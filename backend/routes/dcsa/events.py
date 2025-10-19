from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models.user import User, db
from ..models.dcsa import DepartmentEvent, EventParticipant
from datetime import datetime

events = Blueprint('events', __name__)

@events.route('/api/dcsa/events', methods=['GET'])
def get_events():
    """Get all department events with filters"""
    # Get query parameters
    event_type = request.args.get('type')
    upcoming = request.args.get('upcoming', type=bool)
    featured = request.args.get('featured', type=bool)
    
    query = DepartmentEvent.query
    
    # Apply filters
    if event_type:
        query = query.filter_by(event_type=event_type)
    if upcoming:
        query = query.filter(DepartmentEvent.start_date >= datetime.utcnow())
    if featured:
        query = query.filter_by(is_featured=True)
    
    events = query.order_by(DepartmentEvent.start_date.desc()).all()
    
    return jsonify([{
        'id': event.id,
        'title': event.title,
        'description': event.description,
        'event_type': event.event_type,
        'start_date': event.start_date.isoformat(),
        'end_date': event.end_date.isoformat() if event.end_date else None,
        'venue': event.venue,
        'organizer': event.organizer.full_name,
        'registration_required': event.registration_required,
        'max_participants': event.max_participants,
        'current_participants': len(event.participants),
        'is_featured': event.is_featured
    } for event in events]), 200

@events.route('/api/dcsa/events', methods=['POST'])
@jwt_required()
def create_event():
    """Create a new department event"""
    current_user = User.query.get(get_jwt_identity())
    
    # Check if user can create events (faculty or authorized alumni)
    if not (current_user.is_faculty or current_user.is_alumni):
        return jsonify({'error': 'Not authorized to create events'}), 403
    
    data = request.get_json()
    
    event = DepartmentEvent(
        title=data['title'],
        description=data['description'],
        event_type=data['event_type'],
        start_date=datetime.fromisoformat(data['start_date']),
        end_date=datetime.fromisoformat(data['end_date']) if data.get('end_date') else None,
        venue=data['venue'],
        organizer_id=current_user.id,
        registration_required=data.get('registration_required', False),
        max_participants=data.get('max_participants'),
        is_featured=data.get('is_featured', False)
    )
    
    db.session.add(event)
    db.session.commit()
    
    return jsonify({
        'message': 'Event created successfully',
        'event': {
            'id': event.id,
            'title': event.title,
            'start_date': event.start_date.isoformat()
        }
    }), 201

@events.route('/api/dcsa/events/<int:event_id>', methods=['PUT'])
@jwt_required()
def update_event(event_id):
    """Update an event"""
    current_user = User.query.get(get_jwt_identity())
    event = DepartmentEvent.query.get_or_404(event_id)
    
    # Check if user can update this event
    if event.organizer_id != current_user.id and not current_user.is_faculty:
        return jsonify({'error': 'Not authorized to update this event'}), 403
    
    data = request.get_json()
    updateable_fields = [
        'title', 'description', 'event_type', 'venue',
        'registration_required', 'max_participants', 'is_featured'
    ]
    
    for field in updateable_fields:
        if field in data:
            setattr(event, field, data[field])
    
    # Handle dates separately
    if 'start_date' in data:
        event.start_date = datetime.fromisoformat(data['start_date'])
    if 'end_date' in data:
        event.end_date = datetime.fromisoformat(data['end_date'])
    
    db.session.commit()
    return jsonify({'message': 'Event updated successfully'}), 200

@events.route('/api/dcsa/events/<int:event_id>/register', methods=['POST'])
@jwt_required()
def register_for_event(event_id):
    """Register for an event"""
    current_user = User.query.get(get_jwt_identity())
    event = DepartmentEvent.query.get_or_404(event_id)
    
    # Check if registration is required
    if not event.registration_required:
        return jsonify({'error': 'Registration not required for this event'}), 400
    
    # Check if event is full
    if event.max_participants and len(event.participants) >= event.max_participants:
        return jsonify({'error': 'Event is full'}), 400
    
    # Check if already registered
    if current_user in event.participants:
        return jsonify({'error': 'Already registered for this event'}), 400
    
    participant = EventParticipant(
        user_id=current_user.id,
        event_id=event.id,
        registration_date=datetime.utcnow(),
        attendance_status='Registered'
    )
    
    db.session.add(participant)
    db.session.commit()
    
    return jsonify({'message': 'Successfully registered for event'}), 200

@events.route('/api/dcsa/events/<int:event_id>/attendance', methods=['PUT'])
@jwt_required()
def mark_attendance(event_id):
    """Mark attendance for an event"""
    current_user = User.query.get(get_jwt_identity())
    event = DepartmentEvent.query.get_or_404(event_id)
    
    # Check if user is organizer or faculty
    if event.organizer_id != current_user.id and not current_user.is_faculty:
        return jsonify({'error': 'Not authorized to mark attendance'}), 403
    
    data = request.get_json()
    user_id = data.get('user_id')
    status = data.get('status')
    
    participant = EventParticipant.query.filter_by(
        user_id=user_id,
        event_id=event_id
    ).first_or_404()
    
    participant.attendance_status = status
    db.session.commit()
    
    return jsonify({'message': 'Attendance marked successfully'}), 200

@events.route('/api/dcsa/events/stats', methods=['GET'])
def get_event_stats():
    """Get event statistics"""
    # Events by type
    events = DepartmentEvent.query.all()
    event_types = {}
    for event in events:
        event_types[event.event_type] = event_types.get(event.event_type, 0) + 1
    
    # Participation stats
    total_participants = EventParticipant.query.count()
    attended = EventParticipant.query.filter_by(attendance_status='Attended').count()
    
    # Recent events
    recent_events = DepartmentEvent.query.order_by(
        DepartmentEvent.start_date.desc()
    ).limit(5).all()
    
    return jsonify({
        'events_by_type': event_types,
        'total_events': len(events),
        'total_participants': total_participants,
        'attendance_rate': (attended / total_participants * 100) if total_participants > 0 else 0,
        'recent_events': [{
            'title': e.title,
            'date': e.start_date.isoformat(),
            'type': e.event_type,
            'participants': len(e.participants)
        } for e in recent_events]
    }), 200