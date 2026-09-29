from flask import Blueprint, request, jsonify
import hmac
import hashlib
import razorpay
from config.settings import Config
from app.models import db, Order

payments_bp = Blueprint('payments', __name__, url_prefix='/api/payments/razorpay')

def get_razorpay_client():
    if Config.RAZORPAY_KEY_ID and Config.RAZORPAY_KEY_SECRET:
        return razorpay.Client(auth=(Config.RAZORPAY_KEY_ID, Config.RAZORPAY_KEY_SECRET))
    return None

@payments_bp.route('/create-order', methods=['POST'])
def create_razorpay_order():
    """
    Creates a Razorpay order.
    Minimum amount: 100 paise (1 INR = 100 paise).
    Request: { amount (paise), currency, receipt, order_id }
    Return: { order_id, amount, currency }
    """
    data = request.get_json(silent=True) or {}
    
    # Check for amount in paise (or optional amount_inr conversion if explicitly specified)
    amount_val = data.get('amount')
    if amount_val is None and 'amount_in_paise' in data:
        amount_val = data.get('amount_in_paise')
    elif amount_val is None and 'amount_inr' in data:
        try:
            amount_val = int(round(float(data['amount_inr']) * 100))
        except (ValueError, TypeError):
            return jsonify({'error': 'Invalid amount_inr format'}), 400

    if amount_val is None:
        return jsonify({'error': 'amount is required (in paise, minimum 100 paise)'}), 400

    try:
        amount_in_paise = int(amount_val)
    except (ValueError, TypeError):
        return jsonify({'error': 'Invalid amount, must be an integer representing paise'}), 400

    if amount_in_paise < 100:
        return jsonify({'error': 'Amount must be at least 100 paise (minimum ₹1.00)'}), 400

    currency = data.get('currency', 'INR')
    order_id = data.get('order_id')
    receipt = data.get('receipt') or order_id or f"rcpt_{hashlib.md5(str(amount_in_paise).encode()).hexdigest()[:10]}"

    client = get_razorpay_client()
    if not client:
        return jsonify({'error': 'Razorpay client credentials not configured on server'}), 500

    try:
        razorpay_order = client.order.create({
            'amount': amount_in_paise,
            'currency': currency,
            'receipt': str(receipt),
            'payment_capture': 1
        })
        rzp_order_id = razorpay_order['id']
    except razorpay.errors.BadRequestError as e:
        err_msg = str(e)
        if 'auth' in err_msg.lower() or 'credential' in err_msg.lower():
            return jsonify({'error': f'Razorpay authentication failed: {err_msg}'}), 401
        return jsonify({'error': f'Razorpay API error: {err_msg}'}), 500
    except Exception as e:
        err_msg = str(e)
        if 'auth' in err_msg.lower() or '401' in err_msg:
            return jsonify({'error': f'Razorpay authentication failed: {err_msg}'}), 401
        return jsonify({'error': f'Razorpay API error: {err_msg}'}), 500

    # If order_id was provided, update razorpay_order_id in DB
    if order_id:
        try:
            db_order = Order.query.filter(
                (Order.order_number == order_id) | (Order.id == order_id)
            ).first()
            if db_order:
                db_order.razorpay_order_id = rzp_order_id
                db.session.commit()
        except Exception:
            db.session.rollback()

    return jsonify({
        'order_id': rzp_order_id,
        'razorpay_order_id': rzp_order_id,
        'id': rzp_order_id,
        'amount': razorpay_order.get('amount', amount_in_paise),
        'currency': razorpay_order.get('currency', currency),
        'receipt': receipt,
        'key_id': Config.RAZORPAY_KEY_ID
    }), 200

@payments_bp.route('/verify', methods=['POST'])
@payments_bp.route('/verify-payment', methods=['POST'])
def verify_payment():
    """
    Cryptographically verifies the Razorpay payment signature using HMAC-SHA256.
    Algorithm: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
    Compare generated signature with razorpay_signature.
    Return success only if signatures match.
    """
    data = request.get_json(silent=True) or {}
    razorpay_order_id = data.get('razorpay_order_id') or data.get('order_id')
    razorpay_payment_id = data.get('razorpay_payment_id') or data.get('payment_id')
    razorpay_signature = data.get('razorpay_signature') or data.get('signature')
    store_order_id = data.get('store_order_id') or data.get('receipt') or data.get('order_number')
    if not store_order_id and data.get('order_id') != razorpay_order_id:
        store_order_id = data.get('order_id')

    if not razorpay_order_id or not razorpay_payment_id or not razorpay_signature:
        return jsonify({'error': 'Missing required fields: razorpay_order_id, razorpay_payment_id, and razorpay_signature are required'}), 400

    # Calculate expected signature using HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
    message = f"{razorpay_order_id}|{razorpay_payment_id}".encode('utf-8')
    key_secret = Config.RAZORPAY_KEY_SECRET or ''
    if not key_secret:
        return jsonify({'error': 'Razorpay key secret not configured on server'}), 500

    expected_signature = hmac.new(
        key_secret.encode('utf-8'),
        message,
        hashlib.sha256
    ).hexdigest()

    # Compare safely (timing attack mitigation)
    is_valid = hmac.compare_digest(expected_signature, razorpay_signature)

    if not is_valid:
        # Signature mismatch: return 400, do NOT mark as paid
        return jsonify({
            'success': False,
            'verified': False,
            'error': 'Payment verification failed: Invalid cryptographic signature'
        }), 400

    # Transition order state in database
    target_order_ref = store_order_id or razorpay_order_id
    if target_order_ref:
        try:
            db_order = Order.query.filter(
                (Order.order_number == target_order_ref) | 
                (Order.id == target_order_ref) |
                (Order.razorpay_order_id == razorpay_order_id)
            ).first()
            if db_order:
                db_order.status = 'CONFIRMED'
                db_order.payment_status = 'PAID'
                db_order.razorpay_order_id = razorpay_order_id
                db_order.razorpay_payment_id = razorpay_payment_id
                db_order.razorpay_signature = razorpay_signature
                db.session.commit()
        except Exception:
            db.session.rollback()

    return jsonify({
        'success': True,
        'verified': True,
        'message': 'Payment signature verified successfully',
        'order_id': razorpay_order_id,
        'razorpay_order_id': razorpay_order_id,
        'razorpay_payment_id': razorpay_payment_id,
        'order_status': 'CONFIRMED',
    }), 200

@payments_bp.route('/webhook', methods=['POST'])
def razorpay_webhook():
    """
    Asynchronous Webhook handler for Razorpay.
    Verifies webhook signature using RAZORPAY_WEBHOOK_SECRET.
    """
    webhook_signature = request.headers.get('X-Razorpay-Signature')
    data = request.get_data()

    if Config.RAZORPAY_WEBHOOK_SECRET and webhook_signature:
        expected_sig = hmac.new(
            Config.RAZORPAY_WEBHOOK_SECRET.encode('utf-8'),
            data,
            hashlib.sha256
        ).hexdigest()

        if not hmac.compare_digest(expected_sig, webhook_signature):
            return jsonify({'error': 'Invalid webhook signature'}), 400

    payload = request.get_json(silent=True) or {}
    event = payload.get('event')

    # Handle payment capture and order paid events
    if event in ('payment.captured', 'order.paid'):
        payment_entity = payload.get('payload', {}).get('payment', {}).get('entity', {})
        order_entity = payload.get('payload', {}).get('order', {}).get('entity', {})

        rzp_order_id = payment_entity.get('order_id') or order_entity.get('id')
        rzp_payment_id = payment_entity.get('id')
        order_ref = (
            payment_entity.get('notes', {}).get('order_id') or
            order_entity.get('notes', {}).get('order_id') or
            order_entity.get('receipt')
        )

        try:
            query = Order.query
            if order_ref and rzp_order_id:
                db_order = query.filter(
                    (Order.order_number == order_ref) |
                    (Order.id == order_ref) |
                    (Order.razorpay_order_id == rzp_order_id)
                ).first()
            elif order_ref:
                db_order = query.filter(
                    (Order.order_number == order_ref) |
                    (Order.id == order_ref)
                ).first()
            elif rzp_order_id:
                db_order = query.filter(Order.razorpay_order_id == rzp_order_id).first()
            else:
                db_order = None

            if db_order:
                db_order.payment_status = 'PAID'
                db_order.status = 'CONFIRMED'
                if rzp_order_id:
                    db_order.razorpay_order_id = rzp_order_id
                if rzp_payment_id:
                    db_order.razorpay_payment_id = rzp_payment_id
                db.session.commit()
        except Exception:
            db.session.rollback()

    return jsonify({'status': 'webhook received', 'event': event}), 200

@payments_bp.route('/check-status', methods=['POST'])
def check_order_status():
    """
    Direct Server-to-Server real-time check for captured payments on an order.
    Used for QR Code scan-and-pay and background status confirmation.
    """
    data = request.get_json(silent=True) or {}
    razorpay_order_id = data.get('razorpay_order_id') or data.get('order_id')
    store_order_id = data.get('store_order_id')

    if not razorpay_order_id:
        return jsonify({'error': 'razorpay_order_id is required'}), 400

    client = get_razorpay_client()
    if not client:
        return jsonify({'error': 'Razorpay client not configured'}), 500

    try:
        payments_data = client.order.payments(razorpay_order_id)
        items = payments_data.get('items', [])
        
        captured_payment = next((p for p in items if p.get('status') == 'captured'), None)
        if captured_payment:
            # Transition order in database
            target_ref = store_order_id or razorpay_order_id
            if target_ref:
                try:
                    db_order = Order.query.filter(
                        (Order.order_number == target_ref) | 
                        (Order.id == target_ref) | 
                        (Order.razorpay_order_id == razorpay_order_id)
                    ).first()
                    if db_order:
                        db_order.status = 'CONFIRMED'
                        db_order.payment_status = 'PAID'
                        db_order.razorpay_order_id = razorpay_order_id
                        db_order.razorpay_payment_id = captured_payment.get('id')
                        db.session.commit()
                except Exception:
                    db.session.rollback()

            return jsonify({
                'paid': True,
                'status': 'captured',
                'order_id': razorpay_order_id,
                'payment_id': captured_payment.get('id'),
                'amount': captured_payment.get('amount'),
                'order_status': 'CONFIRMED'
            }), 200

        return jsonify({
            'paid': False,
            'status': 'pending',
            'order_id': razorpay_order_id
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

