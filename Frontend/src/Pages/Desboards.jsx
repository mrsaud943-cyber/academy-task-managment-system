import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../service/api.js";
import {
  Loader2,
  Users,
  Briefcase,
  CheckCircle,
  Clock,
  AlertTriangle,
  Target,
  Trophy,
  Award,
  Calendar,
  ChevronRight,
  User,
  Star,
  Crown,
  Medal,
  TrendingUp,
  FileText,
  BarChart3,
  LayoutDashboard,
  Activity,
  PieChart,
} from "lucide-react";

// ─── Reusable Components ──────────────────────────────────────────
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

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [employee, setEmployee] = useState(null);
  const [employeeProjects, setEmployeeProjects] = useState([]);
  const [deadlineStats, setDeadlineStats] = useState({
    totalTasks: 0,
    missedDeadlines: 0,
    onTimeTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    totalMarks: 0,
    avgMarks: 0,
  });
  const [topPerformers, setTopPerformers] = useState([]);

  useEffect(() => {
    const getUserData = () => {
      try {
        const userData = localStorage.getItem("user");
        if (userData) {
          const parsed = JSON.parse(userData);
          setEmployee(parsed);
        }
      } catch (error) {
        console.error("Error getting user data:", error);
      }
    };
    getUserData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [memberRes, projectRes] = await Promise.all([
        api.get("/members"),
        api.get("/projects"),
      ]);

      const membersData = memberRes.data?.data || memberRes.data || [];
      const projectsData = projectRes.data?.data || projectRes.data || [];

      setMembers(membersData);
      setProjects(projectsData);

      const filteredProjects = projectsData.filter(project => {
        return (project.tasks || []).some(task => {
          const taskUser = task.user?._id || task.user;
          return taskUser && String(taskUser) === String(employee._id);
        });
      });

      setEmployeeProjects(filteredProjects);
      calculateEmployeeStats(projectsData);
      calculateTopPerformers(projectsData);

    } catch (error) {
      console.error("Error fetching data:", error);
      try {
        const [memberFallback, projectFallback] = await Promise.all([
          api.get("/user/all-users"),
          api.get("/projects"),
        ]);
        const users = memberFallback.data?.users || memberFallback.data || [];
        const employees = users.filter(u => u.role === "employee");
        setMembers(employees);
        const projectsData = projectFallback.data?.data || projectFallback.data || [];
        setProjects(projectsData);

        const filteredProjects = projectsData.filter(project => {
          return (project.tasks || []).some(task => {
            const taskUser = task.user?._id || task.user;
            return taskUser && String(taskUser) === String(employee._id);
          });
        });
        setEmployeeProjects(filteredProjects);
        calculateEmployeeStats(projectsData);
        calculateTopPerformers(projectsData);
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateEmployeeStats = (projectsList) => {
    let totalTasks = 0;
    let missedDeadlines = 0;
    let onTimeTasks = 0;
    let completedTasks = 0;
    let pendingTasks = 0;
    let totalMarks = 0;
    let taskCount = 0;

    projectsList.forEach(project => {
      (project.tasks || []).forEach(task => {
        const taskUser = task.user?._id || task.user;
        const isEmployeeTask = employee && String(taskUser) === String(employee._id);

        if (isEmployeeTask) {
          totalTasks++;
          taskCount++;
          totalMarks += task.obtainedMarks || 0;

          if (task.completed || task.status === "Completed") {
            completedTasks++;
          } else {
            pendingTasks++;
          }

          const today = new Date();
          const endDate = task.endDate ? new Date(task.endDate) : null;
          const isCompleted = task.status === "Completed" || task.completed === true;

          if (endDate && endDate < today && !isCompleted) {
            missedDeadlines++;
          } else if (isCompleted) {
            onTimeTasks++;
          }
        }
      });
    });

    const avgMarks = taskCount > 0 ? Math.round(totalMarks / taskCount) : 0;

    setDeadlineStats({
      totalTasks,
      missedDeadlines,
      onTimeTasks,
      completedTasks,
      pendingTasks,
      totalMarks,
      avgMarks,
    });
  };

  const calculateTopPerformers = (projectsList) => {
    const performerMap = {};

    projectsList.forEach(project => {
      (project.tasks || []).forEach(task => {
        const userId = task.user?._id || task.user || task.memberId || task.member;
        const isCompleted = task.status === "Completed" || task.completed === true;

        if (userId) {
          const userIdStr = userId.toString();
          if (!performerMap[userIdStr]) {
            performerMap[userIdStr] = {
              userId: userIdStr,
              name: task.user?.name || "Unknown",
              taskCount: 0,
              completedTasks: 0,
              totalMarks: 0,
            };
          }
          performerMap[userIdStr].taskCount++;
          if (isCompleted) {
            performerMap[userIdStr].completedTasks++;
          }
          performerMap[userIdStr].totalMarks += task.obtainedMarks || 0;
        }
      });
    });

    const performers = Object.values(performerMap)
      .map(p => ({
        ...p,
        avgMarks: p.taskCount > 0 ? Math.round(p.totalMarks / p.taskCount) : 0,
      }))
      .filter(p => p.taskCount > 0)
      .sort((a, b) => b.avgMarks - a.avgMarks)
      .slice(0, 5);

    setTopPerformers(performers);
  };

  useEffect(() => {
    if (employee) {
      fetchData();
    }
  }, [employee]);

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getRankIcon = (index) => {
    if (index === 0) return <Crown className="w-4 h-4 text-yellow-500" />;
    if (index === 1) return <Medal className="w-4 h-4 text-gray-400" />;
    if (index === 2) return <Award className="w-4 h-4 text-amber-600" />;
    return <Star className="w-4 h-4 text-[var(--text-muted)]" />;
  };

  const getMarksColor = (marks) => {
    if (marks >= 80) return "text-emerald-600";
    if (marks >= 60) return "text-blue-600";
    if (marks >= 40) return "text-amber-600";
    return "text-red-600";
  };

  const getProgressColor = (marks) => {
    if (marks >= 80) return "bg-emerald-500";
    if (marks >= 60) return "bg-blue-500";
    if (marks >= 40) return "bg-amber-500";
    return "bg-rose-500";
  };

  const totalTasks = deadlineStats.totalTasks || 0;
  const completedTasks = deadlineStats.completedTasks || 0;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const pendingTasks = deadlineStats.pendingTasks || 0;
  const totalMarks = deadlineStats.totalMarks || 0;
  const avgMarks = deadlineStats.avgMarks || 0;
  const missedDeadlines = deadlineStats.missedDeadlines || 0;

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
                  <LayoutDashboard className="w-7 h-7 text-[var(--accent-primary)]" />
                </div>
                <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[var(--success)] rounded-full border-2 border-[var(--bg-card)]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[var(--text-primary)]">Employee Dashboard</h1>
                <p className="text-sm text-[var(--text-secondary)] mt-0.5">Track your performance and tasks</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)]">
                <Calendar className="w-4 h-4 text-[var(--text-muted)]" />
                <span className="text-xs text-[var(--text-secondary)]">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
              </div>
              <div className="text-xs text-[var(--text-secondary)] bg-[var(--bg-secondary)] px-3 py-1.5 rounded-full border border-[var(--border-color)]">
                Welcome, {employee?.name || "Employee"}
              </div>
            </div>
          </div>
        </div>

        {/* STATS GRID */}
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-[var(--bg-secondary)] rounded-xl p-4 border border-[var(--border-color)] hover:border-[var(--border-hover)] transition-all group">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Total Tasks</span>
                <div className="w-8 h-8 rounded-lg bg-[var(--accent-primary)]/10 flex items-center justify-center group-hover:scale-110 transition">
                  <FileText className="w-4 h-4 text-[var(--accent-primary)]" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">{totalTasks}</p>
            </div>

            <div className="bg-[var(--bg-secondary)] rounded-xl p-4 border border-[var(--border-color)] hover:border-[var(--border-hover)] transition-all group">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Completed</span>
                <div className="w-8 h-8 rounded-lg bg-[var(--success)]/10 flex items-center justify-center group-hover:scale-110 transition">
                  <CheckCircle className="w-4 h-4 text-[var(--success)]" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-[var(--success)]">{completedTasks}</p>
            </div>

            <div className="bg-[var(--bg-secondary)] rounded-xl p-4 border border-[var(--border-color)] hover:border-[var(--border-hover)] transition-all group">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Pending</span>
                <div className="w-8 h-8 rounded-lg bg-[var(--warning)]/10 flex items-center justify-center group-hover:scale-110 transition">
                  <Clock className="w-4 h-4 text-[var(--warning)]" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-[var(--warning)]">{pendingTasks}</p>
            </div>

            <div className="bg-[var(--bg-secondary)] rounded-xl p-4 border border-[var(--border-color)] hover:border-[var(--border-hover)] transition-all group">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Total Marks</span>
                <div className="w-8 h-8 rounded-lg bg-[var(--accent-light)]/10 flex items-center justify-center group-hover:scale-110 transition">
                  <Star className="w-4 h-4 text-[var(--accent-light)]" />
                </div>
              </div>
              <p className={`text-2xl sm:text-3xl font-bold ${getMarksColor(totalMarks)}`}>{totalMarks}</p>
            </div>

            <div className="bg-[var(--bg-secondary)] rounded-xl p-4 border border-[var(--border-color)] hover:border-[var(--border-hover)] transition-all group">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Avg Marks</span>
                <div className="w-8 h-8 rounded-lg bg-[var(--accent-primary)]/10 flex items-center justify-center group-hover:scale-110 transition">
                  <TrendingUp className="w-4 h-4 text-[var(--accent-primary)]" />
                </div>
              </div>
              <p className={`text-2xl sm:text-3xl font-bold ${getMarksColor(avgMarks)}`}>{avgMarks}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* MIDDLE ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Task Completion Rate */}
        <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] p-5 hover:border-[var(--border-hover)] transition-all">
          <div className="flex items-center gap-2 mb-6">
            <Target className="w-5 h-5 text-[var(--accent-primary)]" />
            <h3 className="text-base font-semibold text-[var(--text-primary)]">Task Completion</h3>
          </div>
          <div className="flex items-center justify-around">
            <CircularProgress
              value={completedTasks}
              max={totalTasks || 1}
              size={120}
              strokeWidth={12}
              color="var(--success)"
              label="Completed"
              sublabel={`${completedTasks} of ${totalTasks} tasks`}
            />
            <CircularProgress
              value={pendingTasks}
              max={totalTasks || 1}
              size={100}
              strokeWidth={10}
              color="var(--warning)"
              label="Pending"
              sublabel={`${pendingTasks} tasks`}
            />
          </div>
        </div>

        {/* Missed Deadlines */}
        <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] p-5 hover:border-[var(--border-hover)] transition-all">
          <div className="flex items-center gap-2 mb-6">
            <AlertTriangle className="w-5 h-5 text-[var(--danger)]" />
            <h3 className="text-base font-semibold text-[var(--text-primary)]">Deadline Performance</h3>
          </div>
          <div className="flex items-center justify-around">
            <CircularProgress
              value={missedDeadlines}
              max={totalTasks || 1}
              size={120}
              strokeWidth={12}
              color="var(--danger)"
              label="Missed"
              sublabel={`${missedDeadlines} missed deadlines`}
            />
            <CircularProgress
              value={deadlineStats.onTimeTasks || 0}
              max={totalTasks || 1}
              size={100}
              strokeWidth={10}
              color="var(--success)"
              label="On Time"
              sublabel={`${deadlineStats.onTimeTasks || 0} on time`}
            />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] p-5 hover:border-[var(--border-hover)] transition-all">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-[var(--accent-primary)]" />
            <h3 className="text-base font-semibold text-[var(--text-primary)]">Quick Stats</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-2 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
              <span className="text-sm text-[var(--text-secondary)]">Completion Rate</span>
              <span className="text-sm font-bold text-[var(--success)]">{completionRate}%</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
              <span className="text-sm text-[var(--text-secondary)]">Tasks Assigned</span>
              <span className="text-sm font-bold text-[var(--text-primary)]">{totalTasks}</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
              <span className="text-sm text-[var(--text-secondary)]">Projects Active</span>
              <span className="text-sm font-bold text-[var(--text-primary)]">{employeeProjects.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* MY PROJECTS */}
        <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] p-5 hover:border-[var(--border-hover)] transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-[var(--accent-primary)]" />
              <h3 className="text-base font-semibold text-[var(--text-primary)]">My Projects</h3>
              <span className="text-xs text-[var(--text-muted)] bg-[var(--bg-secondary)] px-2 py-0.5 rounded-full border border-[var(--border-color)]">
                {employeeProjects.length}
              </span>
            </div>
          </div>

          <div className="space-y-2 max-h-[320px] overflow-y-auto custom-scrollbar pr-1">
            {employeeProjects.length === 0 ? (
              <div className="text-center py-8">
                <Briefcase className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-2" />
                <p className="text-sm text-[var(--text-secondary)]">No projects assigned</p>
              </div>
            ) : (
              employeeProjects.slice(0, 5).map((project) => {
                const employeeTasks = (project.tasks || []).filter(task => {
                  const taskUser = task.user?._id || task.user;
                  return taskUser && String(taskUser) === String(employee._id);
                });

                const totalTasks = employeeTasks.length;
                const completedTasks = employeeTasks.filter(t => t.completed || t.status === "Completed").length;
                const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

                return (
                  <div
                    key={project._id}
                    className="p-3 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)] hover:border-[var(--border-hover)] transition cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                          {project.projectName || project.name || "Untitled"}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-[var(--text-muted)] mt-0.5">
                          <span>{totalTasks} tasks</span>
                          <span className="w-1 h-1 rounded-full bg-[var(--border-color)]"></span>
                          <span className={progress >= 80 ? "text-[var(--success)]" : progress >= 50 ? "text-[var(--accent-primary)]" : "text-[var(--warning)]"}>
                            {progress}% done
                          </span>
                        </div>
                      </div>
                      <div className="w-20 h-1.5 bg-[var(--bg-input)] rounded-full overflow-hidden ml-3 flex-shrink-0">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${getProgressColor(progress)}`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                    {project.endDate && (
                      <div className="flex items-center gap-1 text-[10px] text-[var(--text-muted)] mt-1">
                        <Calendar className="w-3 h-3" />
                        <span>Deadline: {formatDate(project.endDate)}</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
            {employeeProjects.length > 5 && (
              <button
                onClick={() => navigate("/admin/project")}
                className="w-full text-center text-xs text-[var(--accent-primary)] hover:text-[var(--accent-hover)] py-2"
              >
                + {employeeProjects.length - 5} more projects
              </button>
            )}
          </div>
        </div>

        {/* TOP PERFORMERS */}
        <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] p-5 hover:border-[var(--border-hover)] transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <h3 className="text-base font-semibold text-[var(--text-primary)]">Top Performers</h3>
              <span className="text-xs text-[var(--text-muted)] bg-[var(--bg-secondary)] px-2 py-0.5 rounded-full border border-[var(--border-color)]">
                {topPerformers.length}
              </span>
            </div>
            <button
              onClick={() => navigate("/layout/ranking-employees")}
              className="text-xs text-[var(--accent-primary)] hover:text-[var(--accent-hover)] transition flex items-center gap-1"
            >
              View All <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2 max-h-[320px] overflow-y-auto custom-scrollbar pr-1">
            {topPerformers.length === 0 ? (
              <div className="text-center py-8">
                <Trophy className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-2" />
                <p className="text-sm text-[var(--text-secondary)]">No performer data available</p>
              </div>
            ) : (
              topPerformers.map((performer, index) => {
                const rank = index + 1;
                const isCurrentUser = employee && String(performer.userId) === String(employee._id);
                return (
                  <div
                    key={performer.userId || index}
                    className={`flex items-center gap-3 p-2 rounded-lg border transition ${rank === 1 ? "border-yellow-500/30 bg-yellow-500/5" :
                        rank === 2 ? "border-gray-400/30 bg-gray-400/5" :
                          rank === 3 ? "border-amber-600/30 bg-amber-600/5" :
                            "border-[var(--border-color)] bg-[var(--bg-secondary)]"
                      } ${isCurrentUser ? "border-[var(--accent-primary)]/30 bg-[var(--accent-primary)]/5" : ""}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${rank === 1 ? "bg-yellow-500/20 text-yellow-600" :
                        rank === 2 ? "bg-gray-400/20 text-gray-500" :
                          rank === 3 ? "bg-amber-500/20 text-amber-600" :
                            "bg-[var(--bg-input)] text-[var(--text-muted)]"
                      }`}>
                      {getRankIcon(index)}
                    </div>

                    <div className="w-8 h-8 rounded-full bg-[var(--accent-primary)] flex items-center justify-center text-[var(--text-inverse)] font-bold text-xs flex-shrink-0">
                      {performer.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                        {performer.name || "Unknown"}
                        {isCurrentUser && (
                          <span className="ml-2 text-[10px] text-[var(--accent-primary)] bg-[var(--accent-primary)]/10 px-1.5 py-0.5 rounded border border-[var(--accent-primary)]/20">
                            You
                          </span>
                        )}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                        <span>{performer.taskCount} tasks</span>
                        <span className="w-1 h-1 rounded-full bg-[var(--border-color)]"></span>
                        <span className={getMarksColor(performer.avgMarks)}>
                          {performer.avgMarks}% avg
                        </span>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className={`text-sm font-bold ${getMarksColor(performer.avgMarks)}`}>
                        {performer.totalMarks || 0}
                      </span>
                      <p className="text-[9px] text-[var(--text-muted)]">points</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: var(--border-color);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: var(--text-muted);
        }
      `}</style>
    </div>
  );
};

export default EmployeeDashboard;