# ARCHITECTURE RESEARCH
## Extension Architecture
- **Background Worker**: Handles authenticating with the Wafferly Flask API using the user's existing session/token.
- **Content Script**: Injected into amazon.com domains to scrape the ASIN/URL and inject the 'Track with Wafferly' UI button near the buy box.
- **Popup UI**: A small React app showing current tracking status or allowing the user to select which collection to save the product to.

## Web Architecture
- **Database**: 
  - User (1-to-Many) Collection
  - Collection (1-to-Many) Product (or Many-to-Many if products span multiple collections).
- **API**: New endpoints /api/collections and /api/extension/track.
