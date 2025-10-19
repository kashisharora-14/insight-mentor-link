from datetime import datetime
from sqlalchemy import Enum, or_
from . import db

class StudentProfile(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    roll_number = db.Column(db.String(20), unique=True, nullable=False)
    current_semester = db.Column(db.Integer)
    enrollment_date = db.Column(db.Date)
    current_backlog = db.Column(db.Integer, default=0)
    
    # Personal Details
    date_of_birth = db.Column(db.Date)
    gender = db.Column(db.String(20))
    blood_group = db.Column(db.String(5))
    category = db.Column(db.String(50))  # General, SC, ST, OBC, etc.
    nationality = db.Column(db.String(50))
    religion = db.Column(db.String(50))
    
    # Contact Information
    permanent_address = db.Column(db.Text)
    current_address = db.Column(db.Text)
    phone_number = db.Column(db.String(15))
    alternate_email = db.Column(db.String(120))
    
    # Academic Details
    admission_type = db.Column(db.String(50))  # Regular, Lateral Entry, etc.
    academic_status = db.Column(db.String(20))  # Active, On Leave, Graduated
    scholarship_status = db.Column(db.String(50))
    hostel_resident = db.Column(db.Boolean, default=False)
    library_card_number = db.Column(db.String(50))
    
    # Relationships
    semester_records = db.relationship('SemesterRecord', backref='student', lazy='dynamic')
    attendance_records = db.relationship('AttendanceRecord', backref='student', lazy='dynamic')

class SemesterRecord(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_profile_id = db.Column(db.Integer, db.ForeignKey('student_profile.id'), nullable=False)
    semester_number = db.Column(db.Integer, nullable=False)
    sgpa = db.Column(db.Float)
    cgpa = db.Column(db.Float)
    semester_start_date = db.Column(db.Date)
    semester_end_date = db.Column(db.Date)
    status = db.Column(db.String(20))  # In Progress, Completed, Failed
    attendance_percentage = db.Column(db.Float)
    subjects_registered = db.Column(db.Integer)
    subjects_cleared = db.Column(db.Integer)
    backlog_subjects = db.Column(db.Integer, default=0)
    
    # Relationships
    subject_records = db.relationship('SubjectRecord', backref='semester', lazy='dynamic')

class SubjectRecord(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    semester_record_id = db.Column(db.Integer, db.ForeignKey('semester_record.id'), nullable=False)
    subject_code = db.Column(db.String(20), nullable=False)
    subject_name = db.Column(db.String(200), nullable=False)
    credits = db.Column(db.Integer)
    grade = db.Column(db.String(2))
    attendance_percentage = db.Column(db.Float)
    is_backlog = db.Column(db.Boolean, default=False)
    internal_marks = db.Column(db.Float)
    external_marks = db.Column(db.Float)
    total_marks = db.Column(db.Float)
    result_status = db.Column(db.String(20))  # Pass, Fail, Absent

class AttendanceRecord(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_profile_id = db.Column(db.Integer, db.ForeignKey('student_profile.id'), nullable=False)
    subject_code = db.Column(db.String(20), nullable=False)
    date = db.Column(db.Date, nullable=False)
    status = db.Column(db.String(20))  # Present, Absent, Late
    remarks = db.Column(db.String(200))

class Document(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_profile_id = db.Column(db.Integer, db.ForeignKey('student_profile.id'), nullable=False)
    document_type = db.Column(db.String(50))  # ID Card, Fee Receipt, Certificate, etc.
    file_name = db.Column(db.String(200))
    file_path = db.Column(db.String(500))
    upload_date = db.Column(db.DateTime, default=datetime.utcnow)
    verified = db.Column(db.Boolean, default=False)
    verification_date = db.Column(db.DateTime)
    verified_by = db.Column(db.Integer, db.ForeignKey('user.id'))