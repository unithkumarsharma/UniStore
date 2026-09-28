from flask import Flask, jsonify
from flask_cors import CORS
from config.settings import Config
from app.models import db

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize SQLAlchemy Database
    db.init_app(app)

    # Enable CORS for frontend and mobile apps
    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

    with app.app_context():
        try:
            db.create_all()
        except Exception as e:
            print(f"⚠️ Database table creation notice: {e}")

    # Register Blueprints
    from app.auth.routes import auth_bp
    from app.products.routes import products_bp
    from app.categories.routes import categories_bp
    from app.cart.routes import cart_bp
    from app.orders.routes import orders_bp
    from app.payments.routes import payments_bp
    from app.coupons.routes import coupons_bp
    from app.reviews.routes import reviews_bp
    from app.admin.routes import admin_bp
    from app.suppliers.routes import suppliers_bp
    from app.backup.routes import backup_bp
    from app.upload.routes import upload_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(products_bp)
    app.register_blueprint(categories_bp)
    app.register_blueprint(cart_bp)
    app.register_blueprint(orders_bp)
    app.register_blueprint(payments_bp)
    app.register_blueprint(coupons_bp)
    app.register_blueprint(reviews_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(suppliers_bp)
    app.register_blueprint(backup_bp)
    app.register_blueprint(upload_bp)

    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({
            'status': 'healthy',
            'service': 'UniStore REST API',
            'version': '1.0.0',
            'currency': 'INR',
        }), 200

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Resource not found'}), 404

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({'error': 'Internal server error'}), 500

    return app
