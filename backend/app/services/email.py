import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from config import Config

config = Config()

NOTIFICATION_TYPES = {
    'LOWEST_PRICE': {
        'subject': '🧇 Wafferly Alert: Lowest Price Ever!',
        'body': (
            "Great news! The product you're tracking has hit its LOWEST price ever!\n\n"
            "Product: {title}\n"
            "Current Price: {currency} {price}\n\n"
            "Don't miss out — grab it now before the price goes back up!\n\n"
            "View on Amazon: {url}\n\n"
            "— Wafferly 🧇"
        ),
    },
    'CHANGE_OF_STOCK': {
        'subject': '🧇 Wafferly Alert: Back in Stock!',
        'body': (
            "The product you've been waiting for is back in stock!\n\n"
            "Product: {title}\n"
            "Current Price: {currency} {price}\n\n"
            "Hurry up — it might sell out again!\n\n"
            "View on Amazon: {url}\n\n"
            "— Wafferly 🧇"
        ),
    },
    'THRESHOLD_MET': {
        'subject': '🧇 Wafferly Alert: Huge Discount!',
        'body': (
            "The product you're tracking just hit a massive discount!\n\n"
            "Product: {title}\n"
            "Current Price: {currency} {price}\n"
            "Discount: {discount}% off!\n\n"
            "This deal won't last long!\n\n"
            "View on Amazon: {url}\n\n"
            "— Wafferly 🧇"
        ),
    },
    'PRICE_DROP': {
        'subject': '🧇 Wafferly Alert: Price Dropped!',
        'body': (
            "The price dropped on a product you're tracking!\n\n"
            "Product: {title}\n"
            "New Price: {currency} {price}\n"
            "Previous Price: {currency} {old_price}\n\n"
            "View on Amazon: {url}\n\n"
            "— Wafferly 🧇"
        ),
    },
}


def send_email(to_email, notification_type, product_data):
    """
    Send an email notification to a subscriber.

    Args:
        to_email: Recipient email address
        notification_type: One of 'LOWEST_PRICE', 'CHANGE_OF_STOCK', 'THRESHOLD_MET', 'PRICE_DROP'
        product_data: Dict with keys: title, currency, price, url, discount, old_price
    """
    if not config.MAIL_USERNAME or not config.MAIL_PASSWORD:
        print("Email credentials not configured. Skipping email.")
        return False

    template = NOTIFICATION_TYPES.get(notification_type)
    if not template:
        print(f"Unknown notification type: {notification_type}")
        return False

    try:
        # Build the email
        msg = MIMEMultipart()
        msg['From'] = config.MAIL_USERNAME
        msg['To'] = to_email
        msg['Subject'] = template['subject']

        body = template['body'].format(
            title=product_data.get('title', 'Unknown Product'),
            currency=product_data.get('currency', '$'),
            price=product_data.get('price', 0),
            url=product_data.get('url', ''),
            discount=product_data.get('discount', 0),
            old_price=product_data.get('old_price', 0),
        )

        msg.attach(MIMEText(body, 'plain'))

        # Send the email
        with smtplib.SMTP(config.MAIL_SERVER, config.MAIL_PORT) as server:
            server.starttls()
            server.login(config.MAIL_USERNAME, config.MAIL_PASSWORD)
            server.send_message(msg)

        print(f"Email sent to {to_email} [{notification_type}]")
        return True

    except Exception as e:
        print(f"Failed to send email to {to_email}: {e}")
        return False


def notify_subscribers(product, notification_type):
    """
    Send email notifications to all subscribers of a product.

    Args:
        product: Product SQLAlchemy object (with subscribers relationship)
        notification_type: Type of notification
    """
    if not product.subscribers:
        print(f"No subscribers for product: {product.title}")
        return

    product_data = {
        'title': product.title,
        'currency': product.currency,
        'price': float(product.current_price) if product.current_price else 0,
        'url': product.url,
        'discount': product.discount_rate or 0,
        'old_price': float(product.original_price) if product.original_price else 0,
    }

    success_count = 0
    for subscriber in product.subscribers:
        if send_email(subscriber.email, notification_type, product_data):
            success_count += 1

    print(f"Notified {success_count}/{len(product.subscribers)} subscribers for: {product.title}")