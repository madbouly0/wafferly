# ARCHITECTURE

This document describes the high-level architecture of Wafferly.

## Overall Architecture
The application follows a decoupled Client-Server architecture. The frontend is a Next.js single-page/server-rendered application that consumes RESTful APIs provided by the Python Flask backend.

## Frontend
- **Design Pattern:** Next.js App Router (`app/`).
- **State Management:** Handled primarily via React component state and potentially Server Components for initial data fetching.
- **Routing:** File-based routing (`app/dashboard`, `app/products`, `app/auth`).

## Backend
- **Design Pattern:** MVC-like structure without the views. 
- **Layers:**
  - **Routes/Controllers:** Located in `app/routes/` (`auth.py`, `products.py`, `cron.py`). They handle incoming HTTP requests and format JSON responses.
  - **Models:** Built with SQLAlchemy in `app/models/` (`product.py`). Map to SQL Server tables.
  - **Services/Scraping:** Dedicated logic for scraping products (`app/scraper/`) and background scraping services (`app/services/`).

## Data Flow
1. User requests to track an Amazon product via the frontend.
2. Frontend sends an API request to the backend `routes`.
3. Backend fetches the current price using `scraper`.
4. The product data is persisted to SQL Server via SQLAlchemy `models`.
5. Background schedulers (`APScheduler`) periodically run scraping jobs to check for price drops and trigger notifications via `Flask-Mail`.
