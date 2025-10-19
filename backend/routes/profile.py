from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models.user import User, db

profile = Blueprint('profile', __name__)

@profile.route('/api/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """Get the current user's profile"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify(user.to_dict()), 200

@profile.route('/api/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """Update the current user's profile"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    data = request.get_json()
    
    # Update basic profile fields
    updateable_fields = [
        'full_name', 'headline', 'bio', 'location', 
        'website', 'github', 'linkedin', 'twitter',
        'graduation_year', 'company', 'position',
        'profile_visibility', 'email_visibility'
    ]
    
    for field in updateable_fields:
        if field in data:
            setattr(user, field, data[field])
    
    try:
        db.session.commit()
        return jsonify({
            'message': 'Profile updated successfully',
            'profile': user.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@profile.route('/api/profile/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user_profile(user_id):
    """Get another user's profile"""
    current_user_id = get_jwt_identity()
    target_user = User.query.get(user_id)
    
    if not target_user:
        return jsonify({'error': 'User not found'}), 404
    
    # Check profile visibility
    if target_user.profile_visibility == 'private':
        return jsonify({'error': 'This profile is private'}), 403
    
    if target_user.profile_visibility == 'alumni-only':
        current_user = User.query.get(current_user_id)
        if not current_user or not current_user.is_alumni:
            return jsonify({'error': 'This profile is only visible to alumni'}), 403
    
    profile_data = target_user.to_dict()
    
    # Remove email if it's not visible
    if not target_user.email_visibility:
        profile_data.pop('email', None)
    
    return jsonify(profile_data), 200

@profile.route('/api/profiles/search', methods=['GET'])
@jwt_required()
def search_profiles():
    """Search for user profiles"""
    # Get query parameters
    query = request.args.get('q', '').strip()
    filters = request.args.get('filters', {})
    page = int(request.args.get('page', 1))
    per_page = min(int(request.args.get('per_page', 10)), 50)
    
    # Base query
    base_query = User.query.filter(User.is_verified == True)
    
    # Apply search query
    if query:
        base_query = base_query.filter(
            db.or_(
                User.full_name.ilike(f'%{query}%'),
                User.company.ilike(f'%{query}%'),
                User.position.ilike(f'%{query}%'),
                User.bio.ilike(f'%{query}%')
            )
        )
    
    # Apply filters
    if isinstance(filters, dict):
        if filters.get('is_alumni'):
            base_query = base_query.filter(User.is_alumni == True)
        if filters.get('graduation_year'):
            base_query = base_query.filter(User.graduation_year == filters['graduation_year'])
        if filters.get('company'):
            base_query = base_query.filter(User.company.ilike(f"%{filters['company']}%"))
    
    # Execute query with pagination
    pagination = base_query.paginate(page=page, per_page=per_page, error_out=False)
    
    # Prepare response
    profiles = [user.to_dict() for user in pagination.items]
    
    # Remove emails based on visibility settings
    for profile in profiles:
        if not profile.get('email_visibility'):
            profile.pop('email', None)
    
    return jsonify({
        'profiles': profiles,
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page,
        'per_page': per_page
    }), 200