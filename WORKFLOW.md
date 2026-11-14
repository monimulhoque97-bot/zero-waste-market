# 🔄 ZeroWaste Market — Complete Workflow Specifications

This document defines the 5 primary end-to-end operational workflows implemented in ZeroWaste Market.

---

## WORKFLOW A: Seller Registration & Onboarding

```mermaid
flowchart TD
    A["Seller opens Register page"] --> B["Selects 'Seller' role"]
    B --> C["Enters Name, Email, Password, Store Name, Address, Guwahati Locality, FSSAI #"]
    C --> D["POST /api/auth/register"]
    D --> E{"Validation Check"}
    E -- Invalid --> F["Return 400 with specific error message"]
    E -- Valid --> G["Hash password with bcrypt (10 rounds)"]
    G --> H["Insert user record into 'users' table"]
    H --> I["Insert seller profile into 'seller_profiles' table"]
    I --> J["Sign JWT token with user ID and 'seller' role"]
    J --> K["Return 201 Created with JWT and user profile"]
    K --> L["Client saves JWT in localStorage and redirects to Seller Dashboard"]
```

### Edge Cases Handled:
- **Duplicate Email:** Checked against existing records. Returns HTTP 409 Conflict with helpful message.
- **Short Password:** Enforces minimum 6 characters.
- **Missing Business Details:** Requires business name and address before assigning `seller` role.

---

## WORKFLOW B: Add Surplus Product with Gemini AI Listing Assistant

```mermaid
flowchart TD
    A["Seller navigates to Add Product"] --> B["Seller uploads photo or enters rough draft notes"]
    B --> C["Seller clicks 'Run AI Assist'"]
    C --> D["POST /api/ai/analyze-listing (Text + Image Base64)"]
    D --> E{"GEMINI_API_KEY Configured?"}
    E -- Yes --> F["Google Gen AI SDK calls gemini-2.5-flash with structured JSON prompt"]
    E -- No --> G["Intelligent Heuristic Engine extracts keywords & category"]
    F --> H["Validate structured JSON output against schema"]
    G --> H
    H --> I["Return suggested title, category, description, and discount %"]
    I --> J["Seller reviews, modifies, or confirms suggestions"]
    J --> K["Optional: Run AI Quality Check (Score 0 - 100)"]
    K --> L["POST /api/products (Multipart form data)"]
    L --> M["Validate prices: Discount Price < Original Price"]
    M --> N["Save product to MySQL database"]
    N --> O["Surplus appears immediately on Guwahati Marketplace"]
```

### Safety & Compliance Guardrail:
- **Food Safety Isolation:** Gemini AI is programmatically instructed **never** to certify food safety or microbiological soundness. The seller must independently inspect physical condition before publication.

---

## WORKFLOW C: Customer Reservation & Transactional Stock Lock

```mermaid
flowchart TD
    A["Customer browses Guwahati Marketplace"] --> B["Filters by Locality or Category (e.g. Christian Basti / Bakery)"]
    B --> C["Selects product and clicks 'Reserve'"]
    C --> D["Chooses quantity in Reservation Modal"]
    D --> E["POST /api/reservations (product_id, quantity)"]
    E --> F["Backend opens dedicated Database Connection"]
    F --> G["BEGIN TRANSACTION"]
    G --> H["SELECT quantity, status FROM products WHERE id=? FOR UPDATE"]
    H --> I{"Is stock >= quantity AND status == 'available'?"}
    I -- No --> J["ROLLBACK transaction and return 409 Conflict ('Insufficient inventory')"]
    I -- Yes --> K["Generate unique Pickup Code (e.g. ZW-GUW-8A29)"]
    K --> L["INSERT INTO reservations (customer_id, product_id, quantity, pickup_code, 'confirmed')"]
    L --> M["UPDATE products SET quantity = quantity - requested_qty"]
    M --> N["COMMIT TRANSACTION"]
    N --> O["Emit real-time notification to Merchant"]
    O --> P["Customer receives digital Pickup Voucher with Code"]
    P --> Q["Customer visits store counter before deadline, shows code, and pays discounted price"]
    Q --> R["Merchant clicks 'Confirm Handover' in Seller Dashboard"]
    R --> S["Reservation marked 'completed' and recorded in Impact Ticker"]
```

---

## WORKFLOW D: NGO Surplus Food Relief Claim

```mermaid
flowchart TD
    A["Merchant identifies unsold surplus eligible for charity"] --> B["Creates Donation listing with non-expired Best-Before date"]
    B --> C["Backend verifies expiry date > current date"]
    C --> D["Donation published on /donations channel"]
    D --> E["Verified NGO browses available donations in Guwahati"]
    E --> F["NGO clicks 'Claim for Relief'"]
    F --> G{"Is NGO verification_status == 'verified'?"}
    G -- No --> H["Block request (HTTP 403 Forbidden: 'Unverified NGO')"]
    G -- Yes --> I["POST /api/donations/:id/request with pickup notes"]
    I --> J["Donation status transitions to 'requested'"]
    J --> K["Merchant receives notification and coordinates collection window"]
    K --> L["Relief van collects supply; Handover marked 'completed'"]
    L --> M["Meals rescued count updated in NGO & Public Impact Dashboards"]
```

---

## WORKFLOW E: Live Environmental & Financial Impact Tracking

```mermaid
flowchart TD
    A["Customer or Evaluator visits /impact or Homepage"] --> B["GET /api/dashboard/impact"]
    B --> C["Query DB: SUM of units sold and units donated from completed records"]
    C --> D["Calculate Customer Savings: SUM(quantity * (original_price - discounted_price))"]
    D --> E["Calculate Waste Mass: Rescued Units * 0.65 kg (UN FAO standard unit weight)"]
    E --> F["Calculate CO2e Avoided: Waste Mass * 2.5 kg CO2e / kg food diverted"]
    F --> G["Calculate Virtual Water Conserved: Waste Mass * 450 Litres / kg food"]
    G --> H["Return structured JSON payload with documented calculation assumptions"]
    H --> I["Display animated live metrics and comparison metrics"]
```
