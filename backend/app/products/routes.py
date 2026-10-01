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

from app.supabase_client import get_supabase

def fetch_all_active_products():
    now = time.time()
    if _CATALOG_CACHE['products'] is not None and (now - _CATALOG_CACHE['timestamp']) < _CATALOG_CACHE['ttl']:
        return _CATALOG_CACHE['products']

    try:
        # Eager load relationships in a single combined SQL query
        products = Product.query.options(
            joinedload(Product.images),
            joinedload(Product.variants),
            joinedload(Product.category)
        ).filter_by(is_active=True).all()
        serialized = [p.to_dict() for p in products]
    except Exception as sql_err:
        print(f"⚠️ Direct SQL query failed ({sql_err}). Falling back to Supabase HTTPS REST API...")
        sp = get_supabase()
        if sp:
            res = sp.table('products').select('*, images:product_images(*), variants:product_variants(*), category:categories(*)').eq('is_active', True).execute()
            data = res.data or []
            serialized = []
            for item in data:
                cat = item.get('category') or {}
                raw_imgs = sorted(item.get('images') or [], key=lambda x: (not x.get('is_primary', False), x.get('display_order', 0)))
                serialized.append({
                    'id': item.get('id'),
                    'name': item.get('name'),
                    'slug': item.get('slug'),
                    'description': item.get('description'),
                    'category_id': item.get('category_id'),
                    'category_name': cat.get('name', ''),
                    'category_slug': cat.get('slug', ''),
                    'base_price': float(item.get('base_price', 0)),
                    'compare_at_price': float(item.get('compare_at_price')) if item.get('compare_at_price') else None,
                    'sku': item.get('sku'),
                    'stock': item.get('stock', 0),
                    'is_active': item.get('is_active', True),
                    'is_featured': item.get('is_featured', False),
                    'is_bestseller': item.get('is_bestseller', False),
                    'rating': float(item.get('rating', 4.8) or 4.8),
                    'review_count': item.get('review_count', 0),
                    'badge': item.get('badge'),
                    'images': raw_imgs,
                    'variants': [v for v in (item.get('variants') or []) if v.get('is_active', True)],
                })
        else:
            raise sql_err

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
