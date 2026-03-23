# PITFALLS RESEARCH
## Common Mistakes
1. **Extension Authentication**: Getting the extension to share auth state with the main web app securely. *Prevention: Use HttpOnly cookies if on the same domain, or a specific API key / JWT flow for the extension.*
2. **Amazon DOM Changes**: Amazon frequently changes their DOM structure, breaking content script selectors. *Prevention: Use robust, multiple fallbacks for selectors (ASIN is usually in the canonical URL or specific hidden inputs).*
3. **Cross-Origin Resource Sharing (CORS)**: The extension background script will make requests from the browser to the Flask API. *Prevention: Configure Flask-CORS to accept requests from the extension's origin (chrome-extension://...)*.
