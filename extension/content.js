/**
 * Wafferly Browser Extension — content.js
 *
 * Runs on Amazon product pages.
 * - Injects a "Track on Wafferly" button into the buy-box area.
 * - Exposes window.__wafferly_showToast() so popup.js can trigger toasts.
 */

const API_BASE = 'http://localhost:5000/api';

// ── Toast ──────────────────────────────────────────────────────────────────
function showToast(type, title, msg) {
    // Remove any existing toast
    const existing = document.getElementById('wafferly-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'wafferly-toast';
    toast.className = type; // 'success' or 'error'

    toast.innerHTML = `
    <span class="wfy-toast-icon">${type === 'success' ? '✓' : '✕'}</span>
    <div class="wfy-toast-text">
      <div class="wfy-toast-title">${title}</div>
      ${msg ? `<div class="wfy-toast-msg">${msg}</div>` : ''}
    </div>
  `;

    document.body.appendChild(toast);

    // Auto-dismiss after 4 seconds
    setTimeout(() => {
        toast.classList.add('hiding');
        setTimeout(() => toast.remove(), 350);
    }, 4000);
}

// Expose globally so popup.js can call it via chrome.scripting.executeScript
window.__wafferly_showToast = showToast;

// ── Detect product page ────────────────────────────────────────────────────
function isProductPage() {
    return /\/dp\/|\/gp\/product\//.test(window.location.pathname);
}

// ── Find the best injection point in Amazon's buy-box ─────────────────────
function findBuyBox() {
    // Try the most common buy-box containers in order of preference
    const selectors = [
        '#buyNow',             // Buy Now button
        '#add-to-cart-button', // Add to Cart button
        '#submit.button',
        '#primaryButtonStack',
        '#desktop-ptc-button-stack',
        '#averageCustomerReviews',
        '#productTitle',
    ];

    for (const sel of selectors) {
        const el = document.querySelector(sel);
        if (el) return el;
    }
    return null;
}

// ── Create the Track button ────────────────────────────────────────────────
function createTrackButton() {
    const btn = document.createElement('button');
    btn.id = 'wafferly-track-btn';
    btn.innerHTML = `
    <svg class="wfy-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
    Track on Wafferly
  `;
    return btn;
}

// ── Track click handler ────────────────────────────────────────────────────
async function handleTrack(btn) {
    const url = window.location.href;

    // Get stored token from extension storage
    const session = await new Promise(resolve => {
        chrome.storage.local.get(['session_token', 'user_email'], resolve);
    });

    if (!session.session_token) {
        showToast('error', 'Not signed in', 'Open the Wafferly extension and log in first.');
        return;
    }

    // Show loading state
    btn.disabled = true;
    const originalHTML = btn.innerHTML;
    btn.innerHTML = `<span class="wfy-spinner"></span> Tracking…`;

    try {
        // Step 1: Scrape and save the product
        const scrapeRes = await fetch(`${API_BASE}/products/scrape`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.session_token}`
            },
            body: JSON.stringify({ url })
        });

        const scrapeData = await scrapeRes.json();

        if (!scrapeRes.ok) {
            showToast('error', 'Tracking failed', scrapeData.error || 'Could not scrape this product.');
            btn.innerHTML = originalHTML;
            btn.disabled = false;
            return;
        }

        const productId = scrapeData.data?.id;

        // Step 2: Auto-subscribe the logged-in user
        if (productId && session.user_email) {
            await fetch(`${API_BASE}/products/${productId}/subscribe`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.session_token}`
                },
                body: JSON.stringify({ email: session.user_email })
            });
        }

        showToast('success', 'Added to Wafferly!', 'We\'ll notify you when the price drops.');
        btn.innerHTML = `
      <svg class="wfy-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
      Tracking!
    `;
        btn.style.background = '#198754';
        // Don't re-enable — it's already tracked

    } catch (err) {
        showToast('error', 'Connection error', 'Make sure the Wafferly backend is running.');
        btn.innerHTML = originalHTML;
        btn.disabled = false;
    }
}

// ── Inject the button ──────────────────────────────────────────────────────
function inject() {
    // Don't inject twice
    if (document.getElementById('wafferly-track-btn')) return;
    if (!isProductPage()) return;

    const anchor = findBuyBox();
    if (!anchor) return;

    const btn = createTrackButton();
    btn.addEventListener('click', () => handleTrack(btn));

    // Insert after the anchor element
    anchor.parentNode.insertBefore(btn, anchor.nextSibling);
}

// ── Run on page load and SPA navigations ───────────────────────────────────
inject();

// Amazon is a SPA — re-inject after navigations (e.g., variant changes)
const observer = new MutationObserver(() => {
    if (isProductPage() && !document.getElementById('wafferly-track-btn')) {
        inject();
    }
});

observer.observe(document.body, { childList: true, subtree: true });
