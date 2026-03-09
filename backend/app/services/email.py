import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from config import Config

config = Config()

# The base URL of our frontend — used to build the unsubscribe link in emails
FRONTEND_URL = "http://localhost:3000"

# These are the email templates for each type of notification we can send
# {unsubscribe_url} is added to every template so users can always opt out
NOTIFICATION_TYPES = {
    'LOWEST_PRICE': {
        'subject': '🧇 Wafferly Alert: Lowest Price Ever!',
        'body': (
            "Great news! The product you're tracking has hit its LOWEST price ever!\n\n"
            "Product: {title}\n"
            "Current Price: {currency} {price}\n\n"
            "Don't miss out — grab it now before the price goes back up!\n\n"
            "View on Amazon: {url}\n\n"
            "— Wafferly 🧇\n\n"
            "---\n"
            "Don't want these emails? Unsubscribe here: {unsubscribe_url}"
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
            "— Wafferly 🧇\n\n"
            "---\n"
            "Don't want these emails? Unsubscribe here: {unsubscribe_url}"
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
            "— Wafferly 🧇\n\n"
            "---\n"
            "Don't want these emails? Unsubscribe here: {unsubscribe_url}"
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
            "— Wafferly 🧇\n\n"
            "---\n"
            "Don't want these emails? Unsubscribe here: {unsubscribe_url}"
        ),
    },
    'TARGET_REACHED': {
        'subject': '🧇 Wafferly Alert: Your Target Price Was Hit!',
        'body': (
            "Great news! A product you're tracking just dropped to your target price!\n\n"
            "Product: {title}\n"
            "Your Target Price: {currency} {target_price}\n"
            "Current Price:     {currency} {price}\n\n"
            "This is the price you were waiting for — act now!\n\n"
            "View on Amazon: {url}\n\n"
            "— Wafferly 🧇\n\n"
            "---\n"
            "Don't want these emails? Unsubscribe here: {unsubscribe_url}"
        ),
    },
    'MAGIC_LINK': {
        'subject': 'Your Wafferly login link',
        'body': (
            "Hello!\n\n"
            "Click the link below to sign in to your Wafferly dashboard.\n\n"
            "{magic_link_url}\n\n"
            "This link will expire in 15 minutes.\n\n"
            "— Wafferly 🧇"
        ),
    },
}


def send_email(to_email, notification_type, product_data, unsubscribe_token=None):
    """
    Send one email to a subscriber.

    to_email            - the email address to send to
    notification_type   - which template to use (e.g. 'PRICE_DROP')
    product_data        - a dict with product info to fill in the template
    unsubscribe_token   - the subscriber's unique token for the unsubscribe link
    """
    # If we have no email credentials set up, skip sending
    if not config.MAIL_USERNAME or not config.MAIL_PASSWORD:
        print("Email credentials not configured. Skipping email.")
        return False

    # Look up the email template
    template = NOTIFICATION_TYPES.get(notification_type)
    if not template:
        print(f"Unknown notification type: {notification_type}")
        return False

    try:
        # Build the unsubscribe URL using the subscriber's unique token
        # e.g. http://localhost:3000/unsubscribe/abc-123-def-456
        if unsubscribe_token:
            unsubscribe_url = f"{FRONTEND_URL}/unsubscribe/{unsubscribe_token}"
        else:
            unsubscribe_url = f"{FRONTEND_URL}"

        # Build the email message
        msg = MIMEMultipart()
        msg['From'] = config.MAIL_USERNAME
        msg['To'] = to_email
        msg['Subject'] = template['subject']

        # Build the magic link URL if applicable
        magic_link_url = ""
        if notification_type == 'MAGIC_LINK':
            token = product_data.get('magic_link_token')
            magic_link_url = f"{FRONTEND_URL}/auth/verify?token={token}"

        # Fill in the template with actual product data + the unsubscribe link
        body = template['body'].format(
            title=product_data.get('title', 'Unknown Product'),
            currency=product_data.get('currency', '$'),
            price=product_data.get('price', 0),
            url=product_data.get('url', ''),
            discount=product_data.get('discount', 0),
            old_price=product_data.get('old_price', 0),
            target_price=product_data.get('target_price', 0),
            unsubscribe_url=unsubscribe_url,
            magic_link_url=magic_link_url,
        )

        # For MAGIC_LINK, use a simpler HTML template with a big button
        if notification_type == 'MAGIC_LINK':
            html_msg = f"""
            <html>
              <body style="font-family: Arial, sans-serif; text-align: center; padding: 40px; background-color: #f9fafb;">
                <div style="max-width: 500px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                  <h1 style="color: #065f46; font-size: 24px; margin-bottom: 20px;">Sign in to Wafferly 🧇</h1>
                  <p style="color: #4b5563; font-size: 16px; margin-bottom: 30px;">Click the button below to sign in to your Wafferly dashboard. This link expires in 15 minutes.</p>
                  <a href="{magic_link_url}" style="display: inline-block; background-color: #059669; color: white; text-decoration: none; padding: 14px 28px; font-size: 16px; font-weight: bold; border-radius: 6px;">Sign In to Dashboard</a>
                  <p style="color: #9ca3af; font-size: 14px; margin-top: 30px;">If you didn't request this email, you can safely ignore it.</p>
                </div>
              </body>
            </html>
            """
            
            # Use MIMEMultipart with both plain and HTML
            # msg is already MIMEMultipart. attach plain text first, then HTML.
            msg.attach(MIMEText(body, 'plain'))
            msg.attach(MIMEText(html_msg, 'html'))
        else:
            msg.attach(MIMEText(body, 'plain'))

        # Connect to Gmail and send the message
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
    Send an email to every subscriber of a product.
    Each subscriber gets their own personalised unsubscribe link.

    product           - the Product object from the database
    notification_type - which kind of email to send
    """
    if not product.subscribers:
        print(f"No subscribers for product: {product.title}")
        return

    # Build the shared product info — same for every subscriber
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
        # Pass each subscriber's unique token so their email has their own unsubscribe link
        email_sent = send_email(
            subscriber.email,
            notification_type,
            product_data,
            unsubscribe_token=subscriber.unsubscribe_token,
        )
        if email_sent:
            success_count += 1

    print(f"Notified {success_count}/{len(product.subscribers)} subscribers for: {product.title}")