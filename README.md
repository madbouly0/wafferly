# 📦 Wafferly

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> *Track Amazon product prices and get email alerts when prices drop!*

## 🌟 Highlights

- **Search & Track** — Paste any Amazon product link to start tracking instantly
- **Price History** — See price changes over time with interactive charts
- **Email Alerts** — Get notified directly when prices drop to your target
- **Auto Updates** — Products are re-scraped periodically so data is always fresh
- **Price Stats** — View current, average, highest, and lowest prices at a glance

## ℹ️ Overview

Wafferly is an Amazon price tracker designed to help you save money on the products you love. It provides a sleek web interface for tracking price changes, visualizes historical price data through intuitive charts, and automatically sends you email alerts when target prices are met. 

The application is built with a robust backend using Flask and Python to handle scraping (via Selenium) and data management, coupled with a modern React/Next.js frontend using Tailwind CSS for a seamless user experience.

### ✍️ Authors

- [madbouly0](https://github.com/madbouly0) - Creator and Maintainer

## 🚀 Usage

Using Wafferly is simple. Once the application is running, open the dashboard:

1. Paste an Amazon product URL into the search bar.
2. The product will be tracked, and its historical prices will be visualized using Recharts.
3. Configure your account to receive email alerts when the price drops!

*(Screenshots coming soon!)*

## ⬇️ Installation

Here is how you can set up Wafferly on your local machine.

### Prerequisites

- Python 3.11+
- Node.js 18+
- SQL Server Express
- Chrome browser (for Selenium)

### Steps

1. **Clone the repo**
```bash
git clone https://github.com/madbouly0/wafferly.git
cd wafferly
```

2. **Set up Python backend**
```bash
python -m venv .venv
.venv\Scripts\Activate
pip install -r requirements.txt
```

3. **Set up frontend**
```bash
cd frontend
npm install
```

4. **Environment Configuration**
Create a `.env` file in the root directory:
```env
FLASK_ENV=development
FLASK_PORT=5000
DB_SERVER=localhost\SQLEXPRESS
DB_NAME=wafferly
DB_DRIVER=ODBC Driver 17 for SQL Server
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

5. **Database Setup**
Create the database in SSMS:
```sql
CREATE DATABASE wafferly;
```

### Running the App

You'll need a few terminals to run the full stack:

**Terminal 1 — Backend:**
```bash
cd backend
python run.py
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

**Terminal 3 — Scheduler (optional):**
```bash
cd backend
python scheduler.py
```

Now visit [http://localhost:3000](http://localhost:3000) to see Wafferly in action!

## 💻 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, TypeScript, Tailwind CSS v4 |
| Backend | Flask, SQLAlchemy, Python |
| Database | SQL Server Express |
| Scraping | Selenium, BeautifulSoup |
| Charts | Recharts |
| Email | Gmail SMTP |

## 💭 Feedback and Contributing

If you encounter any issues or have feature requests, please open an issue in this repository. 

Contributions, pull requests, and feedback are always welcome!