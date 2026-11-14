import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  Tag,
  DollarSign,
  Calendar,
  Clock,
  MapPin,
  Bot,
} from 'lucide-react';

const CATEGORIES = [
  'Bakery',
  'Meals & Cooked',
  'Produce & Fruits',
  'Dairy & Sweets',
  'Packaged Goods',
  'Beverages',
];

export const AddProduct: React.FC = () => {
  const { user, role, quickLoginDemo } = useAuth();
  const navigate = useNavigate();

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Bakery');
  const [description, setDescription] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [discountedPrice, setDiscountedPrice] = useState('');
  const [quantity, setQuantity] = useState('5');
  const [unit, setUnit] = useState('pack');
  const [pickupLocation, setPickupLocation] = useState(
    user?.business_address ? `${user.business_name}, ${user.business_address}` : 'Central Mall Arcade, GS Road, Christian Basti, Guwahati'
  );
  const [pickupEnd, setPickupEnd] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [isEligibleForDonation, setIsEligibleForDonation] = useState(true);
  const [safetyNotes, setSafetyNotes] = useState(
    'Keep stored in clean refrigerated display. Consume or collect within stated deadline.'
  );

  // Image state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');

  // AI Assistant State
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiSuggestions, setAiSuggestions] = useState<any | null>(null);
  const [qualityReport, setQualityReport] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Handle local image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger Gemini AI Assistant
  const handleAiAssist = async () => {
    setIsAiLoading(true);
    setErrorMessage(null);

    try {
      const payload: any = {
        description: description || name || 'Fresh bakery or produce surplus in Guwahati',
        original_price: Number(originalPrice) || 200,
        category: category,
      };

      if (imagePreview) {
        payload.image_base64 = imagePreview;
      }

      const suggestions = await api.analyzeListing(payload);
      setAiSuggestions(suggestions);

      // Auto-apply or present for review
      if (suggestions.suggested_name && !name) {
        setName(suggestions.suggested_name);
      }
      if (suggestions.category) {
        setCategory(suggestions.category);
      }
      if (suggestions.description && (!description || description.length < 15)) {
        setDescription(suggestions.description);
      }
      if (suggestions.suggested_discounted_price && !discountedPrice) {
        setDiscountedPrice(suggestions.suggested_discounted_price.toString());
      }
      if (suggestions.safety_notes && suggestions.safety_notes.length > 0) {
        setSafetyNotes(suggestions.safety_notes.join(' '));
      }
    } catch (err: any) {
      setErrorMessage('AI Assistant failed: ' + err.message);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Run AI Pre-flight Quality Checker
  const handleQualityCheck = async () => {
    try {
      const report = await api.checkListingQuality({
        name,
        category,
        description,
        original_price: originalPrice,
        discounted_price: discountedPrice,
        quantity,
        pickup_location: pickupLocation,
        pickup_end: pickupEnd,
        expiry_date: expiryDate,
        image_url: imagePreview || imageUrl,
        safety_notes: safetyNotes,
      });
      setQualityReport(report);
    } catch (err: any) {
      console.warn('Quality check error:', err);
    }
  };

  // Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (role !== 'seller') {
      setErrorMessage(`Your current role is '${role}'. Only registered Sellers can publish product listings.`);
      return;
    }

    if (Number(discountedPrice) >= Number(originalPrice)) {
      setErrorMessage('Discounted surplus price must be lower than original MRP.');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('category', category);
      formData.append('description', description.trim());
      formData.append('original_price', originalPrice);
      formData.append('discounted_price', discountedPrice);
      formData.append('quantity', quantity);
      formData.append('unit', unit);
      formData.append('pickup_location', pickupLocation.trim());
      formData.append('pickup_end', pickupEnd || new Date(Date.now() + 8 * 3600 * 1000).toISOString());
      if (expiryDate) formData.append('expiry_date', expiryDate);
      formData.append('is_eligible_for_donation', isEligibleForDonation ? '1' : '0');
      formData.append('safety_notes', safetyNotes);

      if (imageFile) {
        formData.append('image', imageFile);
      } else if (imageUrl) {
        formData.append('image_url', imageUrl);
      }

      await api.createProduct(formData);
      setSuccessMessage('Product listed successfully! Redirecting to seller dashboard...');
      setTimeout(() => {
        navigate('/seller/dashboard');
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to list surplus product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center space-x-1.5 bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>AI-Assisted Listing Studio</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Add Surplus Product</h1>
          <p className="text-xs text-slate-500 mt-1">
            Publish edible surplus or clearance goods for immediate counter pickup in Guwahati.
          </p>
        </div>

        {role !== 'seller' && (
          <button
            onClick={() => quickLoginDemo('seller')}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow transition shrink-0"
          >
            1-Click Switch to Seller Mode
          </button>
        )}
      </div>

      {/* Alerts */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 text-rose-800 border border-rose-200 rounded-2xl text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="font-semibold">{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span className="font-semibold">{successMessage}</span>
        </div>
      )}

      {/* AI Assistant Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-forest-900 to-slate-900 text-white p-6 rounded-3xl shadow-lg border border-emerald-700/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="font-bold text-base flex items-center justify-center md:justify-start">
              <Bot className="w-5 h-5 mr-2 text-emerald-400" /> Gemini AI Surplus Assistant
            </h3>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              Upload a photo or enter brief rough notes. Gemini analyzes visible attributes, suggests standard names, auto-categorizes, and calculates optimal clearance discounts.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAiAssist}
            disabled={isAiLoading}
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-forest-950 text-xs font-black rounded-2xl shadow-md transition flex items-center space-x-2 shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isAiLoading ? 'Analyzing with AI...' : 'Run AI Assist'}</span>
          </button>
        </div>

        {/* AI Suggestions Box (if generated) */}
        {aiSuggestions && (
          <div className="mt-6 pt-5 border-t border-white/10 space-y-3 bg-white/5 p-4 rounded-2xl text-xs">
            <div className="flex items-center justify-between">
              <span className="text-emerald-300 font-bold uppercase tracking-wider text-[10px]">
                AI Analysis Report ({aiSuggestions.ai_engine})
              </span>
              <span className="text-[10px] text-slate-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                Verified Structured Output
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-200">
              <div>
                <strong className="text-white">Suggested Name:</strong> {aiSuggestions.suggested_name}
              </div>
              <div>
                <strong className="text-white">Suggested Category:</strong> {aiSuggestions.category}
              </div>
              <div>
                <strong className="text-white">Suggested Discount:</strong> {aiSuggestions.suggested_discount_percent}% (Est. ₹{aiSuggestions.suggested_discounted_price})
              </div>
            </div>

            {aiSuggestions.missing_information?.length > 0 && (
              <div className="text-amber-300 text-[11px] pt-1">
                <strong>Attention:</strong> {aiSuggestions.missing_information.join(' • ')}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Listing Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-sm space-y-8">
        {/* Photo Upload Area */}
        <div>
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
            Product Photograph
          </label>
          <div className="mt-1 flex flex-col sm:flex-row items-center gap-6">
            <div className="w-36 h-36 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0 relative group">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-3">
                  <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-1" />
                  <span className="text-[10px] text-slate-400 block font-medium">Select image</span>
                </div>
              )}
            </div>

            <div className="space-y-2 text-xs text-slate-600 flex-1">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
                className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-forest-800 file:text-white hover:file:bg-forest-900 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400">
                Supports JPG, PNG, WebP up to 5MB. Clear daylight photos get 3x more reservations.
              </p>
              <div className="pt-1">
                <span className="text-[11px] text-slate-500">Or use image URL:</span>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    if (!imageFile) setImagePreview(e.target.value);
                  }}
                  placeholder="https://images.unsplash.com/..."
                  className="mt-1 w-full text-xs px-3 py-1.5 rounded-lg border border-slate-200"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Basic Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Product Title *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sourdough Artisan Loaf (Pack of 2)"
              className="w-full text-sm px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-slate-300 bg-slate-50 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Packaging Unit
            </label>
            <input
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="pack, box, kg, portion"
              className="w-full text-xs px-4 py-3 rounded-xl border border-slate-300"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Product Description & Condition *
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe freshness, ingredients, packaging, and reason for surplus clearance..."
              className="w-full text-xs p-4 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed"
            />
          </div>
        </div>

        {/* Pricing & Stock */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-200">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Original MRP (₹) *
            </label>
            <input
              type="number"
              required
              min="1"
              value={originalPrice}
              onChange={(e) => setOriginalPrice(e.target.value)}
              placeholder="e.g. 250"
              className="w-full text-sm font-bold px-4 py-2.5 rounded-xl border border-slate-300 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2">
              Surplus Price (₹) *
            </label>
            <input
              type="number"
              required
              min="1"
              value={discountedPrice}
              onChange={(e) => setDiscountedPrice(e.target.value)}
              placeholder="e.g. 110"
              className="w-full text-sm font-bold text-emerald-700 px-4 py-2.5 rounded-xl border border-emerald-300 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Stock Quantity *
            </label>
            <input
              type="number"
              required
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full text-sm font-bold px-4 py-2.5 rounded-xl border border-slate-300 bg-white"
            />
          </div>
        </div>

        {/* Pickup and Timing */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Pickup Location & Counter Address *
            </label>
            <input
              type="text"
              required
              value={pickupLocation}
              onChange={(e) => setPickupLocation(e.target.value)}
              placeholder="e.g. Shop 14, Central Mall Arcade, GS Road, Christian Basti, Guwahati"
              className="w-full text-xs px-4 py-3 rounded-xl border border-slate-300"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Pickup Deadline (Availability End) *
            </label>
            <input
              type="datetime-local"
              required
              value={pickupEnd}
              onChange={(e) => setPickupEnd(e.target.value)}
              className="w-full text-xs px-4 py-2.5 rounded-xl border border-slate-300 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Best Before / Expiry Date
            </label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full text-xs px-4 py-2.5 rounded-xl border border-slate-300 bg-white"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Hygiene & Food Safety Notes *
            </label>
            <textarea
              rows={2}
              value={safetyNotes}
              onChange={(e) => setSafetyNotes(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-slate-300 text-slate-700"
            />
          </div>

          {/* Donation Eligibility Toggle */}
          <div className="sm:col-span-2 flex items-center space-x-3 p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200">
            <input
              type="checkbox"
              id="donationToggle"
              checked={isEligibleForDonation}
              onChange={(e) => setIsEligibleForDonation(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
            />
            <label htmlFor="donationToggle" className="text-xs text-emerald-950 font-medium cursor-pointer">
              <strong>Make uncollected items eligible for verified NGO donation</strong> if not reserved by closing time.
            </label>
          </div>
        </div>

        {/* Quality Checker Button & Pre-flight results */}
        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            type="button"
            onClick={handleQualityCheck}
            className="text-xs font-bold text-slate-600 hover:text-emerald-700 flex items-center space-x-1"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Check Listing Quality Score</span>
          </button>

          {qualityReport && (
            <div className="text-xs flex items-center space-x-2">
              <span className="font-bold text-slate-700">Quality Score:</span>
              <span
                className={`font-black px-2.5 py-0.5 rounded-full ${
                  qualityReport.quality_score >= 80
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {qualityReport.quality_score} / 100
              </span>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-slate-200">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-forest-800 hover:bg-forest-900 disabled:opacity-50 text-white font-bold rounded-2xl text-sm shadow-lg hover:shadow-xl transition flex items-center justify-center space-x-2"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>{isSubmitting ? 'Publishing Surplus Listing...' : 'Publish Surplus Product Listing'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
