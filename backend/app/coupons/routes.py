from flask import Blueprint, request, jsonify
from app.models import Coupon
from app.supabase_client import get_supabase

coupons_bp = Blueprint('coupons', __name__, url_prefix='/api/coupons')

STANDARD_COUPONS = {
    'WELCOME10': {'discount_type': 'PERCENTAGE', 'discount_value': 10.0, 'min_order_amount': 999.0, 'max_discount': 500.0},
    'UNISTORE10': {'discount_type': 'PERCENTAGE', 'discount_value': 10.0, 'min_order_amount': 999.0, 'max_discount': 500.0},
    'FESTIVE20': {'discount_type': 'PERCENTAGE', 'discount_value': 20.0, 'min_order_amount': 1999.0, 'max_discount': 1000.0},
    'FLAT500': {'discount_type': 'FIXED', 'discount_value': 500.0, 'min_order_amount': 2999.0, 'max_discount': 500.0},
}

@coupons_bp.route('/validate', methods=['POST'])
def validate_coupon():
    try:
        data = request.get_json() or {}
        code = data.get('code', '').strip().upper()
        order_subtotal = float(data.get('order_subtotal', 0.0))

        if not code:
            return jsonify({'error': 'Coupon code is required'}), 400

        coupon_data = None

        # 1. Try SQLAlchemy Query
        try:
            coupon = Coupon.query.filter_by(code=code, is_active=True).first()
            if coupon:
                coupon_data = {
                    'code': coupon.code,
                    'discount_type': coupon.discount_type,
                    'discount_value': coupon.discount_value,
                    'min_order_amount': coupon.min_order_amount,
                    'max_discount': coupon.max_discount,
                }
        except Exception:
            pass

        # 2. Try Supabase REST HTTPS
        if not coupon_data:
            try:
                sp = get_supabase()
                if sp:
                    res = sp.table('coupons').select('*').eq('code', code).eq('is_active', True).execute()
                    if res.data and len(res.data) > 0:
                        c = res.data[0]
                        coupon_data = {
                            'code': c.get('code'),
                            'discount_type': c.get('discount_type', 'PERCENTAGE'),
                            'discount_value': float(c.get('discount_value', 10.0)),
                            'min_order_amount': float(c.get('min_order_amount', 0.0)),
                            'max_discount': float(c.get('max_discount', 500.0)) if c.get('max_discount') else None,
                        }
            except Exception:
                pass

        # 3. Fallback to standard platform coupons
        if not coupon_data and code in STANDARD_COUPONS:
            coupon_data = {'code': code, **STANDARD_COUPONS[code]}

        if not coupon_data:
            return jsonify({'valid': False, 'message': 'Invalid or expired coupon code'}), 404

        min_val = coupon_data['min_order_amount']
        if order_subtotal < min_val:
            return jsonify({
                'valid': False,
                'message': f"Minimum cart value of ₹{min_val:.0f} required for this code"
            }), 400

        disc_val = coupon_data['discount_value']
        disc_desc = f"{disc_val:.0f}%" if coupon_data['discount_type'] == 'PERCENTAGE' else f"₹{disc_val:.0f}"

        return jsonify({
            'valid': True,
            'code': coupon_data['code'],
            'discount_type': coupon_data['discount_type'],
            'discount_value': disc_val,
            'max_discount': coupon_data.get('max_discount'),
            'message': f"Coupon applied! {disc_desc} discount activated."
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
