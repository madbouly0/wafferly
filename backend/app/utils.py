def get_highest_price(price_history):
    """Get the highest price from price history list."""
    if not price_history:
        return 0
    return max(item['price'] for item in price_history)


def get_lowest_price(price_history):
    """Get the lowest price from price history list."""
    if not price_history:
        return 0
    return min(item['price'] for item in price_history)


def get_average_price(price_history):
    """Get the average price from price history list."""
    if not price_history:
        return 0
    total = sum(item['price'] for item in price_history)
    return total / len(price_history)


THRESHOLD_PERCENTAGE = 40


def get_email_notif_type(scraped_product, current_product):
    """
    Determine what type of email notification to send.
    Returns: 'LOWEST_PRICE', 'CHANGE_OF_STOCK', 'THRESHOLD_MET', or None
    """
    current_history = current_product.get('priceHistory', [])

    if current_history:
        lowest = get_lowest_price(current_history)
        if scraped_product['currentPrice'] < lowest:
            return 'LOWEST_PRICE'

    if not scraped_product['isOutOfStock'] and current_product.get('isOutOfStock', False):
        return 'CHANGE_OF_STOCK'

    if scraped_product['discountRate'] >= THRESHOLD_PERCENTAGE:
        return 'THRESHOLD_MET'

    return None


def format_number(num=0):
    """Format a number with commas."""
    return f"{num:,.0f}"