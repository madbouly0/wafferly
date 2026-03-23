# CONCERNS

This document outlines technical debt, potential issues, and fragility in Wafferly's implementation.

## Security & Privacy
- **Passwordless authentication:** While user-friendly, depends entirely on email security.
- **Database Connection Strings:** Ensure that `DB_USERNAME` and `DB_PASSWORD` are not hardcoded or leaked into the client side if rendering anything server side. Use `trusted_connection` strictly on internal networks.

## Scalability & Performance
- **Web Scraping Overhead:** The use of `selenium` paired with `webdriver-manager` per-request or in background jobs is extremely resource heavy. It will scale poorly if thousands of products are tracked. Should consider asynchronous frameworks like Scrapy, API integration (Keepa API / Amazon Product Advertising API), or a pool of persistent headless browsers.
- **Anti-Bot Defenses:** Amazon aggressively monitors for and blocks scrapers. The architecture relies on BeautifulSoup/Selenium, which may trigger Captchas or outright IP bans frequently.

## Tech Debt
- **Missing Test Suites:** The lack of automated tests poses a risk for regressions, especially given the dual nature of the application (Frontend + Scraper Backend).
- **Sync/Async Disconnect:** Using synchronous Flask views alongside synchronous Selenium may block server threads, slowing down concurrent requests. Consider adopting an asynchronous worker model (like Celery + Redis).
