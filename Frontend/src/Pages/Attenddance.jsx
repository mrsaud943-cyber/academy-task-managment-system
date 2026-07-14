import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import api from "../service/api";
import {
  Calendar, FileText, User, Plus, X, Loader2, CheckCircle2, AlertCircle,
  Clock, MapPin, Check, AlertTriangle, ChevronDown, ChevronUp, Info,
  Ban, Filter, Search, XCircle, ArrowLeft, History, Globe, RefreshCw
} from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { 
  getCurrentPosition, 
  getQuickPosition,
  getAddressFromCoords, 
  watchLocation,
  updateAttendanceLocationBackground 
} from "../service/locationService.js";

export default function Attenddance() {
  const navigate = useNavigate();

  // ===== STATE =====
  const [employeeId, setEmployeeId] = useState(null);
  const [employeeName, setEmployeeName] = useState("");
  const [submittedRequestId, setSubmittedRequestId] = useState(null);

  const [formData, setFormData] = useState({
    name: "", date: "", type: "Present", reason: "",
    latitude: null, longitude: null, locationAddress: "", locationAccuracy: null
  });

  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [isTrackingLocation, setIsTrackingLocation] = useState(false);
  const [locationPermission, setLocationPermission] = useState('prompt');
  const [gpsRetryCount, setGpsRetryCount] = useState(0); // Track retries

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const observerRef = useRef(null);
  const watchIdRef = useRef(null);
  const isFetchingRef = useRef(false);

  const [filters, setFilters] = useState({
    startDate: '', endDate: '', status: 'all', type: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({});
  const [isFiltering, setIsFiltering] = useState(false);

  const [stats, setStats] = useState({ total: 0, approved: 0, rejected: 0, pending: 0 });

  // ===== GET USER DATA =====
  useEffect(() => {
    const getUserData = () => {
      try {
        const userData = localStorage.getItem("user");
        if (userData) {
          const parsed = JSON.parse(userData);
          const id = parsed._id || parsed.id || parsed.userId;
          const name = parsed.name || "";
          if (id) {
            setEmployeeId(id);
            setEmployeeName(name);
            setFormData(prev => ({ ...prev, name }));
          }
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    };
    getUserData();
  }, []);

  // ===== FETCH SETTINGS =====
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get("/settings/allowGeoLocation");
        const isEnabled = res.data?.value === true || res.data?.value === "true";
        setLocationEnabled(isEnabled);
      } catch (error) {
        setLocationEnabled(false);
      }
    };
    fetchSettings();
  }, []);

  // ===== FETCH REQUESTS =====
  const fetchRequests = useCallback(async (pageNum = 1, append = false, filterParams = {}) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      if (append) setLoadingMore(true);
      else setLoading(true);

      const empId = employeeId || localStorage.getItem("userId") || "emp_123";

      const params = new URLSearchParams();
      params.append('employeeId', empId);
      params.append('page', pageNum);
      params.append('limit', 10);
      if (filterParams.startDate) params.append('startDate', filterParams.startDate);
      if (filterParams.endDate) params.append('endDate', filterParams.endDate);
      if (filterParams.status && filterParams.status !== 'all') params.append('status', filterParams.status);
      if (filterParams.type && filterParams.type !== 'all') params.append('type', filterParams.type);

      const res = await api.get(`/attendance/employee?${params.toString()}`);
      const data = res?.data?.data || [];
      const totalCount = res?.data?.total || data.length;

      setRequests(prev => append ? [...prev, ...data] : data);
      setTotal(totalCount);
      setHasMore(pageNum * 10 < totalCount);
      setPage(pageNum);
      setAppliedFilters(filterParams);

      const allData = append ? [...requests, ...data] : data;
      setStats({
        total: allData.length,
        approved: allData.filter(r => r.status === "Approved").length,
        rejected: allData.filter(r => r.status === "Rejected").length,
        pending: allData.filter(r => r.status === "Pending").length
      });
    } catch (error) {
      console.error("Fetch Error:", error);
      toast.error("Failed to load attendance requests");
    } finally {
      if (append) setLoadingMore(false);
      else setLoading(false);
      isFetchingRef.current = false;
    }
  }, [employeeId]);

  useEffect(() => {
    if (employeeId) {
      fetchRequests(1, false);
    }
  }, [employeeId, fetchRequests]);

  // ===== INFINITE SCROLL =====
  const lastElementRef = useCallback((node) => {
    if (loadingMore || !hasMore) return;
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !isFetchingRef.current) {
        fetchRequests(page + 1, true, appliedFilters);
      }
    }, { rootMargin: '100px' });

    if (node) observerRef.current.observe(node);
  }, [loadingMore, hasMore, page, appliedFilters, fetchRequests]);

  const applyFilters = useCallback(() => {
    setIsFiltering(true);
    setRequests([]);
    setPage(1);
    setHasMore(true);
    fetchRequests(1, false, filters).finally(() => {
      setIsFiltering(false);
      setShowFilters(false);
    });
  }, [filters, fetchRequests]);

  const resetFilters = useCallback(() => {
    const emptyFilters = { startDate: '', endDate: '', status: 'all', type: 'all' };
    setFilters(emptyFilters);
    setAppliedFilters({});
    setRequests([]);
    setPage(1);
    setHasMore(true);
    fetchRequests(1, false, emptyFilters);
  }, [fetchRequests]);

  // ===== STOP TRACKING =====
  const stopContinuousTracking = useCallback(() => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTrackingLocation(false);
  }, []);

  // ===== RESET FORM =====
  const resetForm = useCallback(() => {
    stopContinuousTracking();
    setFormData({
      name: employeeName || "", 
      date: "", 
      type: "Present", 
      reason: "",
      latitude: null, 
      longitude: null, 
      locationAddress: "", 
      locationAccuracy: null
    });
    setLocationError(null);
    setSubmittedRequestId(null);
    setGpsRetryCount(0);
    setShowForm(false);
  }, [employeeName, stopContinuousTracking]);

  // ===== HANDLE CAPTURE LOCATION WITH RETRY =====
  const handleCaptureLocation = useCallback(async (isRetry = false) => {
    if (!locationEnabled) {
      toast.error("Location is disabled by admin");
      return;
    }

    setLocationLoading(true);
    setLocationError(null);

    try {
      // Use quick position first (cached or fast low-accuracy)
      const position = await getCurrentPosition({ timeout: 12000 });
      
      // Show coordinates immediately
      const coordStr = `${position.latitude.toFixed(6)}, ${position.longitude.toFixed(6)}`;
      setFormData(prev => ({
        ...prev,
        latitude: position.latitude,
        longitude: position.longitude,
        locationAddress: coordStr,
        locationAccuracy: position.accuracy,
      }));

      toast.success(`📍 Location captured!${position.highAccuracy ? '' : ' (Approximate)'}`);

      // Get real address in background
      getAddressFromCoords(position.latitude, position.longitude, true)
        .then(addressData => {
          const specificAddress = addressData.specificAddress || addressData.locationName;
          if (specificAddress && !addressData.fallback) {
            setFormData(prev => ({
              ...prev,
              locationAddress: specificAddress
            }));
          }
        })
        .catch(() => {});

      // Reset retry count on success
      setGpsRetryCount(0);

      // Start tracking after capture
      if (!isTrackingLocation) {
        startContinuousTracking();
      }
    } catch (error) {
      setLocationError(error.message);
      setGpsRetryCount(prev => prev + 1);
      
      // Auto-retry once if first attempt failed
      if (!isRetry && gpsRetryCount < 1) {
        toast.error("GPS failed. Retrying with lower accuracy...");
        setTimeout(() => handleCaptureLocation(true), 1000);
      } else {
        toast.error(error.message);
      }
    } finally {
      setLocationLoading(false);
    }
  }, [locationEnabled, isTrackingLocation, gpsRetryCount]);

  // ===== CONTINUOUS TRACKING =====
  const startContinuousTracking = useCallback(() => {
    if (!locationEnabled || !navigator.geolocation) return;

    setIsTrackingLocation(true);
    toast.loading("Starting location tracking...", { id: 'location-tracking', duration: 2000 });

    const cleanup = watchLocation(
      async (newLocation) => {
        setFormData(prev => ({
          ...prev,
          latitude: newLocation.latitude,
          longitude: newLocation.longitude,
          locationAccuracy: newLocation.accuracy,
        }));

        // Get address in background
        getAddressFromCoords(newLocation.latitude, newLocation.longitude)
          .then(addressData => {
            const addr = addressData.specificAddress || addressData.locationName;
            setFormData(prev => ({ ...prev, locationAddress: addr }));
          })
          .catch(() => {});

        // Background update to backend
        if (submittedRequestId) {
          updateAttendanceLocationBackground(
            submittedRequestId,
            newLocation.latitude,
            newLocation.longitude,
            {
              platform: navigator.platform,
              userAgent: navigator.userAgent,
              accuracy: newLocation.accuracy
            }
          );
        }
      },
      (error) => {
        setIsTrackingLocation(false);
        setLocationError(error.message);
        toast.error(error.message);
      }
    );

    // Store cleanup function
    watchIdRef.current = cleanup;
  }, [locationEnabled, submittedRequestId]);

  // ===== HANDLE SUBMIT =====
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let locationData = {};

      if (locationEnabled) {
        try {
          // Try quick position with 8s timeout
          const position = await getCurrentPosition({ timeout: 8000 });
          
          // Try to get address quickly (3s), else use coordinates
          const addressPromise = getAddressFromCoords(position.latitude, position.longitude);
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('timeout')), 3000)
          );
          
          let addressData;
          try {
            addressData = await Promise.race([addressPromise, timeoutPromise]);
          } catch {
            addressData = { 
              locationName: `${position.latitude.toFixed(6)}, ${position.longitude.toFixed(6)}` 
            };
          }
          
          locationData = {
            latitude: position.latitude,
            longitude: position.longitude,
            locationAddress: addressData.specificAddress || addressData.locationName,
            locationAccuracy: position.accuracy,
          };
        } catch (error) {
          // If GPS fails on submit, show error but allow submission without location
          if (formData.latitude && formData.longitude) {
            // Use already captured location
            toast("Using previously captured location", { icon: '⚠️' });
          } else {
            toast.error(error.message);
            setSubmitting(false);
            return;
          }
        }
      }

      const requestData = {
        ...formData,
        ...locationData,
        employeeId: employeeId || localStorage.getItem("userId") || "emp_123",
      };

      const response = await api.post("/attendance/create", requestData, { timeout: 15000 });
      const createdId = response.data?.data?._id || response.data?._id;
      
      if (createdId) {
        setSubmittedRequestId(createdId);
        if (!isTrackingLocation) startContinuousTracking();
      }

      toast.success("Attendance request submitted successfully!");
      resetForm();
      setRequests([]);
      setPage(1);
      setHasMore(true);
      fetchRequests(1, false, appliedFilters);
      
    } catch (error) {
      console.error("Submit Error:", error);
      toast.error(error.response?.data?.message || "Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  }, [formData, locationEnabled, employeeId, isTrackingLocation, appliedFilters, fetchRequests, startContinuousTracking, resetForm]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (watchIdRef.current) watchIdRef.current();
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, []);

  // ===== HELPERS =====
  const getStatusBadge = useMemo(() => (status) => {
    const map = {
      'approved': { color: 'bg-emerald-50 text-emerald-600 border-emerald-200', icon: <CheckCircle2 className="w-3 h-3" />, label: 'Approved' },
      'rejected': { color: 'bg-red-50 text-red-600 border-red-200', icon: <Ban className="w-3 h-3" />, label: 'Rejected' }
    };
    return map[status?.toLowerCase()] || { color: 'bg-amber-50 text-amber-600 border-amber-200', icon: <Clock className="w-3 h-3" />, label: 'Pending' };
  }, []);

  const getTypeBadge = useMemo(() => (type) => {
    const map = {
      'present': { color: 'bg-emerald-50 text-emerald-600 border-emerald-200', label: 'Present' },
      'leave': { color: 'bg-amber-50 text-amber-600 border-amber-200', label: 'Leave' },
      'half day': { color: 'bg-blue-50 text-blue-600 border-blue-200', label: 'Half Day' }
    };
    return map[type?.toLowerCase()] || { color: 'bg-gray-50 text-gray-500 border-gray-200', label: type };
  }, []);

  const formatDate = useCallback((date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }, []);

  const formatDateTime = useCallback((date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }, []);

  const toggleExpand = useCallback((id) => {
    setExpandedId(prev => prev === id ? null : id);
  }, []);

  const isReasonRequired = useCallback(() => {
    return formData.type === "Leave" || formData.type === "Half Day";
  }, [formData.type]);

  const isFilterApplied = useCallback(() => {
    return Object.values(filters).some(v => v !== 'all' && v !== '');
  }, [filters]);

  // ===== RENDER =====
  return (
    <div className="min-h-screen bg-[#f5f0eb] p-3 sm:p-4 font-sans">
      <div className="max-w-6xl mx-auto space-y-4">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 border-b border-[#e5ddd5] pb-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/layout/desboards')}
              className="p-2 hover:bg-[#f5f0eb] rounded-lg transition text-[#8a7a6a] hover:text-[#2c1810] border border-transparent hover:border-[#e5ddd5]">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#2c1810] tracking-tight">Attendance Requests</h1>
              <p className="text-xs text-[#8a7a6a] mt-0.5">
                {employeeName ? `Welcome, ${employeeName}` : 'Submit and track your attendance requests'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs ${
              locationEnabled ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-red-50 text-red-600 border-red-200"
            }`}>
              <MapPin className={`w-3 h-3 ${locationEnabled ? "text-emerald-500" : "text-red-500"}`} />
              {locationEnabled ? "Location ON" : "Location OFF"}
            </div>

            <button onClick={() => navigate('/layout/attendance-history')}
              className="hidden sm:inline-flex items-center gap-2 text-xs font-medium text-[#8a7a6a] hover:text-[#2c1810] hover:bg-[#f5f0eb] px-3 py-2 rounded-lg transition border border-[#e5ddd5]">
              <History className="w-4 h-4" /> History
            </button>

            <button onClick={() => setShowForm(!showForm)}
              className={`inline-flex items-center justify-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all active:scale-95 ${
                showForm ? "bg-[#e5ddd5] text-[#8a7a6a] hover:bg-[#d4c8bc]" 
                        : "bg-[#2c1810] hover:bg-[#2c1810]/80 text-white shadow-lg shadow-[#2c1810]/20"
              }`}>
              {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span>{showForm ? "Close Form" : "Create Request"}</span>
            </button>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total', value: stats.total, color: 'text-[#2c1810]' },
            { label: 'Approved', value: stats.approved, color: 'text-emerald-600' },
            { label: 'Pending', value: stats.pending, color: 'text-amber-600' },
            { label: 'Rejected', value: stats.rejected, color: 'text-red-600' }
          ].map(stat => (
            <div key={stat.label} className="bg-[#faf7f3] border border-[#e5ddd5] rounded-xl p-3 sm:p-4 text-center hover:border-[#d4c8bc] transition">
              <p className="text-xs text-[#8a7a6a]">{stat.label}</p>
              <p className={`text-xl sm:text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* FILTERS */}
        <div className="mb-2">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <button onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center gap-2 bg-[#faf7f3] hover:bg-[#f5f0eb] text-[#2c1810] px-3 py-2 rounded-lg text-sm font-medium transition border border-[#e5ddd5]">
                <Filter className="w-4 h-4" /> Filters
                {isFilterApplied() && <span className="ml-1 w-2 h-2 rounded-full bg-[#2c1810]"></span>}
              </button>
              {isFilterApplied() && (
                <>
                  <button onClick={resetFilters}
                    className="text-xs text-[#8a7a6a] hover:text-[#2c1810] transition flex items-center gap-1">
                    <XCircle className="w-3 h-3" /> Clear Filters
                  </button>
                  <span className="text-xs text-[#8a7a6a]">{requests.length} results</span>
                </>
              )}
            </div>
            {isFiltering && <Loader2 className="w-4 h-4 animate-spin text-[#2c1810]" />}
          </div>

          {showFilters && (
            <div className="mt-3 bg-[#faf7f3] border border-[#e5ddd5] rounded-xl p-4 sm:p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div>
                  <label className="text-[10px] font-semibold text-[#8a7a6a] uppercase tracking-wider">Status</label>
                  <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="w-full mt-1 bg-[#f5f0eb] border border-[#e5ddd5] focus:border-[#2c1810] focus:ring-1 focus:ring-[#2c1810] text-[#2c1810] rounded-lg px-3 py-2 text-sm outline-none">
                    <option value="all">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-[#8a7a6a] uppercase tracking-wider">Type</label>
                  <select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                    className="w-full mt-1 bg-[#f5f0eb] border border-[#e5ddd5] focus:border-[#2c1810] focus:ring-1 focus:ring-[#2c1810] text-[#2c1810] rounded-lg px-3 py-2 text-sm outline-none">
                    <option value="all">All Types</option>
                    <option value="Present">Present</option>
                    <option value="Leave">Leave</option>
                    <option value="Half Day">Half Day</option>
                  </select>
                </div>
                <div className="col-span-1 sm:col-span-2 lg:col-span-2">
                  <label className="text-[10px] font-semibold text-[#8a7a6a] uppercase tracking-wider">Date Range</label>
                  <div className="flex flex-col sm:flex-row items-stretch gap-1.5 mt-1">
                    <input type="date" value={filters.startDate} onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                      className="flex-1 bg-[#f5f0eb] border border-[#e5ddd5] focus:border-[#2c1810] focus:ring-1 focus:ring-[#2c1810] text-[#2c1810] rounded-lg px-2 py-2 text-sm outline-none" />
                    <span className="text-[#8a7a6a] text-xs self-center hidden sm:block">to</span>
                    <input type="date" value={filters.endDate} onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                      className="flex-1 bg-[#f5f0eb] border border-[#e5ddd5] focus:border-[#2c1810] focus:ring-1 focus:ring-[#2c1810] text-[#2c1810] rounded-lg px-2 py-2 text-sm outline-none" />
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-2 border-t border-[#e5ddd5]/50">
                <button onClick={resetFilters} className="text-xs text-[#8a7a6a] hover:text-[#2c1810] transition px-3 py-1.5 rounded-lg hover:bg-[#f5f0eb] order-2 sm:order-1">Reset All</button>
                <button onClick={applyFilters} disabled={isFiltering}
                  className="text-xs bg-[#2c1810] hover:bg-[#2c1810]/80 text-white px-4 py-1.5 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-1 order-1 sm:order-2">
                  {isFiltering && <Loader2 className="w-3 h-3 animate-spin" />} Apply Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* FORM MODAL */}
        {showForm && (
          <>
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={resetForm} />
            <div className="fixed inset-0 flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto">
              <div className="bg-[#faf7f3] border border-[#e5ddd5] rounded-2xl p-4 sm:p-6 w-full max-w-lg max-h-[95vh] overflow-y-auto shadow-xl animate-fade-in custom-scrollbar">
                
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-[#2c1810] uppercase tracking-wider flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#2c1810]" /> New Request
                  </h3>
                  <div className="flex items-center gap-2">
                    {isTrackingLocation && (
                      <span className="flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Live
                      </span>
                    )}
                    <button type="button" onClick={resetForm} className="p-1.5 text-[#8a7a6a] hover:text-[#2c1810] hover:bg-[#f5f0eb] rounded-lg transition">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#8a7a6a]">Employee Name</label>
                    <input type="text" placeholder="Enter your name" value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-[#f5f0eb] border border-[#e5ddd5] focus:border-[#2c1810] focus:ring-1 focus:ring-[#2c1810] text-[#2c1810] placeholder-[#8a7a6a] rounded-xl px-3 py-2.5 text-sm outline-none"
                      required />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#8a7a6a]">Date</label>
                    <input type="date" value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full bg-[#f5f0eb] border border-[#e5ddd5] focus:border-[#2c1810] focus:ring-1 focus:ring-[#2c1810] text-[#2c1810] rounded-xl px-3 py-2.5 text-sm outline-none"
                      required />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#8a7a6a]">Attendance Type</label>
                    <select value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value, reason: "" })}
                      className="w-full bg-[#f5f0eb] border border-[#e5ddd5] focus:border-[#2c1810] focus:ring-1 focus:ring-[#2c1810] text-[#2c1810] rounded-xl px-3 py-2.5 text-sm outline-none">
                      <option value="Present">Present</option>
                      <option value="Leave">Leave</option>
                      <option value="Half Day">Half Day</option>
                    </select>
                  </div>

                  {isReasonRequired() && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#8a7a6a] flex items-center gap-1">
                        Reason <span className="text-red-600">*</span>
                        <span className="text-[10px] text-[#8a7a6a] font-normal ml-1">(Required for {formData.type})</span>
                      </label>
                      <textarea placeholder={`Enter reason for ${formData.type}...`} value={formData.reason}
                        onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                        rows="2"
                        className="w-full bg-[#f5f0eb] border border-[#e5ddd5] focus:border-[#2c1810] focus:ring-1 focus:ring-[#2c1810] text-[#2c1810] placeholder-[#8a7a6a] rounded-xl p-3 text-sm outline-none resize-none"
                        required />
                    </div>
                  )}

                  {formData.type === "Present" && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-start gap-2">
                      <Info className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-emerald-600">
                        You are marking yourself as <span className="font-semibold">Present</span>. No reason is required.
                      </p>
                    </div>
                  )}

                  {/* LOCATION SECTION */}
                  {locationEnabled && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-[#8a7a6a] flex items-center gap-2">
                          <MapPin className="w-3 h-3 text-emerald-500" /> Location Verification
                        </label>
                        <div className="flex items-center gap-2">
                          {isTrackingLocation && (
                            <span className="text-[10px] text-emerald-600 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Tracking
                            </span>
                          )}
                          <button type="button" onClick={() => handleCaptureLocation(false)} disabled={locationLoading}
                            className="text-xs bg-[#2c1810] hover:bg-[#2c1810]/80 text-white px-3 py-1.5 rounded-lg transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1">
                            {locationLoading ? <Loader2 className="w-3 h-3 animate-spin" /> 
                              : formData.latitude ? <Check className="w-3 h-3" /> 
                              : <Globe className="w-3 h-3" />}
                            {formData.latitude ? "Update" : "Capture Location"}
                          </button>
                        </div>
                      </div>

                      {locationError && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-2">
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-xs font-medium text-red-600">Location Error</p>
                              <p className="text-xs text-red-600">{locationError}</p>
                            </div>
                          </div>
                          {/* 🔥 RETRY BUTTON 🔥 */}
                          <button 
                            type="button" 
                            onClick={() => handleCaptureLocation(false)}
                            className="w-full text-xs bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded-lg transition flex items-center justify-center gap-2"
                          >
                            <RefreshCw className="w-3 h-3" /> Try Again
                          </button>
                          <p className="text-[10px] text-red-500 text-center">
                            💡 Tip: Make sure GPS is ON and you're in an open area
                          </p>
                        </div>
                      )}

                      {formData.latitude && formData.longitude && (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 space-y-1">
                          <div className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-emerald-800 break-words">
                                {formData.locationAddress}
                              </p>
                              <p className="text-[10px] text-emerald-600 mt-0.5">
                                📍 {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                                {formData.locationAccuracy && <span className="ml-2">±{Math.round(formData.locationAccuracy)}m</span>}
                              </p>
                              {isTrackingLocation && (
                                <p className="text-[10px] text-emerald-600 mt-1 flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                  Live tracking active — updates in background
                                </p>
                              )}
                            </div>
                          </div>
                          {isTrackingLocation && (
                            <button type="button" onClick={stopContinuousTracking}
                              className="text-[10px] text-red-600 hover:text-red-700 transition mt-1">
                              Stop Tracking
                            </button>
                          )}
                        </div>
                      )}

                      {!formData.latitude && !locationError && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-medium text-amber-800">Location Required</p>
                            <p className="text-xs text-amber-700 mt-0.5">
                              Click <span className="font-semibold">"Capture Location"</span> to get GPS
                            </p>
                            <p className="text-[10px] text-amber-600 mt-1">
                              💡 Enable GPS and WiFi for better accuracy
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {!locationEnabled && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
                      <Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-amber-600">
                        Location verification is <span className="font-semibold">disabled</span> by admin.
                      </p>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row justify-end pt-2 gap-3">
                    <button type="button" onClick={resetForm}
                      className="px-4 py-2.5 rounded-xl bg-[#f5f0eb] hover:bg-[#e5ddd5] text-[#8a7a6a] hover:text-[#2c1810] text-xs font-medium transition border border-[#e5ddd5] order-2 sm:order-1">Cancel</button>
                    <button type="submit" disabled={submitting || (locationEnabled && !formData.latitude) || (isReasonRequired() && !formData.reason.trim())}
                      className={`px-5 py-2.5 rounded-xl text-xs font-semibold transition-all active:scale-95 flex items-center justify-center gap-2 order-1 sm:order-2 ${
                        submitting || (locationEnabled && !formData.latitude) || (isReasonRequired() && !formData.reason.trim())
                          ? "bg-[#e5ddd5] text-[#8a7a6a] cursor-not-allowed"
                          : "bg-[#2c1810] hover:bg-[#2c1810]/80 text-white shadow-lg shadow-[#2c1810]/20"
                      }`}>
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      {submitting ? "Submitting..." : "Submit Request"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </>
        )}

        {/* LOADING */}
        {loading && requests.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-[#8a7a6a] gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#2c1810]" />
            <p className="text-xs font-medium">Loading your requests...</p>
          </div>
        )}

        {/* EMPTY STATES */}
        {!loading && requests.length === 0 && !isFilterApplied() && (
          <div className="text-center py-16 bg-[#faf7f3] border border-[#e5ddd5] rounded-2xl">
            <FileText className="w-12 h-12 text-[#8a7a6a] mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-[#8a7a6a]">No requests found</h3>
            <p className="text-xs text-[#8a7a6a] mt-1">Submit your first attendance request</p>
          </div>
        )}

        {!loading && requests.length === 0 && isFilterApplied() && (
          <div className="text-center py-16 bg-[#faf7f3] border border-[#e5ddd5] rounded-2xl">
            <Filter className="w-12 h-12 text-[#8a7a6a] mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-[#8a7a6a]">No matching requests</h3>
            <button onClick={resetFilters} className="mt-3 text-xs text-[#2c1810] hover:text-[#2c1810]/70 transition">Clear all filters</button>
          </div>
        )}

        {/* REQUESTS LIST */}
        {!loading && requests.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-[#2c1810] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#8a7a6a]" /> Your Requests <span className="text-xs text-[#8a7a6a]">({total})</span>
            </h3>

            {requests.map((req, index) => {
              const status = getStatusBadge(req.status);
              const typeBadge = getTypeBadge(req.type);
              const isExpanded = expandedId === req._id;
              const isLast = index === requests.length - 1;

              return (
                <div key={req._id} ref={isLast ? lastElementRef : null}
                  className="bg-[#faf7f3] border border-[#e5ddd5] rounded-xl overflow-hidden hover:border-[#d4c8bc] transition-all">
                  <div className="p-4 cursor-pointer hover:bg-[#f5f0eb] transition-colors" onClick={() => toggleExpand(req._id)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-[#f5f0eb] flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-[#8a7a6a]" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-medium text-[#2c1810] truncate">{req.name}</h4>
                          <div className="flex items-center gap-2 text-xs text-[#8a7a6a]">
                            <span>{formatDate(req.date)}</span>
                            <span className="w-1 h-1 rounded-full bg-[#e5ddd5]"></span>
                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-medium border ${typeBadge.color}`}>
                              {typeBadge.label}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium border ${status.color}`}>
                          {status.icon} {status.label}
                        </span>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-[#8a7a6a]" /> : <ChevronDown className="w-4 h-4 text-[#8a7a6a]" />}
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 border-t border-[#e5ddd5] space-y-3">
                      {req.status === "Rejected" && req.adminRemarks ? (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Ban className="w-4 h-4 text-red-600" />
                            <h5 className="text-xs font-semibold text-red-600 uppercase tracking-wider">Rejection Reason</h5>
                          </div>
                          <p className="text-sm text-[#2c1810]">{req.adminRemarks}</p>
                        </div>
                      ) : req.status === "Rejected" && !req.adminRemarks ? (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                          <Ban className="w-4 h-4 text-red-600" />
                          <p className="text-sm text-red-600">No rejection reason provided</p>
                        </div>
                      ) : (
                        <div className="bg-[#f5f0eb] rounded-lg p-3">
                          <h5 className="text-[10px] font-semibold text-[#8a7a6a] uppercase tracking-wider mb-1 flex items-center gap-1">
                            <FileText className="w-3 h-3" /> Your Reason
                          </h5>
                          <p className="text-sm text-[#2c1810]">{req.reason || "No reason provided"}</p>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-4 text-xs text-[#8a7a6a]">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Submitted: {formatDateTime(req.createdAt)}</span>
                        {req.locationCaptured && <span className="flex items-center gap-1 text-emerald-600"><MapPin className="w-3 h-3" /> Location Verified</span>}
                        {req.processedAt && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Processed: {formatDateTime(req.processedAt)}</span>}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {loadingMore && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-[#2c1810]" />
                <span className="ml-2 text-sm text-[#8a7a6a]">Loading more...</span>
              </div>
            )}

            {!hasMore && requests.length > 0 && !loading && (
              <div className="text-center py-4"><p className="text-xs text-[#8a7a6a]">No more requests to load</p></div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #d4c8bc; border-radius: 8px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #b8a898; }
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-fade-in { animation: fadeIn 0.2s ease-out; }
      `}</style>
    </div>
  );
}