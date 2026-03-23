# STRUCTURE

This document details the directory layout of the Wafferly project.

## Root Level
- `frontend/`: The Next.js application.
- `backend/`: The Python Flask application.
- `.planning/`: GSD workflow planning artifacts.

## Frontend Directory (`frontend/`)
- `app/`: Next.js app router pages, layouts, and global CSS.
  - `auth/`: Authentication related pages.
  - `dashboard/`: User dashboard displaying tracked products.
  - `products/`: Product details pages.
- `components/`: Reusable React components (UI components, modals, form inputs).
- `public/`: Static assets like images and icons.
- `package.json` / `tsconfig.json`: Frontend configuration.

## Backend Directory (`backend/`)
- `app/`: Main Flask application module.
  - `models/`: SQLAlchemy ORM models (e.g., `product.py`).
  - `routes/`: API endpoint definitions (e.g., `auth.py`, `products.py`, `cron.py`).
  - `scraper/`: Modules responsible for extracting data from external sites (Amazon).
  - `services/`: Business logic and utility services.
- `config.py`: Environment configuration and database connection string logic.
- `run.py`: The entry point for starting the Flask development server.
- `scheduler.py`: Logic for scheduling background price scraping checks.
- `requirements.txt`: Python package dependencies.
