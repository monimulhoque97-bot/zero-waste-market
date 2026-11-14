const db = require('../config/database');

/**
 * Environmental and Social Impact Calculation Service
 *
 * All metrics are derived from actual completed reservations and donations.
 *
 * DOCUMENTED CALCULATION ASSUMPTIONS:
 * 1. Waste Avoided (kg):
 *    - Each surplus meal/bakery/produce item saved from landfill is estimated at an average of 0.65 kg.
 *    - Food rescue weight: Total rescued units (Sold + Donated) * 0.65 kg.
 *
 * 2. CO2 Emissions Prevented (kg CO2e):
 *    - Based on UN Food and Agriculture Organization (FAO) and UNEP global food waste emission factors:
 *    - 1 kg of food diverted from landfill prevents approx 2.5 kg of CO2 equivalent emissions (including methane breakdown).
 *    - Formula: Waste Avoided (kg) * 2.5.
 *
 * 3. Water Conserved (Litres):
 *    - Based on Water Footprint Network data for mixed food production:
 *    - Approximately 450 litres of embedded agricultural water is saved per 1 kg of food consumed instead of wasted.
 *    - Formula: Waste Avoided (kg) * 450.
 *
 * 4. Customer Financial Savings (₹):
 *    - Actual sum of: r.quantity * (p.original_price - r.unit_price) across all completed and confirmed reservations.
 */

const ImpactService = {
  async getGlobalImpact() {
    // 1. Total products listed
    const [prodRows] = await db.query('SELECT COUNT(*) as total_listed FROM products');
    const totalListed = prodRows[0]?.total_listed || 0;

    // 2. Quantity sold & savings from reservations
    const [resRows] = await db.query(`
      SELECT
        COUNT(*) as total_reservations,
        SUM(CASE WHEN r.status IN ('confirmed', 'completed') THEN r.quantity ELSE 0 END) as units_sold,
        SUM(CASE WHEN r.status = 'completed' THEN 1 ELSE 0 END) as completed_reservations,
        SUM(CASE WHEN r.status IN ('confirmed', 'completed') THEN (r.quantity * (p.original_price - r.unit_price)) ELSE 0 END) as total_savings_inr,
        SUM(CASE WHEN r.status IN ('confirmed', 'completed') THEN r.total_price ELSE 0 END) as total_revenue_inr
      FROM reservations r
      JOIN products p ON r.product_id = p.id
    `);

    const unitsSold = Number(resRows[0]?.units_sold || 0);
    const completedReservations = Number(resRows[0]?.completed_reservations || 0);
    const totalSavingsInr = Number(Number(resRows[0]?.total_savings_inr || 0).toFixed(2));
    const totalRevenueInr = Number(Number(resRows[0]?.total_revenue_inr || 0).toFixed(2));

    // 3. Quantity donated
    const [donRows] = await db.query(`
      SELECT
        COUNT(*) as total_donation_listings,
        SUM(CASE WHEN status IN ('accepted', 'completed') THEN quantity ELSE 0 END) as units_donated,
        SUM(CASE WHEN status = 'completed' THEN quantity ELSE 0 END) as completed_donations_qty
      FROM donations
    `);

    const unitsDonated = Number(donRows[0]?.units_donated || 0);

    // 4. Combined Rescued Units
    const totalRescuedUnits = unitsSold + unitsDonated;

    // 5. Environmental Metrics with documented factors
    const KG_PER_UNIT = 0.65;
    const CO2_FACTOR = 2.5; // kg CO2e per kg food waste
    const WATER_FACTOR = 450; // Litres of embedded water per kg food

    const estimatedWasteAvoidedKg = Number((totalRescuedUnits * KG_PER_UNIT).toFixed(1));
    const estimatedCo2PreventedKg = Number((estimatedWasteAvoidedKg * CO2_FACTOR).toFixed(1));
    const estimatedWaterSavedLitres = Math.round(estimatedWasteAvoidedKg * WATER_FACTOR);

    return {
      overview: {
        total_products_listed: totalListed,
        total_rescued_units: totalRescuedUnits,
        units_sold: unitsSold,
        units_donated: unitsDonated,
        completed_reservations: completedReservations,
        total_customer_savings_inr: totalSavingsInr,
        total_marketplace_volume_inr: totalRevenueInr,
      },
      environmental: {
        estimated_waste_avoided_kg: estimatedWasteAvoidedKg,
        estimated_co2_prevented_kg: estimatedCo2PreventedKg,
        estimated_water_saved_litres: estimatedWaterSavedLitres,
      },
      methodology: {
        assumptions: [
          'Average weight per surplus food unit: 0.65 kg (based on mixed retail bakery, produce, and prepared meals).',
          'Emissions factor: 2.5 kg CO2e prevented per kg food diverted from landfills (UN FAO / UNEP standard).',
          'Water footprint: 450 Litres embedded water conserved per kg food consumed (Water Footprint Network).',
          'Financial savings calculated exclusively from verified completed and confirmed customer reservations.',
        ],
        location: 'Guwahati, Assam, India',
      },
    };
  },

  async getCustomerImpact(customerId) {
    const [rows] = await db.query(`
      SELECT
        COUNT(*) as total_reservations,
        SUM(CASE WHEN r.status IN ('confirmed', 'completed') THEN r.quantity ELSE 0 END) as units_rescued,
        SUM(CASE WHEN r.status IN ('confirmed', 'completed') THEN (r.quantity * (p.original_price - r.unit_price)) ELSE 0 END) as money_saved_inr,
        SUM(CASE WHEN r.status IN ('confirmed', 'completed') THEN r.total_price ELSE 0 END) as money_spent_inr
      FROM reservations r
      JOIN products p ON r.product_id = p.id
      WHERE r.customer_id = ?
    `, [customerId]);

    const unitsRescued = Number(rows[0]?.units_rescued || 0);
    const moneySaved = Number(Number(rows[0]?.money_saved_inr || 0).toFixed(2));
    const moneySpent = Number(Number(rows[0]?.money_spent_inr || 0).toFixed(2));
    const wasteAvoidedKg = Number((unitsRescued * 0.65).toFixed(1));
    const co2AvoidedKg = Number((wasteAvoidedKg * 2.5).toFixed(1));

    return {
      total_reservations: Number(rows[0]?.total_reservations || 0),
      units_rescued: unitsRescued,
      money_saved_inr: moneySaved,
      money_spent_inr: moneySpent,
      waste_avoided_kg: wasteAvoidedKg,
      co2_avoided_kg: co2AvoidedKg,
    };
  },

  async getSellerImpact(sellerId) {
    const [rows] = await db.query(`
      SELECT
        COUNT(DISTINCT p.id) as total_products_listed,
        SUM(CASE WHEN r.status IN ('confirmed', 'completed') THEN r.quantity ELSE 0 END) as total_units_sold,
        SUM(CASE WHEN r.status IN ('confirmed', 'completed') THEN r.total_price ELSE 0 END) as total_revenue_inr
      FROM products p
      LEFT JOIN reservations r ON p.id = r.product_id
      WHERE p.seller_id = ?
    `, [sellerId]);

    const [donRows] = await db.query(`
      SELECT
        COUNT(*) as total_donations_offered,
        SUM(CASE WHEN status IN ('accepted', 'completed') THEN quantity ELSE 0 END) as units_donated
      FROM donations
      WHERE seller_id = ?
    `, [sellerId]);

    const unitsSold = Number(rows[0]?.total_units_sold || 0);
    const unitsDonated = Number(donRows[0]?.units_donated || 0);
    const totalUnitsRescued = unitsSold + unitsDonated;
    const wasteAvoidedKg = Number((totalUnitsRescued * 0.65).toFixed(1));
    const co2AvoidedKg = Number((wasteAvoidedKg * 2.5).toFixed(1));

    return {
      total_products_listed: Number(rows[0]?.total_products_listed || 0),
      total_units_sold: unitsSold,
      total_units_donated: unitsDonated,
      total_revenue_inr: Number(Number(rows[0]?.total_revenue_inr || 0).toFixed(2)),
      waste_avoided_kg: wasteAvoidedKg,
      co2_avoided_kg: co2AvoidedKg,
    };
  },

  async getNgoImpact(ngoId) {
    const [rows] = await db.query(`
      SELECT
        COUNT(*) as total_requests,
        SUM(CASE WHEN status IN ('accepted', 'completed') THEN quantity ELSE 0 END) as meals_rescued,
        SUM(CASE WHEN status = 'completed' THEN quantity ELSE 0 END) as completed_meals
      FROM donations
      WHERE ngo_id = ?
    `, [ngoId]);

    const mealsRescued = Number(rows[0]?.meals_rescued || 0);
    const wasteAvoidedKg = Number((mealsRescued * 0.65).toFixed(1));

    return {
      total_requests: Number(rows[0]?.total_requests || 0),
      meals_rescued: mealsRescued,
      waste_avoided_kg: wasteAvoidedKg,
    };
  },
};

module.exports = ImpactService;
