import os
from datetime import timedelta

class Config:
    # Database configuration - use SQLite (built-in with Python)
    BASE_DIR = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL') or f'sqlite:///{os.path.join(BASE_DIR, "database.db")}'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_pre_ping': True,
        'pool_recycle': 300,
    } if 'postgresql' in SQLALCHEMY_DATABASE_URI else {}
    
    # JWT configuration - reads from Replit Secrets
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY') or os.getenv('SECRET_KEY')
    if not JWT_SECRET_KEY:
        # Fallback for development only
        import secrets
        print("⚠️ WARNING: Using generated secret key. Set JWT_SECRET_KEY in Replit Secrets for production!")
        JWT_SECRET_KEY = secrets.token_hex(32)
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    
    # Email configuration - reads from Replit Secrets
    MAIL_SERVER = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
    MAIL_PORT = int(os.getenv('MAIL_PORT', 587))
    MAIL_USE_TLS = os.getenv('MAIL_USE_TLS', 'True').lower() == 'true'
    MAIL_USERNAME = os.getenv('MAIL_USERNAME')
    MAIL_PASSWORD = os.getenv('MAIL_PASSWORD')
    MAIL_DEFAULT_SENDER = (
        os.getenv('MAIL_DEFAULT_SENDER')
        or os.getenv('MAIL_FROM')
        or MAIL_USERNAME
    )
    
    # Application configuration - reads from Replit Secrets
    SECRET_KEY = os.getenv('SECRET_KEY')
    if not SECRET_KEY:
        # Fallback for development only
        import secrets
        print("⚠️ WARNING: Using generated secret key. Set SECRET_KEY in Replit Secrets for production!")
        SECRET_KEY = secrets.token_hex(32)
    DEBUG = os.getenv('FLASK_ENV') == 'development'