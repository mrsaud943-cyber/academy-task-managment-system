import React, { useState, useEffect, useCallback, useMemo } from "react";
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
} from "lucide-react";
import toast, { Toaster } from 'react-hot-toast';

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

  const fetchRankings = useCallback(async () => {
    setLoading(true);
    try {
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
    } catch {
      toast.error("Failed to fetch rankings");
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, filters, limit, searchTerm]);

  const handleFilterChange = useCallback((newFilterBy) => {
    setFilters((prev) => ({
      ...prev,
      filterBy: newFilterBy,
      sortOrder: "desc",
    }));
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  }, []);

  const handleSortChange = useCallback((newSortOrder) => {
    setFilters((prev) => ({
      ...prev,
      sortOrder: newSortOrder,
    }));
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  }, []);

  const handlePageChange = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, currentPage: newPage }));
    }
  }, [pagination.totalPages]);

  const getRankIcon = useCallback((rank) => {
    if (rank === 1) {
      return (
        <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
          <Crown className="w-4 h-4 text-amber-500" />
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="w-8 h-8 rounded-full bg-gray-400/20 flex items-center justify-center border border-gray-400/30">
          <Medal className="w-4 h-4 text-gray-400" />
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="w-8 h-8 rounded-full bg-amber-700/20 flex items-center justify-center border border-amber-700/30">
          <Award className="w-4 h-4 text-amber-700" />
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center border border-[var(--border-color)]">
        <span className="text-xs font-bold text-[var(--text-muted)]">{rank}</span>
      </div>
    );
  }, []);

  const getRankStyle = useCallback((rank) => {
    if (rank === 1) return "border-l-4 border-l-amber-500 bg-amber-50/50";
    if (rank === 2) return "border-l-4 border-l-gray-400 bg-gray-50/50";
    if (rank === 3) return "border-l-4 border-l-amber-700 bg-amber-50/30";
    return "border-l-4 border-l-transparent";
  }, []);

  const getMarksColor = useCallback((marks) => {
    if (marks >= 80) return "text-emerald-600";
    if (marks >= 60) return "text-blue-600";
    if (marks >= 40) return "text-amber-600";
    return "text-red-600";
  }, []);

  const renderPaginationButtons = useMemo(() => {
    const buttons = [];
    const totalPages = pagination.totalPages;
    const currentPage = pagination.currentPage;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
        buttons.push(i);
      } else if (i === currentPage - 2 || i === currentPage + 2) {
        buttons.push('...');
      }
    }

    return buttons;
  }, [pagination.totalPages, pagination.currentPage]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="relative">
          <Loader2 className="w-10 h-10 text-[var(--accent-primary)] animate-spin" />
          <div className="absolute inset-0 w-10 h-10 rounded-full border-2 border-[var(--accent-primary)] opacity-20 animate-ping" />
        </div>
        <p className="text-[var(--text-secondary)] text-sm animate-pulse">Loading rankings...</p>
      </div>
    );
  }

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
          },
          success: {
            iconTheme: { primary: 'var(--success)', secondary: 'var(--text-inverse)' },
          },
          error: {
            iconTheme: { primary: 'var(--danger)', secondary: 'var(--text-inverse)' },
          },
        }}
      />
      <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] overflow-hidden">
        {/* Header */}
        <div className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)] px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => navigate("/layout/desboards")}
                className="p-1.5 hover:bg-[var(--bg-hover)] rounded-lg transition text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500" />
                <div>
                  <h1 className="text-base sm:text-lg font-semibold text-[var(--text-primary)]">Employee Rankings</h1>
                  <p className="text-xs text-[var(--text-muted)]">{pagination.totalEmployees} employees</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-3 sm:p-4 md:p-5">
          {/* Search & Filters - Compact */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search employee..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPagination((prev) => ({ ...prev, currentPage: 1 }));
                }}
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] text-[var(--text-primary)] placeholder-[var(--text-muted)] rounded-lg pl-8 pr-3 py-1.5 text-sm outline-none transition-colors"
              />
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <Filter className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              <button
                onClick={() => handleFilterChange("marks")}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                  filters.filterBy === "marks"
                    ? "bg-[var(--accent-primary)] text-[var(--text-inverse)]"
                    : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] border border-[var(--border-color)]"
                }`}
              >
                <span className="flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  Marks
                </span>
              </button>
              <button
                onClick={() => handleFilterChange("percentage")}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                  filters.filterBy === "percentage"
                    ? "bg-[var(--accent-primary)] text-[var(--text-inverse)]"
                    : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] border border-[var(--border-color)]"
                }`}
              >
                <span className="flex items-center gap-1">
                  <BarChart3 className="w-3 h-3" />
                  Avg %
                </span>
              </button>

              <div className="w-px h-5 bg-[var(--border-color)] mx-1 hidden sm:block"></div>

              <button
                onClick={() => handleSortChange("desc")}
                className={`px-2 py-1 rounded-md text-xs font-medium transition flex items-center gap-0.5 ${
                  filters.sortOrder === "desc"
                    ? "bg-[var(--accent-primary)] text-[var(--text-inverse)]"
                    : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] border border-[var(--border-color)]"
                }`}
              >
                <ChevronDown className="w-3 h-3" />
                High
              </button>
              <button
                onClick={() => handleSortChange("asc")}
                className={`px-2 py-1 rounded-md text-xs font-medium transition flex items-center gap-0.5 ${
                  filters.sortOrder === "asc"
                    ? "bg-[var(--accent-primary)] text-[var(--text-inverse)]"
                    : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] border border-[var(--border-color)]"
                }`}
              >
                <ChevronUp className="w-3 h-3" />
                Low
              </button>

              <div className="w-px h-5 bg-[var(--border-color)] mx-1 hidden sm:block"></div>

              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPagination((prev) => ({ ...prev, currentPage: 1 }));
                }}
                className="bg-[var(--bg-secondary)] border border-[var(--border-color)] focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] text-[var(--text-primary)] rounded-md px-2 py-1 text-xs outline-none transition-colors"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          {/* Active Filters - Compact */}
          {(filters.filterBy !== "marks" || filters.sortOrder !== "desc" || searchTerm) && (
            <div className="flex flex-wrap items-center gap-1.5 mb-3">
              <span className="text-[10px] text-[var(--text-muted)]">Filters:</span>
              <span className="px-2 py-0.5 bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] text-[10px] rounded-full border border-[var(--accent-primary)]/20">
                {filters.filterBy === "marks" ? "Marks" : "Avg %"} · {filters.sortOrder === "desc" ? "↓" : "↑"}
              </span>
              {searchTerm && (
                <span className="px-2 py-0.5 bg-[var(--bg-secondary)] text-[var(--text-muted)] text-[10px] rounded-full border border-[var(--border-color)]">
                  "{searchTerm}"
                </span>
              )}
            </div>
          )}

          {/* Employees List */}
          {loading ? (
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)] p-3 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[var(--bg-hover)] rounded-full"></div>
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3.5 bg-[var(--bg-hover)] rounded w-1/4"></div>
                      <div className="h-2.5 bg-[var(--bg-hover)] rounded w-1/3"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : employees.length === 0 ? (
            <div className="bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)] p-8 text-center">
              <User className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-2" />
              <p className="text-sm text-[var(--text-secondary)]">No employees found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {employees.map((employee) => (
                <div
                  key={employee.userId}
                  className={`bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)] p-3 transition hover:border-[var(--border-hover)] ${getRankStyle(employee.rank)}`}
                >
                  <div className="flex items-center gap-3">
                    {/* Rank */}
                    <div className="flex-shrink-0">
                      {getRankIcon(employee.rank)}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-hover)] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                          {employee.user?.name?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <div>
                          <h3 className="font-medium text-sm text-[var(--text-primary)] truncate">
                            {employee.user?.name || "Unknown"}
                          </h3>
                          <p className="text-xs text-[var(--text-muted)] truncate">{employee.user?.email || ""}</p>
                        </div>
                      </div>
                    </div>

                    {/* Stats - Compact */}
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="text-center">
                        <p className="text-sm font-bold text-[var(--text-primary)]">{employee.totalMarks}</p>
                        <p className="text-[8px] text-[var(--text-muted)]">Marks</p>
                      </div>
                      <div className="text-center">
                        <p className={`text-sm font-bold ${getMarksColor(employee.percentage)}`}>
                          {employee.percentage}%
                        </p>
                        <p className="text-[8px] text-[var(--text-muted)]">Avg</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-emerald-600">{employee.completedTasks}</p>
                        <p className="text-[8px] text-[var(--text-muted)]">Done</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination - Centered */}
          {!loading && employees.length > 0 && (
            <div className="mt-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)] px-3 py-2">
              <div className="flex flex-col items-center gap-1.5">
                <div className="flex items-center justify-center gap-1">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={!pagination.hasPrevPage}
                    className={`p-1 rounded-md transition ${
                      pagination.hasPrevPage
                        ? "hover:bg-[var(--bg-hover)] text-[var(--text-primary)]"
                        : "text-[var(--text-muted)] cursor-not-allowed opacity-40"
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {renderPaginationButtons.map((page, index) => (
                    typeof page === 'number' ? (
                      <button
                        key={index}
                        onClick={() => handlePageChange(page)}
                        className={`w-7 h-7 rounded-md text-xs font-medium transition ${
                          pagination.currentPage === page
                            ? "bg-[var(--accent-primary)] text-[var(--text-inverse)]"
                            : "hover:bg-[var(--bg-hover)] text-[var(--text-secondary)]"
                        }`}
                      >
                        {page}
                      </button>
                    ) : (
                      <span key={index} className="px-1 text-[var(--text-muted)] text-xs">…</span>
                    )
                  ))}

                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={!pagination.hasNextPage}
                    className={`p-1 rounded-md transition ${
                      pagination.hasNextPage
                        ? "hover:bg-[var(--bg-hover)] text-[var(--text-primary)]"
                        : "text-[var(--text-muted)] cursor-not-allowed opacity-40"
                    }`}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-[var(--text-muted)] text-center">
                  {Math.min((pagination.currentPage - 1) * pagination.limit + 1, pagination.totalEmployees)} - {Math.min(pagination.currentPage * pagination.limit, pagination.totalEmployees)} of {pagination.totalEmployees}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default RankingEmployee;