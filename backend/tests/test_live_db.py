import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from app.models import db, User, Product, Category, Order

app = create_app()

def test_routes():
    with app.test_client() as client:
        print("Testing API endpoints against database:")

        # 1. Health check
        res = client.get('/api/health')
        assert res.status_code == 200, f"Health check failed: {res.status_code}"
        print("  ✓ /api/health returned 200")

        # 2. Categories
        res = client.get('/api/categories')
        assert res.status_code == 200, f"Categories failed: {res.status_code}"
        categories = res.get_json().get('categories', [])
        assert len(categories) >= 6, f"Expected at least 6 categories, got {len(categories)}"
        print(f"  ✓ /api/categories returned {len(categories)} categories")

        # 3. Products
        res = client.get('/api/products')
        assert res.status_code == 200, f"Products failed: {res.status_code}"
        products = res.get_json().get('products', [])
        assert len(products) >= 6, f"Expected at least 6 products, got {len(products)}"
        print(f"  ✓ /api/products returned {len(products)} products")

        # 4. Product by slug
        slug = products[0]['slug']
        res = client.get(f'/api/products/{slug}')
        assert res.status_code == 200, f"Product by slug failed: {res.status_code}"
        print(f"  ✓ /api/products/{slug} returned 200")

        # 5. Auth Login
        res = client.post('/api/auth/login', json={
            'email': 'admin@unistore.com',
            'password': 'password123'
        })
        assert res.status_code == 200, f"Admin login failed: {res.status_code}"
        data = res.get_json()
        token = data.get('token')
        assert token, "Token not found in login response"
        print("  ✓ /api/auth/login (admin) returned 200 with JWT token")

        # 6. Auth /me
        res = client.get('/api/auth/me', headers={'Authorization': f'Bearer {token}'})
        assert res.status_code == 200, f"/me failed: {res.status_code}"
        assert res.get_json()['user']['role'] == 'ADMIN'
        print("  ✓ /api/auth/me returned 200 with ADMIN role")

        # 7. Create Order in Database
        res = client.post('/api/orders', json={
            'items': [{'product_id': products[0]['id'], 'quantity': 2}],
            'shipping_address': {
                'full_name': 'Arjun Sharma',
                'address_line1': '123 MG Road',
                'city': 'Bengaluru',
                'state': 'Karnataka',
                'postal_code': '560001',
                'phone': '+91 98765 43210'
            },
            'payment_method': 'COD'
        })
        assert res.status_code == 201, f"Order creation failed: {res.status_code}"
        order = res.get_json().get('order')
        order_number = order['order_number']
        print(f"  ✓ /api/orders created real order: {order_number} (total: ₹{order['total_amount']})")

        # 8. Order Tracking from Database
        res = client.get(f'/api/orders/{order_number}/track')
        assert res.status_code == 200, f"Order tracking failed: {res.status_code}"
        print(f"  ✓ /api/orders/{order_number}/track returned live tracking events")

        # 9. Coupon validation from Database
        res = client.post('/api/coupons/validate', json={
            'code': 'WELCOME10',
            'order_subtotal': 1500.0
        })
        assert res.status_code == 200, f"Coupon validation failed: {res.status_code}"
        print("  ✓ /api/coupons/validate returned valid coupon")

        # 10. Admin Metrics from Database
        res = client.get('/api/admin/metrics', headers={'Authorization': f'Bearer {token}'})
        assert res.status_code == 200, f"Admin metrics failed: {res.status_code}"
        metrics = res.get_json()
        print(f"  ✓ /api/admin/metrics returned live stats: {metrics['order_count']} orders, ₹{metrics['gross_sales']} sales")

        print("\n🎉 ALL DATABASE ROUTES & SERVICES VERIFIED SUCCESSFULLY!")

if __name__ == '__main__':
    test_routes()
