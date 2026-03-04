from flask import Blueprint, jsonify, request
from sqlalchemy import text
from app import get_db
from app.models.product import Product, PriceHistory, ProductSubscriber
from app.scraper.amazon import scrape_amazon_product
from app.services.email import send_email

products_bp = Blueprint('products', __name__)


@products_bp.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok", "message": "Wafferly API is running "})


@products_bp.route('/products', methods=['GET'])
def get_products():
    db = next(get_db())
    try:
        products = db.query(Product).all()
        return jsonify({
            "message": "Success",
            "data": [product.to_dict() for product in products]
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()


@products_bp.route('/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    db = next(get_db())
    try:
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            return jsonify({"error": "Product not found"}), 404
        return jsonify({
            "message": "Success",
            "data": product.to_dict()
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()


@products_bp.route('/products/scrape', methods=['POST'])
def scrape_product():
    """Scrape an Amazon product and save it to the database."""
    data = request.get_json()
    url = data.get('url', '').strip()

    if not url:
        return jsonify({"error": "URL is required"}), 400

    if "amazon" not in url.lower():
        return jsonify({"error": "Only Amazon URLs are supported"}), 400

    db = next(get_db())
    try:
        existing = db.query(Product).filter(Product.url == url).first()

        scraped = scrape_amazon_product(url)
        if not scraped:
            return jsonify({"error": "Failed to scrape product. Please check the URL."}), 500

        if existing:
            existing.title = scraped['title']
            existing.image = scraped['image']
            existing.currency = scraped['currency']
            existing.current_price = scraped['currentPrice']
            existing.original_price = scraped['originalPrice']
            existing.discount_rate = scraped['discountRate']
            existing.description = scraped['description']
            existing.is_out_of_stock = scraped['isOutOfStock']
            existing.stars = scraped['stars']
            existing.reviews_count = scraped['reviewsCount']

            new_price = PriceHistory(
                product_id=existing.id,
                price=scraped['currentPrice']
            )
            db.add(new_price)

            prices = [float(ph.price) for ph in existing.price_history]
            prices.append(scraped['currentPrice'])
            existing.lowest_price = min(prices)
            existing.highest_price = max(prices)
            existing.average_price = sum(prices) / len(prices)

            db.commit()
            db.refresh(existing)

            return jsonify({
                "message": "Product updated successfully",
                "data": existing.to_dict()
            })
        else:
            new_product = Product(
                url=scraped['url'],
                title=scraped['title'],
                image=scraped['image'],
                currency=scraped['currency'],
                current_price=scraped['currentPrice'],
                original_price=scraped['originalPrice'],
                lowest_price=scraped['lowestPrice'],
                highest_price=scraped['highestPrice'],
                average_price=scraped['averagePrice'],
                discount_rate=scraped['discountRate'],
                description=scraped['description'],
                category=scraped['category'],
                reviews_count=scraped['reviewsCount'],
                stars=scraped['stars'],
                is_out_of_stock=scraped['isOutOfStock'],
            )
            db.add(new_product)
            db.commit()
            db.refresh(new_product)

            first_price = PriceHistory(
                product_id=new_product.id,
                price=scraped['currentPrice']
            )
            db.add(first_price)
            db.commit()
            db.refresh(new_product)

            return jsonify({
                "data": new_product.to_dict()
            }), 201

    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()


@products_bp.route('/products/<int:product_id>/subscribe', methods=['POST'])
def subscribe_to_product(product_id):
    """Subscribe an email to track a product."""
    data = request.get_json()
    email = data.get('email', '').strip()

    if not email:
        return jsonify({"error": "Email is required"}), 400

    db = next(get_db())
    try:
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            return jsonify({"error": "Product not found"}), 404

        # Check if already subscribed
        existing_sub = db.query(ProductSubscriber).filter(
            ProductSubscriber.product_id == product_id,
            ProductSubscriber.email == email
        ).first()

        if not existing_sub:
            new_sub = ProductSubscriber(product_id=product_id, email=email)
            db.add(new_sub)
            db.commit()

        # Always send confirmation email
        send_email(
            to_email=email,
            notification_type='PRICE_DROP',
            product_data={
                'title': product.title,
                'currency': product.currency,
                'price': float(product.current_price) if product.current_price else 0,
                'url': product.url,
                'old_price': float(product.original_price) if product.original_price else 0,
            }
        )

        return jsonify({"message": "Tracked successfully! Check your email for confirmation."}), 201

    except Exception as e:
        db.rollback()
        print(f"Subscribe error: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()


@products_bp.route('/email-test', methods=['POST'])
def test_email():
    """Test that email sending works."""
    data = request.get_json()
    to_email = data.get('email', '').strip()

    if not to_email:
        return jsonify({"error": "Email is required"}), 400

    success = send_email(
        to_email=to_email,
        notification_type='LOWEST_PRICE',
        product_data={
            'title': 'Test Product - Wafferly Email Test',
            'currency': '$',
            'price': 29.99,
            'url': 'https://www.amazon.com',
            'discount': 50,
            'old_price': 59.99,
        }
    )

    if success:
        return jsonify({"status": "ok", "message": f"Test email sent to {to_email}!"})
    else:
        return jsonify({"status": "error", "message": "Failed to send email. Check your credentials."}), 500


@products_bp.route('/db-test', methods=['GET'])
def test_db():
    """Test that the database connection works."""
    db = next(get_db())
    try:
        result = db.execute(text("SELECT 1")).fetchone()
        return jsonify({
            "status": "ok",
            "message": "Database connected successfully! 🗄️",
            "result": result[0]
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Database connection failed: {str(e)}"
        }), 500
    finally:
        db.close()