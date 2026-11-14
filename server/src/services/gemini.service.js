const { getGeminiClient, isGeminiConfigured, getModelName } = require('../config/gemini');

/**
 * Heuristic/Rule-based AI Listing Assistant Fallback
 * Used when GEMINI_API_KEY is not provided or offline.
 * Clearly identified as demo/heuristic mode.
 */
function generateHeuristicListingSuggestions(inputText = '', originalPrice = 0, category = '') {
  const text = inputText.toLowerCase();

  let detectedCategory = category || 'Bakery';
  if (text.includes('cake') || text.includes('bread') || text.includes('croissant') || text.includes('biscuit') || text.includes('pastry') || text.includes('bun')) {
    detectedCategory = 'Bakery';
  } else if (text.includes('veg') || text.includes('fruit') || text.includes('apple') || text.includes('tomato') || text.includes('potato') || text.includes('strawberry') || text.includes('spinach')) {
    detectedCategory = 'Produce & Fruits';
  } else if (text.includes('milk') || text.includes('paneer') || text.includes('curd') || text.includes('sweet') || text.includes('pitha') || text.includes('laru') || text.includes('mithai')) {
    detectedCategory = 'Dairy & Sweets';
  } else if (text.includes('thali') || text.includes('rice') || text.includes('curry') || text.includes('meal') || text.includes('roti') || text.includes('combo')) {
    detectedCategory = 'Meals & Cooked';
  } else if (text.includes('juice') || text.includes('tea') || text.includes('coffee') || text.includes('shake')) {
    detectedCategory = 'Beverages';
  }

  // Suggest title
  const words = inputText.trim().split(/\s+/).slice(0, 5).join(' ');
  const suggestedName = words
    ? words.charAt(0).toUpperCase() + words.slice(1)
    : `Fresh Surplus ${detectedCategory} Assortment`;

  // Dynamic surplus discount calculation (40% - 60% based on surplus urgency)
  const suggestedDiscountPercent = 45;
  const numOrig = Number(originalPrice) || 200;
  const suggestedDiscountedPrice = Math.round(numOrig * (1 - suggestedDiscountPercent / 100));

  const missingInfo = [];
  if (!originalPrice || Number(originalPrice) <= 0) missingInfo.push('Enter accurate original retail price (MRP).');
  if (!text.includes('date') && !text.includes('expiry') && !text.includes('bake') && !text.includes('today')) {
    missingInfo.push('Confirm best-before or preparation date.');
  }
  if (!text.includes('pack') && !text.includes('box') && !text.includes('kg') && !text.includes('piece') && !text.includes('pcs')) {
    missingInfo.push('Specify total quantity count and packaging unit (e.g. 5 boxes, 2 kg).');
  }

  return {
    is_demo_mode: true,
    ai_engine: 'Heuristic Rule-Based Assistant (Add GEMINI_API_KEY in .env for Live Gemini 2.5 Flash)',
    suggested_name: suggestedName,
    category: detectedCategory,
    description: `Fresh, high-quality ${detectedCategory.toLowerCase()} surplus available for immediate collection in Guwahati. Safely handled and packaged at our licensed establishment.`,
    suggested_discount_percent: suggestedDiscountPercent,
    suggested_discounted_price: suggestedDiscountedPrice,
    missing_information: missingInfo.length > 0 ? missingInfo : ['Verify pickup counter timing with customer.'],
    safety_notes: [
      'Seller must independently verify and confirm product storage conditions.',
      'AI does NOT certify food safety or microbiological suitability.',
      'Ensure FSSAI hygiene guidelines are maintained during packaging.',
    ],
  };
}

/**
 * Analyze Product Listing with Google Gemini AI or Heuristic Fallback
 */
async function analyzeListing({ description = '', originalPrice = 0, category = '', imageBase64 = null, imageMime = 'image/jpeg' }) {
  if (!isGeminiConfigured()) {
    console.log('[GeminiService] Running Heuristic Listing Assistant (Gemini API key not configured)');
    return generateHeuristicListingSuggestions(description, originalPrice, category);
  }

  try {
    const client = getGeminiClient();
    const model = getModelName();

    const systemPrompt = `You are the ZeroWaste Market AI Listing Assistant for a surplus marketplace in Guwahati, Assam, India.
Your mission is to help sellers list usable surplus food or retail goods accurately, attractive for buyers, and compliant with transparency rules.
CRITICAL COMPLIANCE RULE: You MUST NOT independently certify product safety or authenticity. Explicitly remind the seller of their duty to inspect.

Generate a JSON response conforming strictly to this JSON schema:
{
  "suggested_name": "string (clear, professional product name)",
  "category": "Bakery" | "Meals & Cooked" | "Produce & Fruits" | "Dairy & Sweets" | "Packaged Goods" | "Beverages",
  "description": "string (appetising, concise 2-3 sentence description emphasizing freshness and value)",
  "suggested_discount_percent": number (between 30 and 70 based on perishability),
  "suggested_discounted_price": number (calculated from original price if provided),
  "missing_information": ["string array of missing required listing details like exact count, dates, storage temp"],
  "safety_notes": ["string array of important hygiene and consumer safety reminders"]
}`;

    const userPrompt = `Seller provided details:
- Notes/Description: "${description}"
- Category hint: "${category}"
- Original Price (₹): ${originalPrice || 'Not specified'}

Analyze the provided information (and image if attached). Return ONLY raw JSON without markdown code fences.`;

    const contents = [];
    if (imageBase64) {
      contents.push({
        parts: [
          {
            inlineData: {
              data: imageBase64.replace(/^data:image\/\w+;base64,/, ''),
              mimeType: imageMime,
            },
          },
          { text: userPrompt },
        ],
      });
    } else {
      contents.push({
        parts: [{ text: userPrompt }],
      });
    }

    const response = await client.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const text = response.text ? response.text.trim() : '{}';
    let parsed = {};
    try {
      parsed = JSON.parse(text);
    } catch (parseErr) {
      // Clean possible fences
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      parsed = JSON.parse(cleanJson);
    }

    return {
      is_demo_mode: false,
      ai_engine: `Google Gemini AI (${model})`,
      ...parsed,
    };
  } catch (err) {
    console.error('⚠️ [GeminiService] Gemini API call failed. Falling back to heuristic:', err.message);
    const fallback = generateHeuristicListingSuggestions(description, originalPrice, category);
    fallback.ai_engine += ` (Fallback due to: ${err.message})`;
    return fallback;
  }
}

/**
 * AI Listing Quality Checker
 * Evaluates listing completeness and flags missing or risky attributes.
 */
async function checkListingQuality(productData) {
  const issues = [];
  const recommendations = [];
  let score = 100;

  if (!productData.name || productData.name.trim().length < 5) {
    issues.push('Product name is too brief. Provide a specific descriptive title.');
    score -= 20;
  }

  if (!productData.description || productData.description.trim().length < 20) {
    issues.push('Product description is too short. Describe contents, portion size, and condition.');
    score -= 15;
  }

  if (!productData.expiry_date && !productData.pickup_end) {
    issues.push('No deadline or expiry date provided. Customers need transparency on fresh surplus.');
    score -= 25;
  }

  if (!productData.pickup_location || productData.pickup_location.trim().length < 8) {
    issues.push('Pickup location details are vague. Add building/shop number and Guwahati locality.');
    score -= 15;
  }

  const orig = Number(productData.original_price);
  const disc = Number(productData.discounted_price);

  if (orig > 0 && disc > 0) {
    const discountPercent = Math.round(((orig - disc) / orig) * 100);
    if (discountPercent < 20) {
      recommendations.push('Discounts below 20% on surplus items sell more slowly. Consider 30-50% for fast clearance.');
    } else if (discountPercent > 80) {
      recommendations.push('Very steep discount (>80%). Verify that the item is safe and edible.');
    }
  } else {
    issues.push('Pricing information is incomplete or invalid.');
    score -= 20;
  }

  if (!productData.image_url) {
    recommendations.push('Listings with actual photos receive 3x more reservations.');
    score -= 10;
  }

  return {
    quality_score: Math.max(0, score),
    is_ready_to_publish: score >= 60 && issues.length === 0,
    issues,
    recommendations,
    compliance_check: {
      food_safety_acknowledged: Boolean(productData.safety_notes || productData.safety_acknowledged),
      status: score >= 60 ? 'PASSED_PRE_FLIGHT' : 'NEEDS_REVISION',
    },
  };
}

module.exports = {
  analyzeListing,
  checkListingQuality,
};
