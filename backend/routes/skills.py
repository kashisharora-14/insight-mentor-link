from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models.user import User, db
from ..models.profile import Skill, UserSkill

skills = Blueprint('skills', __name__)

@skills.route('/api/skills', methods=['GET'])
@jwt_required()
def get_user_skills():
    """Get current user's skills"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    skills_data = []
    for skill in user.skills:
        user_skill = UserSkill.query.filter_by(
            user_id=user.id,
            skill_id=skill.id
        ).first()
        
        skills_data.append({
            'id': skill.id,
            'name': skill.name,
            'category': skill.category,
            'proficiency_level': user_skill.proficiency_level if user_skill else None,
            'years_of_experience': user_skill.years_of_experience if user_skill else None
        })
    
    return jsonify(skills_data), 200

@skills.route('/api/skills', methods=['POST'])
@jwt_required()
def add_skill():
    """Add a new skill to user's profile"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    data = request.get_json()
    if not data.get('name'):
        return jsonify({'error': 'Skill name is required'}), 400
    
    # Find or create skill
    skill = Skill.query.filter_by(name=data['name']).first()
    if not skill:
        skill = Skill(
            name=data['name'],
            category=data.get('category')
        )
        db.session.add(skill)
    
    # Check if user already has this skill
    if skill in user.skills:
        return jsonify({'error': 'Skill already added'}), 400
    
    # Add skill to user's profile
    user_skill = UserSkill(
        user_id=user.id,
        skill_id=skill.id,
        proficiency_level=data.get('proficiency_level'),
        years_of_experience=data.get('years_of_experience')
    )
    
    db.session.add(user_skill)
    
    try:
        db.session.commit()
        return jsonify({
            'message': 'Skill added successfully',
            'skill': {
                'id': skill.id,
                'name': skill.name,
                'category': skill.category,
                'proficiency_level': user_skill.proficiency_level,
                'years_of_experience': user_skill.years_of_experience
            }
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@skills.route('/api/skills/<int:skill_id>', methods=['PUT'])
@jwt_required()
def update_skill(skill_id):
    """Update skill details"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    user_skill = UserSkill.query.filter_by(
        user_id=user.id,
        skill_id=skill_id
    ).first()
    
    if not user_skill:
        return jsonify({'error': 'Skill not found'}), 404
    
    data = request.get_json()
    if 'proficiency_level' in data:
        user_skill.proficiency_level = data['proficiency_level']
    if 'years_of_experience' in data:
        user_skill.years_of_experience = data['years_of_experience']
    
    try:
        db.session.commit()
        skill = Skill.query.get(skill_id)
        return jsonify({
            'message': 'Skill updated successfully',
            'skill': {
                'id': skill.id,
                'name': skill.name,
                'category': skill.category,
                'proficiency_level': user_skill.proficiency_level,
                'years_of_experience': user_skill.years_of_experience
            }
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@skills.route('/api/skills/<int:skill_id>', methods=['DELETE'])
@jwt_required()
def delete_skill(skill_id):
    """Remove a skill from user's profile"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    user_skill = UserSkill.query.filter_by(
        user_id=user.id,
        skill_id=skill_id
    ).first()
    
    if not user_skill:
        return jsonify({'error': 'Skill not found'}), 404
    
    try:
        db.session.delete(user_skill)
        db.session.commit()
        return jsonify({'message': 'Skill removed successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400