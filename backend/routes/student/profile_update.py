from flask import Blueprint, request, jsonify
from backend.models.student import StudentProfile
from backend import db
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime

profile_update = Blueprint('profile_update', __name__)

def validate_phone(phone):
    """Validate phone number format"""
    if not phone:
        return True
    return len(phone) >= 10 and phone.isdigit()

def validate_email(email):
    """Basic email validation"""
    if not email:
        return True
    return '@' in email and '.' in email.split('@')[1]

@profile_update.route('/api/student/profile/update', methods=['PUT'])
@jwt_required()
def update_profile():
    try:
        current_user_id = get_jwt_identity()
        student = StudentProfile.query.filter_by(user_id=current_user_id).first()
        
        if not student:
            return jsonify({'error': 'Student profile not found'}), 404
        
        data = request.get_json()
        
        # Validate phone number
        if 'phone_number' in data and not validate_phone(data['phone_number']):
            return jsonify({'error': 'Invalid phone number format'}), 400
        
        # Validate email address
        if 'alternate_email' in data and not validate_email(data['alternate_email']):
            return jsonify({'error': 'Invalid alternate email format'}), 400
        
        # Handle date fields
        if 'date_of_birth' in data:
            try:
                data['date_of_birth'] = datetime.strptime(data['date_of_birth'], '%Y-%m-%d').date()
            except ValueError:
                return jsonify({'error': 'Invalid date format for date_of_birth'}), 400
        
        # Update fields
        for key, value in data.items():
            if hasattr(student, key):
                setattr(student, key, value)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Profile updated successfully',
            'data': {
                'roll_number': student.roll_number,
                'current_semester': student.current_semester,
                'phone_number': student.phone_number,
                'alternate_email': student.alternate_email
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@profile_update.route('/api/student/profile/update/contact', methods=['PUT'])
@jwt_required()
def update_contact_info():
    try:
        current_user_id = get_jwt_identity()
        student = StudentProfile.query.filter_by(user_id=current_user_id).first()
        
        if not student:
            return jsonify({'error': 'Student profile not found'}), 404
        
        data = request.get_json()
        contact_fields = [
            'permanent_address', 'current_address', 'phone_number',
            'alternate_email'
        ]
        
        # Validate phone number and email
        if 'phone_number' in data and not validate_phone(data['phone_number']):
            return jsonify({'error': 'Invalid phone number format'}), 400
            
        if 'alternate_email' in data and not validate_email(data['alternate_email']):
            return jsonify({'error': 'Invalid alternate email format'}), 400
        
        # Update contact information
        for field in contact_fields:
            if field in data:
                setattr(student, field, data[field])
        
        db.session.commit()
        
        return jsonify({
            'message': 'Contact information updated successfully',
            'data': {
                'phone_number': student.phone_number,
                'alternate_email': student.alternate_email,
                'emergency_contact_name': student.emergency_contact_name
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500