from flask import Blueprint, jsonify
import time
from app.models import Category

categories_bp = Blueprint('categories', __name__, url_prefix='/api/categories')

_CATEGORIES_CACHE = {
    'categories': None,
    'timestamp': 0,
    'ttl': 60.0  # 60 seconds TTL
}

def invalidate_categories_cache():
    global _CATEGORIES_CACHE
    _CATEGORIES_CACHE['categories'] = None
    _CATEGORIES_CACHE['timestamp'] = 0

from app.supabase_client import get_supabase

def fetch_all_active_categories():
    now = time.time()
    if _CATEGORIES_CACHE['categories'] is not None and (now - _CATEGORIES_CACHE['timestamp']) < _CATEGORIES_CACHE['ttl']:
        return _CATEGORIES_CACHE['categories']

    try:
        cats = Category.query.filter_by(is_active=True).order_by(Category.display_order.asc()).all()
        serialized = [c.to_dict() for c in cats]
    except Exception as sql_err:
        print(f"⚠️ Direct SQL query failed ({sql_err}). Falling back to Supabase HTTPS REST API...")
        sp = get_supabase()
        if sp:
            res = sp.table('categories').select('*').eq('is_active', True).order('display_order').execute()
            data = res.data or []
            serialized = [{
                'id': c.get('id'),
                'name': c.get('name'),
                'slug': c.get('slug'),
                'description': c.get('description'),
                'image_url': c.get('image_url'),
                'display_order': c.get('display_order', 0),
                'is_active': c.get('is_active', True),
            } for c in data]
        else:
            raise sql_err

    _CATEGORIES_CACHE['categories'] = serialized
    _CATEGORIES_CACHE['timestamp'] = now
    return serialized

@categories_bp.route('', methods=['GET'])
def get_categories():
    try:
        categories = fetch_all_active_categories()
        return jsonify({'categories': categories}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@categories_bp.route('/<slug>', methods=['GET'])
def get_category_by_slug(slug):
    try:
        categories = fetch_all_active_categories()
        for c in categories:
            if c.get('slug') == slug:
                return jsonify({'category': c}), 200

        cat = Category.query.filter_by(slug=slug, is_active=True).first()
        if not cat:
            return jsonify({'error': 'Category not found'}), 404
        return jsonify({'category': cat.to_dict()}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
