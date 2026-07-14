import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../service/api.js";
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
  Circle,
  Hash,
} from "lucide-react";

const EmployeesRanking = () => {
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
        <div className="w-10 h-10 rounded-full bg-[var(--warning)]/20 flex items-center justify-center border border-[var(--warning)]/30">
          <Crown className="w-5 h-5 text-[var(--warning)]" />
        </div>
      );
    if (rank === 2)
      return (
        <div className="w-10 h-10 rounded-full bg-[var(--text-muted)]/20 flex items-center justify-center border border-[var(--text-muted)]/30">
          <Medal className="w-5 h-5 text-[var(--text-muted)]" />
        </div>
      );
    if (rank === 3)
      return (
        <div className="w-10 h-10 rounded-full bg-[var(--accent-light)]/20 flex items-center justify-center border border-[var(--accent-light)]/30">
          <Award className="w-5 h-5 text-[var(--accent-light)]" />
        </div>
      );
    return (
      <div className="w-10 h-10 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center border border-[var(--border-color)]">
        <span className="text-sm font-bold text-[var(--text-muted)]">{rank}</span>
      </div>
    );
  };

  const getRankStyle = (rank) => {
    if (rank === 1) return "bg-[var(--warning)]/5 border-[var(--warning)]/20";
    if (rank === 2) return "bg-[var(--text-muted)]/5 border-[var(--text-muted)]/20";
    if (rank === 3) return "bg-[var(--accent-light)]/5 border-[var(--accent-light)]/20";
    return "bg-[var(--bg-secondary)] border-[var(--border-color)]";
  };

  const getMarksColor = (marks) => {
    if (marks >= 80) return "text-[var(--success)]";
    if (marks >= 60) return "text-[var(--accent-primary)]";
    if (marks >= 40) return "text-[var(--warning)]";
    return "text-[var(--danger)]";
  };

  return (
    <div className="ui-card">
      <div className="p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="p-2 hover:bg-[var(--bg-hover)] rounded-lg transition text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-transparent hover:border-[var(--border-color)]"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-[var(--text-primary)] flex items-center gap-2">
                <Trophy className="w-6 h-6 text-[var(--warning)]" />
                Employee Rankings
              </h1>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                Total Employees: {pagination.totalEmployees}
              </p>
            </div>
          </div>
        </div>

        {/* Search & Filters Section */}
        <div className="ui-card p-4 mb-6">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by employee name or email..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPagination((prev) => ({ ...prev, currentPage: 1 }));
                }}
                className="ui-input w-full pl-10 pr-4 text-sm"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-[var(--text-muted)]">
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">Filter By:</span>
              </div>

              <button
                onClick={() => handleFilterChange("marks")}
                className={`px-4 py-1.5 rounded-lg font-medium text-sm transition-all ${
                  filters.filterBy === "marks"
                    ? "ui-btn ui-btn-primary"
                    : "ui-btn"
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
                    ? "ui-btn ui-btn-primary"
                    : "ui-btn"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5" />
                  Percentage
                </div>
              </button>

              <div className="w-px h-6 bg-[var(--border-color)]"></div>

              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-[var(--text-muted)]" />
                <span className="text-sm text-[var(--text-muted)]">Sort:</span>
                <button
                  onClick={() => handleSortChange("desc")}
                  className={`px-3 py-1.5 rounded-lg font-medium text-sm transition-all flex items-center gap-1 ${
                    filters.sortOrder === "desc"
                      ? "ui-btn ui-btn-primary"
                      : "ui-btn"
                  }`}
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                  High to Low
                </button>
                <button
                  onClick={() => handleSortChange("asc")}
                  className={`px-3 py-1.5 rounded-lg font-medium text-sm transition-all flex items-center gap-1 ${
                    filters.sortOrder === "asc"
                      ? "ui-btn ui-btn-primary"
                      : "ui-btn"
                  }`}
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                  Low to High
                </button>
              </div>

              <div className="w-px h-6 bg-[var(--border-color)]"></div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-[var(--text-muted)]">Show:</span>
                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setPagination((prev) => ({ ...prev, currentPage: 1 }));
                  }}
                  className="ui-input text-sm"
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
          <span className="text-xs text-[var(--text-muted)]">Active Filters:</span>
          <span className="px-2.5 py-1 bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] text-xs font-medium rounded-full border border-[var(--accent-primary)]/20">
            {filters.filterBy === "marks" ? "Total Marks" : "Percentage"} -{" "}
            {filters.sortOrder === "desc" ? "High to Low" : "Low to High"}
          </span>
          {searchTerm && (
            <span className="px-2.5 py-1 bg-[var(--bg-secondary)] text-[var(--text-muted)] text-xs font-medium rounded-full border border-[var(--border-color)]">
              Search: "{searchTerm}"
            </span>
          )}
        </div>

        {/* Employees List */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="ui-card p-5 animate-pulse"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[var(--bg-hover)] rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-[var(--bg-hover)] rounded w-1/4"></div>
                    <div className="h-3 bg-[var(--bg-hover)] rounded w-1/3"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : employees.length === 0 ? (
          <div className="ui-card p-12 text-center">
            <User className="w-16 h-16 text-[var(--text-muted)] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[var(--text-secondary)] mb-2">
              No Employees Found
            </h3>
            <p className="text-[var(--text-muted)]">
              No performance data available for the selected criteria.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {employees.map((employee) => (
              <div
                key={employee.userId}
                className={`ui-card p-5 transition-all hover:border-[var(--border-hover)] ${getRankStyle(
                  employee.rank
                )}`}
              >
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                  <div className="flex items-center justify-center">
                    {getRankIcon(employee.rank)}
                  </div>

                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-hover)] rounded-full flex items-center justify-center text-lg font-bold text-white">
                      {employee.user?.name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div>
                      <h3 className="font-bold text-[var(--text-primary)] text-lg">
                        {employee.user?.name || "Unknown Employee"}
                      </h3>
                      <p className="text-sm text-[var(--text-secondary)]">
                        {employee.user?.email || ""}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] text-xs font-semibold rounded-full border border-[var(--accent-primary)]/20">
                          {employee.user?.role || "Employee"}
                        </span>
                        <span
                          className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${
                            employee.user?.isActive
                              ? "bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/20"
                              : "bg-[var(--danger)]/10 text-[var(--danger)] border-[var(--danger)]/20"
                          }`}
                        >
                          {employee.user?.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto justify-between md:justify-end">
                    <div className="text-center">
                      <div className="flex items-center gap-1 justify-center">
                        <Star className="w-4 h-4 text-[var(--warning)]" />
                        <span className="text-xl font-bold text-[var(--text-primary)]">
                          {employee.totalMarks}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-muted)] mt-1">Total Marks</p>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center gap-1 justify-center">
                        <Target className="w-4 h-4 text-[var(--success)]" />
                        <span
                          className={`text-xl font-bold ${getMarksColor(
                            employee.percentage
                          )}`}
                        >
                          {employee.percentage}%
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-muted)] mt-1">Percentage</p>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center gap-1 justify-center">
                        <Hash className="w-4 h-4 text-[var(--accent-primary)]" />
                        <span className="text-xl font-bold text-[var(--text-primary)]">
                          {employee.taskCount}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-muted)] mt-1">Tasks</p>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center gap-1 justify-center">
                        <CheckCircle2 className="w-4 h-4 text-[var(--success)]" />
                        <span className="text-xl font-bold text-[var(--success)]">
                          {employee.completedTasks}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-muted)] mt-1">Completed</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && employees.length > 0 && (
          <div className="mt-6 ui-card p-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm text-[var(--text-muted)]">
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
                      ? "ui-btn"
                      : "bg-[var(--bg-secondary)] text-[var(--text-muted)] cursor-not-allowed border border-[var(--border-color)]"
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
                              ? "ui-btn ui-btn-primary"
                              : "ui-btn"
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
                        <span key={pageNum} className="px-2 text-[var(--text-muted)]">
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
                      ? "ui-btn"
                      : "bg-[var(--bg-secondary)] text-[var(--text-muted)] cursor-not-allowed border border-[var(--border-color)]"
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
  );
};

export default EmployeesRanking;