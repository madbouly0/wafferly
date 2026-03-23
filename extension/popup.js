/**
 * Wafferly Browser Extension — popup.js
 *
 * Handles:
 *  1. Login / logout flow (stores Bearer token in chrome.storage.local)
 *  2. Detecting if the active tab is an Amazon product page
 *  3. Sending track request to the Wafferly backend
 */

const API_BASE = 'http://localhost:5000/api';

// ── DOM refs ──────────────────────────────────────────────────────────────
const viewLogin    = document.getElementById('view-login');
const viewLoggedIn = document.getElementById('view-loggedin');

const loginForm    = document.getElementById('login-form');
const emailInput   = document.getElementById('email');
const passwordInput= document.getElementById('password');
const loginBtn     = document.getElementById('login-btn');
const loginBtnLbl  = document.getElementById('login-btn-label');
const loginMsg     = document.getElementById('login-message');

const userAvatar   = document.getElementById('user-avatar');
const userEmailEl  = document.getElementById('user-email-display');
const trackBtn     = document.getElementById('track-btn');
const trackBtnLbl  = document.getElementById('track-btn-label');
const trackMsg     = document.getElementById('track-message');
const notAmazonMsg = document.getElementById('not-amazon-hint');
const logoutBtn    = document.getElementById('logout-btn');

// ── Helpers ───────────────────────────────────────────────────────────────
function showMessage(el, text, type) {
  el.textContent = text;
  el.className = `message ${type}`;
  el.style.display = 'block';
}

function hideMessage(el) {
  el.style.display = 'none';
}

function setLoading(btn, lbl, loading, label = 'Loading…') {
  if (loading) {
    btn.disabled = true;
    lbl.innerHTML = `<span class="spinner"></span> ${label}`;
  } else {
    btn.disabled = false;
  }
}

function isAmazonProductPage(url) {
  if (!url) return false;
  // Must be an Amazon domain and contain /dp/ or /gp/product/ to be a product page
  return /amazon\.(com|in|co\.uk|de|fr|ca|com\.au|sa|ae)(\/.*)?\/dp\/|\/gp\/product\//.test(url);
}

// ── Auth state ────────────────────────────────────────────────────────────
async function getStoredSession() {
  return new Promise(resolve => {
    chrome.storage.local.get(['session_token', 'user_email'], resolve);
  });
}

async function saveSession(token, email) {
  return new Promise(resolve => {
    chrome.storage.local.set({ session_token: token, user_email: email }, resolve);
  });
}

async function clearSession() {
  return new Promise(resolve => {
    chrome.storage.local.remove(['session_token', 'user_email'], resolve);
  });
}

// ── Active tab URL ────────────────────────────────────────────────────────
async function getActiveTabUrl() {
  return new Promise(resolve => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      resolve(tabs[0]?.url || null);
    });
  });
}

// ── UI: show logged-in view ───────────────────────────────────────────────
async function showLoggedIn(email) {
  viewLogin.style.display = 'none';
  viewLoggedIn.style.display = 'block';

  userEmailEl.textContent = email;
  userAvatar.textContent = email.charAt(0).toUpperCase();

  const url = await getActiveTabUrl();
  if (isAmazonProductPage(url)) {
    trackBtn.style.display = 'flex';
    notAmazonMsg.style.display = 'none';
    trackBtn.dataset.url = url;
    trackBtnLbl.textContent = 'Track This Product';
  } else {
    trackBtn.style.display = 'none';
    notAmazonMsg.style.display = 'block';
  }
}

// ── UI: show login view ───────────────────────────────────────────────────
function showLogin() {
  viewLogin.style.display = 'block';
  viewLoggedIn.style.display = 'none';
  hideMessage(loginMsg);
}

// ── Init ──────────────────────────────────────────────────────────────────
async function init() {
  const { session_token, user_email } = await getStoredSession();
  if (session_token && user_email) {
    showLoggedIn(user_email);
  } else {
    showLogin();
  }
}

// ── Login ─────────────────────────────────────────────────────────────────
loginForm.addEventListener('submit', async e => {
  e.preventDefault();
  hideMessage(loginMsg);
  setLoading(loginBtn, loginBtnLbl, true, 'Signing in…');

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: emailInput.value.trim(),
        password: passwordInput.value
      })
    });

    const data = await res.json();

    if (!res.ok) {
      showMessage(loginMsg, data.error || 'Login failed.', 'error');
      loginBtnLbl.textContent = 'Sign In';
      loginBtn.disabled = false;
      return;
    }

    await saveSession(data.session_token, data.email);
    showLoggedIn(data.email);

  } catch (err) {
    showMessage(loginMsg, 'Cannot connect to Wafferly. Make sure the backend is running.', 'error');
    loginBtnLbl.textContent = 'Sign In';
    loginBtn.disabled = false;
  }
});

// ── Logout ────────────────────────────────────────────────────────────────
logoutBtn.addEventListener('click', async () => {
  const { session_token } = await getStoredSession();
  if (session_token) {
    // Best-effort server-side logout
    fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${session_token}` }
    }).catch(() => {});
  }
  await clearSession();
  showLogin();
});

// ── Track ─────────────────────────────────────────────────────────────────
trackBtn.addEventListener('click', async () => {
  const url = trackBtn.dataset.url;
  if (!url) return;

  hideMessage(trackMsg);
  setLoading(trackBtn, trackBtnLbl, true, 'Tracking…');

  try {
    const { session_token } = await getStoredSession();
    const res = await fetch(`${API_BASE}/products/scrape`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session_token}`
      },
      // scrape endpoint requires a URL; also auto-subscribe the user
      body: JSON.stringify({ url })
    });

    const data = await res.json();

    if (!res.ok) {
      showMessage(trackMsg, data.error || 'Tracking failed.', 'error');
    } else {
      showMessage(trackMsg, '✓ Product is now being tracked!', 'success');

      // Also auto-subscribe the logged-in user to the product
      const { user_email } = await getStoredSession();
      const productId = data.data?.id;
      if (productId && user_email) {
        fetch(`${API_BASE}/products/${productId}/subscribe`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session_token}`
          },
          body: JSON.stringify({ email: user_email })
        }).catch(() => {});
      }

      // Inject success toast on the Amazon page too
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        const tabId = tabs[0]?.id;
        if (tabId) {
          chrome.scripting.executeScript({
            target: { tabId },
            func: () => {
              if (window.__wafferly_showToast) {
                window.__wafferly_showToast('success', 'Added to Wafferly!', 'This product is now being tracked.');
              }
            }
          }).catch(() => {});
        }
      });
    }
  } catch (err) {
    showMessage(trackMsg, 'Cannot connect to Wafferly. Make sure the backend is running.', 'error');
  } finally {
    trackBtnLbl.textContent = 'Track This Product';
    trackBtn.disabled = false;
  }
});

// ── Boot ──────────────────────────────────────────────────────────────────
init();
