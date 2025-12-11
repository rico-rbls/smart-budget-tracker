import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TransactionCard from "../components/TransactionCard";
import { fetchTransactions, deleteTransaction } from "../services/transactions";

const Transactions = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [filters, setFilters] = useState({
    start_date: "",
    end_date: "",
    category_id: "",
    merchant: "",
    sort_by: "date",
    sort_order: "desc",
    limit: 10,
    offset: 0,
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);

  const categories = [
    { id: 1, name: "Food & Dining" },
    { id: 2, name: "Transportation" },
    { id: 3, name: "Shopping" },
    { id: 4, name: "Entertainment" },
    { id: 5, name: "Healthcare" },
    { id: 6, name: "Utilities" },
    { id: 7, name: "Groceries" },
    { id: 8, name: "Other" },
  ];

  useEffect(() => {
    loadTransactions();
  }, [filters]);

  const loadTransactions = async () => {
    setLoading(true);
    setError(null);

    const result = await fetchTransactions(filters);

    if (result.success) {
      setTransactions(result.data.transactions || []);
      setTotalTransactions(result.data.total || 0);
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      offset: 0,
    }));
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    setFilters((prev) => ({
      ...prev,
      offset: (newPage - 1) * prev.limit,
    }));
  };

  const handleEdit = (transaction) => {
    // For now, just log - full edit modal can be added later
    console.log("Edit transaction:", transaction);
  };

  const handleDelete = async (transactionId) => {
    const result = await deleteTransaction(transactionId);

    if (result.success) {
      loadTransactions();
    } else {
      setError(result.error);
    }
  };

  const clearFilters = () => {
    setFilters({
      start_date: "",
      end_date: "",
      category_id: "",
      merchant: "",
      sort_by: "date",
      sort_order: "desc",
      limit: 10,
      offset: 0,
    });
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalTransactions / filters.limit);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Transactions</h2>
        <button
          onClick={() => navigate("/upload")}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
        >
          + Upload Receipt
        </button>
      </div>

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

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          <button
            onClick={clearFilters}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Clear All
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={filters.category_id}
              onChange={(e) =>
                handleFilterChange("category_id", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <select
              value={`${filters.sort_by}-${filters.sort_order}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split("-");
                setFilters((prev) => ({
                  ...prev,
                  sort_by: sortBy,
                  sort_order: sortOrder,
                }));
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="date-desc">Date (Newest)</option>
              <option value="date-asc">Date (Oldest)</option>
              <option value="amount-desc">Amount (High to Low)</option>
              <option value="amount-asc">Amount (Low to High)</option>
              <option value="merchant-asc">Merchant (A-Z)</option>
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={filters.start_date}
              onChange={(e) => handleFilterChange("start_date", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={filters.end_date}
              onChange={(e) => handleFilterChange("end_date", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Search */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Merchant
          </label>
          <input
            type="text"
            value={filters.merchant}
            onChange={(e) => handleFilterChange("merchant", e.target.value)}
            placeholder="Search by merchant name..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Transactions List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600">Loading transactions...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
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
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <p className="text-gray-500 text-lg font-medium">
              No transactions found
            </p>
            <p className="text-sm text-gray-400 mt-1">
              {filters.merchant || filters.category_id || filters.start_date
                ? "Try adjusting your filters"
                : "Start by uploading a receipt"}
            </p>
            <button
              onClick={() => navigate("/upload")}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              Upload Receipt
            </button>
          </div>
        ) : (
          <>
            {/* Transaction Cards */}
            {transactions.map((transaction) => (
              <TransactionCard
                key={transaction.id}
                transaction={transaction}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Showing {(currentPage - 1) * filters.limit + 1} to{" "}
                    {Math.min(currentPage * filters.limit, totalTransactions)}{" "}
                    of {totalTransactions} transactions
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <div className="flex gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(
                          (page) =>
                            page === 1 ||
                            page === totalPages ||
                            Math.abs(page - currentPage) <= 1
                        )
                        .map((page, index, array) => (
                          <div key={page} className="flex items-center">
                            {index > 0 && array[index - 1] !== page - 1 && (
                              <span className="px-2 text-gray-400">...</span>
                            )}
                            <button
                              onClick={() => handlePageChange(page)}
                              className={`px-3 py-1 rounded-lg ${
                                currentPage === page
                                  ? "bg-indigo-600 text-white"
                                  : "border border-gray-300 hover:bg-gray-50"
                              }`}
                            >
                              {page}
                            </button>
                          </div>
                        ))}
                    </div>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Transactions;
