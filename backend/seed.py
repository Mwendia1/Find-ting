from app import app, db
from models import Product

def seed_products():
    products = [
        {
            'name': 'Wireless Headphones',
            'category': 'electronics',
            'price': 2000,
            'rating': 4.5,
            'reviews_count': 128,
            'seller': 'TechStore',
            'seller_id': 1,
            'image': './pictures/images (4).jpeg',
            'images': ['./pictures/images (4).jpeg', './pictures/images (4).jpeg', './pictures/images (4).jpeg'],
            'description': 'High-quality wireless headphones with noise cancellation and 30-hour battery life.',
            'specs': {'Battery Life': '30 hours', 'Connectivity': 'Bluetooth 5.0', 'Weight': '250g', 'Color': 'Black'}
        },
        {
            'name': 'Smart Watch',
            'category': 'electronics',
            'price': 199.99,
            'rating': 4.7,
            'reviews_count': 256,
            'seller': 'ElectroHub',
            'seller_id': 2,
            'image': './pictures/Watch.webp',
            'images': ['./pictures/Watch.webp', './pictures/Watch.webp', './pictures/Watch.webp'],
            'description': 'Feature-rich smartwatch with heart rate monitor, GPS, and 7-day battery.',
            'specs': {'Display': 'AMOLED', 'Battery': '7 days', 'Water Resistance': '5ATM', 'OS': 'WearOS'}
        },
        {
            'name': 'Running Shoes',
            'category': 'fashion',
            'price': 89.99,
            'rating': 4.3,
            'reviews_count': 89,
            'seller': 'SportGear',
            'seller_id': 3,
            'image': './pictures/shoes.jpg',
            'images': ['./pictures/shoes.jpg', './pictures/shoes.jpg', './pictures/shoes.jpg'],
            'description': 'Comfortable and durable running shoes with advanced cushioning technology.',
            'specs': {'Material': 'Mesh & Synthetic', 'Sizes': '6-13', 'Weight': '280g', 'Color': 'Blue'}
        },
        {
            'name': 'Coffee Maker',
            'category': 'home',
            'price': 79.99,
            'rating': 4.2,
            'reviews_count': 64,
            'seller': 'HomeEssentials',
            'seller_id': 4,
            'image': './pictures/coffee.webp',
            'images': ['./pictures/coffee.webp', './pictures/coffee.webp', './pictures/coffee.webp'],
            'description': 'Programmable coffee maker with thermal carafe and built-in grinder.',
            'specs': {'Capacity': '12 cups', 'Features': 'Grinder included', 'Power': '900W', 'Color': 'Silver'}
        },
        {
            'name': 'Bluetooth Speaker',
            'category': 'electronics',
            'price': 49.99,
            'rating': 4.6,
            'reviews_count': 142,
            'seller': 'SoundWave',
            'seller_id': 5,
            'image': './pictures/speaker.jpeg',
            'images': ['./pictures/speaker.jpeg', './pictures/speaker.jpeg', './pictures/speaker.jpeg'],
            'description': 'Portable Bluetooth speaker with deep bass and 12-hour battery life.',
            'specs': {'Battery Life': '12 hours', 'Connectivity': 'Bluetooth 4.2', 'Water Resistance': 'IPX5', 'Color': 'Red'}
        },
        {
            'name': 'Yoga Mat',
            'category': 'fitness',
            'price': 29.99,
            'rating': 4.4,
            'reviews_count': 78,
            'seller': 'FitLife',
            'seller_id': 6,
            'image': './pictures/mat.jpeg',
            'images': ['./pictures/mat.jpeg', './pictures/mat.jpeg', './pictures/mat.jpeg'],
            'description': 'Eco-friendly yoga mat with non-slip surface and extra cushioning.',
            'specs': {'Material': 'TPE', 'Thickness': '6mm', 'Dimensions': '72 x 24 inches', 'Color': 'Purple'}
        },
        {
            'name': 'Electric Kettle',
            'category': 'home',
            'price': 39.99,
            'rating': 4.1,
            'reviews_count': 55,
            'seller': 'KitchenPro',
            'seller_id': 7,
            'image': './pictures/kettle.jpeg',
            'images': ['./pictures/kettle.jpg', './pictures/kettle.jpg', './pictures/kettle.jpg'],
            'description': 'Fast-boiling electric kettle with auto shut-off and cordless design.',
            'specs': {'Capacity': '1.7 liters', 'Power': '1500W', 'Material': 'Stainless Steel', 'Color': 'Black'}
        },
        {
            'name': 'Laptop Stand',
            'category': 'electronics',
            'price': 34.99,
            'rating': 4.5,
            'reviews_count': 92,
            'seller': 'TechStore',
            'seller_id': 1,
            'image': './pictures/stand.webp',
            'images': ['./pictures/laptop-stand.jpg', './pictures/laptop-stand.jpg', './pictures/laptop-stand.jpg'],
            'description': 'Adjustable aluminum laptop stand with ergonomic design for better posture.',
            'specs': {'Material': 'Aluminum', 'Adjustable': 'Yes', 'Weight': '500g', 'Color': 'Silver'}
        }
        

    ]
    
    with app.app_context():
        db.drop_all()
        db.create_all()
        
        for p in products:
            product = Product(**p)
            db.session.add(product)
        
        db.session.commit()
        print(f'Database seeded successfully! Total products: {Product.query.count()}')

if __name__ == '__main__':
    seed_products()
