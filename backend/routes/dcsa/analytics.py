from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models.user import User, db
from ..models.dcsa import (
    Course, DepartmentEvent, ResearchPublication,
    Achievement, EventParticipant
)
from sqlalchemy import func, extract
from datetime import datetime

analytics = Blueprint('analytics', __name__)

@analytics.route('/api/dcsa/analytics/overview', methods=['GET'])
def get_department_overview():
    """Get comprehensive department analytics"""
    # Basic counts
    total_students = User.query.filter_by(is_alumni=False).count()
    total_alumni = User.query.filter_by(is_alumni=True).count()
    total_faculty = User.query.filter_by(is_faculty=True).count()
    total_events = DepartmentEvent.query.count()
    total_publications = ResearchPublication.query.count()
    
    # Course-wise distribution
    courses = Course.query.all()
    course_stats = [{
        'course': course.name,
        'current_students': len([s for s in course.students if not s.is_alumni]),
        'alumni': len([s for s in course.students if s.is_alumni]),
        'average_cgpa': sum(s.cgpa or 0 for s in course.students) / len(course.students) if course.students else 0
    } for course in courses]
    
    # Placement statistics
    placed_students = User.query.filter(User.placement_company.isnot(None)).all()
    placement_stats = {
        'total_placed': len(placed_students),
        'top_companies': db.session.query(
            User.placement_company,
            func.count(User.id)
        ).filter(User.placement_company.isnot(None))
        .group_by(User.placement_company)
        .order_by(func.count(User.id).desc())
        .limit(5).all()
    }
    
    # Research metrics
    research_stats = {
        'total_publications': total_publications,
        'publication_types': db.session.query(
            ResearchPublication.publication_type,
            func.count(ResearchPublication.id)
        ).group_by(ResearchPublication.publication_type).all(),
        'publications_by_year': db.session.query(
            ResearchPublication.year,
            func.count(ResearchPublication.id)
        ).group_by(ResearchPublication.year)
        .order_by(ResearchPublication.year.desc()).all()
    }
    
    # Event statistics
    event_stats = {
        'total_events': total_events,
        'event_types': db.session.query(
            DepartmentEvent.event_type,
            func.count(DepartmentEvent.id)
        ).group_by(DepartmentEvent.event_type).all(),
        'average_attendance': db.session.query(
            func.avg(func.array_length(DepartmentEvent.participants, 1))
        ).scalar() or 0
    }
    
    # Achievement statistics
    achievement_stats = {
        'total_achievements': Achievement.query.count(),
        'types': db.session.query(
            Achievement.achievement_type,
            func.count(Achievement.id)
        ).group_by(Achievement.achievement_type).all()
    }
    
    return jsonify({
        'department_overview': {
            'total_students': total_students,
            'total_alumni': total_alumni,
            'total_faculty': total_faculty,
            'student_faculty_ratio': total_students / total_faculty if total_faculty > 0 else 0
        },
        'course_statistics': course_stats,
        'placement_statistics': placement_stats,
        'research_metrics': research_stats,
        'event_statistics': event_stats,
        'achievement_statistics': achievement_stats
    }), 200

@analytics.route('/api/dcsa/analytics/trends', methods=['GET'])
def get_department_trends():
    """Get trend analysis for various metrics"""
    # Get trends over the past 5 years
    current_year = datetime.utcnow().year
    years = range(current_year - 4, current_year + 1)
    
    # Enrollment trends
    enrollment_trends = []
    for year in years:
        enrollment_trends.append({
            'year': year,
            'new_enrollments': User.query.filter_by(batch_year=year).count(),
            'graduations': User.query.filter_by(graduation_year=year).count()
        })
    
    # Placement trends
    placement_trends = []
    for year in years:
        placed_count = User.query.filter_by(placement_year=year).count()
        total_graduates = User.query.filter_by(graduation_year=year).count()
        placement_trends.append({
            'year': year,
            'placed_students': placed_count,
            'placement_percentage': (placed_count / total_graduates * 100) if total_graduates > 0 else 0
        })
    
    # Research trends
    research_trends = []
    for year in years:
        research_trends.append({
            'year': year,
            'publications': ResearchPublication.query.filter_by(year=year).count(),
            'citations': db.session.query(func.sum(ResearchPublication.citation_count))
                .filter_by(year=year).scalar() or 0
        })
    
    # Event engagement trends
    event_trends = []
    for year in years:
        events = DepartmentEvent.query.filter(
            extract('year', DepartmentEvent.start_date) == year
        ).all()
        event_trends.append({
            'year': year,
            'total_events': len(events),
            'total_participants': sum(len(event.participants) for event in events)
        })
    
    return jsonify({
        'enrollment_trends': enrollment_trends,
        'placement_trends': placement_trends,
        'research_trends': research_trends,
        'event_trends': event_trends
    }), 200

@analytics.route('/api/dcsa/analytics/course/<int:course_id>', methods=['GET'])
def get_course_analytics(course_id):
    """Get detailed analytics for a specific course"""
    course = Course.query.get_or_404(course_id)
    
    # Student statistics
    current_students = [s for s in course.students if not s.is_alumni]
    alumni = [s for s in course.students if s.is_alumni]
    
    # Academic performance
    cgpa_ranges = {
        '9-10': len([s for s in course.students if s.cgpa and s.cgpa >= 9]),
        '8-9': len([s for s in course.students if s.cgpa and 8 <= s.cgpa < 9]),
        '7-8': len([s for s in course.students if s.cgpa and 7 <= s.cgpa < 8]),
        'Below 7': len([s for s in course.students if s.cgpa and s.cgpa < 7])
    }
    
    # Placement statistics
    placed_students = [s for s in alumni if s.placement_company]
    
    # Achievement distribution
    achievements = []
    for student in course.students:
        achievements.extend(student.achievements)
    
    return jsonify({
        'course_info': {
            'name': course.name,
            'duration': course.duration,
            'total_students': len(course.students),
            'current_students': len(current_students),
            'alumni': len(alumni)
        },
        'academic_metrics': {
            'cgpa_distribution': cgpa_ranges,
            'average_cgpa': sum(s.cgpa or 0 for s in course.students) / len(course.students) if course.students else 0,
            'top_performers': [{
                'name': s.full_name,
                'cgpa': s.cgpa
            } for s in sorted(course.students, key=lambda x: x.cgpa or 0, reverse=True)[:5]]
        },
        'placement_metrics': {
            'placed_students': len(placed_students),
            'placement_rate': (len(placed_students) / len(alumni) * 100) if alumni else 0,
            'companies': list(set(s.placement_company for s in placed_students if s.placement_company))
        },
        'achievement_metrics': {
            'total_achievements': len(achievements),
            'achievement_types': {
                atype: len([a for a in achievements if a.achievement_type == atype])
                for atype in set(a.achievement_type for a in achievements)
            }
        }
    }), 200