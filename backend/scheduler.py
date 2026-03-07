"""
Wafferly Scheduler

This script runs in the background and calls the cron endpoint
every 6 hours to keep all product prices up to date.

Usage:
    python scheduler.py
"""

import time
import requests
import schedule
from datetime import datetime


# The base URL of our Flask API
API_URL = "http://localhost:5000/api"

# How often to update products (in hours)
INTERVAL_HOURS = 24


def run_cron_job():
    # Call the cron endpoint to update all products
    print(f"\n{'='*50}")
    print(f" Wafferly Scheduler - Running at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*50}")

    try:
        response = requests.get(f"{API_URL}/cron/update-products", timeout=300)
        result = response.json()

        print(f"Status: {response.status_code}")
        print(f"Result: {result}")

    except Exception as e:
        print(f" Scheduler error: {e}")


if __name__ == "__main__":
    print(f" Wafferly Scheduler Started!")
    print(f" Will update products every {INTERVAL_HOURS} hours")
    print(f" API URL: {API_URL}")
    print(f"{'='*50}")

    # Run once right away when we start
    run_cron_job()

    # Then schedule it to run again every X hours
    schedule.every(INTERVAL_HOURS).hours.do(run_cron_job)

    print(f"Next run in {INTERVAL_HOURS} hours...\n")

    # Keep the script running forever, checking every minute if a job is due
    while True:
        schedule.run_pending()
        time.sleep(60)