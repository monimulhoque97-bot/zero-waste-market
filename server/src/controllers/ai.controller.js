const fs = require('fs');
const GeminiService = require('../services/gemini.service');
const { sendSuccess, sendError } = require('../utils/response');

const AiController = {
  async analyzeListing(req, res, next) {
    try {
      const { description, original_price, category, image_base64 } = req.body;

      let imageBase64 = image_base64 || null;
      let imageMime = 'image/jpeg';

      // If file was uploaded via multer
      if (req.file) {
        const fileBuffer = fs.readFileSync(req.file.path);
        imageBase64 = fileBuffer.toString('base64');
        imageMime = req.file.mimetype;
      }

      const result = await GeminiService.analyzeListing({
        description: description || '',
        originalPrice: Number(original_price) || 0,
        category: category || '',
        imageBase64,
        imageMime,
      });

      return sendSuccess(res, result, 'Listing analysis completed successfully.');
    } catch (err) {
      next(err);
    }
  },

  async checkListing(req, res, next) {
    try {
      const productData = req.body;
      const result = await GeminiService.checkListingQuality(productData);
      return sendSuccess(res, result, 'Listing quality assessment complete.');
    } catch (err) {
      next(err);
    }
  },
};

module.exports = AiController;
