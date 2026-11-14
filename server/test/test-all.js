const { Readable, Writable, Duplex } = require('stream');
const app = require('../src/app');
const db = require('../src/config/database');
const seed = require('../../database/seed');

function request(options) {
  return new Promise((resolve, reject) => {
    const { method = 'GET', url = '/', headers = {}, body = null } = options;

    const req = new Readable({
      read() {},
    });

    req.method = method;
    req.url = url;
    const lowerHeaders = {};
    for (const [k, v] of Object.entries(headers)) {
      lowerHeaders[k.toLowerCase()] = v;
    }
    req.headers = { host: 'localhost', ...lowerHeaders };

    const socket = new Duplex({
      read() {},
      write(chunk, encoding, callback) {
        callback();
      },
    });
    socket.remoteAddress = '127.0.0.1';
    req.socket = socket;
    req.connection = socket;

    if (body) {
      const data = typeof body === 'string' ? body : JSON.stringify(body);
      req.headers['content-type'] = req.headers['content-type'] || 'application/json';
      req.headers['content-length'] = Buffer.byteLength(data);
      req.push(data);
    }
    req.push(null);

    const chunks = [];
    const resHeaders = {};

    const res = new Writable({
      write(chunk, encoding, callback) {
        chunks.push(chunk);
        callback();
      },
    });

    res.statusCode = 200;
    res.setHeader = (k, v) => {
      resHeaders[k.toLowerCase()] = v;
    };
    res.getHeader = (k) => resHeaders[k.toLowerCase()];
    res.writeHead = (status, h) => {
      res.statusCode = status;
      if (h) Object.assign(resHeaders, h);
    };

    res.end = (chunk) => {
      if (chunk) chunks.push(chunk);
      const text = Buffer.concat(chunks).toString();
      let json = null;
      try {
        json = JSON.parse(text);
      } catch (e) {
        json = null;
      }
      resolve({ status: res.statusCode, headers: resHeaders, text, body: json });
    };

    app(req, res);
  });
}

const results = [];

function recordTest(name, passed, detail = '') {
  results.push({ name, passed, detail });
  const icon = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${icon}: ${name}${detail ? ' -> ' + detail : ''}`);
}

async function runTests() {
  console.log('🧪 Starting ZeroWaste Market Comprehensive Test Suite (In-Memory Isolation)...');
  await db.initDatabase();
  await seed();

  let sellerToken = '';
  let customerToken = '';
  let ngoToken = '';
  let createdProductId = null;
  let reservationId = null;
  let donationId = null;

  try {
    // -------------------------------------------------------------
    // TEST 1: Seller registration and login
    // -------------------------------------------------------------
    console.log('\n--- TEST 1: Seller Registration & Login ---');
    const loginRes = await request({
      method: 'POST',
      url: '/api/auth/login',
      body: { email: 'seller@zerowaste.in', password: 'Password123!' },
    });
    sellerToken = loginRes.body?.data?.token;

    const custLoginRes = await request({
      method: 'POST',
      url: '/api/auth/login',
      body: { email: 'customer@zerowaste.in', password: 'Password123!' },
    });
    customerToken = custLoginRes.body?.data?.token;

    const ngoLoginRes = await request({
      method: 'POST',
      url: '/api/auth/login',
      body: { email: 'ngo@zerowaste.in', password: 'Password123!' },
    });
    ngoToken = ngoLoginRes.body?.data?.token;

    recordTest(
      'TEST 1: Authentication & Demo Login for All 3 Roles',
      loginRes.status === 200 && !!sellerToken && !!customerToken && !!ngoToken,
      `Seller (${loginRes.body?.data?.user?.name}), Customer (${custLoginRes.body?.data?.user?.name}), NGO (${ngoLoginRes.body?.data?.user?.name})`
    );

    // -------------------------------------------------------------
    // TEST 2: Seller creates a product listing
    // -------------------------------------------------------------
    console.log('\n--- TEST 2: Seller Creates Product Listing ---');
    const newProdRes = await request({
      method: 'POST',
      url: '/api/products',
      headers: { Authorization: `Bearer ${sellerToken}` },
      body: {
        name: 'Guwahati Evening Tea Cakes (Pack of 6)',
        category: 'Bakery',
        description: 'Freshly baked buttery tea cakes made with Assam cardamom and honey.',
        original_price: 240,
        discounted_price: 99,
        quantity: 5,
        unit: 'pack',
        pickup_location: 'Brahmaputra Bakers, GS Road, Christian Basti, Guwahati',
        pickup_end: new Date(Date.now() + 8 * 3600 * 1000).toISOString(),
        expiry_date: new Date(Date.now() + 24 * 3600 * 1000).toISOString().slice(0, 10),
        safety_notes: 'Keep in dry container. Baked fresh at 8:00 AM.',
      },
    });
    createdProductId = newProdRes.body?.data?.id;

    recordTest(
      'TEST 2: Seller Surplus Product Creation',
      newProdRes.status === 201 && !!createdProductId,
      `Created product ID: ${createdProductId} ("${newProdRes.body?.data?.name}")`
    );

    // -------------------------------------------------------------
    // TEST 3: Gemini analyses a listing (Live or Heuristic)
    // -------------------------------------------------------------
    console.log('\n--- TEST 3: Gemini AI / Listing Assistant ---');
    const aiRes = await request({
      method: 'POST',
      url: '/api/ai/analyze-listing',
      headers: { Authorization: `Bearer ${sellerToken}` },
      body: {
        description: 'Assorted chocolate donuts and cinnamon rolls from morning batch',
        original_price: 300,
        category: 'Bakery',
      },
    });
    const aiData = aiRes.body;
    recordTest(
      'TEST 3: AI Listing Assistant Analysis',
      aiRes.status === 200 && !!aiData.data?.suggested_name && Array.isArray(aiData.data?.safety_notes),
      `Engine: ${aiData.data?.ai_engine}, Suggested Name: "${aiData.data?.suggested_name}", Suggested Price: ₹${aiData.data?.suggested_discounted_price}`
    );

    // -------------------------------------------------------------
    // TEST 4: Customer browses and searches products
    // -------------------------------------------------------------
    console.log('\n--- TEST 4: Customer Browses & Filters ---');
    const searchRes = await request({
      method: 'GET',
      url: '/api/products?search=Sourdough&category=Bakery',
    });
    const foundSourdough = searchRes.body?.data?.some((p) => p.name.includes('Sourdough'));

    recordTest(
      'TEST 4: Customer Product Search & Category Filtering',
      searchRes.status === 200 && foundSourdough,
      `Returned ${searchRes.body?.data?.length} item(s) matching search 'Sourdough'`
    );

    // -------------------------------------------------------------
    // TEST 5: Customer reserves a product (Transaction Safety)
    // -------------------------------------------------------------
    console.log('\n--- TEST 5: Customer Reserves Product ---');
    const resRes = await request({
      method: 'POST',
      url: '/api/reservations',
      headers: { Authorization: `Bearer ${customerToken}` },
      body: {
        product_id: createdProductId,
        quantity: 2,
        notes: 'Picking up around 7:00 PM',
      },
    });
    reservationId = resRes.body?.data?.id;
    const pickupCode = resRes.body?.data?.pickup_code;

    // Verify inventory deduction
    const checkProdRes = await request({
      method: 'GET',
      url: `/api/products/${createdProductId}`,
    });
    const remainingQty = checkProdRes.body?.data?.quantity;

    recordTest(
      'TEST 5: Customer Reservation & Transactional Stock Update',
      resRes.status === 201 && !!pickupCode && remainingQty === 3,
      `Reservation ID: ${reservationId}, Code: ${pickupCode}, Stock deducted from 5 to ${remainingQty}`
    );

    // -------------------------------------------------------------
    // TEST 6: Seller sees and updates the reservation
    // -------------------------------------------------------------
    console.log('\n--- TEST 6: Seller Updates Reservation Handover ---');
    const sellerResRes = await request({
      method: 'GET',
      url: '/api/reservations/seller',
      headers: { Authorization: `Bearer ${sellerToken}` },
    });
    const hasOrder = sellerResRes.body?.data?.some((r) => r.id === reservationId);

    // Complete the order
    const updateRes = await request({
      method: 'PATCH',
      url: `/api/reservations/${reservationId}/status`,
      headers: { Authorization: `Bearer ${sellerToken}` },
      body: { status: 'completed' },
    });

    recordTest(
      'TEST 6: Seller Order Visibility & Handover Confirmation',
      hasOrder && updateRes.status === 200,
      `Order found in seller dashboard and status transitioned to 'completed'`
    );

    // -------------------------------------------------------------
    // TEST 7: NGO requests an eligible donation
    // -------------------------------------------------------------
    console.log('\n--- TEST 7: NGO Requests Surplus Donation ---');
    const donListRes = await request({
      method: 'GET',
      url: '/api/donations?status=available',
    });
    const firstDonation = donListRes.body?.data?.[0];
    donationId = firstDonation?.id;

    const requestRes = await request({
      method: 'POST',
      url: `/api/donations/${donationId}/request`,
      headers: { Authorization: `Bearer ${ngoToken}` },
      body: { notes: 'Relief volunteer pickup at 4:30 PM with sanitized bins.' },
    });

    recordTest(
      'TEST 7: Verified NGO Requests Surplus Donation',
      requestRes.status === 200,
      `Requested donation ID: ${donationId} ("${firstDonation?.title}")`
    );

    // -------------------------------------------------------------
    // TEST 8: Impact dashboard reflects actual completed records
    // -------------------------------------------------------------
    console.log('\n--- TEST 8: Impact Dashboard Verification ---');
    const impactRes = await request({
      method: 'GET',
      url: '/api/dashboard/impact',
    });
    const stats = impactRes.body?.data?.overview;
    const env = impactRes.body?.data?.environmental;

    const isValidImpact =
      stats?.units_sold > 0 &&
      stats?.total_customer_savings_inr > 0 &&
      env?.estimated_waste_avoided_kg > 0 &&
      env?.estimated_co2_prevented_kg > 0;

    recordTest(
      'TEST 8: Live Environmental & Financial Impact Computation',
      isValidImpact,
      `Rescued: ${stats?.total_rescued_units} items, Saved: ₹${stats?.total_customer_savings_inr}, Waste Avoided: ${env?.estimated_waste_avoided_kg} kg, CO2 Prevented: ${env?.estimated_co2_prevented_kg} kg`
    );

    // -------------------------------------------------------------
    // TEST 9: Unauthorised users cannot access protected routes
    // -------------------------------------------------------------
    console.log('\n--- TEST 9: Security & Role-Based Access Control ---');
    // Try customer role calling seller-only route
    const blockedRes = await request({
      method: 'POST',
      url: '/api/products',
      headers: { Authorization: `Bearer ${customerToken}` },
      body: { name: 'Unauthorized item' },
    });

    // Try unauthenticated access
    const unauthRes = await request({
      method: 'GET',
      url: '/api/dashboard/seller',
    });

    recordTest(
      'TEST 9: RBAC Enforcement & Forbidden Route Protection',
      blockedRes.status === 403 && unauthRes.status === 401,
      `Customer blocked from seller product post (403), Unauthenticated request blocked (401)`
    );

    // -------------------------------------------------------------
    // TEST 10: Input validation & error handling
    // -------------------------------------------------------------
    console.log('\n--- TEST 10: Input Validation & Edge Cases ---');
    // Invalid price (discount > original)
    const badPriceRes = await request({
      method: 'POST',
      url: '/api/products',
      headers: { Authorization: `Bearer ${sellerToken}` },
      body: {
        name: 'Invalid Price Item',
        category: 'Bakery',
        original_price: 100,
        discounted_price: 250,
        quantity: 2,
        pickup_location: 'Guwahati',
        pickup_end: new Date().toISOString(),
      },
    });

    // Excess quantity reservation attempt
    const overbookRes = await request({
      method: 'POST',
      url: '/api/reservations',
      headers: { Authorization: `Bearer ${customerToken}` },
      body: {
        product_id: createdProductId,
        quantity: 99999,
      },
    });

    recordTest(
      'TEST 10: Validation Guardrails & Overselling Prevention',
      badPriceRes.status === 400 && overbookRes.status === 409,
      `Discount > MRP rejected (400), Overselling 99999 units rejected (409)`
    );

  } catch (testErr) {
    console.error('❌ Test execution error:', testErr);
  } finally {
    console.log('\n=============================================================');
    const passedCount = results.filter((r) => r.passed).length;
    console.log(`TEST RUN COMPLETE: ${passedCount} / ${results.length} PASSED`);
    console.log('=============================================================');
    if (passedCount === results.length && results.length === 10) {
      console.log('🎉 ALL 10 MASTER TEST CASES PASSED WITH 100% SUCCESS!');
      process.exit(0);
    } else {
      console.log('⚠️ Some tests failed.');
      process.exit(1);
    }
  }
}

runTests();
