from datetime import datetime
from sqlalchemy import event
from . import db

# Skills and expertise
class Skill(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    category = db.Column(db.String(50))  # e.g., 'Technical', 'Soft Skills', 'Tools'
    
    # Many-to-Many relationship with users
    users = db.relationship('User', secondary='user_skills', back_populates='skills')

class UserSkill(db.Model):
    __tablename__ = 'user_skills'
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), primary_key=True)
    skill_id = db.Column(db.Integer, db.ForeignKey('skill.id'), primary_key=True)
    proficiency_level = db.Column(db.String(20))  # e.g., 'Beginner', 'Intermediate', 'Expert'
    years_of_experience = db.Column(db.Float)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# Education history
class Education(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    institution = db.Column(db.String(200), nullable=False)
    degree = db.Column(db.String(200))
    field_of_study = db.Column(db.String(200))
    start_date = db.Column(db.Date)
    end_date = db.Column(db.Date)
    grade = db.Column(db.String(20))
    activities = db.Column(db.Text)
    description = db.Column(db.Text)
    is_current = db.Column(db.Boolean, default=False)
    
    user = db.relationship('User', back_populates='education')

# Work experience
class WorkExperience(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    company = db.Column(db.String(200), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    location = db.Column(db.String(200))
    start_date = db.Column(db.Date)
    end_date = db.Column(db.Date)
    is_current = db.Column(db.Boolean, default=False)
    description = db.Column(db.Text)
    achievements = db.Column(db.Text)
    
    user = db.relationship('User', back_populates='work_experience')

# Projects
class Project(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    start_date = db.Column(db.Date)
    end_date = db.Column(db.Date)
    is_current = db.Column(db.Boolean, default=False)
    project_url = db.Column(db.String(500))
    github_url = db.Column(db.String(500))
    technologies_used = db.Column(db.String(500))  # Comma-separated list
    
    user = db.relationship('User', back_populates='projects')

# Certifications
class Certification(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    name = db.Column(db.String(200), nullable=False)
    issuing_organization = db.Column(db.String(200))
    issue_date = db.Column(db.Date)
    expiry_date = db.Column(db.Date)
    credential_id = db.Column(db.String(100))
    credential_url = db.Column(db.String(500))
    
    user = db.relationship('User', back_populates='certifications')

# Languages
class Language(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    proficiency = db.Column(db.String(50))  # e.g., 'Basic', 'Conversational', 'Fluent', 'Native'
    
    user = db.relationship('User', back_populates='languages')