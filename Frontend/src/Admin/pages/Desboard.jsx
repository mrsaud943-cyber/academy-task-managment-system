import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../service/api.js";
import {
  Users, UserCheck, UserX, Loader2, TrendingUp, Award,
  Briefcase, Calendar, CheckCircle, Clock, AlertCircle,
  ChevronRight, AlertTriangle, CheckCircle2, Target,
  History, ArrowUpRight, ArrowDownRight, Activity,
  BarChart3, PieChart, Zap, Star, Flag, Timer, Trophy
} from "lucide-react";
import TopPerformers from "../components/TopPerformerCard.jsx";
import { autoZeroMissedTasks } from "../utility/autoZero.js";

// ─── Reusable Circular Progress Component ─────────────────────────
const CircularProgress = ({ value, max, size = 120, strokeWidth = 10, color, label, sublabel }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = Math.min(value / max, 1);
  const dashoffset = circumference - progress * circumference;
  const percentage = Math.round((value / max) * 100);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--border-color)"
            strokeWidth={strokeWidth}
            opacity="0.3"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashoffset}
            style={{
              transition: "stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)",
              filter: `drop-shadow(0 0 6px ${color}40)`
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold" style={{ color }}>{percentage}%</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-[var(--text-primary)]">{label}</p>
        <p className="text-xs text-[var(--text-muted)]">{sublabel}</p>
      </div>
    </div>
  );
};

// ─── Mini Bar Chart Component ──────────────────────────────────────
const MiniBarChart = ({ data, color = "var(--accent-primary)" }) => {
  const maxVal = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-1.5 h-16">
      {data.map((item, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
          <div
            className="w-full rounded-t-sm transition-all duration-500 ease-out"
            style={{
              height: `${(item.value / maxVal) * 100}%`,
              backgroundColor: color,
              opacity: 0.6 + (item.value / maxVal) * 0.4,
              minHeight: 4,
            }}
          />
          <span className="text-[9px] text-[var(--text-muted)]">{item.label}</span>
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-md px-2 py-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
            {item.value}
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── Animated Counter ─────────────────────────────────────────────
const AnimatedCounter = ({ end, duration = 1500, suffix = "" }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOut * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [end, duration]);

  return <span>{count.toLocaleString()}{suffix}</span>;
};

// ─── Stat Card with Sparkline ─────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, color, trend, trendValue, sparklineData }) => {
  const isPositive = trend === "up";
  return (
    <div className="bg-[var(--bg-card)] rounded-xl p-4 border border-[var(--border-color)] hover:border-[var(--border-hover)] transition-all group relative overflow-hidden">
      <div
        className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-10 blur-2xl transition-opacity group-hover:opacity-20"
        style={{ backgroundColor: color }}
      />
      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <div
            className="p-2.5 rounded-xl"
            style={{ backgroundColor: `${color}15` }}
          >
            <Icon className="w-5 h-5" style={{ color }} />
          </div>
          {trend && (
            <div className={`flex items-center gap-1 text-xs font-medium ${isPositive ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
              {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              {trendValue}%
            </div>
          )}
        </div>
        <p className="text-3xl font-bold text-[var(--text-primary)] mb-1">
          <AnimatedCounter end={value} />
        </p>
        <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-medium">{label}</p>
        {sparklineData && (
          <div className="mt-3">
            <MiniBarChart data={sparklineData} color={color} />
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Donut Chart Component ────────────────────────────────────────
const DonutChart = ({ data, size = 140 }) => {
  const total = data.reduce((acc, item) => acc + item.value, 0);
  let currentAngle = 0;

  return (
    <div className="flex items-center gap-6">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {data.map((item, i) => {
            const percentage = item.value / total;
            const angle = percentage * 360;
            const startAngle = currentAngle;
            currentAngle += angle;

            const startRad = (startAngle - 90) * Math.PI / 180;
            const endRad = (startAngle + angle - 90) * Math.PI / 180;

            const x1 = size/2 + (size/2 - 20) * Math.cos(startRad);
            const y1 = size/2 + (size/2 - 20) * Math.sin(startRad);
            const x2 = size/2 + (size/2 - 20) * Math.cos(endRad);
            const y2 = size/2 + (size/2 - 20) * Math.sin(endRad);

            const largeArc = angle > 180 ? 1 : 0;

            return (
              <path
                key={i}
                d={`M ${size/2} ${size/2} L ${x1} ${y1} A ${size/2 - 20} ${size/2 - 20} 0 ${largeArc} 1 ${x2} ${y2} Z`}
                fill={item.color}
                stroke="var(--bg-primary)"
                strokeWidth="2"
                style={{ transition: "all 0.5s ease" }}
              />
            );
          })}
          <circle cx={size/2} cy={size/2} r={size/2 - 35} fill="var(--bg-card)" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-[var(--text-primary)]">{total}</span>
          <span className="text-[10px] text-[var(--text-muted)]">Total</span>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }} />
            <span className="text-xs text-[var(--text-secondary)]">{item.label}</span>
            <span className="text-xs font-semibold text-[var(--text-primary)] ml-auto">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Activity Timeline ────────────────────────────────────────────
const ActivityTimeline = ({ activities }) => (
  <div className="space-y-3">
    {activities.map((activity, i) => (
      <div key={i} className="flex items-start gap-3 group">
        <div className="flex flex-col items-center">
          <div
            className="w-2.5 h-2.5 rounded-full ring-4"
            style={{
              backgroundColor: activity.color,
              ringColor: `${activity.color}20`
            }}
          />
          {i < activities.length - 1 && (
            <div className="w-px h-full min-h-[24px] bg-[var(--border-color)] mt-1" />
          )}
        </div>
        <div className="flex-1 pb-3">
          <p className="text-sm text-[var(--text-primary)]">{activity.title}</p>
          <p className="text-xs text-[var(--text-muted)]">{activity.time}</p>
        </div>
      </div>
    ))}
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [topPerformers, setTopPerformers] = useState([]);
  const [performerLoading, setPerformerLoading] = useState(true);
  const [projects, setProjects] = useState([]);

  const [deadlineStats, setDeadlineStats] = useState({
    topMissed: [],
    totalMissed: 0,
    totalOnTime: 0,
    totalDeadlines: 0,
  });
  const [deadlineLoading, setDeadlineLoading] = useState(true);

  // ─── Fetch Data ─────────────────────────────────────────────────
  useEffect(() => {
    const fetchAllData = async () => {
      await autoZeroMissedTasks();
      await Promise.all([fetchUsers(), fetchTopPerformers(), fetchDeadlineStats(), fetchProjects()]);
      setLoading(false);
    };
    fetchAllData();
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await api.get("/user/all-users");
      setUsers((res.data.users || []).filter(u => u.role === "employee"));
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  }, []);

  const fetchProjects = useCallback(async () => {
    try {
      const res = await api.get("/projects");
      let projectsData = [];
      if (res.data && Array.isArray(res.data)) {
        projectsData = res.data;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        projectsData = res.data.data;
      }
      setProjects(projectsData);
    } catch (err) {
      console.error("Error fetching projects:", err);
      setProjects([]);
    }
  }, []);

  // ✅ FIXED: Fetch top performers with proper data
  const fetchTopPerformers = useCallback(async () => {
    setPerformerLoading(true);
    try {
      const res = await api.get("/ranking/top-performers", { params: { limit: 5 } });
      console.log("Top Performers Response:", res.data);
      
      if (res.data.success) {
        // ✅ Filter performers who have taskCount > 0 and avgMarks > 0
        const filtered = res.data.data.filter(p => p.taskCount > 0 && p.avgMarks > 0);
        console.log("Filtered Performers:", filtered);
        setTopPerformers(filtered);
      } else {
        setTopPerformers([]);
      }
    } catch (err) {
      console.error("Error fetching top performers:", err);
      setTopPerformers([]);
    } finally {
      setPerformerLoading(false);
    }
  }, []);

  const fetchDeadlineStats = useCallback(async () => {
    setDeadlineLoading(true);
    try {
      const res = await api.get("/ranking/deadline-rankings", {
        params: { page: 1, limit: 100, filterBy: "missed", sortOrder: "desc" },
      });
      if (res.data.success) {
        const data = res.data.data || [];
        let totalMissed = 0, totalOnTime = 0, totalDeadlines = 0;
        data.forEach(item => {
          totalMissed += item.missedDeadlines || 0;
          totalOnTime += item.onTimeTasks || 0;
          totalDeadlines += item.tasksWithDeadline || 0;
        });
        setDeadlineStats({
          topMissed: data.filter(i => i.missedDeadlines > 0).sort((a, b) => b.missedDeadlines - a.missedDeadlines).slice(0, 5),
          totalMissed,
          totalOnTime,
          totalDeadlines,
        });
      }
    } catch (err) {
      console.error("Error fetching deadline stats:", err);
    } finally {
      setDeadlineLoading(false);
    }
  }, []);

  // ─── Computed Stats ─────────────────────────────────────────────
  const totalEmployees = users.length;
  const activeEmployees = users.filter(u => u.isActive).length;
  const inactiveEmployees = users.filter(u => !u.isActive).length;
  const totalTasks = projects.reduce((acc, p) => acc + (p.tasks?.length || 0), 0);
  const totalProjects = projects.length;
  
  const totalDeadlines = deadlineStats.totalDeadlines || 1;

  // ─── Chart Data ──────────────────────────────────────────────────
  const employeeDistribution = [
    { label: "Active", value: activeEmployees, color: "var(--success)" },
    { label: "Inactive", value: inactiveEmployees, color: "var(--danger)" },
  ];

  const weeklySparkline = [
    { label: "Mon", value: Math.max(1, Math.floor(totalTasks * 0.15)) },
    { label: "Tue", value: Math.max(1, Math.floor(totalTasks * 0.25)) },
    { label: "Wed", value: Math.max(1, Math.floor(totalTasks * 0.20)) },
    { label: "Thu", value: Math.max(1, Math.floor(totalTasks * 0.30)) },
    { label: "Fri", value: Math.max(1, Math.floor(totalTasks * 0.35)) },
    { label: "Sat", value: Math.max(1, Math.floor(totalTasks * 0.10)) },
    { label: "Sun", value: Math.max(1, Math.floor(totalTasks * 0.05)) },
  ];

  const activityData = [
    { title: `${activeEmployees} employees active today`, time: "Just now", color: "var(--success)" },
    { title: `${deadlineStats.totalOnTime} tasks completed on time`, time: "Today", color: "var(--accent-primary)" },
    { title: `${deadlineStats.totalMissed} deadlines missed`, time: "This week", color: "var(--warning)" },
    { title: `${totalProjects} projects in progress`, time: "Ongoing", color: "var(--text-secondary)" },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="relative">
          <Loader2 className="w-10 h-10 text-[var(--accent-primary)] animate-spin" />
          <div className="absolute inset-0 w-10 h-10 rounded-full border-2 border-[var(--accent-primary)] opacity-20 animate-ping" />
        </div>
        <p className="text-[var(--text-secondary)] text-sm animate-pulse">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-[1400px] mx-auto">

      {/* HEADER SECTION */}
      <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] overflow-hidden">
        <div className="relative bg-gradient-to-r from-[var(--bg-secondary)] to-transparent border-b border-[var(--border-color)] px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="bg-[var(--accent-primary)]/15 p-3 rounded-2xl">
                  <Activity className="w-7 h-7 text-[var(--accent-primary)]" />
                </div>
                <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[var(--success)] rounded-full border-2 border-[var(--bg-card)]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[var(--text-primary)]">Dashboard</h1>
                <p className="text-sm text-[var(--text-secondary)] mt-0.5">Real-time team performance overview</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)]">
                <Calendar className="w-4 h-4 text-[var(--text-muted)]" />
                <span className="text-xs text-[var(--text-secondary)]">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
              </div>
              <button onClick={() => navigate("/admin/history")} className="inline-flex items-center gap-2 bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-[var(--text-inverse)] px-4 py-2 rounded-lg text-sm font-medium transition shadow-lg shadow-[var(--accent-primary)]/20">
                <History className="w-4 h-4" />
                <span className="hidden sm:inline">View History</span>
              </button>
            </div>
          </div>
        </div>

        {/* STATS GRID */}
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard
              icon={Users}
              label="Total Employees"
              value={totalEmployees}
              color="var(--accent-primary)"
              trend="up"
              trendValue={12}
              sparklineData={weeklySparkline}
            />
            <StatCard
              icon={UserCheck}
              label="Active Now"
              value={activeEmployees}
              color="var(--success)"
              trend="up"
              trendValue={8}
              sparklineData={weeklySparkline.map(d => ({ ...d, value: Math.floor(d.value * 0.8) }))}
            />
            <StatCard
              icon={UserX}
              label="Inactive"
              value={inactiveEmployees}
              color="var(--danger)"
              trend="down"
              trendValue={3}
            />
            <StatCard
              icon={Briefcase}
              label="Projects"
              value={totalProjects}
              color="var(--accent-light)"
              trend="up"
              trendValue={24}
              sparklineData={weeklySparkline.map(d => ({ ...d, value: Math.floor(d.value * 0.5) }))}
            />
            <StatCard
              icon={AlertTriangle}
              label="Missed Deadlines"
              value={deadlineStats.totalMissed}
              color="var(--warning)"
              trend="down"
              trendValue={5}
            />
          </div>
        </div>
      </div>

      {/* MIDDLE ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] p-5 hover:border-[var(--border-hover)] transition-all">
          <div className="flex items-center gap-2 mb-6">
            <Target className="w-5 h-5 text-[var(--accent-primary)]" />
            <h3 className="text-base font-semibold text-[var(--text-primary)]">Task Completion Rate</h3>
          </div>
          <div className="flex items-center justify-around">
            <CircularProgress
              value={deadlineStats.totalOnTime}
              max={totalDeadlines || 1}
              size={140}
              strokeWidth={12}
              color="var(--success)"
              label="On Time"
              sublabel={`${deadlineStats.totalOnTime} of ${totalDeadlines} tasks`}
            />
            <CircularProgress
              value={deadlineStats.totalMissed}
              max={totalDeadlines || 1}
              size={100}
              strokeWidth={10}
              color="var(--warning)"
              label="Missed"
              sublabel={`${deadlineStats.totalMissed} tasks`}
            />
          </div>
        </div>

        <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] p-5 hover:border-[var(--border-hover)] transition-all">
          <div className="flex items-center gap-2 mb-6">
            <PieChart className="w-5 h-5 text-[var(--accent-primary)]" />
            <h3 className="text-base font-semibold text-[var(--text-primary)]">Employee Distribution</h3>
          </div>
          <div className="flex items-center justify-center py-2">
            <DonutChart data={employeeDistribution} size={160} />
          </div>
        </div>

        <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] p-5 hover:border-[var(--border-hover)] transition-all">
          <div className="flex items-center gap-2 mb-6">
            <Clock className="w-5 h-5 text-[var(--accent-primary)]" />
            <h3 className="text-base font-semibold text-[var(--text-primary)]">Recent Activity</h3>
          </div>
          <ActivityTimeline activities={activityData} />
        </div>
      </div>

      {/* BOTTOM ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Top Performers */}
        <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] p-5 hover:border-[var(--border-hover)] transition-all">
          <div className="flex items-center justify-between mb-4 px-1">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <h3 className="text-base font-semibold text-[var(--text-primary)]">Top Performers</h3>
            </div>
            <button 
              onClick={() => navigate("/admin/employees-ranking")}
              className="text-xs text-[var(--accent-primary)] hover:text-[var(--accent-hover)] transition flex items-center gap-1 font-medium"
            >
              View All <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          
          {performerLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-[var(--accent-primary)] animate-spin" />
            </div>
          ) : topPerformers.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-3" />
              <p className="text-sm text-[var(--text-secondary)]">No performer data available</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">Complete tasks with marks to appear here</p>
            </div>
          ) : (
            <div className="space-y-2">
              {topPerformers.map((performer, index) => {
                const avgMarks = performer.avgMarks || 0;
                const taskCount = performer.taskCount || 0;
                
                return (
                  <div 
                    key={performer.userId || index} 
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all hover:border-[var(--border-hover)] bg-[var(--bg-card)] ${
                      index === 0 ? 'border-yellow-500/30 bg-yellow-500/5' :
                      index === 1 ? 'border-gray-400/30 bg-gray-400/5' :
                      index === 2 ? 'border-amber-600/30 bg-amber-600/5' :
                      'border-[var(--border-color)]'
                    }`}
                  >
                    {/* Rank */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-yellow-500/20 text-yellow-600 border border-yellow-500/30' :
                      index === 1 ? 'bg-gray-400/20 text-gray-500 border border-gray-400/30' :
                      index === 2 ? 'bg-amber-500/20 text-amber-600 border border-amber-500/30' :
                      'bg-[var(--bg-secondary)] text-[var(--text-muted)] border border-[var(--border-color)]'
                    }`}>
                      {index + 1}
                    </div>

                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-[var(--accent-primary)]/10 flex items-center justify-center text-[var(--text-primary)] font-semibold text-sm flex-shrink-0 border border-[var(--accent-primary)]/20">
                      {performer.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                        {performer.name || 'Unknown'}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
                        <span>{taskCount} tasks</span>
                        <span className="w-1 h-1 rounded-full bg-[var(--border-color)]" />
                        <span className={avgMarks >= 80 ? 'text-emerald-600' : avgMarks >= 60 ? 'text-blue-600' : avgMarks >= 40 ? 'text-amber-600' : 'text-red-600'}>
                          {avgMarks}% avg
                        </span>
                      </div>
                    </div>

                    {/* Score */}
                    <div className="text-right flex-shrink-0">
                      <p className={`text-lg font-bold ${avgMarks >= 80 ? 'text-emerald-600' : avgMarks >= 60 ? 'text-blue-600' : avgMarks >= 40 ? 'text-amber-600' : 'text-red-600'}`}>
                        {avgMarks}%
                      </p>
                      <p className="text-[10px] text-[var(--text-muted)]">score</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Deadline Performance */}
        <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] p-5 hover:border-[var(--border-hover)] transition-all overflow-hidden">
          <div className="flex items-center justify-between mb-4 px-1">
            <div className="flex items-center gap-2">
              <Timer className="w-5 h-5 text-[var(--warning)]" />
              <h3 className="text-base font-semibold text-[var(--text-primary)]">Deadline Performance</h3>
            </div>
            <button 
              onClick={() => navigate("/admin/deadline-ranking")}
              className="text-xs text-[var(--accent-primary)] hover:text-[var(--accent-hover)] transition flex items-center gap-1 font-medium"
            >
              View All <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {deadlineLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-[var(--warning)] animate-spin" />
            </div>
          ) : deadlineStats.topMissed.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-[var(--success)]/10 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-[var(--success)]" />
              </div>
              <p className="text-[var(--text-secondary)] text-sm font-medium">No missed deadlines!</p>
              <p className="text-[var(--text-muted)] text-xs mt-1">Great job team!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {deadlineStats.topMissed.slice(0, 5).map((item, index) => (
                <div 
                  key={item.userId || index} 
                  className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-primary)]/50 border border-[var(--border-color)] hover:border-[var(--warning)]/30 transition-all group"
                >
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{
                      backgroundColor: index === 0 ? 'var(--danger)' : index === 1 ? 'var(--warning)' : 'var(--bg-secondary)',
                      color: index < 2 ? 'white' : 'var(--text-muted)',
                    }}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">{item.user?.name || "Unknown"}</p>
                    <p className="text-[10px] text-[var(--text-muted)]">{item.tasksWithDeadline || 0} total tasks</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 rounded-full bg-[var(--bg-secondary)] overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-[var(--warning)] to-[var(--danger)] transition-all duration-500"
                        style={{ width: `${Math.min((item.missedDeadlines / (deadlineStats.topMissed[0]?.missedDeadlines || 1)) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-[var(--warning)] w-6 text-right">{item.missedDeadlines}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;