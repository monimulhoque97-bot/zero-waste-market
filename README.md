# 🌿 ZeroWaste Market — Guwahati, Assam

> **"Save Products. Save Money. Save the Planet."**  
> An AI-powered surplus product marketplace connecting local businesses, conscious shoppers, and verified hunger relief NGOs in Guwahati, Assam, India.

---

## 🌟 Hackathon Project Overview

In urban centres like Guwahati (from Christian Basti and GS Road to Uzan Bazar and Paltan Bazar), bakeries, restaurants, fruit marts, and grocery stores routinely generate high-quality unsold surplus. Often, this edible surplus is discarded into landfills at closing time, releasing potent methane emissions.

At the same time:
1. **Shoppers** are looking for affordable, high-quality groceries and fresh meals.
2. **NGOs and Community Kitchens** urgently need consistent, safe surplus food supplies to serve vulnerable communities.
3. **Local Merchants** lack a fast, automated digital workflow to clear surplus inventory responsibly.

**ZeroWaste Market** provides an integrated full-stack solution:
- **Merchants** list surplus inventory in 60 seconds using Google Gemini AI.
- **Shoppers** reserve items at **40% – 70% off** with reserve-now, pay-at-counter vouchers (zero online transaction friction).
- **Verified NGOs** claim eligible surplus food donations free of charge for community distribution.
- **ACID Database Transactions** guarantee inventory safety and prevent overselling.
- **Live Environmental Impact Tracker** accurately computes landfill diversion mass, CO₂ equivalent emissions prevented, and household savings using UN FAO standard factors.

---

## 🏗️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, React Router v6, Lucide React Icons |
| **Backend** | Node.js (v24), Express.js, REST API, JWT Authentication, bcryptjs, Multer |
| **Database** | MySQL 8.0+ / `mysql2/promise` with auto-resilient local relational engine (`sqlite3`) |
| **Artificial Intelligence** | Google Gemini API via official `@google/genai` SDK + intelligent heuristic fallback |
| **DevOps & Testing** | Comprehensive automated in-memory test runner (10/10 tests passed), Git |

---

## ⚡ Quick Demo Accounts (Ready Out-of-the-Box)

The frontend features a **1-Click Demo Account Switcher** at the top of every screen:

| Role | Account Email | Password | Organization / Persona | Locality in Guwahati |
| :--- | :--- | :--- | :--- | :--- |
| **👨‍🍳 Seller** | `seller@zerowaste.in` | `Password123!` | *Brahmaputra Bakers & Cafe* | Christian Basti, GS Road |
| **🛍️ Customer** | `customer@zerowaste.in` | `Password123!` | *Rahul Goswami* | Uzan Bazar |
| **🤝 NGO Partner** | `ngo@zerowaste.in` | `Password123!` | *Assam Food Relief & Seva Trust* | Zoo-Narengi Road |

---

## 🚀 Getting Started & Installation

### Prerequisites
- Node.js (v18 or higher recommended; tested on v24)
- npm (v9 or higher)
- Optional: MySQL Server (if using MySQL; the platform automatically activates SQLite fallback if MySQL is offline)

### Step 1: Clone Repository
```bash
git clone <repository-url>
cd zero-waste-market
```

### Step 2: Configure Environment Variables
Inside `server/`, create or inspect `.env`:
```bash
cp server/.env.example server/.env
```
Default configuration values in `server/.env`:
```env
PORT=5001
NODE_ENV=development
JWT_SECRET=zerowaste_secret_token_guwahati_2026_hackathon
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=zerowaste_market
USE_SQLITE=false
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash
```
*(Note: If `GEMINI_API_KEY` is empty, the server automatically activates the intelligent heuristic Listing Assistant fallback, keeping the application 100% operational.)*

### Step 3: Seed Database
Populate Guwahati demo accounts, surplus listings, and sample reservations:
```bash
npm run seed
```

### Step 4: Run Application
Open two terminal tabs:

**Terminal 1 (Backend API):**
```bash
npm run dev:server
# Server runs on http://localhost:5001
```

**Terminal 2 (Frontend Client):**
```bash
npm run dev:client
# Client runs on http://localhost:5173
```

Visit **http://localhost:5173** in your web browser.

---

## 🧪 Automated Testing Suite

ZeroWaste Market includes a comprehensive test suite validating all 10 critical workflows:

```bash
npm test
```

### Test Results
```text
✅ PASS: TEST 1: Authentication & Demo Login for All 3 Roles
✅ PASS: TEST 2: Seller Surplus Product Creation
✅ PASS: TEST 3: AI Listing Assistant Analysis (Gemini / Heuristic)
✅ PASS: TEST 4: Customer Product Search & Category Filtering
✅ PASS: TEST 5: Customer Reservation & Transactional Stock Update
✅ PASS: TEST 6: Seller Order Visibility & Handover Confirmation
✅ PASS: TEST 7: Verified NGO Requests Surplus Donation
✅ PASS: TEST 8: Live Environmental & Financial Impact Computation
✅ PASS: TEST 9: RBAC Enforcement & Forbidden Route Protection
✅ PASS: TEST 10: Validation Guardrails & Overselling Prevention
=============================================================
TEST RUN COMPLETE: 10 / 10 PASSED (100% SUCCESS)
=============================================================
```

---

## 📐 Project Structure

```text
zero-waste-market/
├── client/                     # Vite + React + TypeScript Frontend
│   ├── src/
│   │   ├── components/         # Navbar, Footer, ProductCard, ReservationModal, etc.
│   │   ├── context/            # AuthContext (with 1-click role switcher)
│   │   ├── pages/              # Home, Marketplace, AddProduct, Dashboards, etc.
│   │   ├── services/           # api.ts (REST client with automatic JWT header)
│   │   ├── types/              # TypeScript schema definitions
│   │   └── App.tsx             # React Router structure
│   ├── tailwind.config.js      # Forest green and emerald brand identity
│   └── package.json
├── server/                     # Express.js REST API Backend
│   ├── src/
│   │   ├── config/             # database.js, gemini.js
│   │   ├── controllers/        # auth, product, reservation, donation, ai, dashboard
│   │   ├── middleware/         # auth, role (RBAC), error, upload (Multer)
│   │   ├── models/             # Relational data models with transactions
│   │   ├── routes/             # REST API endpoint definitions
│   │   ├── services/           # gemini.service, impact.service
│   │   ├── utils/              # validators, response formats
│   │   ├── app.js              # Express app definition
│   │   └── server.js           # Server entry point
│   ├── test/                   # Automated test suite
│   ├── uploads/                # Local storage for uploaded product images
│   └── package.json
├── database/
│   ├── schema.sql              # MySQL DDL relational schema
│   ├── seed.sql                # MySQL seed records
│   └── seed.js                 # Cross-platform JavaScript seeder with bcrypt hashing
├── ARCHITECTURE.md             # System architecture and architectural decision records
├── API_DOCUMENTATION.md        # Comprehensive REST API reference
├── DATABASE_SCHEMA.md          # Entity relationships, tables, and constraints
├── WORKFLOW.md                 # End-to-end user journeys
└── package.json                # Root package scripts
```

---

## 🌍 Documented Environmental Calculation Standards

All environmental metrics displayed on the **Impact Dashboard** are derived from actual completed records using international scientific benchmarks:

1. **Food Mass Diverted (kg):**  
   $$\text{Mass} = \text{Total Rescued Units (Sold + Donated)} \times 0.65\text{ kg}$$  
   *(Assumes average standard retail surplus unit weight of 650g across bakery, cooked meals, and produce).*

2. **Greenhouse Gas Emissions Prevented ($\text{kg CO}_2\text{e}$):**  
   $$\text{CO}_2\text{e} = \text{Mass (kg)} \times 2.5$$  
   *(Based on United Nations FAO / UNEP standard: 1 kg of food diverted from municipal landfill prevents ~2.5 kg of greenhouse emissions).*

3. **Agricultural Water Saved (Litres):**  
   $$\text{Water} = \text{Mass (kg)} \times 450\text{ Litres}$$  
   *(Based on Water Footprint Network data for mixed consumer foodstuffs).*

4. **Consumer Financial Savings (₹):**  
   $$\text{Savings} = \sum (\text{Quantity} \times (\text{MRP} - \text{Discounted Price}))$$  
   *(Calculated strictly from verified completed and confirmed reservations).*

---

## 📜 Food Safety Compliance

ZeroWaste Market prioritizes consumer safety:
- Only licensed food businesses with valid FSSAI registrations can register as sellers.
- Expired or spoiled food is strictly prohibited from listing and donation.
- AI provides listing assistance and pricing suggestions but **never** independently certifies microbiological safety or storage integrity.
- Verified NGOs must acknowledge food safety handling and temperature maintenance protocols before claiming donations.

---

## 🛡️ License
MIT License. Built with pride for the Guwahati Hackathon 2026.
