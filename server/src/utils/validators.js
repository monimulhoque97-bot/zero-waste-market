/**
 * Input Validation Utilities
 */

function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim());
}

function isValidPassword(password) {
  if (!password || typeof password !== 'string') return false;
  return password.length >= 6;
}

function isValidPrice(val) {
  const num = Number(val);
  return !isNaN(num) && num >= 0 && isFinite(num);
}

function isValidQuantity(val) {
  const num = Number(val);
  return Number.isInteger(num) && num > 0;
}

function validateProductInput(data) {
  const errors = [];
  if (!data.name || !data.name.trim()) errors.push('Product name is required.');
  if (!data.category || !data.category.trim()) errors.push('Product category is required.');
  if (!isValidPrice(data.original_price)) errors.push('Valid original price is required.');
  if (!isValidPrice(data.discounted_price)) errors.push('Valid discounted price is required.');
  if (Number(data.discounted_price) > Number(data.original_price)) {
    errors.push('Discounted price cannot be higher than original price.');
  }
  if (!isValidQuantity(data.quantity)) errors.push('Valid positive quantity is required.');
  if (!data.pickup_location || !data.pickup_location.trim()) {
    errors.push('Pickup location is required.');
  }
  if (!data.pickup_end) errors.push('Pickup deadline (availability deadline) is required.');

  return {
    isValid: errors.length === 0,
    errors,
  };
}

function validateDonationInput(data) {
  const errors = [];
  if (!data.title || !data.title.trim()) errors.push('Donation title is required.');
  if (!data.category || !data.category.trim()) errors.push('Category is required.');
  if (!isValidQuantity(data.quantity)) errors.push('Valid quantity is required.');
  if (!data.expiry_date) errors.push('Expiry date is required for food safety verification.');
  if (!data.pickup_location || !data.pickup_location.trim()) errors.push('Pickup location is required.');
  if (!data.pickup_deadline) errors.push('Pickup deadline is required.');

  // Food safety check: Expiry date cannot be in the past
  if (data.expiry_date) {
    const exp = new Date(data.expiry_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (exp < today) {
      errors.push('Expired food cannot be listed for donation. Food safety standards strictly prohibit expired items.');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

module.exports = {
  isValidEmail,
  isValidPassword,
  isValidPrice,
  isValidQuantity,
  validateProductInput,
  validateDonationInput,
};
