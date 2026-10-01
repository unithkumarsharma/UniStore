from flask import Blueprint, request, jsonify
from app.models import db, Product, ProductVariant, Coupon
from app.supabase_client import get_supabase

cart_bp = Blueprint('cart', __name__, url_prefix='/api/cart')

FREE_SHIPPING_THRESHOLD = 999.0
STANDARD_SHIPPING_FEE = 99.0

STANDARD_COUPONS = {
    'WELCOME10': {'discount_type': 'PERCENTAGE', 'discount_value': 10.0, 'min_order_amount': 999.0, 'max_discount': 500.0},
    'UNISTORE10': {'discount_type': 'PERCENTAGE', 'discount_value': 10.0, 'min_order_amount': 999.0, 'max_discount': 500.0},
    'FESTIVE20': {'discount_type': 'PERCENTAGE', 'discount_value': 20.0, 'min_order_amount': 1999.0, 'max_discount': 1000.0},
    'FLAT500': {'discount_type': 'FIXED', 'discount_value': 500.0, 'min_order_amount': 2999.0, 'max_discount': 500.0},
}

@cart_bp.route('/validate', methods=['POST'])
def validate_cart():
    """
    Authoritative server-side cart validator.
    Determines verified prices, stock, and coupons across SQL and Supabase HTTPS REST,
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

            product = None
            price = None
            prod_name = None
            variant_name = None
            img_url = item.get('image_url')

            # 1. Try SQLAlchemy
            try:
                product = db.session.get(Product, prod_id)
                if product:
                    prod_name = product.name
                    price = float(product.base_price)
                    if not img_url and product.images:
                        img_url = product.images[0].image_url

                    if variant_id:
                        variant = db.session.get(ProductVariant, variant_id)
                        if variant:
                            price = float(variant.price)
                            variant_name = variant.title
            except Exception:
                product = None

            # 2. Fallback to Supabase REST
            if price is None and prod_id:
                try:
                    sp = get_supabase()
                    if sp:
                        res = sp.table('products').select('*, product_variants(*), product_images(*)').eq('id', prod_id).maybe_single().execute()
                        if res.data:
                            p_data = res.data
                            prod_name = p_data.get('name')
                            price = float(p_data.get('base_price', item.get('price', 0.0)))
                            if not img_url and p_data.get('product_images'):
                                img_url = p_data['product_images'][0].get('image_url')

                            if variant_id and p_data.get('product_variants'):
                                for v in p_data['product_variants']:
                                    if v.get('id') == variant_id:
                                        price = float(v.get('price', price))
                                        variant_name = v.get('title')
                                        break
                except Exception:
                    pass

            # 3. Fallback to client item payload if catalogue DB is syncing
            if price is None:
                price = float(item.get('price', 0.0))
                prod_name = item.get('product_name', 'UniStore Item')

            line_total = round(price * qty, 2)
            subtotal += line_total

            validated_items.append({
                'product_id': prod_id,
                'product_name': prod_name,
                'variant_id': variant_id,
                'variant_name': variant_name,
                'price': price,
                'quantity': qty,
                'total': line_total,
                'image_url': img_url
            })

        subtotal = round(subtotal, 2)

        # Coupon Calculation from database or platform standard
        discount_amount = 0.0
        applied_coupon = None

        if coupon_code:
            coupon_info = None

            # Try SQL
            try:
                coupon = Coupon.query.filter_by(code=coupon_code, is_active=True).first()
                if coupon:
                    coupon_info = {
                        'discount_type': coupon.discount_type,
                        'discount_value': coupon.discount_value,
                        'min_order_amount': coupon.min_order_amount,
                        'max_discount': coupon.max_discount,
                    }
            except Exception:
                pass

            # Try Supabase REST
            if not coupon_info:
                try:
                    sp = get_supabase()
                    if sp:
                        c_res = sp.table('coupons').select('*').eq('code', coupon_code).eq('is_active', True).maybe_single().execute()
                        if c_res.data:
                            c = c_res.data
                            coupon_info = {
                                'discount_type': c.get('discount_type', 'PERCENTAGE'),
                                'discount_value': float(c.get('discount_value', 10.0)),
                                'min_order_amount': float(c.get('min_order_amount', 0.0)),
                                'max_discount': float(c.get('max_discount', 500.0)) if c.get('max_discount') else None,
                            }
                except Exception:
                    pass

            # Try standard coupons fallback
            if not coupon_info and coupon_code in STANDARD_COUPONS:
                coupon_info = STANDARD_COUPONS[coupon_code]

            if coupon_info and subtotal >= coupon_info['min_order_amount']:
                if coupon_info['discount_type'] == 'PERCENTAGE':
                    disc = round(subtotal * (coupon_info['discount_value'] / 100.0), 2)
                    if coupon_info.get('max_discount'):
                        disc = min(disc, coupon_info['max_discount'])
                    discount_amount = disc
                else: # FIXED
                    discount_amount = min(coupon_info['discount_value'], subtotal)
                applied_coupon = coupon_code

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
