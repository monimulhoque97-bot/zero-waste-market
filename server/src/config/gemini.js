const { GoogleGenAI } = require('@google/genai');

const apiKey = process.env.GEMINI_API_KEY || '';
const isConfigured = Boolean(apiKey && apiKey.trim().length > 10 && !apiKey.includes('your_gemini_key'));

let client = null;
if (isConfigured) {
  try {
    client = new GoogleGenAI({ apiKey });
    console.log('✨ [Gemini] Google Gen AI SDK initialized successfully.');
  } catch (err) {
    console.warn('⚠️ [Gemini] Failed to initialize Google Gen AI client:', err.message);
  }
} else {
  console.log('ℹ️ [Gemini] GEMINI_API_KEY is not set or placeholder. Smart Rule-Based Listing Assistant active for demo.');
}

module.exports = {
  getGeminiClient: () => client,
  isGeminiConfigured: () => Boolean(client && isConfigured),
  getModelName: () => process.env.GEMINI_MODEL || 'gemini-2.5-flash',
};
