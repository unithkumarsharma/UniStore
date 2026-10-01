import random
from flask import Blueprint, request, jsonify
from app.auth.routes import require_role
from app.models import db, Product, Order, User, Category, ProductImage
from app.supabase_client import get_supabase

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')

@admin_bp.route('/metrics', methods=['GET'])
@require_role(['ADMIN', 'SUPER_ADMIN', 'STAFF'])
def get_metrics():
    try:
        # 1. Try SQLAlchemy
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
        except Exception:
            pass

        # 2. Fallback to Supabase REST
        sp = get_supabase()
        if sp:
            o_res = sp.table('orders').select('id, total_amount').execute()
            orders = o_res.data or []
            total_sales = sum(float(o.get('total_amount', 0)) for o in orders)
            order_count = len(orders)

            p_res = sp.table('products').select('id, stock').execute()
            products = p_res.data or []
            total_products = len(products)
            low_stock_count = len([p for p in products if (p.get('stock') or 0) < 20])

            u_res = sp.table('users').select('id').execute()
            users = u_res.data or []
            total_users = len(users)

            return jsonify({
                'gross_sales': total_sales,
                'order_count': order_count,
                'average_order_value': round(total_sales / order_count, 2) if order_count > 0 else 0.0,
                'low_stock_count': low_stock_count,
                'total_products': total_products,
                'total_customers': total_users,
            }), 200

        return jsonify({
            'gross_sales': 0.0,
            'order_count': 0,
            'average_order_value': 0.0,
            'low_stock_count': 0,
            'total_products': 0,
            'total_customers': 0,
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/products', methods=['POST'])
@require_role(['ADMIN', 'SUPER_ADMIN'])
def add_product():
    try:
        data = request.get_json() or {}
        name = data.get('name', '').strip()
        price = data.get('base_price') if data.get('base_price') is not None else data.get('price')

        if not name or price is None:
            return jsonify({'error': 'Product name and base price are required'}), 400

        slug = data.get('slug') or name.lower().replace(' ', '-')
        sku = data.get('sku') or f"UNI-{random.randint(100, 999)}"

        images_list = data.get('images', [])
        if not images_list and data.get('image_url'):
            images_list = [{'image_url': data.get('image_url'), 'is_primary': True, 'display_order': 1}]

        # 1. Try SQLAlchemy
        try:
            new_product = Product(
                name=name,
                slug=slug,
                description=data.get('description', 'Curated product for UniStore.'),
                category_id=data.get('category_id'),
                base_price=float(price),
                compare_at_price=float(data.get('compare_at_price', float(price) * 1.2)),
                sku=sku,
                stock=int(data.get('stock', 10)),
                is_active=True,
                is_featured=bool(data.get('is_featured', False)),
                is_bestseller=bool(data.get('is_bestseller', False)),
                badge=data.get('badge'),
            )
            db.session.add(new_product)
            db.session.flush()

            for img in images_list:
                product_img = ProductImage(
                    product_id=new_product.id,
                    image_url=img['image_url'],
                    is_primary=img.get('is_primary', False),
                    display_order=img.get('display_order', 0)
                )
                db.session.add(product_img)

            db.session.commit()
            return jsonify({'product': new_product.to_dict(), 'message': 'Product created successfully'}), 201
        except Exception:
            db.session.rollback()

        # 2. Fallback to Supabase REST
        sp = get_supabase()
        if sp:
            prod_row = {
                'name': name,
                'slug': slug,
                'description': data.get('description', 'Curated product for UniStore.'),
                'category_id': data.get('category_id'),
                'base_price': float(price),
                'compare_at_price': float(data.get('compare_at_price', float(price) * 1.2)),
                'sku': sku,
                'stock': int(data.get('stock', 10)),
                'is_active': True,
                'is_featured': bool(data.get('is_featured', False)),
                'is_bestseller': bool(data.get('is_bestseller', False)),
                'badge': data.get('badge'),
            }
            res = sp.table('products').insert(prod_row).execute()
            if res.data and len(res.data) > 0:
                created_p = res.data[0]
                p_id = created_p['id']
                for img in images_list:
                    sp.table('product_images').insert({
                        'product_id': p_id,
                        'image_url': img['image_url'],
                        'is_primary': img.get('is_primary', False),
                        'display_order': img.get('display_order', 0)
                    }).execute()
                return jsonify({'product': created_p, 'message': 'Product created successfully'}), 201

        return jsonify({'error': 'Failed to persist product'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/products/<product_id>/toggle-status', methods=['PATCH'])
@require_role(['ADMIN', 'SUPER_ADMIN', 'STAFF'])
def toggle_product_status(product_id):
    try:
        # 1. Try SQLAlchemy
        try:
            product = db.session.get(Product, product_id)
            if product:
                product.is_active = not product.is_active
                db.session.commit()
                return jsonify({
                    'product': product.to_dict(),
                    'message': f"Product is now {'ACTIVE' if product.is_active else 'INACTIVE'}"
                }), 200
        except Exception:
            db.session.rollback()

        # 2. Fallback to Supabase REST
        sp = get_supabase()
        if sp:
            p_res = sp.table('products').select('*').eq('id', product_id).maybe_single().execute()
            if p_res.data:
                curr_status = p_res.data.get('is_active', True)
                new_st = not curr_status
                sp.table('products').update({'is_active': new_st}).eq('id', product_id).execute()
                return jsonify({
                    'product': {**p_res.data, 'is_active': new_st},
                    'message': f"Product is now {'ACTIVE' if new_st else 'INACTIVE'}"
                }), 200

        return jsonify({'error': 'Product not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/orders/<order_id>/status', methods=['PATCH'])
@require_role(['ADMIN', 'SUPER_ADMIN', 'STAFF'])
def update_order_status(order_id):
    try:
        data = request.get_json() or {}
        new_status = data.get('status')
        if not new_status:
            return jsonify({'error': 'Status is required'}), 400

        # 1. Try SQLAlchemy
        try:
            order = Order.query.filter(
                (Order.order_number == order_id) | (Order.id == order_id)
            ).first()

            if order:
                order.status = new_status
                db.session.commit()
                return jsonify({
                    'order': order.to_dict(),
                    'message': f"Order status updated to {new_status}"
                }), 200
        except Exception:
            db.session.rollback()

        # 2. Fallback to Supabase REST
        sp = get_supabase()
        if sp:
            o_res = sp.table('orders').select('*').or_(f"id.eq.{order_id},order_number.eq.{order_id}").maybe_single().execute()
            if o_res.data:
                sp.table('orders').update({'status': new_status}).eq('id', o_res.data['id']).execute()
                return jsonify({
                    'order': {**o_res.data, 'status': new_status},
                    'message': f"Order status updated to {new_status}"
                }), 200

        return jsonify({'error': 'Order not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500
