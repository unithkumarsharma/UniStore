import sys
import os

# Ensure backend directory is in python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from app.models import db, User, Category, Product, ProductImage, ProductVariant, Coupon, Review, Order, OrderItem

app = create_app()

def seed_database():
    with app.app_context():
        print("🌱 Seeding database...")
        db.create_all()

        # 1. Seed Users
        users_data = [
            {
                'id': '99999999-9999-9999-9999-999999999999',
                'email': 'admin@unistore.com',
                'full_name': 'UniStore Administrator',
                'phone': '+91 99999 88888',
                'role': 'ADMIN',
                'password': 'password123',
            },
            {
                'id': '88888888-8888-8888-8888-888888888888',
                'email': 'customer@unistore.com',
                'full_name': 'Arjun Sharma',
                'phone': '+91 98765 43210',
                'role': 'CUSTOMER',
                'password': 'password123',
            },
        ]

        for u in users_data:
            existing = User.query.filter_by(email=u['email']).first()
            if not existing:
                new_user = User(
                    id=u['id'],
                    email=u['email'],
                    full_name=u['full_name'],
                    phone=u['phone'],
                    role=u['role']
                )
                new_user.set_password(u['password'])
                db.session.add(new_user)
                print(f"  ✓ User created: {u['email']} ({u['role']})")

        # 2. Seed Categories
        categories_data = [
            {
                'id': '11111111-1111-1111-1111-111111111111',
                'name': 'Tech & Audio',
                'slug': 'tech-audio',
                'description': 'High-fidelity audio, wireless accessories, and tactile personal technology.',
                'image_url': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80',
                'display_order': 1,
            },
            {
                'id': '22222222-2222-2222-2222-222222222222',
                'name': 'Home & Living',
                'slug': 'home-living',
                'description': 'Artisanal ceramics, warm ambient lighting, and Scandinavian home accents.',
                'image_url': 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=400&q=80',
                'display_order': 2,
            },
            {
                'id': '33333333-3333-3333-3333-333333333333',
                'name': 'Coffee & Kitchen',
                'slug': 'coffee-kitchen',
                'description': 'Precision pour-over drippers, carafes, and curated morning rituals.',
                'image_url': 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&q=80',
                'display_order': 3,
            },
            {
                'id': '44444444-4444-4444-4444-444444444444',
                'name': 'Self Care',
                'slug': 'self-care',
                'description': 'Organic wellness, ultrasonic diffusers, and botanical grooming essentials.',
                'image_url': 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80',
                'display_order': 4,
            },
            {
                'id': '55555555-5555-5555-5555-555555555555',
                'name': 'Desk Setup',
                'slug': 'desk-setup',
                'description': 'Ergonomic seating, precision aluminum risers, and tactile desk pads.',
                'image_url': 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&q=80',
                'display_order': 5,
            },
            {
                'id': '66666666-6666-6666-6666-666666666666',
                'name': 'Travel Gear',
                'slug': 'travel-gear',
                'description': 'Weatherproof sling packs, organizers, and durable everyday carry.',
                'image_url': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80',
                'display_order': 6,
            },
        ]

        for c in categories_data:
            existing = Category.query.filter_by(slug=c['slug']).first()
            if not existing:
                category = Category(
                    id=c['id'],
                    name=c['name'],
                    slug=c['slug'],
                    description=c['description'],
                    image_url=c['image_url'],
                    display_order=c['display_order']
                )
                db.session.add(category)
                print(f"  ✓ Category created: {c['name']}")

        db.session.commit()

        # 3. Seed Products
        products_data = [
            {
                'id': 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
                'name': 'Aura Sound Pro Wireless Noise-Cancelling Headphones',
                'slug': 'aura-sound-pro-headphones',
                'description': 'Studio-grade acoustic immersion engineered with 40mm custom planar drivers, active noise cancellation up to 42dB, and 38-hour battery longevity.',
                'category_id': '11111111-1111-1111-1111-111111111111',
                'base_price': 8499.0,
                'compare_at_price': 11999.0,
                'sku': 'UNI-AUD-001',
                'stock': 45,
                'is_active': True,
                'is_featured': True,
                'is_bestseller': True,
                'rating': 4.9,
                'review_count': 1240,
                'badge': '29% OFF',
                'images': [
                    {'image_url': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80', 'is_primary': True, 'display_order': 1},
                    {'image_url': 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&q=80', 'is_primary': False, 'display_order': 2},
                ],
                'variants': [
                    {'title': 'Matte Charcoal', 'sku': 'UNI-AUD-001-CHR', 'price': 8499.0, 'stock': 25, 'attributes': {'Color': 'Matte Charcoal'}},
                    {'title': 'Warm Sand', 'sku': 'UNI-AUD-001-SND', 'price': 8499.0, 'stock': 20, 'attributes': {'Color': 'Warm Sand'}},
                ]
            },
            {
                'id': 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
                'name': 'Nordic Minimalist Ceramic Pour-Over Dripper',
                'slug': 'nordic-ceramic-pour-over-dripper',
                'description': 'Handcrafted stoneware dripper with conical internal spiral ribs calibrated for optimal water drawdown.',
                'category_id': '33333333-3333-3333-3333-333333333333',
                'base_price': 1899.0,
                'compare_at_price': 2499.0,
                'sku': 'UNI-COF-002',
                'stock': 62,
                'is_active': True,
                'is_featured': True,
                'is_bestseller': False,
                'rating': 4.8,
                'review_count': 420,
                'badge': 'HOT',
                'images': [
                    {'image_url': 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80', 'is_primary': True, 'display_order': 1},
                ],
                'variants': []
            },
            {
                'id': 'cccccccc-cccc-cccc-cccc-cccccccccccc',
                'name': 'Lumbar Ergonomic Sculpt Desk Chair',
                'slug': 'lumbar-ergonomic-sculpt-chair',
                'description': 'Engineered for sustained 12-hour postural alignment with breathable 3D woven tensile mesh and 4D armrests.',
                'category_id': '55555555-5555-5555-5555-555555555555',
                'base_price': 14299.0,
                'compare_at_price': 18999.0,
                'sku': 'UNI-DSK-003',
                'stock': 14,
                'is_active': True,
                'is_featured': True,
                'is_bestseller': False,
                'rating': 4.9,
                'review_count': 880,
                'badge': 'POPULAR',
                'images': [
                    {'image_url': 'https://images.unsplash.com/photo-1589384267710-7a170981ca78?w=800&q=80', 'is_primary': True, 'display_order': 1},
                ],
                'variants': []
            },
            {
                'id': 'dddddddd-dddd-dddd-dddd-dddddddddddd',
                'name': 'Orbit MagSafe 3-in-1 Wireless Charging Dock',
                'slug': 'orbit-magsafe-wireless-charging-dock',
                'description': 'Solid FSC-certified American walnut base with fast 15W MagSafe phone charging and Apple Watch cradle.',
                'category_id': '11111111-1111-1111-1111-111111111111',
                'base_price': 3299.0,
                'compare_at_price': 4199.0,
                'sku': 'UNI-TEC-004',
                'stock': 50,
                'is_active': True,
                'is_featured': True,
                'is_bestseller': False,
                'rating': 4.7,
                'review_count': 310,
                'badge': '21% OFF',
                'images': [
                    {'image_url': 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&q=80', 'is_primary': True, 'display_order': 1},
                ],
                'variants': []
            },
            {
                'id': 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
                'name': 'Kanso Ultrasonic Ceramic Aroma Diffuser',
                'slug': 'kanso-ultrasonic-aroma-diffuser',
                'description': 'Sculptural matte porcelain shell diffusing 2.4MHz ultrasonic cool mist with warm ambient LED halo ring.',
                'category_id': '44444444-4444-4444-4444-444444444444',
                'base_price': 2499.0,
                'compare_at_price': 2999.0,
                'sku': 'UNI-SLC-005',
                'stock': 38,
                'is_active': True,
                'is_featured': True,
                'is_bestseller': True,
                'rating': 4.9,
                'review_count': 640,
                'badge': 'Bestseller',
                'images': [
                    {'image_url': 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&q=80', 'is_primary': True, 'display_order': 1},
                ],
                'variants': []
            },
            {
                'id': 'ffffffff-ffff-ffff-ffff-ffffffffffff',
                'name': 'Thermal Vessel Vacuum Insulated Bottle 750ml',
                'slug': 'thermal-vessel-insulated-bottle-750ml',
                'description': 'Double-walled copper-lined 18/8 stainless steel keeps cold for 24 hours or hot for 12 hours with natural beechwood loop cap.',
                'category_id': '66666666-6666-6666-6666-666666666666',
                'base_price': 1499.0,
                'compare_at_price': 1999.0,
                'sku': 'UNI-TRV-006',
                'stock': 85,
                'is_active': True,
                'is_featured': True,
                'is_bestseller': True,
                'rating': 4.8,
                'review_count': 912,
                'badge': 'Bestseller',
                'images': [
                    {'image_url': 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80', 'is_primary': True, 'display_order': 1},
                ],
                'variants': []
            }
        ]

        for p in products_data:
            existing = Product.query.filter_by(slug=p['slug']).first()
            if not existing:
                prod = Product(
                    id=p['id'],
                    name=p['name'],
                    slug=p['slug'],
                    description=p['description'],
                    category_id=p['category_id'],
                    base_price=p['base_price'],
                    compare_at_price=p['compare_at_price'],
                    sku=p['sku'],
                    stock=p['stock'],
                    is_active=p['is_active'],
                    is_featured=p['is_featured'],
                    is_bestseller=p['is_bestseller'],
                    rating=p['rating'],
                    review_count=p['review_count'],
                    badge=p['badge'],
                )
                db.session.add(prod)

                for img in p.get('images', []):
                    product_img = ProductImage(
                        product_id=p['id'],
                        image_url=img['image_url'],
                        is_primary=img['is_primary'],
                        display_order=img['display_order']
                    )
                    db.session.add(product_img)

                for var in p.get('variants', []):
                    product_var = ProductVariant(
                        product_id=p['id'],
                        title=var['title'],
                        sku=var['sku'],
                        price=var['price'],
                        stock=var['stock'],
                    )
                    product_var.attributes = var['attributes']
                    db.session.add(product_var)

                print(f"  ✓ Product created: {p['name']}")

        # 4. Seed Coupons
        coupons_data = [
            {'code': 'WELCOME10', 'discount_type': 'PERCENTAGE', 'discount_value': 10.0, 'min_order_amount': 500.0, 'max_discount': 500.0},
            {'code': 'UNI200', 'discount_type': 'FIXED', 'discount_value': 200.0, 'min_order_amount': 1500.0, 'max_discount': 200.0},
            {'code': 'FESTIVE15', 'discount_type': 'PERCENTAGE', 'discount_value': 15.0, 'min_order_amount': 1000.0, 'max_discount': 1000.0},
        ]

        for cp in coupons_data:
            existing = Coupon.query.filter_by(code=cp['code']).first()
            if not existing:
                coupon = Coupon(
                    code=cp['code'],
                    discount_type=cp['discount_type'],
                    discount_value=cp['discount_value'],
                    min_order_amount=cp['min_order_amount'],
                    max_discount=cp['max_discount'],
                    is_active=True
                )
                db.session.add(coupon)
                print(f"  ✓ Coupon created: {cp['code']}")

        # 5. Seed Reviews
        reviews_data = [
            {
                'product_id': 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
                'user_name': 'Devansh K.',
                'rating': 5,
                'comment': 'Outstanding audio clarity and tactile build quality. ANC effortlessly cuts down city noise.',
            },
            {
                'product_id': 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
                'user_name': 'Meera R.',
                'rating': 5,
                'comment': 'The flow rate on this pour-over is perfection. It looks like an art sculpture on my kitchen counter.',
            }
        ]

        for rv in reviews_data:
            existing = Review.query.filter_by(product_id=rv['product_id'], user_name=rv['user_name']).first()
            if not existing:
                review = Review(
                    product_id=rv['product_id'],
                    user_name=rv['user_name'],
                    rating=rv['rating'],
                    comment=rv['comment'],
                    is_verified_purchase=True
                )
                db.session.add(review)

        db.session.commit()
        print("✅ Database seeding complete!")

if __name__ == '__main__':
    seed_database()
