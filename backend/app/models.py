import uuid
import json
from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

def generate_uuid():
    return str(uuid.uuid4())

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    full_name = db.Column(db.String(255), nullable=False)
    phone = db.Column(db.String(30), nullable=True)
    role = db.Column(db.String(30), nullable=False, default='CUSTOMER') # CUSTOMER, ADMIN
    avatar_url = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def set_password(self, password: str):
        self.password_hash = generate_password_hash(password, method='pbkdf2:sha256')

    def check_password(self, password: str) -> bool:
        # Also check plain text in case of seed or legacy matching, otherwise hashed
        if self.password_hash == password:
            return True
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'full_name': self.full_name,
            'phone': self.phone,
            'role': self.role,
            'avatar_url': self.avatar_url,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }

class Category(db.Model):
    __tablename__ = 'categories'

    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    name = db.Column(db.String(150), nullable=False)
    slug = db.Column(db.String(150), unique=True, nullable=False, index=True)
    description = db.Column(db.Text, nullable=True)
    image_url = db.Column(db.Text, nullable=False)
    display_order = db.Column(db.Integer, default=0)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    products = db.relationship('Product', backref='category', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'slug': self.slug,
            'description': self.description,
            'image_url': self.image_url,
            'display_order': self.display_order,
            'is_active': self.is_active,
            'item_count': len([p for p in self.products if p.is_active]) if self.products else 0,
        }

class Product(db.Model):
    __tablename__ = 'products'

    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    name = db.Column(db.String(255), nullable=False)
    slug = db.Column(db.String(255), unique=True, nullable=False, index=True)
    description = db.Column(db.Text, nullable=False)
    category_id = db.Column(db.String(36), db.ForeignKey('categories.id'), nullable=False)
    base_price = db.Column(db.Float, nullable=False)
    compare_at_price = db.Column(db.Float, nullable=True)
    sku = db.Column(db.String(100), unique=True, nullable=False)
    stock = db.Column(db.Integer, default=0)
    is_active = db.Column(db.Boolean, default=True)
    is_featured = db.Column(db.Boolean, default=False)
    is_bestseller = db.Column(db.Boolean, default=False)
    rating = db.Column(db.Float, default=5.0)
    review_count = db.Column(db.Integer, default=0)
    badge = db.Column(db.String(50), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    images = db.relationship('ProductImage', backref='product', lazy=True, cascade='all, delete-orphan')
    variants = db.relationship('ProductVariant', backref='product', lazy=True, cascade='all, delete-orphan')
    reviews = db.relationship('Review', backref='product', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        sorted_images = sorted(self.images, key=lambda x: (not x.is_primary, x.display_order))
        return {
            'id': self.id,
            'name': self.name,
            'slug': self.slug,
            'description': self.description,
            'category_id': self.category_id,
            'category_name': self.category.name if self.category else '',
            'category_slug': self.category.slug if self.category else '',
            'base_price': self.base_price,
            'compare_at_price': self.compare_at_price,
            'sku': self.sku,
            'stock': self.stock,
            'is_active': self.is_active,
            'is_featured': self.is_featured,
            'is_bestseller': self.is_bestseller,
            'rating': self.rating,
            'review_count': self.review_count,
            'badge': self.badge,
            'images': [img.to_dict() for img in sorted_images],
            'variants': [v.to_dict() for v in self.variants if v.is_active],
        }

class ProductImage(db.Model):
    __tablename__ = 'product_images'

    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    product_id = db.Column(db.String(36), db.ForeignKey('products.id'), nullable=False)
    image_url = db.Column(db.Text, nullable=False)
    is_primary = db.Column(db.Boolean, default=False)
    display_order = db.Column(db.Integer, default=0)

    def to_dict(self):
        return {
            'id': self.id,
            'image_url': self.image_url,
            'is_primary': self.is_primary,
            'display_order': self.display_order,
        }

class ProductVariant(db.Model):
    __tablename__ = 'product_variants'

    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    product_id = db.Column(db.String(36), db.ForeignKey('products.id'), nullable=False)
    title = db.Column(db.String(150), nullable=False)
    sku = db.Column(db.String(100), nullable=True)
    price = db.Column(db.Float, nullable=False)
    stock = db.Column(db.Integer, default=0)
    attributes_json = db.Column(db.Text, default='{}')
    is_active = db.Column(db.Boolean, default=True)

    @property
    def attributes(self):
        try:
            return json.loads(self.attributes_json or '{}')
        except Exception:
            return {}

    @attributes.setter
    def attributes(self, value):
        self.attributes_json = json.dumps(value or {})

    def to_dict(self):
        return {
            'id': self.id,
            'product_id': self.product_id,
            'title': self.title,
            'sku': self.sku,
            'price': self.price,
            'stock': self.stock,
            'attributes': self.attributes,
            'is_active': self.is_active,
        }

class Order(db.Model):
    __tablename__ = 'orders'

    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    order_number = db.Column(db.String(50), unique=True, nullable=False, index=True)
    user_id = db.Column(db.String(36), nullable=True)
    status = db.Column(db.String(50), default='CONFIRMED') # PENDING, CONFIRMED, SHIPPED, OUT_FOR_DELIVERY, DELIVERED, CANCELLED
    subtotal = db.Column(db.Float, nullable=False)
    discount_amount = db.Column(db.Float, default=0.0)
    shipping_fee = db.Column(db.Float, default=0.0)
    tax_amount = db.Column(db.Float, default=0.0)
    total_amount = db.Column(db.Float, nullable=False)
    currency = db.Column(db.String(10), default='INR')
    shipping_address_json = db.Column(db.Text, nullable=False)
    payment_method = db.Column(db.String(50), default='RAZORPAY') # RAZORPAY, COD, UPI
    payment_status = db.Column(db.String(50), default='PENDING') # PENDING, PAID, FAILED, REFUNDED
    razorpay_order_id = db.Column(db.String(100), nullable=True)
    razorpay_payment_id = db.Column(db.String(100), nullable=True)
    tracking_number = db.Column(db.String(100), nullable=True)
    carrier = db.Column(db.String(100), default='Bluedart Express')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    items = db.relationship('OrderItem', backref='order', lazy=True, cascade='all, delete-orphan')

    @property
    def shipping_address(self):
        try:
            return json.loads(self.shipping_address_json or '{}')
        except Exception:
            return {}

    @shipping_address.setter
    def shipping_address(self, value):
        self.shipping_address_json = json.dumps(value or {})

    def to_dict(self):
        return {
            'id': self.order_number,
            'order_id': self.id,
            'order_number': self.order_number,
            'user_id': self.user_id,
            'status': self.status,
            'subtotal': self.subtotal,
            'discount_amount': self.discount_amount,
            'shipping_fee': self.shipping_fee,
            'tax_amount': self.tax_amount,
            'total_amount': self.total_amount,
            'currency': self.currency,
            'shipping_address': self.shipping_address,
            'payment_method': self.payment_method,
            'payment_status': self.payment_status,
            'razorpay_order_id': self.razorpay_order_id,
            'razorpay_payment_id': self.razorpay_payment_id,
            'tracking_number': self.tracking_number,
            'carrier': self.carrier,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'items': [item.to_dict() for item in self.items],
        }

class OrderItem(db.Model):
    __tablename__ = 'order_items'

    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    order_id = db.Column(db.String(36), db.ForeignKey('orders.id'), nullable=False)
    product_id = db.Column(db.String(36), nullable=False)
    variant_id = db.Column(db.String(36), nullable=True)
    product_name = db.Column(db.String(255), nullable=False)
    price = db.Column(db.Float, nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    total = db.Column(db.Float, nullable=False)
    image_url = db.Column(db.Text, nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'product_id': self.product_id,
            'variant_id': self.variant_id,
            'product_name': self.product_name,
            'price': self.price,
            'quantity': self.quantity,
            'total': self.total,
            'image_url': self.image_url,
        }

class Coupon(db.Model):
    __tablename__ = 'coupons'

    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    code = db.Column(db.String(50), unique=True, nullable=False, index=True)
    discount_type = db.Column(db.String(20), default='PERCENTAGE') # PERCENTAGE, FIXED
    discount_value = db.Column(db.Float, nullable=False)
    min_order_amount = db.Column(db.Float, default=0.0)
    max_discount = db.Column(db.Float, nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    expires_at = db.Column(db.DateTime, nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'code': self.code,
            'discount_type': self.discount_type,
            'discount_value': self.discount_value,
            'min_order_amount': self.min_order_amount,
            'max_discount': self.max_discount,
            'is_active': self.is_active,
        }

class Review(db.Model):
    __tablename__ = 'reviews'

    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    product_id = db.Column(db.String(36), db.ForeignKey('products.id'), nullable=False)
    user_id = db.Column(db.String(36), nullable=True)
    user_name = db.Column(db.String(255), nullable=False)
    rating = db.Column(db.Integer, nullable=False)
    comment = db.Column(db.Text, nullable=False)
    is_verified_purchase = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'product_id': self.product_id,
            'user_name': self.user_name,
            'rating': self.rating,
            'comment': self.comment,
            'is_verified_purchase': self.is_verified_purchase,
            'created_at': self.created_at.strftime('%d %b %Y') if self.created_at else None,
        }
