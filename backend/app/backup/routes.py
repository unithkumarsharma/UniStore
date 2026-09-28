from flask import Blueprint, request, jsonify
from app.models import Product, Category, Order, User
from app.firebase_client import bulk_backup_to_firestore, backup_record_to_firestore
from app.auth.routes import require_role

backup_bp = Blueprint('backup', __name__, url_prefix='/api/backup')

@backup_bp.route('/sync-all', methods=['POST'])
def sync_all_to_firestore():
    """
    On-demand or scheduled trigger to sync all active Supabase PostgreSQL data
    into Google Cloud Firestore collections as a multi-cloud backup.
    """
    try:
        # 1. Backup Categories
        cats = [c.to_dict() for c in Category.query.all()]
        bulk_backup_to_firestore('backup_categories', cats)

        # 2. Backup Products
        prods = [p.to_dict() for p in Product.query.all()]
        bulk_backup_to_firestore('backup_products', prods)

        # 3. Backup Orders
        orders = [o.to_dict() for o in Order.query.all()]
        bulk_backup_to_firestore('backup_orders', orders)

        # 4. Backup Users
        users = [u.to_dict() for u in User.query.all()]
        bulk_backup_to_firestore('backup_users', users)

        return jsonify({
            'status': 'success',
            'message': 'All Supabase entities mirrored into Firebase Cloud Firestore backup successfully',
            'synced_counts': {
                'categories': len(cats),
                'products': len(prods),
                'orders': len(orders),
                'users': len(users),
            }
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@backup_bp.route('/status', methods=['GET'])
def backup_status():
    """
    Returns current health and stats of the Firebase Cloud Firestore backsupport service.
    """
    try:
        total_products = Product.query.count()
        total_orders = Order.query.count()
        total_categories = Category.query.count()

        return jsonify({
            'backup_provider': 'Google Cloud Firestore',
            'backup_project': 'unistore-app-live',
            'primary_db': 'Supabase PostgreSQL (AWS ap-south-1)',
            'sync_health': 'ACTIVE',
            'collections': [
                'backup_orders',
                'backup_products',
                'backup_categories',
                'backup_users',
            ],
            'monitored_records': {
                'products': total_products,
                'orders': total_orders,
                'categories': total_categories,
            }
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
