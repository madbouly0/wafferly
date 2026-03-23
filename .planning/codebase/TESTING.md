# TESTING

This document describes the testing approach within the Wafferly project.

## Current State
At present, there is no standardized testing framework explicitly configured in `package.json` for the frontend (no Jest or Vitest dependencies detected) or in `requirements.txt` for the backend (no PyTest or unittest setup detected).

## Recommendations
To establish a robust development workflow:
- **Frontend:** Introduce Vitest or Jest along with React Testing Library. Setup basic rendering tests and mock API calls (Axios mock adapters). Setup Cypress or Playwright for end-to-end user flows.
- **Backend:** Setup `pytest` for testing Flask API routes and mocking BeautifulSoup and Selenium interactions. Introduce database transaction fixtures for SQLAlchemy to ensure database state isolation between tests.
