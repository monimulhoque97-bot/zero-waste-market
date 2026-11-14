# 📖 ZeroWaste Market — REST API Documentation

Base URL: `http://localhost:5001/api`

All authenticated endpoints require an HTTP header:
```http
Authorization: Bearer <your_jwt_token>
```

---

## 1. Authentication Endpoints

### `POST /auth/register`
Creates a new customer, seller, or NGO account.

* **Access:** Public
* **Request Body:**
```json
{
  "name": "Priyanka Sarma",
  "email": "seller@zerowaste.in",
  "password": "Password123!",
  "role": "seller",
  "phone": "+91 98640 12345",
  "business_name": "Brahmaputra Bakers & Cafe",
  "business_address": "Shop 14, Central Mall Arcade, GS Road",
  "locality": "Christian Basti",
  "business_type": "Bakery",
  "fssai_license": "10321999000123"
}
```
* **Response (201 Created):**
```json
{
  "success": true,
  "message": "Registration successful! Welcome to ZeroWaste Market.",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "Priyanka Sarma",
      "email": "seller@zerowaste.in",
      "role": "seller",
      "business_name": "Brahmaputra Bakers & Cafe",
      "locality": "Christian Basti"
    }
  }
}
```

---

### `POST /auth/login`
Authenticates user credentials and returns JWT.

* **Access:** Public
* **Request Body:**
```json
{
  "email": "customer@zerowaste.in",
  "password": "Password123!"
}
```
* **Response (200 OK):**
```json
{
  "success": true,
  "message": "Welcome back, Rahul Goswami!",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 2,
      "name": "Rahul Goswami",
      "email": "customer@zerowaste.in",
      "role": "customer"
    }
  }
}
```

---

### `GET /auth/me`
Retrieves currently logged-in user profile.

* **Access:** Authenticated (Any role)
* **Response (200 OK):** User profile object.

---

## 2. Products Endpoints

### `GET /products`
Browse available surplus products with search and filtering.

* **Access:** Public
* **Query Parameters:**
  - `category` (string, optional: `Bakery`, `Produce & Fruits`, etc.)
  - `locality` (string, optional: `Christian Basti`, `Uzan Bazar`, etc.)
  - `search` (string, optional: searches name and description)
  - `maxPrice` (number, optional)
  - `minDiscount` (number, optional: e.g. `30` for 30%+ off)
* **Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Artisan Sourdough Loaves (Pack of 2)",
      "category": "Bakery",
      "original_price": 240,
      "discounted_price": 99,
      "quantity": 8,
      "discount_percentage": 59,
      "business_name": "Brahmaputra Bakers & Cafe",
      "locality": "Christian Basti",
      "status": "available"
    }
  ]
}
```

---

### `GET /products/:id`
Fetch single surplus product profile with merchant details.

* **Access:** Public

---

### `POST /products`
Publish a new surplus product listing.

* **Access:** Seller only (`role: 'seller'`)
* **Content-Type:** `multipart/form-data` or `application/json`
* **Request Body:**
```json
{
  "name": "Guwahati Evening Tea Cakes (Pack of 6)",
  "category": "Bakery",
  "description": "Freshly baked buttery tea cakes made with Assam cardamom and honey.",
  "original_price": 240,
  "discounted_price": 99,
  "quantity": 5,
  "unit": "pack",
  "pickup_location": "Brahmaputra Bakers, GS Road, Christian Basti, Guwahati",
  "pickup_end": "2026-11-14T21:00:00Z",
  "expiry_date": "2026-11-15",
  "safety_notes": "Store in airtight container. Best enjoyed within 48 hours."
}
```
* **Response (201 Created):** Full created product record with unique ID.

---

### `DELETE /products/:id`
Deletes an active surplus product listing.

* **Access:** Seller only (Must own the product)

---

## 3. Reservations Endpoints

### `POST /reservations`
Reserve a surplus item with database transactional lock.

* **Access:** Customer only (`role: 'customer'`)
* **Request Body:**
```json
{
  "product_id": 1,
  "quantity": 2,
  "notes": "Arriving around 6:30 PM"
}
```
* **Response (201 Created):**
```json
{
  "success": true,
  "message": "Reservation confirmed! Show pickup code ZW-GUW-8A29 at collection counter.",
  "data": {
    "id": 15,
    "pickup_code": "ZW-GUW-8A29",
    "quantity": 2,
    "unit_price": 99,
    "total_price": 198,
    "status": "confirmed"
  }
}
```

---

### `GET /reservations/my-reservations`
Retrieves reservation vouchers for the logged-in customer.

* **Access:** Customer only

---

### `GET /reservations/seller`
Retrieves incoming customer orders for the seller's store.

* **Access:** Seller only

---

### `PATCH /reservations/:id/cancel`
Cancels reservation and automatically restores product inventory.

* **Access:** Customer only (Must own the reservation)

---

### `PATCH /reservations/:id/status`
Merchant updates reservation status (e.g. marks `completed` upon in-person handover).

* **Access:** Seller only (Must own the product)
* **Request Body:** `{ "status": "completed" }`

---

## 4. Donations Endpoints (NGO Channel)

### `GET /donations`
Browse eligible surplus food donations.

* **Access:** Public / NGO

---

### `POST /donations`
Merchant lists eligible surplus for registered non-profits.

* **Access:** Seller only
* **Validation:** Expired food is strictly blocked by backend validator.

---

### `POST /donations/:id/request`
Verified NGO claims a donation for community hunger relief.

* **Access:** NGO only (Must have `verification_status: 'verified'`)
* **Request Body:**
```json
{
  "notes": "Relief van collecting at 4:30 PM for community kitchen."
}
```

---

## 5. Artificial Intelligence Endpoints

### `POST /ai/analyze-listing`
Analyzes rough seller notes and optional photograph via Google Gemini AI (or heuristic fallback).

* **Access:** Seller only
* **Request Body:**
```json
{
  "description": "5 boxes of butter croissants from afternoon batch",
  "original_price": 250,
  "category": "Bakery"
}
```
* **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "is_demo_mode": false,
    "ai_engine": "Google Gemini AI (gemini-2.5-flash)",
    "suggested_name": "Fresh French Butter Croissants (Box of 4)",
    "category": "Bakery",
    "description": "Flaky golden butter croissants freshly baked this afternoon. Perfect for evening tea.",
    "suggested_discount_percent": 45,
    "suggested_discounted_price": 138,
    "missing_information": ["Confirm packaging count", "Confirm pickup cutoff"],
    "safety_notes": [
      "Seller must independently confirm product storage conditions.",
      "AI does NOT certify food safety or microbiological suitability."
    ]
  }
}
```

---

### `POST /ai/check-listing`
AI Listing Quality Checker analyzing pre-flight listing completeness and safety disclosures.

* **Access:** Seller only

---

## 6. Dashboards & Impact Endpoints

### `GET /dashboard/impact`
Public environmental and financial impact calculation across Guwahati.

* **Access:** Public
* **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "overview": {
      "total_products_listed": 18,
      "total_rescued_units": 45,
      "units_sold": 25,
      "units_donated": 20,
      "completed_reservations": 14,
      "total_customer_savings_inr": 743,
      "total_marketplace_volume_inr": 1150
    },
    "environmental": {
      "estimated_waste_avoided_kg": 29.3,
      "estimated_co2_prevented_kg": 73.3,
      "estimated_water_saved_litres": 13185
    },
    "methodology": {
      "assumptions": [
        "Average weight per surplus unit: 0.65 kg",
        "Emissions factor: 2.5 kg CO2e per kg food waste diverted (UN FAO)",
        "Water factor: 450 L per kg food consumed"
      ],
      "location": "Guwahati, Assam, India"
    }
  }
}
```
