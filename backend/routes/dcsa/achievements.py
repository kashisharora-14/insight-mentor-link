from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models.user import User, db
from ..models.dcsa import Achievement
from datetime import datetime

achievements = Blueprint('achievements', __name__)

@achievements.route('/api/dcsa/achievements', methods=['GET'])
def get_achievements():
    """Get all achievements with filters"""
    # Get query parameters
    user_id = request.args.get('user_id', type=int)
    achievement_type = request.args.get('type')
    year = request.args.get('year', type=int)
    
    query = Achievement.query
    
    # Apply filters
    if user_id:
        query = query.filter_by(user_id=user_id)
    if achievement_type:
        query = query.filter_by(achievement_type=achievement_type)
    if year:
        query = query.filter(db.extract('year', Achievement.date) == year)
    
    achievements = query.order_by(Achievement.date.desc()).all()
    
    return jsonify([{
        'id': a.id,
        'title': a.title,
        'description': a.description,
        'achievement_type': a.achievement_type,
        'date': a.date.isoformat() if a.date else None,
        'proof_url': a.proof_url,
        'user': {
            'id': a.user.id,
            'name': a.user.full_name
        }
    } for a in achievements]), 200

@achievements.route('/api/dcsa/achievements', methods=['POST'])
@jwt_required()
def add_achievement():
    """Add a new achievement"""
    current_user = User.query.get(get_jwt_identity())
    data = request.get_json()
    
    achievement = Achievement(
        user_id=current_user.id,
        title=data['title'],
        description=data.get('description'),
        achievement_type=data['achievement_type'],
        date=datetime.fromisoformat(data['date']) if data.get('date') else None,
        proof_url=data.get('proof_url')
    )
    
    db.session.add(achievement)
    db.session.commit()
    
    return jsonify({
        'message': 'Achievement added successfully',
        'achievement': {
            'id': achievement.id,
            'title': achievement.title
        }
    }), 201

@achievements.route('/api/dcsa/achievements/<int:achievement_id>', methods=['PUT'])
@jwt_required()
def update_achievement(achievement_id):
    """Update an achievement"""
    current_user = User.query.get(get_jwt_identity())
    achievement = Achievement.query.get_or_404(achievement_id)
    
    # Check if user owns this achievement or is faculty
    if achievement.user_id != current_user.id and not current_user.is_faculty:
        return jsonify({'error': 'Not authorized to update this achievement'}), 403
    
    data = request.get_json()
    updateable_fields = ['title', 'description', 'achievement_type', 'proof_url']
    
    for field in updateable_fields:
        if field in data:
            setattr(achievement, field, data[field])
    
    if 'date' in data:
        achievement.date = datetime.fromisoformat(data['date'])
    
    db.session.commit()
    return jsonify({'message': 'Achievement updated successfully'}), 200

@achievements.route('/api/dcsa/achievements/<int:achievement_id>', methods=['DELETE'])
@jwt_required()
def delete_achievement(achievement_id):
    """Delete an achievement"""
    current_user = User.query.get(get_jwt_identity())
    achievement = Achievement.query.get_or_404(achievement_id)
    
    # Check if user owns this achievement or is faculty
    if achievement.user_id != current_user.id and not current_user.is_faculty:
        return jsonify({'error': 'Not authorized to delete this achievement'}), 403
    
    db.session.delete(achievement)
    db.session.commit()
    
    return jsonify({'message': 'Achievement deleted successfully'}), 200

@achievements.route('/api/dcsa/placements', methods=['GET'])
def get_placement_stats():
    """Get placement statistics"""
    # Get query parameters
    year = request.args.get('year', type=int)
    course_id = request.args.get('course_id', type=int)
    
    query = User.query.filter(User.placement_company.isnot(None))
    
    # Apply filters
    if year:
        query = query.filter_by(placement_year=year)
    if course_id:
        query = query.filter_by(course_id=course_id)
    
    placed_students = query.all()
    
    # Group by company
    companies = {}
    for student in placed_students:
        companies[student.placement_company] = companies.get(student.placement_company, 0) + 1
    
    # Group by course
    course_stats = {}
    for student in placed_students:
        if student.course:
            course_name = student.course.name
            course_stats[course_name] = course_stats.get(course_name, 0) + 1
    
    return jsonify({
        'total_placements': len(placed_students),
        'companies': [{'name': k, 'count': v} for k, v in companies.items()],
        'course_wise': [{'course': k, 'count': v} for k, v in course_stats.items()],
        'placement_percentage': {
            course.name: (
                len([s for s in course.students if s.placement_company]) / 
                len([s for s in course.students if s.is_alumni]) * 100
                if len([s for s in course.students if s.is_alumni]) > 0 else 0
            )
            for course in Course.query.all()
        }
    }), 200

# Batch-wise statistics
@achievements.route('/api/dcsa/batch-stats/<int:batch_year>', methods=['GET'])
def get_batch_stats(batch_year):
    """Get statistics for a specific batch"""
    batch_students = User.query.filter_by(batch_year=batch_year).all()
    
    stats = {
        'total_students': len(batch_students),
        'placed_students': len([s for s in batch_students if s.placement_company]),
        'higher_studies': len([s for s in batch_students if any(e.institution != 'Panjab University' for e in s.education.all())]),
        'average_cgpa': sum(s.cgpa or 0 for s in batch_students) / len(batch_students) if batch_students else 0,
        'top_companies': [
            {'company': s.placement_company, 'student': s.full_name}
            for s in batch_students
            if s.placement_company
        ],
        'achievements': [
            {
                'title': a.title,
                'student': a.user.full_name,
                'type': a.achievement_type
            }
            for s in batch_students
            for a in s.achievements
        ]
    }
    
    return jsonify(stats), 200