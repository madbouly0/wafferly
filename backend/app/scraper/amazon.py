from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup
import re
import json


def get_chrome_driver():
    """Create and return a headless Chrome browser instance."""
    options = Options()
    options.add_argument("--headless")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    options.add_argument("--window-size=1920,1080")
    options.add_argument(
        "user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/122.0.0.0 Safari/537.36"
    )

    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)
    return driver


def extract_price(*elements):
    """Extract price from a list of possible text values."""
    for text in elements:
        if text:
            clean = re.sub(r'[^\d.]', '', text.strip())
            if clean:
                match = re.search(r'\d+\.?\d{0,2}', clean)
                if match:
                    return match.group()
    return ''


def extract_description(soup):
    """Extract product description from Amazon page."""
    selectors = [
        "#feature-bullets .a-list-item",
        ".a-expander-content p",
        "#productDescription p",
    ]

    for selector in selectors:
        elements = soup.select(selector)
        if elements:
            texts = [el.get_text(strip=True) for el in elements]
            # Filter out empty strings and common junk
            texts = [t for t in texts if t and len(t) > 5]
            if texts:
                return "\n".join(texts)

    return ""


def scrape_amazon_product(url):
    """
    Scrape an Amazon product page using Selenium + BeautifulSoup.
    Returns a dictionary with product data, or None if scraping fails.
    """
    if not url:
        return None

    driver = None
    try:
        driver = get_chrome_driver()
        driver.get(url)

        # Wait for the product title to load
        WebDriverWait(driver, 15).until(
            EC.presence_of_element_located((By.ID, "productTitle"))
        )

        # Get page source and parse with BeautifulSoup
        soup = BeautifulSoup(driver.page_source, 'html.parser')

        # --- Extract Title ---
        title_el = soup.select_one("#productTitle")
        title = title_el.get_text(strip=True) if title_el else ""

        # --- Extract Current Price ---
        current_price_texts = [
            soup.select_one(".priceToPay .a-price-whole"),
            soup.select_one(".a-price .a-offscreen"),
            soup.select_one("#priceblock_ourprice"),
            soup.select_one(".a-button-selected .a-color-base"),
        ]
        current_price_values = [
            el.get_text(strip=True) if el else '' for el in current_price_texts
        ]
        current_price = extract_price(*current_price_values)

        # --- Extract Original Price ---
        original_price_texts = [
            soup.select_one(".a-price.a-text-price .a-offscreen"),
            soup.select_one("#listPrice"),
            soup.select_one("#priceblock_dealprice"),
            soup.select_one(".a-size-base.a-color-price"),
        ]
        original_price_values = [
            el.get_text(strip=True) if el else '' for el in original_price_texts
        ]
        original_price = extract_price(*original_price_values)

        # --- Extract Out of Stock ---
        availability_el = soup.select_one("#availability span")
        out_of_stock = False
        if availability_el:
            out_of_stock = "currently unavailable" in availability_el.get_text(strip=True).lower()

        # --- Extract Image ---
        image_url = ""
        img_el = soup.select_one("#imgBlkFront") or soup.select_one("#landingImage")
        if img_el:
            dynamic_images = img_el.get("data-a-dynamic-image", "{}")
            try:
                image_urls = list(json.loads(dynamic_images).keys())
                if image_urls:
                    image_url = image_urls[0]
            except json.JSONDecodeError:
                image_url = img_el.get("src", "")

        # --- Extract Currency ---
        currency_el = soup.select_one(".a-price-symbol")
        currency = currency_el.get_text(strip=True)[:1] if currency_el else "$"

        # --- Extract Discount ---
        discount_el = soup.select_one(".savingsPercentage")
        discount_rate = 0
        if discount_el:
            discount_text = re.sub(r'[-%]', '', discount_el.get_text(strip=True))
            discount_rate = int(discount_text) if discount_text.isdigit() else 0

        # --- Extract Description ---
        description = extract_description(soup)

        # --- Extract Stars ---
        stars = 0
        stars_el = soup.select_one("#acrPopover .a-icon-alt")
        if stars_el:
            stars_match = re.search(r'[\d.]+', stars_el.get_text(strip=True))
            if stars_match:
                stars = float(stars_match.group())

        # --- Extract Reviews Count ---
        reviews_count = 0
        reviews_el = soup.select_one("#acrCustomerReviewText")
        if reviews_el:
            reviews_match = re.search(r'[\d,]+', reviews_el.get_text(strip=True))
            if reviews_match:
                reviews_count = int(reviews_match.group().replace(',', ''))

        # --- Build Data ---
        cp = float(current_price) if current_price else 0
        op = float(original_price) if original_price else 0

        data = {
            "url": url,
            "currency": currency or "$",
            "image": image_url,
            "title": title,
            "currentPrice": cp or op,
            "originalPrice": op or cp,
            "priceHistory": [],
            "discountRate": discount_rate,
            "category": "category",
            "reviewsCount": reviews_count,
            "stars": stars,
            "isOutOfStock": out_of_stock,
            "description": description,
            "lowestPrice": cp or op,
            "highestPrice": op or cp,
            "averagePrice": cp or op,
        }

        return data

    except Exception as e:
        print(f"Error scraping product: {e}")
        return None

    finally:
        if driver:
            driver.quit()