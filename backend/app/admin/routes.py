import random
from flask import Blueprint, request, jsonify
from app.auth.routes import require_role
from app.models import db, Product, Order, User, Category, ProductImage

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')

@admin_bp.route('/metrics', methods=['GET'])
@require_role(['ADMIN', 'SUPER_ADMIN', 'STAFF'])
def get_metrics():
    try:
        orders = Order.query.all()
        total_sales = sum(ord.total_amount for ord in orders)
        order_count = len(orders)
        total_products = Product.query.count()
        low_stock_count = Product.query.filter(Product.stock < 20).count()
        total_users = User.query.count()

        return jsonify({
            'gross_sales': total_sales,
            'order_count': order_count,
            'average_order_value': round(total_sales / order_count, 2) if order_count > 0 else 0.0,
            'low_stock_count': low_stock_count,
            'total_products': total_products,
            'total_customers': total_users,
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/products', methods=['POST'])
@require_role(['ADMIN', 'SUPER_ADMIN'])
def add_product():
    try:
        data = request.get_json() or {}
        name = data.get('name', '').strip()
        price = data.get('base_price')

        if not name or price is None:
            return jsonify({'error': 'Product name and base price are required'}), 400

        slug = data.get('slug') or name.lower().replace(' ', '-')
        sku = data.get('sku') or f"UNI-{random.randint(100, 999)}"

        new_product = Product(
            name=name,
            slug=slug,
            description=data.get('description', 'Curated product for UniStore.'),
            category_id=data.get('category_id'),
            base_price=float(price),
            compare_at_price=float(data.get('compare_at_price', price * 1.2)),
            sku=sku,
            stock=int(data.get('stock', 10)),
            is_active=True,
            is_featured=bool(data.get('is_featured', False)),
            is_bestseller=bool(data.get('is_bestseller', False)),
            badge=data.get('badge'),
        )
        db.session.add(new_product)
        db.session.flush()

        for img in data.get('images', []):
            product_img = ProductImage(
                product_id=new_product.id,
                image_url=img['image_url'],
                is_primary=img.get('is_primary', False),
                display_order=img.get('display_order', 0)
            )
            db.session.add(product_img)

        db.session.commit()
        return jsonify({'product': new_product.to_dict(), 'message': 'Product created successfully'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/products/<product_id>/toggle-status', methods=['PATCH'])
@require_role(['ADMIN', 'SUPER_ADMIN', 'STAFF'])
def toggle_product_status(product_id):
    try:
        product = Product.query.get(product_id)
        if not product:
            return jsonify({'error': 'Product not found'}), 404
        product.is_active = not product.is_active
        db.session.commit()
        return jsonify({
            'product': product.to_dict(),
            'message': f"Product is now {'ACTIVE' if product.is_active else 'INACTIVE'}"
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/orders/<order_id>/status', methods=['PATCH'])
@require_role(['ADMIN', 'SUPER_ADMIN', 'STAFF'])
def update_order_status(order_id):
    try:
        data = request.get_json() or {}
        new_status = data.get('status')
        if not new_status:
            return jsonify({'error': 'Status is required'}), 400

        order = Order.query.filter(
            (Order.order_number == order_id) | (Order.id == order_id)
        ).first()

        if not order:
            return jsonify({'error': 'Order not found'}), 404

        order.status = new_status
        db.session.commit()
        return jsonify({
            'order': order.to_dict(),
            'message': f"Order status updated to {new_status}"
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
