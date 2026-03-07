# If the discount is 40% or more, we consider it a big deal worth emailing about
THRESHOLD_PERCENTAGE = 40


def get_highest_price(price_history):
    # If there are no prices in the history, just return 0
    if not price_history:
        return 0

    highest = 0
    for item in price_history:
        if item['price'] > highest:
            highest = item['price']
    return highest


def get_lowest_price(price_history):
    # If there are no prices in the history, just return 0
    if not price_history:
        return 0

    # Start with the first price and compare the rest
    lowest = price_history[0]['price']
    for item in price_history:
        if item['price'] < lowest:
            lowest = item['price']
    return lowest


def get_average_price(price_history):
    # If there are no prices in the history, just return 0
    if not price_history:
        return 0

    total = 0
    for item in price_history:
        total += item['price']

    average = total / len(price_history)
    return average


def get_email_notif_type(scraped_product, current_product):
    """
    Look at the new scraped data and the old data and decide
    what kind of email notification to send (if any).

    Returns one of: 'LOWEST_PRICE', 'CHANGE_OF_STOCK', 'THRESHOLD_MET', or None
    """
    price_history = current_product.get('priceHistory', [])

    # Check if the new price is the lowest we have ever seen
    if price_history:
        lowest_ever = get_lowest_price(price_history)
        if scraped_product['currentPrice'] < lowest_ever:
            return 'LOWEST_PRICE'

    # Check if the item was out of stock before and is now back in stock
    was_out_of_stock = current_product.get('isOutOfStock', False)
    is_now_in_stock = not scraped_product['isOutOfStock']
    if is_now_in_stock and was_out_of_stock:
        return 'CHANGE_OF_STOCK'

    # Check if the discount is big enough to notify about
    if scraped_product['discountRate'] >= THRESHOLD_PERCENTAGE:
        return 'THRESHOLD_MET'

    # No notification needed
    return None


def format_number(num=0):
    # Format a number with commas, e.g. 1000 -> "1,000"
    return f"{num:,.0f}"