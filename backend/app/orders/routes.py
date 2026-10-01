from flask import Blueprint, request, jsonify
import random
import datetime
from app.models import db, Order, OrderItem, Product, ProductVariant

orders_bp = Blueprint('orders', __name__, url_prefix='/api/orders')

@orders_bp.route('', methods=['GET'])
def get_orders():
    try:
        user_id = request.args.get('user_id')
        query = Order.query
        if user_id:
            query = query.filter_by(user_id=user_id)
        orders = query.order_by(Order.created_at.desc()).all()
        return jsonify({'orders': [o.to_dict() for o in orders]}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@orders_bp.route('', methods=['POST'])
def create_order():
    try:
        data = request.get_json() or {}
        items = data.get('items', [])
        shipping_address = data.get('shipping_address')
        payment_method = data.get('payment_method', 'RAZORPAY')
        discount_amount = float(data.get('discount_amount', 0.0))
        user_id = data.get('user_id')

        if not items or not shipping_address:
            return jsonify({'error': 'Order items and shipping address are required'}), 400

        order_number = f"UNI-{random.randint(100000, 999999)}"
        subtotal = 0.0
        order_items_to_create = []

        for item in items:
            prod_id = item.get('product_id')
            var_id = item.get('variant_id')
            qty = max(1, int(item.get('quantity', 1)))

            product = db.session.get(Product, prod_id)
            if not product:
                continue

            price = product.base_price
            if var_id:
                variant = db.session.get(ProductVariant, var_id)
                if variant:
                    price = variant.price
                    # Deduct variant stock
                    variant.stock = max(0, variant.stock - qty)

            # Deduct product stock
            product.stock = max(0, product.stock - qty)

            line_total = price * qty
            subtotal += line_total

            img_url = item.get('image_url')
            if not img_url and product.images:
                img_url = product.images[0].image_url

            order_items_to_create.append({
                'product_id': prod_id,
                'variant_id': var_id,
                'product_name': product.name,
                'price': price,
                'quantity': qty,
                'total': line_total,
                'image_url': img_url
            })

        shipping_fee = 0.0 if (subtotal - discount_amount) >= 999.0 else 99.0
        taxable_subtotal = max(0.0, subtotal - discount_amount)
        tax_amount = round(taxable_subtotal * 0.18, 2)
        total_amount = round(taxable_subtotal + shipping_fee + tax_amount, 2)

        new_order = Order(
            order_number=order_number,
            user_id=user_id,
            status='CONFIRMED' if payment_method in ['COD', 'RAZORPAY'] else 'PENDING',
            subtotal=subtotal,
            discount_amount=discount_amount,
            shipping_fee=shipping_fee,
            tax_amount=tax_amount,
            total_amount=total_amount,
            currency='INR',
            payment_method=payment_method,
            payment_status='PAID' if payment_method == 'RAZORPAY' else 'PENDING',
            tracking_number=f"BLUEDART-{random.randint(100000000, 999999999)}",
            carrier='Bluedart Express',
        )
        new_order.shipping_address = shipping_address
        db.session.add(new_order)
        db.session.flush() # Populate new_order.id

        for oi in order_items_to_create:
            order_item = OrderItem(
                order_id=new_order.id,
                product_id=oi['product_id'],
                variant_id=oi.get('variant_id'),
                product_name=oi['product_name'],
                price=oi['price'],
                quantity=oi['quantity'],
                total=oi['total'],
                image_url=oi.get('image_url')
            )
            db.session.add(order_item)

        db.session.commit()
        order_dict = new_order.to_dict()
        try:
            from app.firebase_client import backup_record_to_firestore
            backup_record_to_firestore('backup_orders', new_order.order_number, order_dict)
        except Exception as fb_err:
            print(f"⚠️ Non-blocking Firestore backup note: {fb_err}")

        return jsonify({'order': order_dict}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@orders_bp.route('/<order_id>', methods=['GET'])
def get_order(order_id):
    try:
        order = Order.query.filter(
            (Order.order_number == order_id) | (Order.id == order_id)
        ).first()

        if not order:
            return jsonify({'error': 'Order not found'}), 404
        return jsonify({'order': order.to_dict()}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@orders_bp.route('/<order_id>/track', methods=['GET'])
def track_order(order_id):
    try:
        order = Order.query.filter(
            (Order.order_number == order_id) | (Order.id == order_id)
        ).first()

        if not order:
            # Fallback simulated timeline
            return jsonify({
                'order_id': order_id,
                'carrier': 'Bluedart Express',
                'tracking_number': 'BLUEDART-839201948',
                'status': 'IN_TRANSIT',
                'estimated_delivery': 'Within 48 Hours',
                'events': [
                    {'title': 'Order Confirmed', 'time': 'Today, 10:30 AM', 'completed': True},
                    {'title': 'Quality Assessment & Packed', 'time': 'Today, 12:15 PM', 'completed': True},
                    {'title': 'Dispatched with Bluedart', 'time': 'Today, 02:40 PM', 'completed': True},
                    {'title': 'Out for Delivery', 'time': 'Expected Tomorrow, by 2 PM', 'completed': False},
                    {'title': 'Delivered', 'time': 'Pending', 'completed': False},
                ]
            }), 200

        is_shipped = order.status in ['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED']
        is_out = order.status in ['OUT_FOR_DELIVERY', 'DELIVERED']
        is_delivered = order.status == 'DELIVERED'

        return jsonify({
            'order_id': order.order_number,
            'carrier': order.carrier,
            'tracking_number': order.tracking_number,
            'status': order.status,
            'estimated_delivery': 'Within 2-3 Business Days',
            'events': [
                {'title': 'Order Confirmed', 'time': order.created_at.strftime('%d %b %Y, %I:%M %p') if order.created_at else 'Just now', 'completed': True},
                {'title': 'Quality Check & Packed', 'time': 'Fulfilled at Central Hub', 'completed': True},
                {'title': 'Dispatched with Carrier', 'time': order.carrier, 'completed': is_shipped},
                {'title': 'Out for Delivery', 'time': 'Local Delivery Agent', 'completed': is_out},
                {'title': 'Delivered', 'time': 'Doorstep Handover', 'completed': is_delivered},
            ]
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
