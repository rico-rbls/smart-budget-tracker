import { useState } from "react";
import PropTypes from "prop-types";
import { formatCurrency } from "../utils/currency";

const TransactionCard = ({ transaction, onEdit, onDelete }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const categoryColors = {
    "Food & Dining": "bg-orange-100 text-orange-800 border-orange-200",
    Transportation: "bg-blue-100 text-blue-800 border-blue-200",
    Shopping: "bg-pink-100 text-pink-800 border-pink-200",
    Entertainment: "bg-purple-100 text-purple-800 border-purple-200",
    Healthcare: "bg-red-100 text-red-800 border-red-200",
    Utilities: "bg-yellow-100 text-yellow-800 border-yellow-200",
    Groceries: "bg-green-100 text-green-800 border-green-200",
    Other: "bg-gray-100 text-gray-800 border-gray-200",
  };

  const categoryIcons = {
    "Food & Dining": "🍔",
    Transportation: "🚗",
    Shopping: "🛍️",
    Entertainment: "🎬",
    Healthcare: "🏥",
    Utilities: "💡",
    Groceries: "🛒",
    Other: "📦",
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(transaction.id);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error("Error deleting transaction:", error);
    } finally {
      setDeleting(false);
    }
  };

  const categoryName = transaction.category_name || "Other";
  const categoryColor = categoryColors[categoryName] || categoryColors.Other;
  const categoryIcon = categoryIcons[categoryName] || categoryIcons.Other;

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4 border border-gray-200">
      <div className="flex items-start justify-between">
        {/* Left Section - Category & Details */}
        <div className="flex items-start gap-3 flex-1">
          {/* Category Icon */}
          <div
            className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl border ${categoryColor}`}
          >
            {categoryIcon}
          </div>

          {/* Transaction Details */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {transaction.merchant_name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`px-2 py-0.5 text-xs font-medium rounded-full border ${categoryColor}`}
              >
                {categoryName}
              </span>
              {transaction.payment_method && (
                <span className="text-xs text-gray-500">
                  • {transaction.payment_method.replace("_", " ")}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {formatDate(transaction.transaction_date)}
            </p>
            {transaction.description && (
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                {transaction.description}
              </p>
            )}
          </div>
        </div>

        {/* Right Section - Amount & Actions */}
        <div className="flex flex-col items-end gap-2 ml-4">
          <p className="text-xl font-bold text-gray-900">
            {formatCurrency(transaction.amount)}
          </p>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(transaction)}
              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              title="Edit transaction"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete transaction"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Delete Transaction?
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this transaction from{" "}
              <span className="font-semibold">{transaction.merchant_name}</span>{" "}
              for {formatCurrency(transaction.amount)}? This action cannot be
              undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

TransactionCard.propTypes = {
  transaction: PropTypes.shape({
    id: PropTypes.number.isRequired,
    merchant_name: PropTypes.string.isRequired,
    amount: PropTypes.number.isRequired,
    transaction_date: PropTypes.string.isRequired,
    category_name: PropTypes.string,
    payment_method: PropTypes.string,
    description: PropTypes.string,
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default TransactionCard;
