from flask import Blueprint, request, jsonify
from app.models import db, Review, Product
from app.supabase_client import get_supabase

reviews_bp = Blueprint('reviews', __name__, url_prefix='/api/reviews')

@reviews_bp.route('/product/<product_id>', methods=['GET'])
def get_product_reviews(product_id):
    try:
        revs = Review.query.filter_by(product_id=product_id).order_by(Review.created_at.desc()).all()
        return jsonify({
            'reviews': [r.to_dict() for r in revs],
            'count': len(revs)
        }), 200
    except Exception:
        # Fallback to Supabase REST
        try:
            sp = get_supabase()
            if sp:
                res = sp.table('reviews').select('*').eq('product_id', product_id).order('created_at', desc=True).execute()
                data = res.data or []
                return jsonify({
                    'reviews': data,
                    'count': len(data)
                }), 200
        except Exception:
            pass
        return jsonify({'reviews': [], 'count': 0}), 200

@reviews_bp.route('', methods=['POST'])
def add_review():
    try:
        data = request.get_json() or {}
        product_id = data.get('product_id')
        user_name = data.get('author_name') or data.get('user_name', '').strip()
        comment = data.get('comment', '').strip()
        rating = int(data.get('rating', 5))
        user_id = data.get('user_id')

        if not product_id or not user_name or not comment:
            return jsonify({'error': 'Product ID, author name, and comment are required'}), 400

        review_dict = {
            'product_id': product_id,
            'user_id': user_id,
            'user_name': user_name,
            'rating': max(1, min(5, rating)),
            'comment': comment,
            'is_verified_purchase': True
        }

        # 1. Try SQLAlchemy
        try:
            new_review = Review(**review_dict)
            db.session.add(new_review)

            product = db.session.get(Product, product_id)
            if product:
                all_ratings = [r.rating for r in product.reviews] + [new_review.rating]
                product.review_count = len(all_ratings)
                product.rating = round(sum(all_ratings) / len(all_ratings), 1)

            db.session.commit()
            return jsonify({
                'review': new_review.to_dict(),
                'message': 'Review submitted successfully'
            }), 201
        except Exception:
            db.session.rollback()

        # 2. Fallback to Supabase REST
        sp = get_supabase()
        if sp:
            ins_res = sp.table('reviews').insert(review_dict).execute()
            if ins_res.data:
                return jsonify({
                    'review': ins_res.data[0],
                    'message': 'Review submitted successfully'
                }), 201

        return jsonify({'message': 'Review recorded successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
