from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models.user import User, db
from ..models.dcsa import ResearchPublication, DepartmentRole
from datetime import datetime

research = Blueprint('research', __name__)

@research.route('/api/dcsa/publications', methods=['GET'])
def get_publications():
    """Get all research publications with filters"""
    # Get query parameters
    user_id = request.args.get('user_id', type=int)
    year = request.args.get('year', type=int)
    pub_type = request.args.get('type')
    
    query = ResearchPublication.query
    
    # Apply filters
    if user_id:
        query = query.filter_by(user_id=user_id)
    if year:
        query = query.filter_by(year=year)
    if pub_type:
        query = query.filter_by(publication_type=pub_type)
    
    publications = query.order_by(ResearchPublication.year.desc()).all()
    
    return jsonify([{
        'id': pub.id,
        'title': pub.title,
        'authors': pub.authors,
        'publication_type': pub.publication_type,
        'journal_name': pub.journal_name,
        'conference_name': pub.conference_name,
        'year': pub.year,
        'doi': pub.doi,
        'url': pub.url,
        'citation_count': pub.citation_count,
        'abstract': pub.abstract,
        'author': pub.user.full_name
    } for pub in publications]), 200

@research.route('/api/dcsa/publications', methods=['POST'])
@jwt_required()
def add_publication():
    """Add a new research publication"""
    current_user = User.query.get(get_jwt_identity())
    data = request.get_json()
    
    publication = ResearchPublication(
        user_id=current_user.id,
        title=data['title'],
        authors=data['authors'],
        publication_type=data['publication_type'],
        journal_name=data.get('journal_name'),
        conference_name=data.get('conference_name'),
        year=data['year'],
        doi=data.get('doi'),
        url=data.get('url'),
        citation_count=data.get('citation_count', 0),
        abstract=data.get('abstract')
    )
    
    db.session.add(publication)
    db.session.commit()
    
    return jsonify({
        'message': 'Publication added successfully',
        'publication': {
            'id': publication.id,
            'title': publication.title,
            'authors': publication.authors
        }
    }), 201

@research.route('/api/dcsa/publications/<int:pub_id>', methods=['PUT'])
@jwt_required()
def update_publication(pub_id):
    """Update a publication"""
    current_user = User.query.get(get_jwt_identity())
    publication = ResearchPublication.query.get_or_404(pub_id)
    
    # Check if user owns this publication or is faculty
    if publication.user_id != current_user.id and not current_user.is_faculty:
        return jsonify({'error': 'Not authorized to update this publication'}), 403
    
    data = request.get_json()
    updateable_fields = [
        'title', 'authors', 'publication_type', 'journal_name',
        'conference_name', 'year', 'doi', 'url', 'citation_count', 'abstract'
    ]
    
    for field in updateable_fields:
        if field in data:
            setattr(publication, field, data[field])
    
    db.session.commit()
    return jsonify({'message': 'Publication updated successfully'}), 200

@research.route('/api/dcsa/research-roles', methods=['GET'])
def get_research_roles():
    """Get all research roles (faculty and research scholars)"""
    roles = DepartmentRole.query.filter(
        DepartmentRole.role_type.in_(['Faculty', 'Research Scholar'])
    ).all()
    
    return jsonify([{
        'id': role.id,
        'user': {
            'id': role.user.id,
            'name': role.user.full_name,
            'email': role.user.email if role.user.email_visibility else None
        },
        'role_type': role.role_type,
        'designation': role.designation,
        'research_interests': role.user.research_interests,
        'publication_count': len(role.user.research_publications)
    } for role in roles]), 200

@research.route('/api/dcsa/research-stats', methods=['GET'])
def get_research_stats():
    """Get research statistics"""
    # Publications by year
    publications = ResearchPublication.query.all()
    years = {}
    for pub in publications:
        years[pub.year] = years.get(pub.year, 0) + 1
    
    # Publications by type
    pub_types = {}
    for pub in publications:
        pub_types[pub.publication_type] = pub_types.get(pub.publication_type, 0) + 1
    
    # Top cited publications
    top_cited = ResearchPublication.query.order_by(
        ResearchPublication.citation_count.desc()
    ).limit(5).all()
    
    # Faculty research stats
    faculty = User.query.filter_by(is_faculty=True).all()
    faculty_stats = [{
        'name': f.full_name,
        'publication_count': len(f.research_publications),
        'total_citations': sum(p.citation_count for p in f.research_publications)
    } for f in faculty]
    
    return jsonify({
        'publications_by_year': years,
        'publications_by_type': pub_types,
        'top_cited_publications': [{
            'title': p.title,
            'authors': p.authors,
            'citations': p.citation_count,
            'year': p.year
        } for p in top_cited],
        'faculty_statistics': faculty_stats
    }), 200