from datetime import datetime
from collections import defaultdict

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from ..models.dcsa import DepartmentEvent, EventParticipant
from ..models.user import User, db


events = Blueprint("events", __name__)


def _serialize_event(event: DepartmentEvent, admin: bool = False):
    data = {
        "id": event.id,
        "title": event.title,
        "description": event.description,
        "event_type": event.event_type,
        "start_date": event.start_date.isoformat() if event.start_date else None,
        "end_date": event.end_date.isoformat() if event.end_date else None,
        "venue": event.venue,
        "department": event.department,
        "registration_required": event.registration_required,
        "max_participants": event.max_participants,
        "current_participants": len(event.participants),
        "is_featured": event.is_featured,
        "status": event.status,
        "is_paid": event.is_paid,
        "fee_amount": float(event.fee_amount) if event.fee_amount is not None else None,
        "approval_notes": event.approval_notes,
        "organizer": {
            "id": event.organizer.id if event.organizer else None,
            "name": event.organizer.full_name if event.organizer else None,
            "email": event.organizer.email if event.organizer else None,
            "role": getattr(event.organizer, "role", None),
        },
    }

    if admin:
        data["created_by_role"] = event.created_by_role
        data["participant_requests"] = [
            {
                "user_id": link.user_id,
                "program": link.program,
                "department": link.department,
                "approval_status": link.approval_status,
                "notes": link.notes,
                "registered_at": link.registration_date.isoformat()
                if link.registration_date
                else None,
            }
            for link in event.participant_links
        ]

    return data


def _is_admin_or_faculty(user: User) -> bool:
    return bool(user and (getattr(user, "role", None) == "admin" or getattr(user, "is_faculty", False)))


def _can_submit_event(user: User) -> bool:
    if not user:
        return False
    role = getattr(user, "role", None)
    return role in {"admin", "alumni"} or getattr(user, "is_faculty", False) or getattr(user, "is_alumni", False)


@events.route("/api/dcsa/events", methods=["GET"])
@jwt_required(optional=True)
def list_events():
    current_user = User.query.get(get_jwt_identity()) if get_jwt_identity() else None
    status_filter = request.args.get("status")
    if not status_filter:
        status_filter = "all" if _is_admin_or_faculty(current_user) else "approved"

    query = DepartmentEvent.query
    if status_filter != "all":
        query = query.filter_by(status=status_filter)

    if request.args.get("type"):
        query = query.filter_by(event_type=request.args["type"])
    if request.args.get("department"):
        query = query.filter_by(department=request.args["department"])
    if request.args.get("upcoming") in {"true", "1", "True"}:
        query = query.filter(DepartmentEvent.start_date >= datetime.utcnow())

    events_data = query.order_by(DepartmentEvent.start_date.desc()).all()
    admin = _is_admin_or_faculty(current_user)
    return jsonify([_serialize_event(evt, admin=admin) for evt in events_data]), 200


@events.route("/api/dcsa/events", methods=["POST"])
@jwt_required()
def submit_event():
    current_user = User.query.get(get_jwt_identity())
    if not _can_submit_event(current_user):
        return jsonify({"error": "Only alumni, faculty, or admins can submit events"}), 403

    data = request.get_json() or {}
    for field in ("title", "description", "event_type", "start_date"):
        if not data.get(field):
            return jsonify({"error": f"Missing field: {field}"}), 400

    try:
        start_date = datetime.fromisoformat(data["start_date"])
    except ValueError:
        return jsonify({"error": "Invalid start_date"}), 400

    end_date = None
    if data.get("end_date"):
        try:
            end_date = datetime.fromisoformat(data["end_date"])
        except ValueError:
            return jsonify({"error": "Invalid end_date"}), 400

    event = DepartmentEvent(
        title=data["title"],
        description=data.get("description"),
        event_type=data.get("event_type"),
        start_date=start_date,
        end_date=end_date,
        venue=data.get("venue"),
        department=data.get("department"),
        organizer_id=current_user.id,
        registration_required=bool(data.get("registration_required", False)),
        max_participants=data.get("max_participants"),
        is_featured=bool(data.get("is_featured", False)),
        status="approved" if _is_admin_or_faculty(current_user) else "pending",
        created_by_role=getattr(current_user, "role", None),
        is_paid=bool(data.get("is_paid", False)),
        fee_amount=data.get("fee_amount"),
    )

    db.session.add(event)
    db.session.commit()

    return jsonify({
        "message": "Event published" if event.status == "approved" else "Event submitted for approval",
        "event": _serialize_event(event, admin=True),
    }), 201


@events.route("/api/dcsa/events/<int:event_id>", methods=["PUT"])
@jwt_required()
def update_event(event_id: int):
    current_user = User.query.get(get_jwt_identity())
    event = DepartmentEvent.query.get_or_404(event_id)

    if not (_is_admin_or_faculty(current_user) or event.organizer_id == current_user.id):
        return jsonify({"error": "Not authorized"}), 403

    data = request.get_json() or {}
    for field in [
        "title",
        "description",
        "event_type",
        "venue",
        "department",
        "registration_required",
        "max_participants",
        "is_featured",
        "is_paid",
        "fee_amount",
    ]:
        if field in data:
            setattr(event, field, data[field])

    if "start_date" in data:
        try:
            event.start_date = datetime.fromisoformat(data["start_date"])
        except ValueError:
            return jsonify({"error": "Invalid start_date"}), 400

    if "end_date" in data:
        try:
            event.end_date = datetime.fromisoformat(data["end_date"])
        except ValueError:
            return jsonify({"error": "Invalid end_date"}), 400

    db.session.commit()
    return jsonify({"message": "Event updated", "event": _serialize_event(event, admin=_is_admin_or_faculty(current_user))}), 200


@events.route("/api/dcsa/events/<int:event_id>/status", methods=["POST"])
@jwt_required()
def moderate_event(event_id: int):
    current_user = User.query.get(get_jwt_identity())
    if not _is_admin_or_faculty(current_user):
        return jsonify({"error": "Only admins or faculty can moderate events"}), 403

    data = request.get_json() or {}
    status = data.get("status")
    if status not in {"approved", "rejected"}:
        return jsonify({"error": "Status must be 'approved' or 'rejected'"}), 400

    event = DepartmentEvent.query.get_or_404(event_id)
    event.status = status
    event.approval_notes = data.get("notes")
    db.session.commit()

    return jsonify({"message": f"Event {status}", "event": _serialize_event(event, admin=True)}), 200


@events.route("/api/dcsa/events/<int:event_id>/participation", methods=["POST"])
@jwt_required()
def request_participation(event_id: int):
    current_user = User.query.get(get_jwt_identity())
    if getattr(current_user, "role", None) != "student":
        return jsonify({"error": "Only students can request participation"}), 403

    event = DepartmentEvent.query.get_or_404(event_id)
    if event.status != "approved":
        return jsonify({"error": "Event is not open for participation"}), 400

    existing = EventParticipant.query.filter_by(user_id=current_user.id, event_id=event.id).first()
    if existing:
        return jsonify({"error": "Participation already requested"}), 400

    data = request.get_json() or {}
    program = data.get("program") or getattr(getattr(current_user, "course", None), "name", None)
    department = data.get("department") or getattr(current_user, "department_designation", None)

    participant = EventParticipant(
        user_id=current_user.id,
        event_id=event.id,
        attendance_status="Registered",
        approval_status="pending",
        program=program,
        department=department,
        notes=data.get("notes"),
    )

    db.session.add(participant)
    db.session.commit()

    return jsonify({"message": "Participation request submitted"}), 201


@events.route("/api/dcsa/events/my-participation", methods=["GET"])
@jwt_required()
def my_participation():
    current_user = User.query.get(get_jwt_identity())
    links = EventParticipant.query.filter_by(user_id=current_user.id).all()
    return jsonify([
        {
            "event_id": link.event_id,
            "approval_status": link.approval_status,
            "attendance_status": link.attendance_status,
            "program": link.program,
            "department": link.department,
        }
        for link in links
    ]), 200


@events.route("/api/dcsa/events/<int:event_id>/participation/<int:user_id>", methods=["POST"])
@jwt_required()
def review_participation(event_id: int, user_id: int):
    current_user = User.query.get(get_jwt_identity())
    event = DepartmentEvent.query.get_or_404(event_id)

    if not (_is_admin_or_faculty(current_user) or event.organizer_id == current_user.id):
        return jsonify({"error": "Not authorized"}), 403

    link = EventParticipant.query.filter_by(event_id=event.id, user_id=user_id).first_or_404()
    data = request.get_json() or {}
    status = data.get("status")
    if status not in {"approved", "rejected"}:
        return jsonify({"error": "Status must be 'approved' or 'rejected'"}), 400

    link.approval_status = status
    link.notes = data.get("notes")
    db.session.commit()

    return jsonify({"message": f"Participation {status}"}), 200


@events.route("/api/dcsa/events/stats", methods=["GET"])
@jwt_required(optional=True)
def event_stats():
    events = DepartmentEvent.query.all()
    participants = EventParticipant.query.all()

    events_by_type = defaultdict(int)
    for event in events:
        events_by_type[event.event_type] += 1

    program_counts = defaultdict(int)
    department_counts = defaultdict(int)
    for part in participants:
        if part.approval_status == "approved":
            if part.program:
                program_counts[part.program] += 1
            if part.department:
                department_counts[part.department] += 1

    return jsonify({
        "events_by_type": dict(events_by_type),
        "total_events": len(events),
        "approved_participants": len([p for p in participants if p.approval_status == "approved"]),
        "program_counts": dict(program_counts),
        "department_counts": dict(department_counts),
    }), 200