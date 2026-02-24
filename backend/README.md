# ShopHub Backend

Python Flask backend for ShopHub e-commerce application.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Configure environment variables in `.env`

3. Initialize database and seed data:
```bash
python seed.py
```

4. Run the server:
```bash
python app.py
```

Server runs on http://localhost:5000

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user
- GET `/api/auth/me` - Get current user (requires JWT)

### Products
- GET `/api/products` - Get all products
- GET `/api/products/<id>` - Get single product
- POST `/api/products/<id>/reviews` - Add review (requires JWT)
- GET `/api/products/<id>/reviews` - Get product reviews

### Orders
- POST `/api/orders` - Create order (requires JWT)
- GET `/api/orders` - Get user orders (requires JWT)
- GET `/api/orders/<order_id>` - Get order details (requires JWT)

## Database

SQLite database with models:
- User
- Product
- Order
- OrderItem
- Review
- Address
