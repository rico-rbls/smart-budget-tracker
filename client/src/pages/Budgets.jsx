import { formatCurrency } from "../utils/currency";

const Budgets = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Budgets</h2>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
          + Create Budget
        </button>
      </div>

      {/* Budget Period Selector */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex space-x-4">
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg">
            Monthly
          </button>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
            Weekly
          </button>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
            Yearly
          </button>
        </div>
      </div>

      {/* Budget Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm font-medium text-gray-600">Total Budget</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {formatCurrency(0)}
          </p>
          <p className="text-xs text-gray-500 mt-1">This month</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm font-medium text-gray-600">Total Spent</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {formatCurrency(0)}
          </p>
          <p className="text-xs text-gray-500 mt-1">This month</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm font-medium text-gray-600">Remaining</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {formatCurrency(0)}
          </p>
          <p className="text-xs text-gray-500 mt-1">This month</p>
        </div>
      </div>

      {/* Budgets List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Budget Categories
          </h3>
          <div className="text-center py-12">
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
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-gray-500 text-lg font-medium">No budgets set</p>
            <p className="text-sm text-gray-400 mt-1">
              Create your first budget to start tracking your spending
            </p>
            <button className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
              Create Budget
            </button>
          </div>
        </div>
      </div>

      {/* Budget Alerts Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start">
          <svg
            className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0"
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
            <h4 className="text-sm font-semibold text-blue-900 mb-1">
              Budget Alerts
            </h4>
            <p className="text-sm text-blue-800">
              You'll receive alerts when you reach 80%, 100%, and 120% of your
              budget limits to help you stay on track.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Budgets;
