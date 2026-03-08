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
import random
import time


# Rotate between realistic user agents to avoid fingerprinting
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_3_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3.1 Safari/605.1.15",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
]

# Realistic screen sizes to avoid headless detection
WINDOW_SIZES = [
    "1920,1080",
    "1366,768",
    "1440,900",
    "1536,864",
    "1280,800",
]


def get_chrome_driver():
    options = Options()

    # Use the new headless mode — harder to detect than the old --headless flag
    options.add_argument("--headless=new")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")

    # Random window size to avoid fingerprinting
    options.add_argument(f"--window-size={random.choice(WINDOW_SIZES)}")

    # Rotate user agent
    user_agent = random.choice(USER_AGENTS)
    options.add_argument(f"--user-agent={user_agent}")

    # Remove the "Chrome is controlled by automated software" banner
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    options.add_experimental_option("useAutomationExtension", False)

    # Disable Blink features that expose headless/automation
    options.add_argument("--disable-blink-features=AutomationControlled")

    # Realistic language settings
    options.add_argument("--lang=en-US,en;q=0.9")

    options.add_argument("--disable-extensions")
    options.add_argument("--disable-plugins-discovery")
    options.add_argument("--disable-infobars")
    options.add_argument("--disable-notifications")

    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)

    # Patch navigator.webdriver to undefined via CDP
    # This is the primary signal Amazon uses to detect headless browsers
    driver.execute_cdp_cmd("Page.addScriptToEvaluateOnNewDocument", {
        "source": """
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined
            });
            Object.defineProperty(navigator, 'plugins', {
                get: () => [1, 2, 3, 4, 5]
            });
            Object.defineProperty(navigator, 'languages', {
                get: () => ['en-US', 'en']
            });
            window.chrome = {
                runtime: {}
            };
        """
    })

    return driver


def is_bot_detection_page(soup):
    """
    Check if Amazon has served a CAPTCHA or bot-detection page
    instead of the actual product.
    """
    page_text = soup.get_text().lower()

    bot_signals = [
        "enter the characters you see below",
        "sorry, we just need to make sure you're not a robot",
        "type the characters you see in this image",
        "to discuss automated access to amazon data",
        "api.amazon.com",
        "captcha",
    ]

    for signal in bot_signals:
        if signal in page_text:
            return True

    title_tag = soup.find("title")
    if title_tag:
        title_text = title_tag.get_text().lower()
        if "robot check" in title_text or "captcha" in title_text:
            return True

    return False


def human_delay(min_sec=1.5, max_sec=4.0):
    """Sleep for a random duration to simulate human browsing behaviour."""
    time.sleep(random.uniform(min_sec, max_sec))


def extract_price(*text_values):
    """
    Try each text value one by one and return the first valid price found.
    """
    for text in text_values:
        if text:
            cleaned = re.sub(r'[^\d.]', '', text.strip())
            if cleaned:
                match = re.search(r'\d+\.?\d{0,2}', cleaned)
                if match:
                    return match.group()
    return ''


def extract_description(soup):
    """
    Try a few different CSS selectors to find the product description.
    """
    selectors = [
        "#feature-bullets .a-list-item",
        ".a-expander-content p",
        "#productDescription p",
    ]

    for selector in selectors:
        elements = soup.select(selector)
        if elements:
            lines = []
            for el in elements:
                text = el.get_text(strip=True)
                if text and len(text) > 5:
                    lines.append(text)
            if lines:
                return "\n".join(lines)

    return ""


def scrape_amazon_product(url):
    """
    Visit an Amazon product page and pull out all the info we need.
    Returns a dictionary with product data, or None if something goes wrong.
    """
    if not url:
        return None

    driver = None

    try:
        driver = get_chrome_driver()

        # Pre-navigation delay (simulates human typing/clicking)
        human_delay(0.5, 1.5)

        driver.get(url)

        # Wait for either a real product or a CAPTCHA to appear
        try:
            WebDriverWait(driver, 20).until(
                lambda d: d.find_elements(By.ID, "productTitle") or
                          d.find_elements(By.ID, "captchacharacters") or
                          d.find_elements(By.CSS_SELECTOR, "form[action='/errors/validateCaptcha']")
            )
        except Exception:
            # Neither appeared in time — wait a bit more and try to parse anyway
            human_delay(3, 5)

        # Simulate human reading/thinking time after page load
        human_delay(1.5, 3.0)

        soup = BeautifulSoup(driver.page_source, 'html.parser')

        # --- Bot detection check with one retry ---
        if is_bot_detection_page(soup):
            print(f"  ⚠️  Bot detection triggered. Waiting before retry...")
            human_delay(10, 20)
            driver.refresh()
            human_delay(5, 10)
            soup = BeautifulSoup(driver.page_source, 'html.parser')

            if is_bot_detection_page(soup):
                print("  ❌  Still blocked after retry. Skipping.")
                return None

        # --- Product title (also a sanity check) ---
        title_element = soup.select_one("#productTitle")
        title = title_element.get_text(strip=True) if title_element else ""

        if not title or len(title) < 3:
            print(f"  ⚠️  No product title found — likely blocked or bad URL")
            return None

        # --- Current price ---
        price_element_1 = soup.select_one(".priceToPay .a-price-whole")
        price_element_2 = soup.select_one(".a-price .a-offscreen")
        price_element_3 = soup.select_one("#priceblock_ourprice")
        price_element_4 = soup.select_one(".a-button-selected .a-color-base")

        current_price = extract_price(
            price_element_1.get_text(strip=True) if price_element_1 else '',
            price_element_2.get_text(strip=True) if price_element_2 else '',
            price_element_3.get_text(strip=True) if price_element_3 else '',
            price_element_4.get_text(strip=True) if price_element_4 else '',
        )

        # --- Original price ---
        orig_element_1 = soup.select_one(".a-price.a-text-price .a-offscreen")
        orig_element_2 = soup.select_one("#listPrice")
        orig_element_3 = soup.select_one("#priceblock_dealprice")
        orig_element_4 = soup.select_one(".a-size-base.a-color-price")

        original_price = extract_price(
            orig_element_1.get_text(strip=True) if orig_element_1 else '',
            orig_element_2.get_text(strip=True) if orig_element_2 else '',
            orig_element_3.get_text(strip=True) if orig_element_3 else '',
            orig_element_4.get_text(strip=True) if orig_element_4 else '',
        )

        # --- Availability ---
        availability_element = soup.select_one("#availability span")
        out_of_stock = False
        if availability_element:
            availability_text = availability_element.get_text(strip=True).lower()
            if "currently unavailable" in availability_text:
                out_of_stock = True

        # --- Product image ---
        image_url = ""
        img_element = soup.select_one("#imgBlkFront") or soup.select_one("#landingImage")
        if img_element:
            dynamic_images_json = img_element.get("data-a-dynamic-image", "{}")
            try:
                image_urls = list(json.loads(dynamic_images_json).keys())
                if image_urls:
                    image_url = image_urls[0]
            except json.JSONDecodeError:
                image_url = img_element.get("src", "")

        # --- Currency ---
        currency_element = soup.select_one(".a-price-symbol")
        currency = currency_element.get_text(strip=True)[:1] if currency_element else "₹"

        # --- Discount ---
        discount_rate = 0
        discount_element = soup.select_one(".savingsPercentage")
        if discount_element:
            discount_text = re.sub(r'[-%]', '', discount_element.get_text(strip=True))
            if discount_text.isdigit():
                discount_rate = int(discount_text)

        # --- Description ---
        description = extract_description(soup)

        # --- Stars ---
        stars = 0
        stars_element = soup.select_one("#acrPopover .a-icon-alt")
        if stars_element:
            stars_match = re.search(r'[\d.]+', stars_element.get_text(strip=True))
            if stars_match:
                stars = float(stars_match.group())

        # --- Review count ---
        reviews_count = 0
        reviews_element = soup.select_one("#acrCustomerReviewText")
        if reviews_element:
            reviews_match = re.search(r'[\d,]+', reviews_element.get_text(strip=True))
            if reviews_match:
                reviews_count = int(reviews_match.group().replace(',', ''))

        cp = float(current_price) if current_price else 0
        op = float(original_price) if original_price else 0

        return {
            "url": url,
            "currency": currency or "₹",
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

    except Exception as e:
        print(f"Error scraping product: {e}")
        return None

    finally:
        if driver:
            driver.quit()