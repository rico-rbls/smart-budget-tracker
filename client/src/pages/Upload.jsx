import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ReceiptUploader from "../components/ReceiptUploader";
import OCRResult from "../components/OCRResult";
import { createTransaction } from "../services/transactions";

const Upload = () => {
  const navigate = useNavigate();
  const [ocrData, setOcrData] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleUploadSuccess = (data) => {
    setError(null);
    setSuccess("Receipt uploaded and processed successfully!");
    setOcrData(data);

    // Clear success message after 3 seconds
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleUploadError = (errorMessage) => {
    setError(errorMessage);
    setSuccess(null);

    // Clear error message after 5 seconds
    setTimeout(() => setError(null), 5000);
  };

  const handleSaveTransaction = async (transactionData) => {
    const result = await createTransaction(transactionData);

    if (result.success) {
      setSuccess("Transaction saved successfully!");
      setOcrData(null);

      // Redirect to transactions page after 2 seconds
      setTimeout(() => {
        navigate("/transactions");
      }, 2000);
    } else {
      setError(result.error || "Failed to save transaction");
    }
  };

  const handleCancel = () => {
    setOcrData(null);
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Upload Receipt</h2>
        <button
          onClick={() => navigate("/transactions")}
          className="px-4 py-2 text-indigo-600 hover:text-indigo-700 font-medium"
        >
          View All Transactions →
        </button>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-sm font-medium text-green-800">
              {success}
            </span>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-sm font-medium text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Upload Instructions */}
      {!ocrData && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg
              className="w-6 h-6 text-blue-600 shrink-0 mt-0.5"
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
            <div>
              <h3 className="text-sm font-semibold text-blue-900 mb-1">
                How to upload receipts
              </h3>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>Take a clear photo of your receipt</li>
                <li>Ensure the text is readable and not blurry</li>
                <li>Supported formats: JPG, PNG, PDF (max 5MB)</li>
                <li>
                  Our OCR will automatically extract merchant, amount, and date
                </li>
                <li>Review and edit the extracted data before saving</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Uploader or OCR Result */}
      {!ocrData ? (
        <ReceiptUploader
          onUploadSuccess={handleUploadSuccess}
          onUploadError={handleUploadError}
        />
      ) : (
        <OCRResult
          ocrData={ocrData}
          onSave={handleSaveTransaction}
          onCancel={handleCancel}
        />
      )}

      {/* Recent Uploads Info */}
      {!ocrData && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            What happens after upload?
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold shrink-0">
                1
              </div>
              <div>
                <h4 className="font-medium text-gray-900">OCR Processing</h4>
                <p className="text-sm text-gray-600 mt-1">
                  We extract merchant name, amount, and date from your receipt
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold shrink-0">
                2
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Review & Edit</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Verify the extracted data and make corrections if needed
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold shrink-0">
                3
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Save Transaction</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Transaction is saved and appears in your transaction list
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Upload;
