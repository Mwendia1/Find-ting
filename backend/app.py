from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt
from dotenv import load_dotenv
import os
import logging

from models import db
from routes.auth import auth_bp
from routes.products import products_bp
from routes.orders import orders_bp

load_dotenv()

app = Flask(__name__)

# Configuration
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'jwt-secret-key-change-in-production')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///shophub.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize extensions
CORS(app)
db.init_app(app)
jwt = JWTManager(app)
bcrypt = Bcrypt(app)

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(products_bp, url_prefix='/api/products')
app.register_blueprint(orders_bp, url_prefix='/api/orders')

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Resource not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return jsonify({'error': 'Internal server error'}), 500

@app.errorhandler(400)
def bad_request(error):
    return jsonify({'error': 'Bad request'}), 400

# JWT error handlers
@app.errorhandler(401)
def unauthorized(error):
    return jsonify({'error': 'Unauthorized'}), 401

@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_data):
    return jsonify({'error': 'Token has expired'}), 401

@jwt.invalid_token_loader
def invalid_token_callback(error):
    return jsonify({'error': 'Invalid token'}), 401

@jwt.unauthorized_loader
def missing_token_callback(error):
    return jsonify({'error': 'Missing authorization token'}), 401

# Routes
@app.route('/')
def index():
    return jsonify({'message': 'ShopHub API', 'version': '1.0.0'})

@app.route('/health')
def health():
    return jsonify({'status': 'healthy'}), 200

@app.route('/api/endpoints')
def list_endpoints():
    return jsonify({
        'authentication': {
            'register': 'POST /api/auth/register',
            'login': 'POST /api/auth/login',
            'me': 'GET /api/auth/me (requires JWT)'
        },
        'products': {
            'list': 'GET /api/products/',
            'detail': 'GET /api/products/<id>',
            'add_review': 'POST /api/products/<id>/reviews (requires JWT)',
            'get_reviews': 'GET /api/products/<id>/reviews'
        },
        'orders': {
            'create': 'POST /api/orders/ (requires JWT)',
            'list': 'GET /api/orders/ (requires JWT)',
            'detail': 'GET /api/orders/<order_id> (requires JWT)'
        },
        'general': {
            'index': 'GET /',
            'health': 'GET /health',
            'endpoints': 'GET /api/endpoints'
        }
    })

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    
    # Setup logging
    logging.basicConfig(level=logging.INFO)
    app.run(debug=True, port=5000)
