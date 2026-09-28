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
    # 10% discount on 16998 = 1699.8
    assert data['discount_amount'] == 1699.8
    # Free shipping because subtotal >= 999
    assert data['shipping_fee'] == 0.0

def test_razorpay_create_order(client):
    payload = {'amount': 8499, 'order_id': 'UNI-TEST-99'}
    response = client.post('/api/payments/razorpay/create-order', json=payload)
    assert response.status_code == 200
    data = response.get_json()
    assert data['amount'] == 849900
    assert data['currency'] == 'INR'
    assert 'razorpay_order_id' in data

def test_razorpay_signature_verification_demo(client):
    payload = {
        'razorpay_order_id': 'order_123',
        'razorpay_payment_id': 'pay_demo_verified',
        'razorpay_signature': 'any_sig',
        'order_id': 'UNI-TEST-99'
    }
    response = client.post('/api/payments/razorpay/verify', json=payload)
    assert response.status_code == 200
    data = response.get_json()
    assert data['verified'] is True

def test_admin_metrics_protection(client):
    # Without token, should be 401
    response = client.get('/api/admin/metrics')
    assert response.status_code == 401
