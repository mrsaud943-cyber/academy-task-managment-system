import React, { useState, useEffect, useMemo } from "react";
import { useNavigate }from "react-router-dom";
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
} from "lucide-react";

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
      
      // ✅ Filter projects that have tasks assigned to this employee
      const filteredProjects = projectsData.filter(project => {
        return (project.tasks || []).some(task => {
          const taskUser = task.user?._id || task.user;
          return taskUser && String(taskUser) === String(employee._id);
        });
      });
      
      setEmployeeProjects(filteredProjects);
      
      // ✅ Calculate employee's stats
      calculateEmployeeStats(projectsData);
      
      // ✅ Calculate top performers (all employees)
      calculateTopPerformers(projectsData);

    } catch (error) {
      console.error("❌ Error fetching data:", error);
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
        console.error("❌ Fallback also failed:", fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ Calculate ONLY employee's stats
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

        // ✅ Only count tasks assigned to this employee
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

  // ✅ Calculate Top Performers (ALL employees)
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
    return <Star className="w-4 h-4 text-[#8a7a6a]" />;
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-[#2c1810] animate-spin" />
        <p className="text-[#8a7a6a] text-sm">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f0eb] p-3 sm:p-4">
      <div className="max-w-7xl mx-auto space-y-4">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#e5ddd5]">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#2c1810]">Dashboard</h1>
            <p className="text-sm text-[#8a7a6a]">Overview of your performance</p>
          </div>
          <div className="text-xs text-[#8a7a6a] bg-[#faf7f3] px-3 py-1.5 rounded-full border border-[#e5ddd5]">
            Welcome, {employee?.name || "Employee"}
          </div>
        </div>

        {/* STATS GRID - Only employee's stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-[#faf7f3] border border-[#e5ddd5] rounded-xl p-3 text-center hover:border-[#d4c8bc] transition group">
            <FileText className="w-5 h-5 text-[#2c1810] mx-auto mb-1 group-hover:scale-110 transition" />
            <p className="text-xl font-bold text-[#2c1810]">{deadlineStats.totalTasks}</p>
            <p className="text-[9px] text-[#8a7a6a] uppercase tracking-wider">Total Tasks</p>
          </div>

          <div className="bg-[#faf7f3] border border-[#e5ddd5] rounded-xl p-3 text-center hover:border-[#d4c8bc] transition group">
            <CheckCircle className="w-5 h-5 text-emerald-600 mx-auto mb-1 group-hover:scale-110 transition" />
            <p className="text-xl font-bold text-emerald-600">{deadlineStats.completedTasks}</p>
            <p className="text-[9px] text-[#8a7a6a] uppercase tracking-wider">Completed</p>
          </div>

          <div className="bg-[#faf7f3] border border-[#e5ddd5] rounded-xl p-3 text-center hover:border-[#d4c8bc] transition group">
            <Clock className="w-5 h-5 text-amber-600 mx-auto mb-1 group-hover:scale-110 transition" />
            <p className="text-xl font-bold text-amber-600">{deadlineStats.pendingTasks}</p>
            <p className="text-[9px] text-[#8a7a6a] uppercase tracking-wider">Pending</p>
          </div>

          <div className="bg-[#faf7f3] border border-[#e5ddd5] rounded-xl p-3 text-center hover:border-[#d4c8bc] transition group">
            <Star className="w-5 h-5 text-amber-600 mx-auto mb-1 group-hover:scale-110 transition" />
            <p className={`text-xl font-bold ${getMarksColor(deadlineStats.totalMarks)}`}>{deadlineStats.totalMarks}</p>
            <p className="text-[9px] text-[#8a7a6a] uppercase tracking-wider">Total Marks</p>
          </div>

          <div className="bg-[#faf7f3] border border-[#e5ddd5] rounded-xl p-3 text-center hover:border-[#d4c8bc] transition group">
            <TrendingUp className="w-5 h-5 text-[#2c1810] mx-auto mb-1 group-hover:scale-110 transition" />
            <p className={`text-xl font-bold ${getMarksColor(deadlineStats.avgMarks)}`}>{deadlineStats.avgMarks}%</p>
            <p className="text-[9px] text-[#8a7a6a] uppercase tracking-wider">Average</p>
          </div>

          <div className="bg-[#faf7f3] border border-[#e5ddd5] rounded-xl p-3 text-center hover:border-[#d4c8bc] transition group">
            <AlertTriangle className="w-5 h-5 text-red-600 mx-auto mb-1 group-hover:scale-110 transition" />
            <p className="text-xl font-bold text-red-600">{deadlineStats.missedDeadlines}</p>
            <p className="text-[9px] text-[#8a7a6a] uppercase tracking-wider">Missed</p>
          </div>
        </div>

        {/* BOTTOM ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* TOP PERFORMERS - All employees */}
          <div className="bg-[#faf7f3] border border-[#e5ddd5] rounded-xl overflow-hidden">
            <div className="bg-[#f5f0eb] border-b border-[#e5ddd5] px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-medium text-[#2c1810]">Top Performers</h3>
                <span className="text-xs text-[#8a7a6a] bg-[#faf7f3] px-2 py-0.5 rounded-full border border-[#e5ddd5]">
                  {topPerformers.length}
                </span>
              </div>
              <button 
                onClick={() => navigate("/layout/ranking-employees")}
                className="text-xs text-[#8a7a6a] hover:text-[#2c1810] transition flex items-center gap-1"
              >
                View All
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-3 divide-y divide-[#e5ddd5] max-h-[320px] overflow-y-auto custom-scrollbar">
              {topPerformers.length === 0 ? (
                <div className="p-6 text-center">
                  <Trophy className="w-10 h-10 text-[#8a7a6a] mx-auto mb-2" />
                  <p className="text-sm text-[#8a7a6a]">No performer data available</p>
                </div>
              ) : (
                topPerformers.map((performer, index) => {
                  const rank = index + 1;
                  const isCurrentUser = employee && String(performer.userId) === String(employee._id);
                  return (
                    <div 
                      key={performer.userId || index} 
                      className={`flex items-center gap-3 py-2.5 px-2 rounded-lg transition hover:bg-[#f5f0eb] ${
                        rank === 1 ? "bg-amber-50" : ""
                      } ${isCurrentUser ? "border border-[#2c1810]/30 bg-[#2c1810]/5" : ""}`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        rank === 1 ? "bg-amber-100 text-amber-600" :
                        rank === 2 ? "bg-gray-200 text-gray-500" :
                        rank === 3 ? "bg-amber-100 text-amber-600" :
                        "bg-[#f5f0eb] text-[#8a7a6a]"
                      }`}>
                        {getRankIcon(index)}
                      </div>

                      <div className="w-8 h-8 rounded-full bg-[#2c1810] flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                        {performer.name?.charAt(0)?.toUpperCase() || "U"}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#2c1810] truncate">
                          {performer.name || "Unknown"}
                          {isCurrentUser && (
                            <span className="ml-2 text-[10px] text-[#2c1810] bg-[#2c1810]/10 px-1.5 py-0.5 rounded border border-[#2c1810]/20">
                              You
                            </span>
                          )}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-[#8a7a6a]">
                          <span>{performer.taskCount} tasks</span>
                          <span className="w-1 h-1 rounded-full bg-[#e5ddd5]"></span>
                          <span className={getMarksColor(performer.avgMarks)}>
                            {performer.avgMarks} avg
                          </span>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <span className={`text-sm font-bold ${getMarksColor(performer.avgMarks)}`}>
                          {performer.totalMarks || 0}
                        </span>
                        <p className="text-[9px] text-[#8a7a6a]">points</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* MY PROJECTS - Only employee's projects */}
          <div className="bg-[#faf7f3] border border-[#e5ddd5] rounded-xl overflow-hidden">
            <div className="bg-[#f5f0eb] border-b border-[#e5ddd5] px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#2c1810]" />
                <h3 className="text-sm font-medium text-[#2c1810]">My Projects</h3>
                <span className="text-xs text-[#8a7a6a] bg-[#faf7f3] px-2 py-0.5 rounded-full border border-[#e5ddd5]">
                  {employeeProjects.length}
                </span>
              </div>
              <button 
                onClick={() => navigate("/admin/project")}
                className="text-xs text-[#8a7a6a] hover:text-[#2c1810] transition flex items-center gap-1"
              >
                View All
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-3 divide-y divide-[#e5ddd5] max-h-[320px] overflow-y-auto custom-scrollbar">
              {employeeProjects.length === 0 ? (
                <div className="p-6 text-center">
                  <Briefcase className="w-10 h-10 text-[#8a7a6a] mx-auto mb-2" />
                  <p className="text-sm text-[#8a7a6a]">You are not assigned to any projects</p>
                </div>
              ) : (
                employeeProjects.slice(0, 5).map((project) => {
                  // ✅ Count only tasks assigned to this employee in this project
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
                      className="py-3 px-2 hover:bg-[#f5f0eb] rounded-lg transition cursor-pointer"
                      onClick={() => navigate(`/admin/project/${project._id}`)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#2c1810] truncate">
                            {project.projectName || project.name || "Untitled"}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-[#8a7a6a] mt-0.5">
                            <span>{totalTasks} tasks</span>
                            <span className="w-1 h-1 rounded-full bg-[#e5ddd5]"></span>
                            <span className={progress >= 80 ? "text-emerald-600" : progress >= 50 ? "text-blue-600" : "text-amber-600"}>
                              {progress}% done
                            </span>
                          </div>
                        </div>
                        <div className="w-20 h-1.5 bg-[#e5ddd5] rounded-full overflow-hidden ml-3 flex-shrink-0">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${getProgressColor(progress)}`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                      {project.endDate && (
                        <div className="flex items-center gap-1 text-[10px] text-[#8a7a6a] mt-1">
                          <Calendar className="w-3 h-3" />
                          <span>Deadline: {formatDate(project.endDate)}</span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
              {employeeProjects.length > 5 && (
                <div className="py-2 text-center">
                  <button 
                    onClick={() => navigate("/admin/project")}
                    className="text-xs text-[#2c1810] hover:text-[#2c1810]/70 transition"
                  >
                    + {employeeProjects.length - 5} more projects
                  </button>
                </div>
              )}
            </div>
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
          background: #d4c8bc;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #b8a898;
        }
      `}</style>
    </div>
  );
};

export default EmployeeDashboard;