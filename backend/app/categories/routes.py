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

def fetch_all_active_categories():
    now = time.time()
    if _CATEGORIES_CACHE['categories'] is not None and (now - _CATEGORIES_CACHE['timestamp']) < _CATEGORIES_CACHE['ttl']:
        return _CATEGORIES_CACHE['categories']

    cats = Category.query.filter_by(is_active=True).order_by(Category.display_order.asc()).all()
    serialized = [c.to_dict() for c in cats]
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
