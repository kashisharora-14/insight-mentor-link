
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token
from datetime import datetime, timedelta
import random
import string
from ..models import db, User, VerificationCode
from ..utils.email_service import send_verification_email

auth = Blueprint('auth', __name__)

def generate_verification_code():
    return ''.join(random.choices(string.digits, k=6))

@auth.route('/api/auth/login', methods=['POST'])
@auth.route('/api/auth/login/send-code', methods=['POST'])
def send_login_code():
    data = request.get_json()
    identifier = data.get('identifier')  # Email or student ID
    
    if not identifier:
        return jsonify({'error': 'Email or student ID is required'}), 400
    
    # Find user by email or student ID
    user = User.query.filter(
        (User.email == identifier) | (User.student_id == identifier)
    ).first()
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Generate verification code
    code = generate_verification_code()
    expires_at = datetime.utcnow() + timedelta(minutes=15)
    
    # Save verification code
    verification = VerificationCode(
        email=user.email,
        code=code,
        type='login',
        expires_at=expires_at
    )
    db.session.add(verification)
    db.session.commit()
    
    # Send email with verification code
    send_verification_email(user.email, code)
    
    return jsonify({
        'data': {
            'user_id': str(user.id),
            'email': user.email,
            'code_expires_in': 900
        }
    }), 200

@auth.route('/api/auth/login/verify-code', methods=['POST'])
def verify_login_code():
    data = request.get_json()
    user_id = data.get('user_id')
    code = data.get('code')
    
    if not all([user_id, code]):
        return jsonify({'error': 'User ID and code are required'}), 400
    
    # Get user
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Verify code
    verification = VerificationCode.query.filter_by(
        email=user.email,
        code=code,
        type='login',
        is_used=False
    ).first()
    
    if not verification or verification.expires_at < datetime.utcnow():
        return jsonify({'error': 'Invalid or expired verification code'}), 400
    
    # Mark code as used
    verification.is_used = True
    verification.used_at = datetime.utcnow()
    db.session.commit()
    
    # Generate tokens
    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))
    
    return jsonify({
        'success': True,
        'access_token': access_token,
        'refresh_token': refresh_token,
        'user': user.to_dict()
    }), 200

@auth.route('/api/auth/register/send-code', methods=['POST'])
def send_registration_code():
    data = request.get_json()
    email = data.get('email')
    name = data.get('name')
    student_id = data.get('student_id')
    role = data.get('role', 'student')
    
    if not email or not name:
        return jsonify({'error': 'Email and name are required'}), 400
    
    # Check if user already exists
    user = User.query.filter_by(email=email).first()
    if user:
        return jsonify({'error': 'Email already registered'}), 400
    
    # Generate verification code
    code = generate_verification_code()
    expires_at = datetime.utcnow() + timedelta(minutes=15)
    
    # Save verification code
    verification = VerificationCode(
        email=email,
        code=code,
        type='registration',
        expires_at=expires_at
    )
    db.session.add(verification)
    db.session.commit()
    
    # Send email with verification code
    send_verification_email(email, code)
    
    return jsonify({
        'success': True,
        'email': email,
        'message': 'Verification code sent to your email',
        'code_expires_in': 900
    }), 200

@auth.route('/api/auth/register/verify', methods=['POST'])
def verify_registration():
    data = request.get_json()
    email = data.get('email')
    code = data.get('code')
    password = data.get('password')
    
    if not all([email, code, password]):
        return jsonify({'error': 'Email, code and password are required'}), 400
    
    # Verify code
    verification = VerificationCode.query.filter_by(
        email=email,
        code=code,
        type='registration',
        is_used=False
    ).first()
    
    if not verification or verification.expires_at < datetime.utcnow():
        return jsonify({'error': 'Invalid or expired verification code'}), 400
    
    # Create user
    user = User(email=email)
    user.set_password(password)
    user.is_verified = True
    
    verification.is_used = True
    verification.used_at = datetime.utcnow()
    
    db.session.add(user)
    db.session.commit()
    
    # Generate tokens
    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))
    
    return jsonify({
        'success': True,
        'access_token': access_token,
        'refresh_token': refresh_token,
        'user': user.to_dict()
    }), 200

@auth.route('/api/auth/logout', methods=['POST'])
def logout():
    return jsonify({'success': True, 'message': 'Logged out successfully'}), 200
