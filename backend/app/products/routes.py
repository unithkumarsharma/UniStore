from flask import Blueprint, request, jsonify
from sqlalchemy.orm import joinedload
import time
from app.models import db, Product, Category

products_bp = Blueprint('products', __name__, url_prefix='/api/products')

# In-memory high-speed cache for catalog responses
_CATALOG_CACHE = {
    'products': None,
    'timestamp': 0,
    'ttl': 45.0  # 45 seconds TTL
}

def invalidate_products_cache():
    global _CATALOG_CACHE
    _CATALOG_CACHE['products'] = None
    _CATALOG_CACHE['timestamp'] = 0

def fetch_all_active_products():
    now = time.time()
    if _CATALOG_CACHE['products'] is not None and (now - _CATALOG_CACHE['timestamp']) < _CATALOG_CACHE['ttl']:
        return _CATALOG_CACHE['products']

    # Eager load relationships in a single combined SQL query
    products = Product.query.options(
        joinedload(Product.images),
        joinedload(Product.variants),
        joinedload(Product.category)
    ).filter_by(is_active=True).all()

    serialized = [p.to_dict() for p in products]
    _CATALOG_CACHE['products'] = serialized
    _CATALOG_CACHE['timestamp'] = now
    return serialized

@products_bp.route('', methods=['GET'])
def get_products():
    try:
        category_slug = request.args.get('category')
        search = request.args.get('search', '').strip().lower()
        sort_by = request.args.get('sort', 'popularity')
        max_price = request.args.get('max_price', type=float)

        all_products = fetch_all_active_products()
        filtered = list(all_products)

        # Category filter
        if category_slug and category_slug != 'all':
            filtered = [p for p in filtered if p.get('category_slug') == category_slug]

        # Price filter
        if max_price is not None:
            filtered = [p for p in filtered if p.get('base_price', 0) <= max_price]

        # Search filter
        if search:
            filtered = [
                p for p in filtered
                if search in p.get('name', '').lower()
                or search in p.get('description', '').lower()
                or search in p.get('category_name', '').lower()
            ]

        # Sorting
        if sort_by == 'price-low':
            filtered.sort(key=lambda x: x.get('base_price', 0))
        elif sort_by == 'price-high':
            filtered.sort(key=lambda x: x.get('base_price', 0), reverse=True)
        elif sort_by == 'rating':
            filtered.sort(key=lambda x: x.get('rating', 0), reverse=True)
        else: # popularity / reviews
            filtered.sort(key=lambda x: x.get('review_count', 0), reverse=True)

        return jsonify({
            'products': filtered,
            'count': len(filtered)
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@products_bp.route('/<slug>', methods=['GET'])
def get_product_by_slug(slug):
    try:
        # Check cache first for instant retrieval
        all_products = fetch_all_active_products()
        for p in all_products:
            if p.get('slug') == slug:
                return jsonify({'product': p}), 200

        # Fallback to direct query
        product = Product.query.options(
            joinedload(Product.images),
            joinedload(Product.variants),
            joinedload(Product.category)
        ).filter_by(slug=slug, is_active=True).first()

        if not product:
            return jsonify({'error': 'Product not found'}), 404
        return jsonify({'product': product.to_dict()}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@products_bp.route('/featured', methods=['GET'])
def get_featured_products():
    try:
        all_products = fetch_all_active_products()
        featured = [p for p in all_products if p.get('is_featured')]
        return jsonify({'products': featured}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@products_bp.route('/bestsellers', methods=['GET'])
def get_bestsellers():
    try:
        all_products = fetch_all_active_products()
        bestsellers = [p for p in all_products if p.get('is_bestseller')]
        return jsonify({'products': bestsellers}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
