from datetime import datetime
from sqlalchemy import Enum

# Course information specific to DCSA
class Course(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)  # MCA, MSc(IT), PhD, etc.
    duration = db.Column(db.Integer)  # Duration in years
    batch_start_year = db.Column(db.Integer, nullable=False)
    batch_end_year = db.Column(db.Integer, nullable=False)
    
    # Relationship with users
    students = db.relationship('User', backref='course')

class Specialization(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)  # e.g., Data Science, Web Technologies, etc.
    description = db.Column(db.Text)
    
    # Many-to-Many relationship with users
    users = db.relationship('User', secondary='user_specializations')

class UserSpecialization(db.Model):
    __tablename__ = 'user_specializations'
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), primary_key=True)
    specialization_id = db.Column(db.Integer, db.ForeignKey('specialization.id'), primary_key=True)

class DepartmentRole(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    role_type = db.Column(db.String(50))  # Faculty, Student, Research Scholar, etc.
    designation = db.Column(db.String(100))  # Professor, Associate Professor, etc.
    start_date = db.Column(db.Date)
    end_date = db.Column(db.Date)
    is_current = db.Column(db.Boolean, default=True)

class ResearchPublication(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    title = db.Column(db.String(500), nullable=False)
    authors = db.Column(db.String(500))
    publication_type = db.Column(db.String(50))  # Journal, Conference, Book Chapter
    journal_name = db.Column(db.String(200))
    conference_name = db.Column(db.String(200))
    year = db.Column(db.Integer)
    doi = db.Column(db.String(100))
    url = db.Column(db.String(500))
    citation_count = db.Column(db.Integer, default=0)
    abstract = db.Column(db.Text)

class Achievement(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    achievement_type = db.Column(db.String(50))  # Academic, Research, Professional
    date = db.Column(db.Date)
    proof_url = db.Column(db.String(500))  # URL to certificate or proof

class DepartmentEvent(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    event_type = db.Column(db.String(50))  # Workshop, Conference, Seminar, Alumni Meet
    start_date = db.Column(db.DateTime)
    end_date = db.Column(db.DateTime)
    venue = db.Column(db.String(200))
    organizer_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    registration_required = db.Column(db.Boolean, default=False)
    max_participants = db.Column(db.Integer)
    is_featured = db.Column(db.Boolean, default=False)
    
    # Event participants
    participants = db.relationship('User', secondary='event_participants')

class EventParticipant(db.Model):
    __tablename__ = 'event_participants'
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), primary_key=True)
    event_id = db.Column(db.Integer, db.ForeignKey('department_event.id'), primary_key=True)
    registration_date = db.Column(db.DateTime, default=datetime.utcnow)
    attendance_status = db.Column(db.String(20))  # Registered, Attended, Cancelled
    certificate_issued = db.Column(db.Boolean, default=False)