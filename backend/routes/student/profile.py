from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models.user import User, db
from ..models.student import (
    StudentProfile, SemesterRecord, SubjectRecord,
    AttendanceRecord, Document
)
from datetime import datetime

student = Blueprint('student', __name__)

@student.route('/api/student/profile', methods=['GET'])
@jwt_required()
def get_student_profile():
    """Get current student's profile"""
    current_user_id = get_jwt_identity()
    student_profile = StudentProfile.query.filter_by(user_id=current_user_id).first()
    
    if not student_profile:
        return jsonify({'error': 'Student profile not found'}), 404
    
    # Get latest semester record
    latest_semester = (SemesterRecord.query
                      .filter_by(student_profile_id=student_profile.id)
                      .order_by(SemesterRecord.semester_number.desc())
                      .first())
    
    # Calculate overall attendance
    attendance_records = AttendanceRecord.query.filter_by(student_profile_id=student_profile.id)
    total_classes = attendance_records.count()
    if total_classes > 0:
        present_classes = attendance_records.filter_by(status='Present').count()
        overall_attendance = (present_classes / total_classes) * 100
    else:
        overall_attendance = 0
    
    return jsonify({
        'personal_info': {
            'roll_number': student_profile.roll_number,
            'current_semester': student_profile.current_semester,
            'date_of_birth': student_profile.date_of_birth.isoformat() if student_profile.date_of_birth else None,
            'gender': student_profile.gender,
            'blood_group': student_profile.blood_group,
            'category': student_profile.category,
            'phone_number': student_profile.phone_number,
            'alternate_email': student_profile.alternate_email,
            'address': student_profile.address
        },
        'academic_info': {
            'enrollment_date': student_profile.enrollment_date.isoformat() if student_profile.enrollment_date else None,
            'admission_type': student_profile.admission_type,
            'academic_status': student_profile.academic_status,
            'current_backlog': student_profile.current_backlog,
            'scholarship_status': student_profile.scholarship_status,
            'hostel_resident': student_profile.hostel_resident,
            'library_card_number': student_profile.library_card_number
        },
        'current_semester': {
            'semester_number': latest_semester.semester_number if latest_semester else None,
            'sgpa': latest_semester.sgpa if latest_semester else None,
            'cgpa': latest_semester.cgpa if latest_semester else None,
            'attendance': latest_semester.attendance_percentage if latest_semester else None,
            'status': latest_semester.status if latest_semester else None
        },
        'overall_attendance': overall_attendance,
        'parent_info': {
            'father_name': student_profile.father_name,
            'father_occupation': student_profile.father_occupation,
            'father_phone': student_profile.father_phone,
            'mother_name': student_profile.mother_name,
            'mother_occupation': student_profile.mother_occupation,
            'mother_phone': student_profile.mother_phone
        }
    }), 200

@student.route('/api/student/profile', methods=['PUT'])
@jwt_required()
def update_student_profile():
    """Update student's profile information"""
    current_user_id = get_jwt_identity()
    student_profile = StudentProfile.query.filter_by(user_id=current_user_id).first()
    
    if not student_profile:
        return jsonify({'error': 'Student profile not found'}), 404
    
    data = request.get_json()
    
    # Update personal information
    personal_fields = [
        'phone_number', 'alternate_email', 'address',
        'blood_group', 'category'
    ]
    
    for field in personal_fields:
        if field in data:
            setattr(student_profile, field, data[field])
    
    # Update parent information
    parent_fields = [
        'father_name', 'father_occupation', 'father_phone',
        'mother_name', 'mother_occupation', 'mother_phone'
    ]
    
    for field in parent_fields:
        if field in data:
            setattr(student_profile, field, data[field])
    
    try:
        db.session.commit()
        return jsonify({'message': 'Profile updated successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@student.route('/api/student/documents', methods=['GET'])
@jwt_required()
def get_student_documents():
    """Get student's documents"""
    current_user_id = get_jwt_identity()
    student_profile = StudentProfile.query.filter_by(user_id=current_user_id).first()
    
    if not student_profile:
        return jsonify({'error': 'Student profile not found'}), 404
    
    documents = Document.query.filter_by(student_profile_id=student_profile.id).all()
    
    return jsonify([{
        'id': doc.id,
        'document_type': doc.document_type,
        'file_name': doc.file_name,
        'upload_date': doc.upload_date.isoformat(),
        'verified': doc.verified,
        'verification_date': doc.verification_date.isoformat() if doc.verification_date else None
    } for doc in documents]), 200

@student.route('/api/student/documents', methods=['POST'])
@jwt_required()
def upload_document():
    """Upload a new student document"""
    current_user_id = get_jwt_identity()
    student_profile = StudentProfile.query.filter_by(user_id=current_user_id).first()
    
    if not student_profile:
        return jsonify({'error': 'Student profile not found'}), 404
    
    data = request.get_json()
    
    document = Document(
        student_profile_id=student_profile.id,
        document_type=data['document_type'],
        file_name=data['file_name'],
        file_path=data['file_path'],
        upload_date=datetime.utcnow()
    )
    
    db.session.add(document)
    
    try:
        db.session.commit()
        return jsonify({
            'message': 'Document uploaded successfully',
            'document_id': document.id
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@student.route('/api/student/semester-history', methods=['GET'])
@jwt_required()
def get_semester_history():
    """Get student's semester-wise academic history"""
    current_user_id = get_jwt_identity()
    student_profile = StudentProfile.query.filter_by(user_id=current_user_id).first()
    
    if not student_profile:
        return jsonify({'error': 'Student profile not found'}), 404
    
    semesters = SemesterRecord.query.filter_by(
        student_profile_id=student_profile.id
    ).order_by(SemesterRecord.semester_number).all()
    
    return jsonify([{
        'semester_number': sem.semester_number,
        'sgpa': sem.sgpa,
        'cgpa': sem.cgpa,
        'status': sem.status,
        'attendance': sem.attendance_percentage,
        'subjects': {
            'registered': sem.subjects_registered,
            'cleared': sem.subjects_cleared,
            'backlog': sem.backlog_subjects
        },
        'duration': {
            'start': sem.semester_start_date.isoformat() if sem.semester_start_date else None,
            'end': sem.semester_end_date.isoformat() if sem.semester_end_date else None
        }
    } for sem in semesters]), 200