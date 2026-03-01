"""
Wafferly Scheduler
Runs the cron job to update all tracked products at regular intervals.

Usage:
    python scheduler.py

This will scrape all products every 6 hours and send email notifications
when prices change.
"""

import time
import requests
import schedule
from datetime import datetime


API_URL = "http://localhost:5000/api"
INTERVAL_HOURS = 6


def run_cron_job():
    """Call the cron endpoint to update all products."""
    print(f"\n{'='*50}")
    print(f" Wafferly Scheduler - Running at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*50}")

    try:
        response = requests.get(f"{API_URL}/cron/update-products", timeout=300)
        data = response.json()

        print(f"Status: {response.status_code}")
        print(f"Result: {data}")

    except Exception as e:
        print(f" Scheduler error: {e}")


if __name__ == "__main__":
    print(f" Wafferly Scheduler Started!")
    print(f" Will update products every {INTERVAL_HOURS} hours")
    print(f" API URL: {API_URL}")
    print(f"{'='*50}")

    # Run once immediately on startup
    run_cron_job()

    # Schedule to run every X hours
    schedule.every(INTERVAL_HOURS).hours.do(run_cron_job)

    print(f"Next run in {INTERVAL_HOURS} hours...\n")

    while True:
        schedule.run_pending()
        time.sleep(60)  # Check every minute