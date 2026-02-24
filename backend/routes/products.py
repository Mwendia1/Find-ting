from flask import Blueprint, request, jsonify
from models import db, Product, Review
from flask_jwt_extended import jwt_required, get_jwt_identity

products_bp = Blueprint('products', __name__)

@products_bp.route('/', methods=['GET'])
def get_products():
    products = Product.query.all()
    return jsonify([{
        'id': p.id,
        'name': p.name,
        'category': p.category,
        'price': p.price,
        'rating': p.rating,
        'reviews': p.reviews_count,
        'seller': p.seller,
        'sellerId': p.seller_id,
        'image': p.image,
        'images': p.images,
        'description': p.description,
        'specs': p.specs
    } for p in products])

@products_bp.route('/<int:id>', methods=['GET'])
def get_product(id):
    product = Product.query.get_or_404(id)
    return jsonify({
        'id': product.id,
        'name': product.name,
        'category': product.category,
        'price': product.price,
        'rating': product.rating,
        'reviews': product.reviews_count,
        'seller': product.seller,
        'sellerId': product.seller_id,
        'image': product.image,
        'images': product.images,
        'description': product.description,
        'specs': product.specs
    })

@products_bp.route('/<int:id>/reviews', methods=['POST'])
@jwt_required()
def add_review(id):
    user_id = get_jwt_identity()
    data = request.json
    
    review = Review(
        user_id=user_id,
        product_id=id,
        rating=data['rating'],
        text=data['text']
    )
    
    db.session.add(review)
    db.session.commit()
    
    return jsonify({'message': 'Review added'}), 201

@products_bp.route('/<int:id>/reviews', methods=['GET'])
def get_reviews(id):
    reviews = Review.query.filter_by(product_id=id).all()
    return jsonify([{
        'id': r.id,
        'author': r.user.name,
        'rating': r.rating,
        'text': r.text,
        'date': r.created_at.isoformat()
    } for r in reviews])
