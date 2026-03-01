from flask import Blueprint, jsonify
from app import get_db
from app.models.product import Product, PriceHistory
from app.scraper.amazon import scrape_amazon_product
from app.services.email import notify_subscribers
from app.utils import get_email_notif_type

cron_bp = Blueprint('cron', __name__)


@cron_bp.route('/cron/update-products', methods=['GET'])
def update_all_products():
    """
    Cron job endpoint: Re-scrape all products and notify subscribers of price changes.
    Run this every few hours via a scheduler or manually.
    """
    db = next(get_db())
    try:
        products = db.query(Product).all()

        if not products:
            return jsonify({"message": "No products to update"}), 200

        updated = 0
        failed = 0
        notified = 0

        for product in products:
            try:
                print(f"\n🔄 Scraping: {product.title[:50]}...")

                # Scrape fresh data
                scraped = scrape_amazon_product(product.url)

                if not scraped:
                    print(f"❌ Failed to scrape: {product.url}")
                    failed += 1
                    continue

                # Save current state for comparison
                current_data = {
                    'currentPrice': float(product.current_price) if product.current_price else 0,
                    'isOutOfStock': product.is_out_of_stock,
                    'priceHistory': [
                        {'price': float(ph.price)} for ph in product.price_history
                    ],
                }

                # Update product fields
                product.title = scraped['title'] or product.title
                product.image = scraped['image'] or product.image
                product.currency = scraped['currency'] or product.currency
                product.current_price = scraped['currentPrice'] or product.current_price
                product.original_price = scraped['originalPrice'] or product.original_price
                product.discount_rate = scraped['discountRate']
                product.description = scraped['description'] or product.description
                product.is_out_of_stock = scraped['isOutOfStock']
                product.stars = scraped['stars'] or product.stars
                product.reviews_count = scraped['reviewsCount'] or product.reviews_count

                # Add new price to history
                new_price_entry = PriceHistory(
                    product_id=product.id,
                    price=scraped['currentPrice']
                )
                db.add(new_price_entry)

                # Recalculate price stats
                all_prices = [float(ph.price) for ph in product.price_history]
                all_prices.append(scraped['currentPrice'])
                # Filter out zero prices
                valid_prices = [p for p in all_prices if p > 0]

                if valid_prices:
                    product.lowest_price = min(valid_prices)
                    product.highest_price = max(valid_prices)
                    product.average_price = sum(valid_prices) / len(valid_prices)

                db.commit()
                updated += 1
                print(f"✅ Updated: {product.title[:50]}")

                # Check if we need to notify subscribers
                notif_type = get_email_notif_type(scraped, current_data)
                if notif_type and product.subscribers:
                    print(f"📧 Sending {notif_type} notification...")
                    db.refresh(product)
                    notify_subscribers(product, notif_type)
                    notified += 1

            except Exception as e:
                print(f"❌ Error updating product {product.id}: {e}")
                db.rollback()
                failed += 1
                continue

        summary = {
            "message": "Cron job completed! 🧇",
            "total_products": len(products),
            "updated": updated,
            "failed": failed,
            "notifications_sent": notified,
        }

        print(f"\n{'='*50}")
        print(f"🧇 Cron Summary: {updated} updated, {failed} failed, {notified} notified")
        print(f"{'='*50}\n")

        return jsonify(summary), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()