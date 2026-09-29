import pytest
import hmac
import hashlib
from app import create_app
from config.settings import Config

@pytest.fixture
def client():
    app = create_app(Config)
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_health_check(client):
    response = client.get('/api/health')
    assert response.status_code == 200
    data = response.get_json()
    assert data['status'] == 'healthy'
    assert data['currency'] == 'INR'

def test_get_products(client):
    response = client.get('/api/products')
    assert response.status_code == 200
    data = response.get_json()
    assert 'products' in data
    assert len(data['products']) > 0

def test_get_product_by_slug(client):
    response = client.get('/api/products/aura-sound-pro-headphones')
    assert response.status_code == 200
    data = response.get_json()
    assert data['product']['name'] == 'Aura Sound Pro Wireless Noise-Cancelling Headphones'
    assert data['product']['base_price'] == 8499.0

def test_get_categories(client):
    response = client.get('/api/categories')
    assert response.status_code == 200
    data = response.get_json()
    assert 'categories' in data
    assert len(data['categories']) >= 6

def test_cart_authoritative_validation(client):
    payload = {
        'items': [
            {'product_id': 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'quantity': 2}
        ],
        'coupon_code': 'WELCOME10'
    }
    response = client.post('/api/cart/validate', json=payload)
    assert response.status_code == 200
    data = response.get_json()
    # 8499 * 2 = 16998
    assert data['subtotal'] == 16998.0
    # 10% discount on 16998 capped at max_discount (500.0)
    assert data['discount_amount'] == 500.0
    # Free shipping because subtotal >= 999
    assert data['shipping_fee'] == 0.0

def test_razorpay_create_order(client):
    payload = {'amount': 50000, 'currency': 'INR', 'receipt': 'rcpt_test_99'}
    response = client.post('/api/create-order', json=payload)
    assert response.status_code == 200
    data = response.get_json()
    assert data['amount'] == 50000
    assert data['currency'] == 'INR'
    assert 'order_id' in data

def test_razorpay_create_order_minimum_amount(client):
    # Minimum amount is 100 paise
    payload = {'amount': 50, 'currency': 'INR'}
    response = client.post('/api/create-order', json=payload)
    assert response.status_code == 400
    data = response.get_json()
    assert 'error' in data

def test_razorpay_signature_verification_success(client):
    order_id = 'order_test_12345'
    payment_id = 'pay_test_67890'
    message = f"{order_id}|{payment_id}".encode('utf-8')
    valid_signature = hmac.new(
        Config.RAZORPAY_KEY_SECRET.encode('utf-8'),
        message,
        hashlib.sha256
    ).hexdigest()

    payload = {
        'razorpay_order_id': order_id,
        'razorpay_payment_id': payment_id,
        'razorpay_signature': valid_signature,
    }
    response = client.post('/api/verify-payment', json=payload)
    assert response.status_code == 200
    data = response.get_json()
    assert data['verified'] is True
    assert data['success'] is True

def test_razorpay_signature_verification_mismatch(client):
    payload = {
        'razorpay_order_id': 'order_test_12345',
        'razorpay_payment_id': 'pay_test_67890',
        'razorpay_signature': 'invalid_signature_hash',
    }
    response = client.post('/api/verify-payment', json=payload)
    assert response.status_code == 400
    data = response.get_json()
    assert data['verified'] is False

def test_razorpay_signature_verification_missing_fields(client):
    payload = {
        'razorpay_order_id': 'order_test_12345'
    }
    response = client.post('/api/verify-payment', json=payload)
    assert response.status_code == 400

def test_admin_metrics_protection(client):
    # Without token, should be 401
    response = client.get('/api/admin/metrics')
    assert response.status_code == 401
