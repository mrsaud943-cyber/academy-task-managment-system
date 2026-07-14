import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../service/api.js";
import {
  ArrowLeft,
  Trophy,
  Medal,
  ChevronUp,
  ChevronDown,
  Filter,
  ArrowUpDown,
  Crown,
  Star,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Search,
  User,
  Loader2,
  Award,
  Target,
  BarChart3,
  CheckCircle2,
  Hash,
  Users,
} from "lucide-react";

const RankingEmployee = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalEmployees: 0,
    limit: 10,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [filters, setFilters] = useState({
    filterBy: "marks",
    sortOrder: "desc",
  });
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchRankings();
  }, [pagination.currentPage, filters, limit, searchTerm]);

  const fetchRankings = async () => {
    try {
      setLoading(true);
      const response = await api.get("/ranking/rankings", {
        params: {
          page: pagination.currentPage,
          limit: limit,
          filterBy: filters.filterBy,
          sortOrder: filters.sortOrder,
          search: searchTerm,
        },
      });

      if (response.data.success) {
        setEmployees(response.data.data);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error("Error fetching rankings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilterBy) => {
    setFilters((prev) => ({
      ...prev,
      filterBy: newFilterBy,
      sortOrder: "desc",
    }));
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handleSortChange = (newSortOrder) => {
    setFilters((prev) => ({
      ...prev,
      sortOrder: newSortOrder,
    }));
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, currentPage: newPage }));
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1)
      return (
        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center border border-amber-300">
          <Crown className="w-5 h-5 text-amber-600" />
        </div>
      );
    if (rank === 2)
      return (
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center border border-gray-300">
          <Medal className="w-5 h-5 text-gray-500" />
        </div>
      );
    if (rank === 3)
      return (
        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center border border-amber-300">
          <Award className="w-5 h-5 text-amber-600" />
        </div>
      );
    return (
      <div className="w-10 h-10 rounded-full bg-[#f5f0eb] flex items-center justify-center border border-[#e5ddd5]">
        <span className="text-sm font-bold text-[#8a7a6a]">{rank}</span>
      </div>
    );
  };

  const getRankStyle = (rank) => {
    if (rank === 1) return "bg-amber-50 border-amber-200";
    if (rank === 2) return "bg-gray-50 border-gray-200";
    if (rank === 3) return "bg-amber-50 border-amber-200";
    return "bg-[#faf7f3] border-[#e5ddd5]";
  };

  const getMarksColor = (marks) => {
    if (marks >= 80) return "text-emerald-600";
    if (marks >= 60) return "text-blue-600";
    if (marks >= 40) return "text-amber-600";
    return "text-red-600";
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-[#2c1810] animate-spin" />
        <p className="text-[#8a7a6a] text-sm">Loading rankings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f0eb] p-3 sm:p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-[#faf7f3] border border-[#e5ddd5] rounded-xl overflow-hidden">
          <div className="p-4 sm:p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate("/layout/desboards")}
                  className="p-2 hover:bg-[#f5f0eb] rounded-lg transition text-[#8a7a6a] hover:text-[#2c1810] border border-transparent hover:border-[#e5ddd5]"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-xl sm:text-2xl font-semibold text-[#2c1810] flex items-center gap-2">
                    <Trophy className="w-6 h-6 text-amber-600" />
                    Employee Rankings
                  </h1>
                  <p className="text-sm text-[#8a7a6a] mt-0.5">
                    Total Employees: {pagination.totalEmployees}
                  </p>
                </div>
              </div>
            </div>

            {/* Search & Filters */}
            <div className="bg-[#f5f0eb] border border-[#e5ddd5] rounded-xl p-4 mb-6">
              <div className="flex flex-col gap-4">
                <div className="relative">
                  <Search className="w-4 h-4 text-[#8a7a6a] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by employee name or email..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setPagination((prev) => ({ ...prev, currentPage: 1 }));
                    }}
                    className="w-full bg-[#faf7f3] border border-[#e5ddd5] focus:border-[#2c1810] focus:ring-1 focus:ring-[#2c1810] text-[#2c1810] placeholder-[#8a7a6a] rounded-lg pl-10 pr-4 py-2.5 text-sm outline-none transition-colors"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 text-[#8a7a6a]">
                    <Filter className="w-4 h-4" />
                    <span className="text-sm font-medium">Filter By:</span>
                  </div>

                  <button
                    onClick={() => handleFilterChange("marks")}
                    className={`px-4 py-1.5 rounded-lg font-medium text-sm transition-all ${
                      filters.filterBy === "marks"
                        ? "bg-[#2c1810] text-white shadow-md shadow-[#2c1810]/20"
                        : "bg-[#faf7f3] text-[#8a7a6a] hover:text-[#2c1810] border border-[#e5ddd5]"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5" />
                      Total Marks
                    </div>
                  </button>
                  <button
                    onClick={() => handleFilterChange("percentage")}
                    className={`px-4 py-1.5 rounded-lg font-medium text-sm transition-all ${
                      filters.filterBy === "percentage"
                        ? "bg-[#2c1810] text-white shadow-md shadow-[#2c1810]/20"
                        : "bg-[#faf7f3] text-[#8a7a6a] hover:text-[#2c1810] border border-[#e5ddd5]"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <BarChart3 className="w-3.5 h-3.5" />
                      Percentage
                    </div>
                  </button>

                  <div className="w-px h-6 bg-[#e5ddd5]"></div>

                  <div className="flex items-center gap-2">
                    <ArrowUpDown className="w-4 h-4 text-[#8a7a6a]" />
                    <span className="text-sm text-[#8a7a6a]">Sort:</span>
                    <button
                      onClick={() => handleSortChange("desc")}
                      className={`px-3 py-1.5 rounded-lg font-medium text-sm transition-all flex items-center gap-1 ${
                        filters.sortOrder === "desc"
                          ? "bg-[#2c1810] text-white shadow-md shadow-[#2c1810]/20"
                          : "bg-[#faf7f3] text-[#8a7a6a] hover:text-[#2c1810] border border-[#e5ddd5]"
                      }`}
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                      High to Low
                    </button>
                    <button
                      onClick={() => handleSortChange("asc")}
                      className={`px-3 py-1.5 rounded-lg font-medium text-sm transition-all flex items-center gap-1 ${
                        filters.sortOrder === "asc"
                          ? "bg-[#2c1810] text-white shadow-md shadow-[#2c1810]/20"
                          : "bg-[#faf7f3] text-[#8a7a6a] hover:text-[#2c1810] border border-[#e5ddd5]"
                      }`}
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                      Low to High
                    </button>
                  </div>

                  <div className="w-px h-6 bg-[#e5ddd5]"></div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[#8a7a6a]">Show:</span>
                    <select
                      value={limit}
                      onChange={(e) => {
                        setLimit(Number(e.target.value));
                        setPagination((prev) => ({ ...prev, currentPage: 1 }));
                      }}
                      className="bg-[#faf7f3] border border-[#e5ddd5] focus:border-[#2c1810] focus:ring-1 focus:ring-[#2c1810] text-[#2c1810] rounded-lg px-3 py-1.5 text-sm outline-none transition-colors"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Filters Display */}
            <div className="mb-4 flex items-center gap-2 flex-wrap">
              <span className="text-xs text-[#8a7a6a]">Active Filters:</span>
              <span className="px-2.5 py-1 bg-[#2c1810]/10 text-[#2c1810] text-xs font-medium rounded-full border border-[#2c1810]/20">
                {filters.filterBy === "marks" ? "Total Marks" : "Percentage"} -{" "}
                {filters.sortOrder === "desc" ? "High to Low" : "Low to High"}
              </span>
              {searchTerm && (
                <span className="px-2.5 py-1 bg-[#f5f0eb] text-[#8a7a6a] text-xs font-medium rounded-full border border-[#e5ddd5]">
                  Search: "{searchTerm}"
                </span>
              )}
            </div>

            {/* Employees List */}
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="bg-[#faf7f3] border border-[#e5ddd5] rounded-xl p-5 animate-pulse">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#e5ddd5] rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-[#e5ddd5] rounded w-1/4"></div>
                        <div className="h-3 bg-[#e5ddd5] rounded w-1/3"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : employees.length === 0 ? (
              <div className="bg-[#faf7f3] border border-[#e5ddd5] rounded-xl p-12 text-center">
                <User className="w-16 h-16 text-[#8a7a6a] mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-[#8a7a6a] mb-2">
                  No Employees Found
                </h3>
                <p className="text-[#8a7a6a]">
                  No performance data available for the selected criteria.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {employees.map((employee) => (
                  <div
                    key={employee.userId}
                    className={`bg-[#faf7f3] border rounded-xl p-5 transition-all hover:border-[#d4c8bc] ${getRankStyle(
                      employee.rank
                    )}`}
                  >
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                      <div className="flex items-center justify-center">
                        {getRankIcon(employee.rank)}
                      </div>

                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-12 h-12 bg-[#2c1810] rounded-full flex items-center justify-center text-white text-lg font-bold">
                          {employee.user?.name?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <div>
                          <h3 className="font-bold text-[#2c1810] text-lg">
                            {employee.user?.name || "Unknown Employee"}
                          </h3>
                          <p className="text-sm text-[#8a7a6a]">
                            {employee.user?.email || ""}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="px-2 py-0.5 bg-[#2c1810]/10 text-[#2c1810] text-xs font-semibold rounded-full border border-[#2c1810]/20">
                              {employee.user?.role || "Employee"}
                            </span>
                            <span
                              className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${
                                employee.user?.isActive
                                  ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                                  : "bg-red-50 text-red-600 border-red-200"
                              }`}
                            >
                              {employee.user?.isActive ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto justify-between md:justify-end">
                        <div className="text-center">
                          <div className="flex items-center gap-1 justify-center">
                            <Star className="w-4 h-4 text-amber-500" />
                            <span className="text-xl font-bold text-[#2c1810]">
                              {employee.totalMarks}
                            </span>
                          </div>
                          <p className="text-xs text-[#8a7a6a] mt-1">Total Marks</p>
                        </div>

                        <div className="text-center">
                          <div className="flex items-center gap-1 justify-center">
                            <Target className="w-4 h-4 text-emerald-500" />
                            <span
                              className={`text-xl font-bold ${getMarksColor(
                                employee.percentage
                              )}`}
                            >
                              {employee.percentage}%
                            </span>
                          </div>
                          <p className="text-xs text-[#8a7a6a] mt-1">Percentage</p>
                        </div>

                        <div className="text-center">
                          <div className="flex items-center gap-1 justify-center">
                            <Hash className="w-4 h-4 text-[#2c1810]" />
                            <span className="text-xl font-bold text-[#2c1810]">
                              {employee.taskCount}
                            </span>
                          </div>
                          <p className="text-xs text-[#8a7a6a] mt-1">Tasks</p>
                        </div>

                        <div className="text-center">
                          <div className="flex items-center gap-1 justify-center">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            <span className="text-xl font-bold text-emerald-600">
                              {employee.completedTasks}
                            </span>
                          </div>
                          <p className="text-xs text-[#8a7a6a] mt-1">Completed</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {!loading && employees.length > 0 && (
              <div className="mt-6 bg-[#f5f0eb] border border-[#e5ddd5] rounded-xl p-4">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <p className="text-sm text-[#8a7a6a]">
                    Showing{" "}
                    {(pagination.currentPage - 1) * pagination.limit + 1} to{" "}
                    {Math.min(
                      pagination.currentPage * pagination.limit,
                      pagination.totalEmployees
                    )}{" "}
                    of {pagination.totalEmployees} employees
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={!pagination.hasPrevPage}
                      className={`p-2 rounded-lg transition-all ${
                        pagination.hasPrevPage
                          ? "bg-[#faf7f3] hover:bg-[#f5f0eb] text-[#2c1810] border border-[#e5ddd5]"
                          : "bg-[#f5f0eb] text-[#8a7a6a] cursor-not-allowed border border-[#e5ddd5]"
                      }`}
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-1">
                      {[...Array(pagination.totalPages)].map((_, i) => {
                        const pageNum = i + 1;
                        if (
                          pageNum === 1 ||
                          pageNum === pagination.totalPages ||
                          (pageNum >= pagination.currentPage - 1 &&
                            pageNum <= pagination.currentPage + 1)
                        ) {
                          return (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              className={`w-10 h-10 rounded-lg font-medium text-sm transition-all ${
                                pagination.currentPage === pageNum
                                  ? "bg-[#2c1810] text-white shadow-md shadow-[#2c1810]/20"
                                  : "bg-[#faf7f3] text-[#8a7a6a] hover:text-[#2c1810] border border-[#e5ddd5] hover:border-[#d4c8bc]"
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        } else if (
                          pageNum === pagination.currentPage - 2 ||
                          pageNum === pagination.currentPage + 2
                        ) {
                          return (
                            <span key={pageNum} className="px-2 text-[#8a7a6a]">
                              ...
                            </span>
                          );
                        }
                        return null;
                      })}
                    </div>

                    <button
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={!pagination.hasNextPage}
                      className={`p-2 rounded-lg transition-all ${
                        pagination.hasNextPage
                          ? "bg-[#faf7f3] hover:bg-[#f5f0eb] text-[#2c1810] border border-[#e5ddd5]"
                          : "bg-[#f5f0eb] text-[#8a7a6a] cursor-not-allowed border border-[#e5ddd5]"
                      }`}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RankingEmployee;