from flask import Blueprint, jsonify, request
from sqlalchemy import text
from app import get_db
from app.models.product import Product, PriceHistory, ProductSubscriber, Session
from app.scraper.amazon import scrape_amazon_product
from app.services.email import send_email
from app.routes.auth import get_current_user
from datetime import datetime

# A Blueprint is just a way to group related routes together
products_bp = Blueprint('products', __name__)


@products_bp.route('/health', methods=['GET'])
def health_check():
    # Simple endpoint to check if the API is running
    return jsonify({"status": "ok", "message": "Wafferly API is running "})


@products_bp.route('/products', methods=['GET'])
def get_products():
    # Return a list of all tracked products
    db = next(get_db())
    try:
        all_products = db.query(Product).all()
        products_list = [product.to_dict() for product in all_products]
        return jsonify({
            "message": "Success",
            "data": products_list
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()


@products_bp.route('/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    # Return a single product by its ID
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
    # Scrape an Amazon product URL and save it (or update it) in the database
    data = request.get_json()
    url = data.get('url', '').strip()

    if not url:
        return jsonify({"error": "URL is required"}), 400

    if "amazon" not in url.lower():
        return jsonify({"error": "Only Amazon URLs are supported"}), 400

    db = next(get_db())
    try:
        # Check if we already have this product saved
        existing_product = db.query(Product).filter(Product.url == url).first()

        # Scrape the product page
        scraped = scrape_amazon_product(url)

        if not scraped:
            return jsonify({"error": "Failed to scrape product. Please check the URL."}), 500
            
        if "error" in scraped:
            return jsonify({"error": scraped["error"]}), 500

        if existing_product:
            # Update the existing product with fresh data
            existing_product.title = scraped['title']
            existing_product.image = scraped['image']
            existing_product.currency = scraped['currency']
            existing_product.current_price = scraped['currentPrice']
            existing_product.original_price = scraped['originalPrice']
            existing_product.discount_rate = scraped['discountRate']
            existing_product.description = scraped['description']
            existing_product.is_out_of_stock = scraped['isOutOfStock']
            existing_product.stars = scraped['stars']
            existing_product.reviews_count = scraped['reviewsCount']

            # Add a new entry to the price history
            new_price_entry = PriceHistory(
                product_id=existing_product.id,
                price=scraped['currentPrice']
            )
            db.add(new_price_entry)

            # Recalculate lowest, highest and average price from all history
            all_prices = [float(ph.price) for ph in existing_product.price_history]
            all_prices.append(scraped['currentPrice'])

            existing_product.lowest_price = min(all_prices)
            existing_product.highest_price = max(all_prices)
            existing_product.average_price = sum(all_prices) / len(all_prices)

            db.commit()
            db.refresh(existing_product)

            return jsonify({
                "message": "Product updated successfully",
                "data": existing_product.to_dict()
            })

        else:
            # Save the new product to the database
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

            # Save the first price history entry
            first_price_entry = PriceHistory(
                product_id=new_product.id,
                price=scraped['currentPrice']
            )
            db.add(first_price_entry)
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
    # Sign up an email address to get price alerts for a product
    data = request.get_json()
    email = data.get('email', '').strip()

    if not email:
        return jsonify({"error": "Email is required"}), 400

    # target_price is optional — the user can set a price they want to wait for
    # e.g. "notify me only when this drops below $40"
    raw_target = data.get('targetPrice')
    target_price = None
    if raw_target:
        try:
            target_price = float(raw_target)
            if target_price <= 0:
                target_price = None
        except (ValueError, TypeError):
            return jsonify({"error": "Target price must be a valid number"}), 400

    db = next(get_db())
    try:
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            return jsonify({"error": "Product not found"}), 404

        # Check for authentication token and resolve user
        user = get_current_user(db)
        user_id = user.id if user else None

        # Check if this email is already subscribed to this product
        already_subscribed = db.query(ProductSubscriber).filter(
            ProductSubscriber.product_id == product_id,
            ProductSubscriber.email == email
        ).first()

        if already_subscribed:
            # If they are already subscribed, just update their target price
            already_subscribed.target_price = target_price
            
            # If they just logged in, link the record to their user ID explicitly
            if user_id and not already_subscribed.user_id:
                already_subscribed.user_id = user_id
                
            db.commit()
            db.refresh(already_subscribed)
            subscriber = already_subscribed
        else:
            # Create a brand new subscription
            # The unsubscribe_token is generated automatically by the model default
            subscriber = ProductSubscriber(
                product_id=product_id,
                email=email,
                user_id=user_id,
                target_price=target_price,
            )
            db.add(subscriber)
            db.commit()
            db.refresh(subscriber)

        # Build a friendly confirmation message for the email
        if target_price:
            price_note = f"We'll alert you when the price drops to {product.currency} {target_price:.2f} or below."
        else:
            price_note = "We'll alert you whenever the price drops."

        # Send a confirmation email with the unsubscribe link already in it
        send_email(
            to_email=email,
            notification_type='PRICE_DROP',
            product_data={
                'title': product.title,
                'currency': product.currency,
                'price': float(product.current_price) if product.current_price else 0,
                'url': product.url,
                'old_price': float(product.original_price) if product.original_price else 0,
            },
            unsubscribe_token=subscriber.unsubscribe_token,
        )

        return jsonify({
            "message": f"Tracked successfully! {price_note} Check your email for confirmation."
        }), 201

    except Exception as e:
        db.rollback()
        print(f"Subscribe error: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()


@products_bp.route('/unsubscribe/<string:token>', methods=['GET'])
def unsubscribe(token):
    """
    One-click unsubscribe endpoint.
    The user clicks the link in their email which hits this URL.
    We find the subscription by the token and delete it.
    """
    db = next(get_db())
    try:
        # Find the subscription that has this token
        subscriber = db.query(ProductSubscriber).filter(
            ProductSubscriber.unsubscribe_token == token
        ).first()

        if not subscriber:
            return jsonify({"error": "Unsubscribe link is invalid or already used."}), 404

        # Save the email for the confirmation message before deleting
        email = subscriber.email
        product_title = subscriber.product.title if subscriber.product else "the product"

        # Delete the subscription from the database
        db.delete(subscriber)
        db.commit()

        print(f"✅ Unsubscribed {email} from {product_title}")

        return jsonify({
            "message": f"You have been unsubscribed from price alerts for '{product_title}'. You won't receive any more emails about this product."
        }), 200

    except Exception as e:
        db.rollback()
        print(f"Unsubscribe error: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()


@products_bp.route('/email-test', methods=['POST'])
def test_email():
    # Test that our email sending is working correctly
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
    # Test that we can connect to the database
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