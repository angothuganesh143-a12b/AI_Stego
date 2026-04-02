import os
from flask import Flask, jsonify
from flask_cors import CORS
from models import db
from routes.auth import auth_bp
from routes.media import media_bp
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
# Enable CORS for the React frontend, allowing credentials if needed.
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Configuration
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'super-secret-key-for-dev')

import urllib.parse

# Build the MySQL Connection URL
db_user = os.environ.get('MYSQL_USER', 'root')
# URL-encode the password to safely handle special characters like '@'
raw_db_password = os.environ.get('MYSQL_PASSWORD', '')
db_password = urllib.parse.quote_plus(raw_db_password)

db_host = os.environ.get('MYSQL_HOST', 'localhost')
db_name = os.environ.get('MYSQL_DB', 'stego_db')

app.config['SQLALCHEMY_DATABASE_URI'] = f'mysql+pymysql://{db_user}:{db_password}@{db_host}/{db_name}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(__file__), 'uploads')
app.config['OUTPUT_FOLDER'] = os.path.join(os.path.dirname(__file__), 'outputs')

# Ensure upload/output directories exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(app.config['OUTPUT_FOLDER'], exist_ok=True)

# Initialize DB
db.init_app(app)

# Register Blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(media_bp, url_prefix='/api')

@app.route('/', methods=['GET'])
def health_check():
    return jsonify({"status": "success", "message": "AI Steganography API is running."})

if __name__ == '__main__':
    with app.app_context():
        try:
            db.create_all()
        except Exception as e:
            print(f"Warning: Could not connect to the database. Error: {e}")
    app.run(debug=True, port=5000)
