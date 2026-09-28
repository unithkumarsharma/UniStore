from flask import Blueprint, request, jsonify
from app.models import db, Review, Product

reviews_bp = Blueprint('reviews', __name__, url_prefix='/api/reviews')

@reviews_bp.route('/product/<product_id>', methods=['GET'])
def get_product_reviews(product_id):
    try:
        revs = Review.query.filter_by(product_id=product_id).order_by(Review.created_at.desc()).all()
        return jsonify({
            'reviews': [r.to_dict() for r in revs],
            'count': len(revs)
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

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

        new_review = Review(
            product_id=product_id,
            user_id=user_id,
            user_name=user_name,
            rating=max(1, min(5, rating)),
            comment=comment,
            is_verified_purchase=True
        )
        db.session.add(new_review)

        # Update product review count and average rating
        product = Product.query.get(product_id)
        if product:
            all_ratings = [r.rating for r in product.reviews] + [new_review.rating]
            product.review_count = len(all_ratings)
            product.rating = round(sum(all_ratings) / len(all_ratings), 1)

        db.session.commit()
        return jsonify({
            'review': new_review.to_dict(),
            'message': 'Review submitted successfully'
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
