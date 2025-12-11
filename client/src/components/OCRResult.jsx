import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { formatCurrency } from "../utils/currency";

const OCRResult = ({ ocrData, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    merchant_name: "",
    amount: "",
    transaction_date: "",
    category_id: "",
    payment_method: "cash",
    description: "",
  });

  const [categories, setCategories] = useState([
    { id: 1, name: "Food & Dining", icon: "🍔" },
    { id: 2, name: "Transportation", icon: "🚗" },
    { id: 3, name: "Shopping", icon: "🛍️" },
    { id: 4, name: "Entertainment", icon: "🎬" },
    { id: 5, name: "Healthcare", icon: "🏥" },
    { id: 6, name: "Utilities", icon: "💡" },
    { id: 7, name: "Groceries", icon: "🛒" },
    { id: 8, name: "Other", icon: "📦" },
  ]);

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (ocrData) {
      setFormData({
        merchant_name: ocrData.merchant_name || "",
        amount: ocrData.amount || "",
        transaction_date:
          ocrData.transaction_date || new Date().toISOString().split("T")[0],
        category_id: ocrData.category_id || "",
        payment_method: ocrData.payment_method || "cash",
        description: ocrData.raw_text || "",
      });
    }
  }, [ocrData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.merchant_name.trim()) {
      newErrors.merchant_name = "Merchant name is required";
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Valid amount is required";
    }

    if (!formData.transaction_date) {
      newErrors.transaction_date = "Transaction date is required";
    }

    if (!formData.category_id) {
      newErrors.category_id = "Please select a category";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      return;
    }

    setSaving(true);
    try {
      await onSave({
        ...formData,
        amount: parseFloat(formData.amount),
        category_id: parseInt(formData.category_id),
      });
    } catch (error) {
      console.error("Error saving transaction:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">
          Review Extracted Data
        </h3>
        <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
          OCR Complete
        </span>
      </div>

      <div className="space-y-4">
        {/* Merchant Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Merchant Name *
          </label>
          <input
            type="text"
            name="merchant_name"
            value={formData.merchant_name}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
              errors.merchant_name ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="e.g., Starbucks, 7-Eleven"
          />
          {errors.merchant_name && (
            <p className="mt-1 text-sm text-red-600">{errors.merchant_name}</p>
          )}
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-500">₱</span>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              step="0.01"
              min="0"
              className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                errors.amount ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="0.00"
            />
          </div>
          {errors.amount && (
            <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
          )}
        </div>

        {/* Transaction Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Transaction Date *
          </label>
          <input
            type="date"
            name="transaction_date"
            value={formData.transaction_date}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
              errors.transaction_date ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.transaction_date && (
            <p className="mt-1 text-sm text-red-600">
              {errors.transaction_date}
            </p>
          )}
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category *
          </label>
          <div className="grid grid-cols-2 gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    category_id: category.id.toString(),
                  }))
                }
                className={`flex items-center gap-2 px-3 py-2 border rounded-lg transition-colors ${
                  formData.category_id === category.id.toString()
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                    : "border-gray-300 hover:border-indigo-300 text-gray-700"
                }`}
              >
                <span className="text-xl">{category.icon}</span>
                <span className="text-sm font-medium">{category.name}</span>
              </button>
            ))}
          </div>
          {errors.category_id && (
            <p className="mt-1 text-sm text-red-600">{errors.category_id}</p>
          )}
        </div>

        {/* Payment Method */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Payment Method
          </label>
          <select
            name="payment_method"
            value={formData.payment_method}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="cash">Cash</option>
            <option value="credit_card">Credit Card</option>
            <option value="debit_card">Debit Card</option>
            <option value="gcash">GCash</option>
            <option value="paymaya">PayMaya</option>
            <option value="bank_transfer">Bank Transfer</option>
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description / Notes
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Additional notes about this transaction..."
          />
        </div>

        {/* OCR Confidence (if available) */}
        {ocrData?.confidence && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-sm text-blue-800">
                OCR Confidence: {ocrData.confidence}% - Please verify the data
                above
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "Saving..." : "Save Transaction"}
        </button>
        <button
          onClick={onCancel}
          disabled={saving}
          className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

OCRResult.propTypes = {
  ocrData: PropTypes.shape({
    merchant_name: PropTypes.string,
    amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    transaction_date: PropTypes.string,
    category_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    payment_method: PropTypes.string,
    raw_text: PropTypes.string,
    confidence: PropTypes.number,
  }),
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default OCRResult;
