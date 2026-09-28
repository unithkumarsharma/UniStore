import os
import sys

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from config.settings import Config

app = create_app(Config)

if __name__ == '__main__':
    port = Config.PORT
    print(f"🚀 UniStore Backend Server starting on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=(Config.FLASK_ENV == 'development'))
