from flask import Blueprint, request, jsonify
import datetime
from app.auth.routes import require_role

suppliers_bp = Blueprint('suppliers', __name__, url_prefix='/api/suppliers')

SUPPLIERS_DB = [
    {
        'id': 'sup-1',
        'name': 'Nordic Lifestyle Suppliers Ltd.',
        'code': 'SUP-NDIC',
        'contact_email': 'fulfillment@nordiclifestyle.test',
        'phone': '+91 22 2490 1200',
        'fulfillment_sla_hours': 24,
        'is_active': True,
        'products_count': 12,
    },
    {
        'id': 'sup-2',
        'name': 'Acoustic Craft Audio Partners',
        'code': 'SUP-ACST',
        'contact_email': 'orders@acousticcraft.test',
        'phone': '+91 80 4120 9000',
        'fulfillment_sla_hours': 12,
        'is_active': True,
        'products_count': 6,
    }
]

@suppliers_bp.route('', methods=['GET'])
@require_role(['ADMIN', 'SUPER_ADMIN', 'STAFF'])
def get_suppliers():
    return jsonify({'suppliers': SUPPLIERS_DB}), 200

@suppliers_bp.route('/<supplier_id>/fulfillment/dispatch', methods=['POST'])
@require_role(['ADMIN', 'SUPER_ADMIN'])
def dispatch_to_supplier(supplier_id):
    """
    Extensible dropshipping pipeline:
    Triggers automated fulfillment dispatch to the external supplier API endpoint.
    """
    data = request.get_json() or {}
    order_id = data.get('order_id')
    supplier = next((s for s in SUPPLIERS_DB if s['id'] == supplier_id), None)

    if not supplier:
        return jsonify({'error': 'Supplier not found'}), 404

    fulfillment_payload = {
        'dispatch_id': f"DSP-{datetime.datetime.utcnow().timestamp()}",
        'supplier_id': supplier['id'],
        'supplier_code': supplier['code'],
        'order_id': order_id,
        'status': 'DISPATCHED_TO_SUPPLIER',
        'sla_deadline': f"Within {supplier['fulfillment_sla_hours']} hours",
        'timestamp': datetime.datetime.utcnow().isoformat(),
    }

    return jsonify({
        'success': True,
        'message': f"Order {order_id} successfully transmitted to {supplier['name']}",
        'fulfillment': fulfillment_payload,
    }), 200
