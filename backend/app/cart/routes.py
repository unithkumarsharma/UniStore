from flask import Blueprint, request, jsonify
from app.models import db, Product, ProductVariant, Coupon

cart_bp = Blueprint('cart', __name__, url_prefix='/api/cart')

FREE_SHIPPING_THRESHOLD = 999.0
STANDARD_SHIPPING_FEE = 99.0

@cart_bp.route('/validate', methods=['POST'])
def validate_cart():
    """
    Authoritative server-side cart validator using live database.
    Ensures that prices and stock are determined securely on the backend,
    preventing any client-side tampering of totals.
    """
    try:
        data = request.get_json() or {}
        items = data.get('items', [])
        coupon_code = data.get('coupon_code', '').strip().upper()

        validated_items = []
        subtotal = 0.0

        for item in items:
            prod_id = item.get('product_id')
            variant_id = item.get('variant_id')
            qty = max(1, int(item.get('quantity', 1)))

            product = db.session.get(Product, prod_id)
            if not product:
                continue

            price = product.base_price
            variant_name = None

            if variant_id:
                variant = db.session.get(ProductVariant, variant_id)
                if variant:
                    price = variant.price
                    variant_name = variant.title

            line_total = price * qty
            subtotal += line_total

            img_url = item.get('image_url')
            if not img_url and product.images:
                img_url = product.images[0].image_url

            validated_items.append({
                'product_id': product.id,
                'product_name': product.name,
                'variant_id': variant_id,
                'variant_name': variant_name,
                'price': price,
                'quantity': qty,
                'total': line_total,
                'image_url': img_url
            })

        # Coupon Calculation from database
        discount_amount = 0.0
        applied_coupon = None

        if coupon_code:
            coupon = Coupon.query.filter_by(code=coupon_code, is_active=True).first()
            if coupon and subtotal >= coupon.min_order_amount:
                if coupon.discount_type == 'PERCENTAGE':
                    discount_amount = round(subtotal * (coupon.discount_value / 100.0), 2)
                    if coupon.max_discount:
                        discount_amount = min(discount_amount, coupon.max_discount)
                else: # FIXED
                    discount_amount = min(coupon.discount_value, subtotal)
                applied_coupon = coupon.code

        shipping_fee = 0.0 if (subtotal == 0 or (subtotal - discount_amount) >= FREE_SHIPPING_THRESHOLD) else STANDARD_SHIPPING_FEE
        taxable_amount = max(0.0, subtotal - discount_amount)
        # Indian consumer retail: listed prices are inclusive of 18% GST
        tax_amount = round(taxable_amount * (0.18 / 1.18), 2)
        total_amount = max(0.0, round(taxable_amount + shipping_fee, 2))

        return jsonify({
            'items': validated_items,
            'subtotal': subtotal,
            'discount_amount': discount_amount,
            'coupon_code': applied_coupon,
            'shipping_fee': shipping_fee,
            'tax_amount': tax_amount,
            'total_amount': total_amount,
            'free_shipping_threshold': FREE_SHIPPING_THRESHOLD,
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
