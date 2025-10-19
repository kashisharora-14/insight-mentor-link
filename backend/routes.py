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
    return jsonify({"success": True, "message": "Verification code sent."}), 200

@main.route('/api/auth/login/send-code', methods=['POST'])
def send_login_code():
    data = request.get_json()
    identifier = data.get('identifier')
    # In a real application, you would look up the user and send a code.
    # For now, we'll just simulate success.
    print(f"Sending login code for identifier: {identifier}")
    return jsonify({"success": True, "user_id": "12345", "email": "test@example.com"}), 200

@main.route('/api/auth/login', methods=['POST'])
def login():
    # This is for the legacy password-based login
    data = request.get_json()
    identifier = data.get('identifier')
    password = data.get('password')
    print(f"Attempting legacy login for: {identifier}")
    # In a real app, you'd validate credentials.
    # For now, we'll simulate a successful login.
    return jsonify({
        "access_token": "fake_access_token",
        "refresh_token": "fake_refresh_token",
        "user": {
            "id": "12345",
            "email": identifier,
            "name": "Test User"
        }
    }), 200
