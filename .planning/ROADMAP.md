# Roadmap

**2 phases** | **4 requirements mapped** | All v1 requirements covered ✓

| # | Phase | Goal | Requirements | Success Criteria |
|---|-------|------|--------------|------------------|
| 1 | Dashboard Collections | Implement logical grouping and management of tracked products in the dashboard | REQ-3, REQ-4 | 3 |
| 2 | Browser Extension | Build a browser extension to add Amazon products to Wafferly with one click | REQ-1, REQ-2 | 2 |

---

## Phase Details

### Phase 1: Dashboard Collections
**Goal:** Implement logical grouping and management of tracked products in the dashboard
**Requirements:** REQ-3, REQ-4
**Success criteria:**
1. User can create, rename, and delete custom Collections from the dashboard.
2. User can assign a tracked product to one or more Collections.
3. User can view a dashboard filtered specifically to a single Collection.

### Phase 2: Browser Extension
**Goal:** Build a browser extension to add Amazon products to Wafferly with one click
**Requirements:** REQ-1, REQ-2
**Success criteria:**
1. Extension successfully parses Amazon product URLs/ASINs and sends an authenticated POST request to the Wafferly API.
2. Extension displays an inline success or error toast upon API response.
