# Requirements

## REQ-1: Browser Extension - One-Click Add
- **Description**: A browser extension (Chrome, Edge, Firefox) that allows users to add a product to Wafferly securely with one click directly from an Amazon product page.
- **Value**: Massively reduces friction (copy/pasting URLs) to track items. 
- **Complexity**: High (Involves extension auth + content script bridging with backend API).
- **Acceptance Criteria**:
  - [ ] Extension can parse the ASIN or URL correctly from Amazon product pages.
  - [ ] Clicking the "Track" button sends an authenticated request to the Wafferly backend.
  - [ ] The backend successfully registers the product and begins tracking it.

## REQ-2: Browser Extension - UI Feedback
- **Description**: Visual feedback injected into the DOM when adding a product tracking request.
- **Value**: Users must know if their action succeeded or failed.
- **Complexity**: Low
- **Acceptance Criteria**:
  - [ ] A success toast/notification appears if the product is tracked successfully.
  - [ ] An error toast appears if tracking fails (e.g. invalid URL, backend error).

## REQ-3: Collections - CRUD
- **Description**: The ability to Create, Read, Update, and Delete custom logical "Collections" or Wishlists inside the Wafferly dashboard.
- **Value**: Helps users safely group and organize a large number of tracked products.
- **Complexity**: Medium
- **Acceptance Criteria**:
  - [ ] User can create a new collection with a custom name.
  - [ ] User can rename or delete an existing collection.
  - [ ] User can view a dedicated dashboard view showing only products inside a specific collection.

## REQ-4: Collections - Item Management
- **Description**: The ability to move tracked products in and out of collections.
- **Value**: Empowers users to re-organize past and current items dynamically.
- **Complexity**: Medium
- **Acceptance Criteria**:
  - [ ] When viewing the general dashboard, users can assign a product to a specific collection via a dropdown or modal.
  - [ ] Users can remove a product from a collection.
  - [ ] A single product can belong to a collection (or multiple, depending on design).

---

## Out of Scope
- **Inline Price History Chart (Extension)** — Deferred to keep scope focused on table stakes.
- **Shareable Collection Links (Dashboard)** — Deferred to keep scope focused on table stakes.

---

## Traceability

- REQ-1 -> Phase 2 (Browser Extension)
- REQ-2 -> Phase 2 (Browser Extension)
- REQ-3 -> Phase 1 (Dashboard Collections)
- REQ-4 -> Phase 1 (Dashboard Collections)
