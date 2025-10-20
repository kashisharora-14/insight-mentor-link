
from flask import Blueprint, request, jsonify
from backend.routes.student.profile_update import profile_update

main = Blueprint('main', __name__)

@main.route('/')
def index():
    return jsonify({"message": "Welcome to the Insight Mentor Link API", "status": "running"}), 200

# Register student profile update routes
main.register_blueprint(profile_update)

@main.route('/api/auth/register/send-code', methods=['POST'])
def send_registration_code():
    data = request.get_json()
    email = data.get('email')
    # In a real application, you would generate a code and send it via email.
    # For now, we'll just simulate success.
    print(f"Sending registration code to {email}")
    return jsonify({
        "data": {
            "email": email,
            "code_expires_in": 300
        }
    }), 200

@main.route('/api/auth/login', methods=['POST'])
def send_login_code():
    data = request.get_json()
    identifier = data.get('identifier')
    # Simulate sending a login code
    print(f"Sending login code for identifier: {identifier}")
    return jsonify({
        "data": {
            "user_id": "12345",
            "email": identifier,
            "code_expires_in": 300
        }
    }), 200

@main.route('/api/auth/verify-login-code', methods=['POST'])
def verify_login_code():
    data = request.get_json()
    user_id = data.get('user_id')
    code = data.get('code')
    print(f"Verifying login code for user: {user_id}")
    
    # Simulate successful verification
    return jsonify({
        "data": {
            "access_token": "fake_access_token_12345",
            "refresh_token": "fake_refresh_token_12345",
            "token_type": "Bearer",
            "expires_in": 3600,
            "user": {
                "id": user_id,
                "email": "test@example.com",
                "name": "Test User",
                "role": "student"
            }
        }
    }), 200

@main.route('/api/auth/me', methods=['GET'])
def get_current_user():
    # Simulate returning current user
    return jsonify({
        "data": {
            "id": "12345",
            "email": "test@example.com",
            "name": "Test User",
            "role": "student"
        }
    }), 200
