from flask import Blueprint, jsonify
from app import get_db
from app.models.product import Product, PriceHistory
from app.scraper.amazon import scrape_amazon_product
from app.services.email import send_email, notify_subscribers
from app.utils import get_email_notif_type

cron_bp = Blueprint('cron', __name__)


@cron_bp.route('/cron/update-products', methods=['GET'])
def update_all_products():
    """
    This endpoint is called on a schedule (like every 6 hours).
    It goes through every product, scrapes fresh data, saves it,
    and sends email alerts to subscribers if the price changed.
    """
    db = next(get_db())

    try:
        all_products = db.query(Product).all()

        if not all_products:
            return jsonify({"message": "No products to update"}), 200

        # Keep track of how things went
        updated_count = 0
        failed_count = 0
        notified_count = 0

        for product in all_products:
            try:
                print(f"\n🔄 Scraping: {product.title[:50]}...")

                # Scrape the latest data from Amazon
                scraped = scrape_amazon_product(product.url)

                if not scraped:
                    print(f"❌ Failed to scrape: {product.url}")
                    failed_count += 1
                    continue

                # Save a snapshot of the current state so we can compare later
                old_data = {
                    'currentPrice': float(product.current_price) if product.current_price else 0,
                    'isOutOfStock': product.is_out_of_stock,
                    'priceHistory': [
                        {'price': float(ph.price)} for ph in product.price_history
                    ],
                }

                # Update the product with the freshly scraped values
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

                # Add a new price history record for today
                new_price_entry = PriceHistory(
                    product_id=product.id,
                    price=scraped['currentPrice']
                )
                db.add(new_price_entry)

                # Recalculate the price statistics
                all_prices = [float(ph.price) for ph in product.price_history]
                all_prices.append(scraped['currentPrice'])

                # Ignore any zero prices when calculating stats
                valid_prices = [p for p in all_prices if p > 0]

                if valid_prices:
                    product.lowest_price = min(valid_prices)
                    product.highest_price = max(valid_prices)
                    product.average_price = sum(valid_prices) / len(valid_prices)

                db.commit()
                updated_count += 1
                print(f"✅ Updated: {product.title[:50]}")

                new_price = scraped['currentPrice']

                # ── Step 1: Check global notification (lowest ever, back in stock, big discount)
                # This sends ONE email to ALL subscribers at once
                notif_type = get_email_notif_type(scraped, old_data)
                if notif_type and product.subscribers:
                    print(f"📧 Sending {notif_type} notification to all subscribers...")
                    db.refresh(product)
                    notify_subscribers(product, notif_type)
                    notified_count += 1

                # ── Step 2: Check each subscriber's personal target price
                # We loop through subscribers individually because each has their own target
                db.refresh(product)
                for subscriber in product.subscribers:

                    # Skip this subscriber if they have no target price set
                    if not subscriber.target_price:
                        continue

                    target = float(subscriber.target_price)

                    # Did the price just cross below their target for the first time?
                    # We check: current price <= target AND old price was above target
                    # This prevents sending the same "target reached" email every single cron run
                    old_price = old_data['currentPrice']
                    price_just_hit_target = new_price <= target and old_price > target

                    if price_just_hit_target:
                        print(f"🎯 Target price hit for {subscriber.email} (target: {target}, current: {new_price})")

                        send_email(
                            to_email=subscriber.email,
                            notification_type='TARGET_REACHED',
                            product_data={
                                'title': product.title,
                                'currency': product.currency,
                                'price': new_price,
                                'url': product.url,
                                'target_price': target,
                            },
                            unsubscribe_token=subscriber.unsubscribe_token,
                        )
                        notified_count += 1

            except Exception as e:
                print(f"❌ Error updating product {product.id}: {e}")
                db.rollback()
                failed_count += 1
                continue

        # Build a summary to return as the response
        summary = {
            "message": "Cron job completed! ",
            "total_products": len(all_products),
            "updated": updated_count,
            "failed": failed_count,
            "notifications_sent": notified_count,
        }

        print(f"\n{'='*50}")
        print(f" Cron Summary: {updated_count} updated, {failed_count} failed, {notified_count} notified")
        print(f"{'='*50}\n")

        return jsonify(summary), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        db.close()