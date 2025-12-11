const Upload = () => {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Upload Receipt
        </h2>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-indigo-500 transition-colors cursor-pointer">
          <svg
            className="w-16 h-16 text-gray-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p className="text-lg font-medium text-gray-900 mb-2">
            Drop your receipt here
          </p>
          <p className="text-sm text-gray-500 mb-4">
            or click to browse files
          </p>
          <p className="text-xs text-gray-400">
            Supports JPG, PNG, PDF (max 5MB)
          </p>
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-900 mb-3">
            How it works:
          </h3>
          <ol className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mr-3 mt-0.5">
                1
              </span>
              <span>Upload a photo or scan of your receipt</span>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mr-3 mt-0.5">
                2
              </span>
              <span>
                Our OCR technology extracts merchant, amount, and date
              </span>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mr-3 mt-0.5">
                3
              </span>
              <span>
                Transaction is automatically categorized and added to your
                records
              </span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default Upload;

