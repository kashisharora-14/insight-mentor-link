
from backend import create_app
from backend.models import db

def init_database():
    app = create_app()
    with app.app_context():
        print("Creating database tables...")
        db.create_all()
        print("Database tables created successfully!")

if __name__ == '__main__':
    init_database()
