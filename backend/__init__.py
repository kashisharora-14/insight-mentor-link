from flask import Flask, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from .config.config import Config
from .models import db
import os

def create_app():
    app = Flask(__name__, static_folder='../dist', static_url_path='')

    # Load configuration
    app.config.from_object(Config)

    # Initialize extensions
    db.init_app(app)
    jwt = JWTManager(app)

    # Configure CORS
    CORS(app, resources={
        r"/api/*": {
            "origins": "*",
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })

    # Create tables if they don't exist
    with app.app_context():
        db.create_all()

    # Register blueprints
    from .routes.auth import auth
    app.register_blueprint(auth)

    # Serve React app in production
    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve(path):
        if path and os.path.exists(os.path.join(app.static_folder, path)):
            return send_from_directory(app.static_folder, path)
        return send_from_directory(app.static_folder, 'index.html')

    # Health check
    @app.route('/health')
    def health():
        return {'status': 'ok', 'message': 'Flask API server is running'}, 200

    return app