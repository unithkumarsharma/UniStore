import os
import cloudinary
import cloudinary.uploader
from flask import Blueprint, request, jsonify
from config.settings import Config

upload_bp = Blueprint('upload', __name__, url_prefix='/api/upload')

def init_cloudinary():
    """Configure Cloudinary using environment settings."""
    if Config.CLOUDINARY_URL:
        # If full connection string is set, Cloudinary loads automatically
        os.environ['CLOUDINARY_URL'] = Config.CLOUDINARY_URL
        return True

    if Config.CLOUDINARY_CLOUD_NAME and Config.CLOUDINARY_API_KEY and Config.CLOUDINARY_API_SECRET:
        cloudinary.config(
            cloud_name=Config.CLOUDINARY_CLOUD_NAME,
            api_key=Config.CLOUDINARY_API_KEY,
            api_secret=Config.CLOUDINARY_API_SECRET,
            secure=True
        )
        return True
    return False

@upload_bp.route('/status', methods=['GET'])
def get_cloudinary_status():
    """Check Cloudinary connection status."""
    is_ready = init_cloudinary()
    cloud_name = Config.CLOUDINARY_CLOUD_NAME or ('configured_via_url' if Config.CLOUDINARY_URL else None)
    return jsonify({
        'configured': is_ready,
        'cloud_name': cloud_name,
        'service': 'Cloudinary Media Storage',
        'status': 'connected' if is_ready else 'credentials_missing'
    }), 200

@upload_bp.route('', methods=['POST'])
@upload_bp.route('/image', methods=['POST'])
def upload_image():
    """Upload an image file or URL to Cloudinary."""
    if not init_cloudinary():
        return jsonify({
            'error': 'Cloudinary is not connected yet.',
            'message': 'Please provide CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET (or CLOUDINARY_URL) in backend/.env'
        }), 400

    file = request.files.get('file') or request.files.get('image')
    folder = request.form.get('folder', 'unistore/products')

    try:
        if file:
            res = cloudinary.uploader.upload(
                file,
                folder=folder,
                resource_type='image'
            )
        else:
            data = request.get_json(silent=True) or {}
            img_data = data.get('file') or data.get('image') or data.get('image_url')
            if not img_data:
                return jsonify({'error': 'No file or image payload received for upload.'}), 400

            res = cloudinary.uploader.upload(
                img_data,
                folder=folder,
                resource_type='image'
            )

        return jsonify({
            'url': res.get('secure_url'),
            'secure_url': res.get('secure_url'),
            'public_id': res.get('public_id'),
            'width': res.get('width'),
            'height': res.get('height'),
            'format': res.get('format'),
            'bytes': res.get('bytes'),
            'message': 'Image successfully uploaded to Cloudinary!'
        }), 200
    except Exception as e:
        return jsonify({'error': f'Cloudinary upload failed: {str(e)}'}), 500
