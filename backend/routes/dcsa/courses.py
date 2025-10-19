from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models.user import User, db
from ..models.dcsa import Course, Specialization, UserSpecialization

dcsa = Blueprint('dcsa', __name__)

# Course Management Endpoints
@dcsa.route('/api/dcsa/courses', methods=['GET'])
def get_courses():
    """Get all DCSA courses"""
    courses = Course.query.all()
    return jsonify([{
        'id': c.id,
        'name': c.name,
        'duration': c.duration,
        'batch_start_year': c.batch_start_year,
        'batch_end_year': c.batch_end_year,
        'student_count': len(c.students)
    } for c in courses]), 200

@dcsa.route('/api/dcsa/courses', methods=['POST'])
@jwt_required()
def create_course():
    """Create a new course (admin only)"""
    current_user = User.query.get(get_jwt_identity())
    if not current_user.is_faculty:
        return jsonify({'error': 'Only faculty members can create courses'}), 403
    
    data = request.get_json()
    course = Course(
        name=data['name'],
        duration=data['duration'],
        batch_start_year=data['batch_start_year'],
        batch_end_year=data['batch_end_year']
    )
    
    db.session.add(course)
    db.session.commit()
    
    return jsonify({
        'message': 'Course created successfully',
        'course': {
            'id': course.id,
            'name': course.name,
            'duration': course.duration,
            'batch_start_year': course.batch_start_year,
            'batch_end_year': course.batch_end_year
        }
    }), 201

@dcsa.route('/api/dcsa/courses/<int:course_id>', methods=['PUT'])
@jwt_required()
def update_course(course_id):
    """Update course details (admin only)"""
    current_user = User.query.get(get_jwt_identity())
    if not current_user.is_faculty:
        return jsonify({'error': 'Only faculty members can update courses'}), 403
    
    course = Course.query.get_or_404(course_id)
    data = request.get_json()
    
    for field in ['name', 'duration', 'batch_start_year', 'batch_end_year']:
        if field in data:
            setattr(course, field, data[field])
    
    db.session.commit()
    return jsonify({'message': 'Course updated successfully'}), 200

# Specialization Management
@dcsa.route('/api/dcsa/specializations', methods=['GET'])
def get_specializations():
    """Get all specializations"""
    specializations = Specialization.query.all()
    return jsonify([{
        'id': s.id,
        'name': s.name,
        'description': s.description,
        'student_count': len(s.users)
    } for s in specializations]), 200

@dcsa.route('/api/dcsa/specializations', methods=['POST'])
@jwt_required()
def create_specialization():
    """Create a new specialization (admin only)"""
    current_user = User.query.get(get_jwt_identity())
    if not current_user.is_faculty:
        return jsonify({'error': 'Only faculty members can create specializations'}), 403
    
    data = request.get_json()
    specialization = Specialization(
        name=data['name'],
        description=data.get('description')
    )
    
    db.session.add(specialization)
    db.session.commit()
    
    return jsonify({
        'message': 'Specialization created successfully',
        'specialization': {
            'id': specialization.id,
            'name': specialization.name,
            'description': specialization.description
        }
    }), 201

# Student Course Management
@dcsa.route('/api/dcsa/student/course', methods=['PUT'])
@jwt_required()
def update_student_course():
    """Update student's course information"""
    current_user = User.query.get(get_jwt_identity())
    data = request.get_json()
    
    # Update course
    if 'course_id' in data:
        course = Course.query.get_or_404(data['course_id'])
        current_user.course_id = course.id
    
    # Update other academic info
    fields = ['batch_year', 'current_semester', 'cgpa', 'roll_number']
    for field in fields:
        if field in data:
            setattr(current_user, field, data[field])
    
    db.session.commit()
    return jsonify({
        'message': 'Academic information updated successfully',
        'course': current_user.course.name if current_user.course else None,
        'batch_year': current_user.batch_year,
        'current_semester': current_user.current_semester,
        'cgpa': current_user.cgpa,
        'roll_number': current_user.roll_number
    }), 200

# Student Specialization Management
@dcsa.route('/api/dcsa/student/specializations', methods=['POST'])
@jwt_required()
def add_student_specialization():
    """Add specialization to student's profile"""
    current_user = User.query.get(get_jwt_identity())
    data = request.get_json()
    
    specialization = Specialization.query.get_or_404(data['specialization_id'])
    if specialization in current_user.specializations:
        return jsonify({'error': 'Specialization already added'}), 400
    
    current_user.specializations.append(specialization)
    db.session.commit()
    
    return jsonify({
        'message': 'Specialization added successfully',
        'specializations': [{'id': s.id, 'name': s.name} for s in current_user.specializations]
    }), 200

@dcsa.route('/api/dcsa/student/specializations/<int:spec_id>', methods=['DELETE'])
@jwt_required()
def remove_student_specialization(spec_id):
    """Remove specialization from student's profile"""
    current_user = User.query.get(get_jwt_identity())
    specialization = Specialization.query.get_or_404(spec_id)
    
    if specialization not in current_user.specializations:
        return jsonify({'error': 'Specialization not found in profile'}), 404
    
    current_user.specializations.remove(specialization)
    db.session.commit()
    
    return jsonify({'message': 'Specialization removed successfully'}), 200

# Course Statistics
@dcsa.route('/api/dcsa/courses/stats', methods=['GET'])
def get_course_stats():
    """Get statistics for all courses"""
    courses = Course.query.all()
    stats = []
    
    for course in courses:
        students = course.students
        alumni_count = sum(1 for s in students if s.is_alumni)
        current_count = sum(1 for s in students if not s.is_alumni)
        placed_count = sum(1 for s in students if s.placement_company)
        
        stats.append({
            'course_name': course.name,
            'total_students': len(students),
            'alumni_count': alumni_count,
            'current_students': current_count,
            'placement_percentage': (placed_count / alumni_count * 100) if alumni_count > 0 else 0,
            'average_cgpa': sum(s.cgpa or 0 for s in students) / len(students) if students else 0
        })
    
    return jsonify(stats), 200