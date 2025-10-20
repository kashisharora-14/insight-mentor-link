from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token
from datetime import datetime, timedelta
import random
import string
from ..models import db, User, VerificationCode

auth = Blueprint('auth', __name__)

def generate_verification_code():
    return ''.join(random.choices(string.digits, k=6))

@auth.route('/api/auth/register/send-code', methods=['POST'])
def send_registration_code():
    data = request.get_json()
    email = data.get('email')
    
    if not email:
        return jsonify({'error': 'Email is required'}), 400
        
    # Check if user already exists
    user = User.query.filter_by(email=email).first()
    if user and user.is_verified:
        return jsonify({'error': 'Email already registered'}), 400
    
    # Generate verification code
    code = generate_verification_code()
    expires_at = datetime.utcnow() + timedelta(minutes=15)
    
    # Save verification code
    verification = VerificationCode(
        email=email,
        code=code,
        expires_at=expires_at
    )
    db.session.add(verification)
    db.session.commit()
    
    # TODO: Send email with verification code
    # For development, return the code in response
    return jsonify({
        'message': 'Verification code sent',
        'code': code,  # Remove this in production
        'expires_in': 900  # 15 minutes in seconds
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
        is_used=False
    ).first()
    
    if not verification or verification.expires_at < datetime.utcnow():
        return jsonify({'error': 'Invalid or expired verification code'}), 400
    
    # Create user
    user = User.query.filter_by(email=email).first()
    if not user:
        user = User(email=email)
    
    user.set_password(password)
    user.is_verified = True
    verification.is_used = True
    
    db.session.add(user)
    db.session.commit()
    
    # Generate tokens
    access_token = create_access_token(identity=user.id)
    refresh_token = create_refresh_token(identity=user.id)
    
    return jsonify({
        'access_token': access_token,
        'refresh_token': refresh_token,
        'user': user.to_dict()
    }), 200

@auth.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    identifier = data.get('identifier')  # Can be email or student ID
    password = data.get('password')
    
    if not identifier or not password:
        return jsonify({'error': 'Identifier and password are required'}), 400
    
    # Try to find user by email or student ID
    user = User.query.filter(
        (User.email == identifier) | (User.student_id == identifier)
    ).first()
    
    if not user or not user.check_password(password):
        return jsonify({'error': 'Invalid credentials'}), 401
    
    if not user.is_verified:
        return jsonify({'error': 'Email not verified'}), 401
    
    # Generate tokens
    access_token = create_access_token(identity=user.id)
    refresh_token = create_refresh_token(identity=user.id)
    
    return jsonify({
        'access_token': access_token,
        'refresh_token': refresh_token,
        'user': user.to_dict()
    }), 200