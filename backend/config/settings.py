import os
from dotenv import load_dotenv

load_dotenv()

basedir = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))

class Config:
    FLASK_ENV = os.getenv('FLASK_ENV', 'development')
    SECRET_KEY = os.getenv('SECRET_KEY', 'unistore-dev-secret-key-change-in-prod-2026')
    PORT = int(os.getenv('PORT', 5001))
    
    # Database Configuration (Pure Supabase PostgreSQL)
    DATABASE_URL = os.getenv('DATABASE_URL', '')
    if not DATABASE_URL:
        raise RuntimeError("DATABASE_URL is not set in backend/.env. Supabase PostgreSQL connection is required.")
    
    # SQLAlchemy 2.0 requires postgresql:// instead of postgres://
    if DATABASE_URL.startswith('postgres://'):
        DATABASE_URL = DATABASE_URL.replace('postgres://', 'postgresql://', 1)
    SQLALCHEMY_DATABASE_URI = DATABASE_URL
        
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Supabase Credentials
    SUPABASE_URL = os.getenv('SUPABASE_URL', 'https://rjeotwckxytlzuofyvck.supabase.co')
    SUPABASE_KEY = os.getenv('SUPABASE_KEY', '')
    SUPABASE_SERVICE_ROLE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY', '')

    # Razorpay Payment Credentials
    RAZORPAY_KEY_ID = os.getenv('RAZORPAY_KEY_ID', 'rzp_test_unistore_key_2026')
    RAZORPAY_KEY_SECRET = os.getenv('RAZORPAY_KEY_SECRET', 'unistore_razorpay_secret_key_2026')
    RAZORPAY_WEBHOOK_SECRET = os.getenv('RAZORPAY_WEBHOOK_SECRET', 'unistore_webhook_secret_2026')

    # Cloudinary Storage
    CLOUDINARY_URL = os.getenv('CLOUDINARY_URL', '')
    CLOUDINARY_CLOUD_NAME = os.getenv('CLOUDINARY_CLOUD_NAME', '')
    CLOUDINARY_API_KEY = os.getenv('CLOUDINARY_API_KEY', '')
    CLOUDINARY_API_SECRET = os.getenv('CLOUDINARY_API_SECRET', '')

    # CORS
    FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:5173')
