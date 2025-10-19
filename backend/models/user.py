from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256))
    student_id = db.Column(db.String(50), unique=True)
    is_alumni = db.Column(db.Boolean, default=False)
    is_verified = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Profile information
    full_name = db.Column(db.String(100))
    graduation_year = db.Column(db.Integer)
    company = db.Column(db.String(100))
    position = db.Column(db.String(100))
    bio = db.Column(db.Text)
    
    # Additional profile fields
    headline = db.Column(db.String(200))  # Professional headline
    location = db.Column(db.String(100))
    website = db.Column(db.String(200))
    github = db.Column(db.String(200))
    linkedin = db.Column(db.String(200))
    twitter = db.Column(db.String(200))
    
    # Profile visibility settings
    profile_visibility = db.Column(db.String(20), default='public')  # public, alumni-only, private
    email_visibility = db.Column(db.Boolean, default=False)
    
    # DCSA-specific information
    roll_number = db.Column(db.String(20), unique=True)  # PU Roll Number
    course_id = db.Column(db.Integer, db.ForeignKey('course.id'))
    batch_year = db.Column(db.Integer)  # Year of joining
    current_semester = db.Column(db.Integer)  # For current students
    cgpa = db.Column(db.Float)  # Cumulative GPA
    research_interests = db.Column(db.Text)  # For research scholars and faculty
    thesis_title = db.Column(db.String(500))  # For PhD scholars
    supervisor_name = db.Column(db.String(100))  # For PhD scholars
    placement_company = db.Column(db.String(200))  # If placed through department
    placement_year = db.Column(db.Integer)
    
    # Additional DCSA fields
    is_faculty = db.Column(db.Boolean, default=False)
    is_research_scholar = db.Column(db.Boolean, default=False)
    department_designation = db.Column(db.String(100))  # For faculty members
    
    # Relationships
    skills = db.relationship('Skill', secondary='user_skills', back_populates='users')
    education = db.relationship('Education', back_populates='user', lazy='dynamic')
    work_experience = db.relationship('WorkExperience', back_populates='user', lazy='dynamic')
    projects = db.relationship('Project', back_populates='user', lazy='dynamic')
    certifications = db.relationship('Certification', back_populates='user', lazy='dynamic')
    languages = db.relationship('Language', back_populates='user', lazy='dynamic')
    
    # DCSA-specific relationships
    specializations = db.relationship('Specialization', secondary='user_specializations')
    department_roles = db.relationship('DepartmentRole', backref='user')
    research_publications = db.relationship('ResearchPublication', backref='user')
    achievements = db.relationship('Achievement', backref='user')
    organized_events = db.relationship('DepartmentEvent', backref='organizer')
    participated_events = db.relationship('DepartmentEvent', 
                                       secondary='event_participants',
                                       backref='participants')
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        data = {
            'id': self.id,
            'email': self.email,
            'student_id': self.student_id,
            'roll_number': self.roll_number,
            'is_alumni': self.is_alumni,
            'is_verified': self.is_verified,
            'full_name': self.full_name,
            'graduation_year': self.graduation_year,
            'company': self.company,
            'position': self.position,
            'bio': self.bio,
            'created_at': self.created_at.isoformat(),
            
            # DCSA-specific information
            'batch_year': self.batch_year,
            'current_semester': self.current_semester,
            'cgpa': self.cgpa,
            'research_interests': self.research_interests,
            'thesis_title': self.thesis_title,
            'supervisor_name': self.supervisor_name,
            'placement_company': self.placement_company,
            'placement_year': self.placement_year,
            'is_faculty': self.is_faculty,
            'is_research_scholar': self.is_research_scholar,
            'department_designation': self.department_designation,
            
            # Course information
            'course': self.course.name if self.course else None,
            
            # Include specializations
            'specializations': [{'id': s.id, 'name': s.name} for s in self.specializations],
            
            # Include publication count
            'publication_count': len(self.research_publications),
            
            # Include achievement count
            'achievement_count': len(self.achievements)
        }
        return data

class VerificationCode(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), nullable=False)
    code = db.Column(db.String(6), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    expires_at = db.Column(db.DateTime, nullable=False)
    is_used = db.Column(db.Boolean, default=False)