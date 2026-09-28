from flask import Blueprint, request, jsonify
from app.models import Coupon

coupons_bp = Blueprint('coupons', __name__, url_prefix='/api/coupons')

@coupons_bp.route('/validate', methods=['POST'])
def validate_coupon():
    try:
        data = request.get_json() or {}
        code = data.get('code', '').strip().upper()
        order_subtotal = float(data.get('order_subtotal', 0.0))

        if not code:
            return jsonify({'error': 'Coupon code is required'}), 400

        coupon = Coupon.query.filter_by(code=code, is_active=True).first()
        if not coupon:
            return jsonify({'valid': False, 'message': 'Invalid or expired coupon code'}), 404

        if order_subtotal < coupon.min_order_amount:
            return jsonify({
                'valid': False,
                'message': f"Minimum cart value of ₹{coupon.min_order_amount:.0f} required for this code"
            }), 400

        discount_desc = f"{coupon.discount_value:.0f}%" if coupon.discount_type == 'PERCENTAGE' else f"₹{coupon.discount_value:.0f}"

        return jsonify({
            'valid': True,
            'code': coupon.code,
            'discount_type': coupon.discount_type,
            'discount_value': coupon.discount_value,
            'message': f"Coupon applied! {discount_desc} discount activated."
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
