from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Order, OrderItem
from datetime import datetime

orders_bp = Blueprint('orders', __name__)

@orders_bp.route('/', methods=['POST'])
@jwt_required()
def create_order():
    user_id = get_jwt_identity()
    data = request.json
    
    order = Order(
        order_id=f"ORD-{int(datetime.utcnow().timestamp())}",
        user_id=user_id,
        total=data['total'],
        status='pending',
        shipping_address=data['shipping'],
        payment_method=data['payment']
    )
    
    db.session.add(order)
    db.session.flush()
    
    for item in data['items']:
        order_item = OrderItem(
            order_id=order.id,
            product_id=item['id'],
            quantity=item['quantity'],
            price=item['price']
        )
        db.session.add(order_item)
    
    db.session.commit()
    
    return jsonify({'message': 'Order created', 'orderId': order.order_id}), 201

@orders_bp.route('/', methods=['GET'])
@jwt_required()
def get_orders():
    user_id = get_jwt_identity()
    orders = Order.query.filter_by(user_id=user_id).all()
    
    return jsonify([{
        'id': o.order_id,
        'date': o.created_at.isoformat(),
        'total': o.total,
        'status': o.status,
        'items': [{
            'id': item.product.id,
            'name': item.product.name,
            'quantity': item.quantity,
            'price': item.price
        } for item in o.items],
        'shipping': o.shipping_address
    } for o in orders])

@orders_bp.route('/<order_id>', methods=['GET'])
@jwt_required()
def get_order(order_id):
    user_id = get_jwt_identity()
    order = Order.query.filter_by(order_id=order_id, user_id=user_id).first_or_404()
    
    return jsonify({
        'id': order.order_id,
        'date': order.created_at.isoformat(),
        'total': order.total,
        'status': order.status,
        'items': [{
            'id': item.product.id,
            'name': item.product.name,
            'quantity': item.quantity,
            'price': item.price
        } for item in order.items],
        'shipping': order.shipping_address,
        'payment': order.payment_method
    })
