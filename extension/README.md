# Wafferly Browser Extension

Track Amazon prices on Wafferly with one click.

## Loading the Extension (Chrome / Edge)

1. Open **Chrome** and navigate to `chrome://extensions`
2. Enable **Developer mode** (toggle in the top-right)
3. Click **"Load unpacked"**
4. Select this folder: `d:\projects\wafferly\extension`

The Wafferly icon will appear in your browser toolbar.

## How to Use

1. Click the **Wafferly icon** in the toolbar
2. Sign in with your Wafferly email and password
3. Navigate to **any Amazon product page**
4. Click **"Track This Product"** in the popup — or click the green **"Track on Wafferly"** button injected into the Amazon page itself
5. A toast notification will confirm the product is being tracked
6. View it on your dashboard at `http://localhost:3000/dashboard`

## Prerequisites

- The Wafferly **backend** must be running on `http://localhost:5000`
  ```bash
  cd backend
  python run.py
  ```
- The Wafferly **frontend** must be running on `http://localhost:3000`
  ```bash
  cd frontend
  npm run dev
  ```

## Files

| File | Purpose |
|------|---------|
| `manifest.json` | Extension configuration (Manifest V3) |
| `popup.html/js/css` | Popup UI (login + track button) |
| `content.js/css` | Injected into Amazon pages |
| `icons/` | Extension icons |
