#  Wafferly — Amazon Price Tracker

Track Amazon product prices and get email alerts when prices drop!

## Features

- 🔍 **Search & Track** — Paste any Amazon product link to start tracking
- 📊 **Price History** — See price changes over time with interactive charts
- 📧 **Email Alerts** — Get notified when prices drop
- ⏰ **Auto Updates** — Products are re-scraped every 6 hours
- 💰 **Price Stats** — View current, average, highest, and lowest prices

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React, TypeScript, Tailwind CSS v4 |
| Backend | Flask, SQLAlchemy, Python |
| Database | SQL Server Express |
| Scraping | Selenium, BeautifulSoup |
| Charts | Recharts |
| Email | Gmail SMTP |

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- SQL Server Express
- Chrome browser (for Selenium)

### Installation

1. Clone the repo
```bash
git clone https://github.com/madbouly0/wafferly.git
cd wafferly
```

2. Set up Python virtual environment
```bash
python -m venv .venv
.venv\Scripts\Activate
pip install -r requirements.txt
```

3. Set up frontend
```bash
cd frontend
npm install
```

4. Create `.env` file in root directory
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

5. Create the database in SSMS
```sql
CREATE DATABASE wafferly;
```

### Running the App

Terminal 1 — Backend:
```bash
cd backend
python run.py
```

Terminal 2 — Frontend:
```bash
cd frontend
npm run dev
```

Terminal 3 — Scheduler (optional):
```bash
cd backend
python scheduler.py
```

Visit **http://localhost:3000** 

## Screenshots

Coming soon!

## License

MIT