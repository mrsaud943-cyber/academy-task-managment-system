// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import api from "../../service/api.js";
// import { 
//   Users, 
//   UserCheck, 
//   UserX, 
//   Loader2, 
//   TrendingUp, 
//   Award,
//   Briefcase,
//   Calendar,
//   CheckCircle,
//   Clock,
//   AlertCircle,
//   ChevronRight,
//   AlertTriangle,
//   CheckCircle2,
//   Target,
//   History,
// } from "lucide-react";
// import TopPerformers from "../components/TopPerformerCard.jsx";
// import { autoZeroMissedTasks } from "../utility/autoZero.js";

// const Dashboard = () => {
//   const navigate = useNavigate();
//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [topPerformers, setTopPerformers] = useState([]);
//   const [performerLoading, setPerformerLoading] = useState(true);
//   const [projects, setProjects] = useState([]);
  
//   // ✅ Deadline Stats
//   const [deadlineStats, setDeadlineStats] = useState({
//     topMissed: [],
//     totalMissed: 0,
//     totalOnTime: 0,
//     totalDeadlines: 0,
//   });
//   const [deadlineLoading, setDeadlineLoading] = useState(true);

//   useEffect(() => {
//     const fetchAllData = async () => {
//       await autoZeroMissedTasks();
//       await fetchUsers();
//       await fetchTopPerformers();
//       await fetchDeadlineStats();
//       setLoading(false);
//     };

//     fetchAllData();
//   }, []);

//   const fetchUsers = async () => {
//     try {
//       const res = await api.get("/user/all-users");
//       const employees = (res.data.users || []).filter(
//         (u) => u.role === "employee"
//       );
//       setUsers(employees);
//     } catch (error) {
//       console.log("Error fetching users:", error);
//     }
//   };

//   const fetchTopPerformers = async () => {
//     setPerformerLoading(true);
//     try {
//       const res = await api.get("/ranking/top-performers", {
//         params: { limit: 5 }
//       });
//       if (res.data.success) {
//         const filteredPerformers = res.data.data.filter(
//           performer => performer.taskCount > 0 && performer.avgMarks > 0
//         );
//         setTopPerformers(filteredPerformers);
//       }
//     } catch (error) {
//       console.error("Error fetching top performers:", error);
//       setTopPerformers([]);
//     } finally {
//       setPerformerLoading(false);
//     }
//   };

//   const fetchDeadlineStats = async () => {
//     setDeadlineLoading(true);
//     try {
//       const res = await api.get("/ranking/deadline-rankings", {
//         params: {
//           page: 1,
//           limit: 100,
//           filterBy: "missed",
//           sortOrder: "desc",
//         },
//       });

//       if (res.data.success) {
//         const data = res.data.data || [];
        
//         let totalMissed = 0;
//         let totalOnTime = 0;
//         let totalDeadlines = 0;
        
//         data.forEach(item => {
//           totalMissed += item.missedDeadlines || 0;
//           totalOnTime += item.onTimeTasks || 0;
//           totalDeadlines += item.tasksWithDeadline || 0;
//         });

//         const topMissed = data
//           .filter(item => item.missedDeadlines > 0)
//           .sort((a, b) => b.missedDeadlines - a.missedDeadlines)
//           .slice(0, 5);

//         setDeadlineStats({
//           topMissed,
//           totalMissed,
//           totalOnTime,
//           totalDeadlines,
//         });
//       }
//     } catch (error) {
//       console.error("Error fetching deadline stats:", error);
//     } finally {
//       setDeadlineLoading(false);
//     }
//   };

//   // COUNTS
//   const totalEmployees = users.length;
//   const activeEmployees = users.filter((u) => u.isActive === true).length;
//   const inactiveEmployees = users.filter((u) => u.isActive === false).length;
//   const totalTasks = projects.reduce((acc, p) => acc + (p.tasks?.length || 0), 0);
//   const totalProjects = projects.length;

//   if (loading) {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
//         <Loader2 className="w-8 h-8 text-[var(--accent-primary)] animate-spin" />
//         <p className="text-[var(--text-secondary)] text-sm">Loading dashboard...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6 p-4 md:p-6">
//       {/* Header */}
//       <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] overflow-hidden">
//         <div className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)] px-6 py-5">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-3">
//               <div className="bg-[var(--accent-primary)]/10 p-2.5 rounded-xl">
//                 <Users className="w-5 h-5 text-[var(--accent-primary)]" />
//               </div>
//               <div>
//                 <h1 className="text-xl font-semibold text-[var(--text-primary)]">Dashboard</h1>
//                 <p className="text-sm text-[var(--text-secondary)]">Overview of your team and projects</p>
//               </div>
//             </div>
//             {/* ✅ History Button */}
//             <button
//               onClick={() => navigate("/admin/history")}
//               className="inline-flex items-center gap-2 bg-[var(--bg-hover)] hover:bg-[var(--bg-input)] text-[var(--text-primary)] px-4 py-2.5 rounded-lg text-sm font-medium transition border border-[var(--border-color)] hover:border-[var(--border-hover)]"
//             >
//               <History className="w-4 h-4" />
//               View History
//             </button>
//           </div>
//         </div>

//         {/* Stats Grid */}
//         <div className="p-6">
//           <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
//             {/* Total Employees */}
//             <div className="bg-[var(--bg-secondary)] p-4 rounded-xl border border-[var(--border-color)] hover:border-[var(--border-hover)] transition-all group">
//               <div className="flex items-center gap-3">
//                 <div className="p-2 rounded-lg bg-[var(--accent-primary)]/10 group-hover:bg-[var(--accent-primary)]/20 transition">
//                   <Users className="w-4 h-4 text-[var(--accent-primary)]" />
//                 </div>
//                 <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Total</span>
//               </div>
//               <p className="text-2xl font-bold text-[var(--text-primary)] mt-2">{totalEmployees}</p>
//               <p className="text-[10px] text-[var(--text-muted)] mt-1">Employees</p>
//             </div>

//             {/* Active */}
//             <div className="bg-[var(--bg-secondary)] p-4 rounded-xl border border-[var(--border-color)] hover:border-[var(--border-hover)] transition-all group">
//               <div className="flex items-center gap-3">
//                 <div className="p-2 rounded-lg bg-[var(--success)]/10 group-hover:bg-[var(--success)]/20 transition">
//                   <UserCheck className="w-4 h-4 text-[var(--success)]" />
//                 </div>
//                 <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Active</span>
//               </div>
//               <p className="text-2xl font-bold text-[var(--success)] mt-2">{activeEmployees}</p>
//               <p className="text-[10px] text-[var(--text-muted)] mt-1">Active employees</p>
//             </div>

//             {/* Inactive */}
//             <div className="bg-[var(--bg-secondary)] p-4 rounded-xl border border-[var(--border-color)] hover:border-[var(--border-hover)] transition-all group">
//               <div className="flex items-center gap-3">
//                 <div className="p-2 rounded-lg bg-[var(--danger)]/10 group-hover:bg-[var(--danger)]/20 transition">
//                   <UserX className="w-4 h-4 text-[var(--danger)]" />
//                 </div>
//                 <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Inactive</span>
//               </div>
//               <p className="text-2xl font-bold text-[var(--danger)] mt-2">{inactiveEmployees}</p>
//               <p className="text-[10px] text-[var(--text-muted)] mt-1">Inactive employees</p>
//             </div>

//             {/* Projects */}
//             <div className="bg-[var(--bg-secondary)] p-4 rounded-xl border border-[var(--border-color)] hover:border-[var(--border-hover)] transition-all group">
//               <div className="flex items-center gap-3">
//                 <div className="p-2 rounded-lg bg-[var(--accent-light)]/20 group-hover:bg-[var(--accent-light)]/30 transition">
//                   <Briefcase className="w-4 h-4 text-[var(--accent-primary)]" />
//                 </div>
//                 <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Projects</span>
//               </div>
//               <p className="text-2xl font-bold text-[var(--text-primary)] mt-2">{totalProjects}</p>
//               <p className="text-[10px] text-[var(--text-muted)] mt-1">Active projects</p>
//             </div>

//             {/* Missed Deadlines */}
//             <div className="bg-[var(--bg-secondary)] p-4 rounded-xl border border-[var(--border-color)] hover:border-[var(--border-hover)] transition-all group">
//               <div className="flex items-center gap-3">
//                 <div className="p-2 rounded-lg bg-[var(--warning)]/10 group-hover:bg-[var(--warning)]/20 transition">
//                   <AlertTriangle className="w-4 h-4 text-[var(--warning)]" />
//                 </div>
//                 <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Missed</span>
//               </div>
//               <p className="text-2xl font-bold text-[var(--warning)] mt-2">{deadlineStats.totalMissed}</p>
//               <p className="text-[10px] text-[var(--text-muted)] mt-1">Deadlines missed</p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Bottom Row: Top Performers + Deadline Performance */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* Top Performers */}
//         <div className="lg:col-span-1">
//           <TopPerformers performers={topPerformers} loading={performerLoading} compact />
//         </div>

//         {/* Deadline Performance - Only Most Missed Deadlines */}
//         <div className="lg:col-span-1 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] overflow-hidden">
//           <div className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)] px-5 py-3 flex items-center justify-between">
//             <div className="flex items-center gap-2">
//               <Target className="w-4 h-4 text-[var(--warning)]" />
//               <h3 className="text-sm font-medium text-[var(--text-primary)]">Deadline Performance</h3>
//             </div>
//             <button 
//               onClick={() => navigate("/admin/deadline-ranking")}
//               className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition flex items-center gap-1"
//             >
//               View All
//               <ChevronRight className="w-3.5 h-3.5" />
//             </button>
//           </div>

//           {deadlineLoading ? (
//             <div className="flex items-center justify-center py-8">
//               <Loader2 className="w-6 h-6 text-[var(--warning)] animate-spin" />
//             </div>
//           ) : deadlineStats.topMissed.length === 0 ? (
//             <div className="p-6 text-center">
//               <Target className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-2" />
//               <p className="text-[var(--text-secondary)] text-sm">No deadline data available</p>
//             </div>
//           ) : (
//             <div className="p-3 divide-y divide-[var(--border-color)]">
//               {/* Top Missed Deadlines - Only this section */}
//               <div className="pb-2">
//                 <div className="flex items-center gap-1.5 mb-1.5 text-[10px] text-[var(--warning)] font-medium">
//                   <AlertTriangle className="w-3 h-3" />
//                   Most Missed Deadlines
//                 </div>
//                 {deadlineStats.topMissed.slice(0, 5).map((item, index) => (
//                   <div key={item.userId || index} className="flex items-center gap-2 py-1.5">
//                     <div className="w-6 h-6 rounded-full bg-[var(--warning)]/20 flex items-center justify-center text-[8px] font-bold text-[var(--warning)] flex-shrink-0">
//                       {index + 1}
//                     </div>
//                     <div className="flex-1 min-w-0">
//                       <p className="text-xs text-[var(--text-primary)] truncate">{item.user?.name || "Unknown"}</p>
//                     </div>
//                     <span className="text-xs font-bold text-[var(--warning)]">{item.missedDeadlines}</span>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;




import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../service/api.js";
import { 
  Users, 
  UserCheck, 
  UserX, 
  Loader2, 
  TrendingUp, 
  Award,
  Briefcase,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Target,
  History,
} from "lucide-react";
import TopPerformers from "../components/TopPerformerCard.jsx";
import { autoZeroMissedTasks } from "../utility/autoZero.js";

const Dashboard = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [topPerformers, setTopPerformers] = useState([]);
  const [performerLoading, setPerformerLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  
  // ✅ Deadline Stats
  const [deadlineStats, setDeadlineStats] = useState({
    topMissed: [],
    totalMissed: 0,
    totalOnTime: 0,
    totalDeadlines: 0,
  });
  const [deadlineLoading, setDeadlineLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      await autoZeroMissedTasks();
      await fetchUsers();
      await fetchTopPerformers();
      await fetchDeadlineStats();
      setLoading(false);
    };

    fetchAllData();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/user/all-users");
      const employees = (res.data.users || []).filter(
        (u) => u.role === "employee"
      );
      setUsers(employees);
    } catch (error) {
      console.log("Error fetching users:", error);
    }
  };

  const fetchTopPerformers = async () => {
    setPerformerLoading(true);
    try {
      const res = await api.get("/ranking/top-performers", {
        params: { limit: 5 }
      });
      if (res.data.success) {
        const filteredPerformers = res.data.data.filter(
          performer => performer.taskCount > 0 && performer.avgMarks > 0
        );
        setTopPerformers(filteredPerformers);
      }
    } catch (error) {
      console.error("Error fetching top performers:", error);
      setTopPerformers([]);
    } finally {
      setPerformerLoading(false);
    }
  };

  const fetchDeadlineStats = async () => {
    setDeadlineLoading(true);
    try {
      const res = await api.get("/ranking/deadline-rankings", {
        params: {
          page: 1,
          limit: 100,
          filterBy: "missed",
          sortOrder: "desc",
        },
      });

      if (res.data.success) {
        const data = res.data.data || [];
        
        let totalMissed = 0;
        let totalOnTime = 0;
        let totalDeadlines = 0;
        
        data.forEach(item => {
          totalMissed += item.missedDeadlines || 0;
          totalOnTime += item.onTimeTasks || 0;
          totalDeadlines += item.tasksWithDeadline || 0;
        });

        const topMissed = data
          .filter(item => item.missedDeadlines > 0)
          .sort((a, b) => b.missedDeadlines - a.missedDeadlines)
          .slice(0, 5);

        setDeadlineStats({
          topMissed,
          totalMissed,
          totalOnTime,
          totalDeadlines,
        });
      }
    } catch (error) {
      console.error("Error fetching deadline stats:", error);
    } finally {
      setDeadlineLoading(false);
    }
  };

  // COUNTS
  const totalEmployees = users.length;
  const activeEmployees = users.filter((u) => u.isActive === true).length;
  const inactiveEmployees = users.filter((u) => u.isActive === false).length;
  const totalTasks = projects.reduce((acc, p) => acc + (p.tasks?.length || 0), 0);
  const totalProjects = projects.length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-[var(--accent-primary)] animate-spin" />
        <p className="text-[var(--text-secondary)] text-sm">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header - Using ui-card */}
      <div className="ui-card">
        <div className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)] px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-[var(--accent-primary)]/10 p-2.5 rounded-lg">
                <Users className="w-5 h-5 text-[var(--accent-primary)]" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-[var(--text-primary)]">Dashboard</h1>
                <p className="text-sm text-[var(--text-secondary)]">Overview of your team and projects</p>
              </div>
            </div>
            {/* ✅ History Button - Using ui-btn */}
            <button
              onClick={() => navigate("/admin/history")}
              className="ui-btn ui-btn-primary inline-flex items-center gap-2"
            >
              <History className="w-4 h-4" />
              View History
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {/* Total Employees */}
            <div className="ui-card hover:border-[var(--border-hover)] transition-all group">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[var(--accent-primary)]/10 group-hover:bg-[var(--accent-primary)]/20 transition">
                  <Users className="w-4 h-4 text-[var(--accent-primary)]" />
                </div>
                <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Total</span>
              </div>
              <p className="text-2xl font-bold text-[var(--text-primary)] mt-2">{totalEmployees}</p>
              <p className="text-[10px] text-[var(--text-muted)] mt-1">Employees</p>
            </div>

            {/* Active */}
            <div className="ui-card hover:border-[var(--border-hover)] transition-all group">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[var(--success)]/10 group-hover:bg-[var(--success)]/20 transition">
                  <UserCheck className="w-4 h-4 text-[var(--success)]" />
                </div>
                <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Active</span>
              </div>
              <p className="text-2xl font-bold text-[var(--success)] mt-2">{activeEmployees}</p>
              <p className="text-[10px] text-[var(--text-muted)] mt-1">Active employees</p>
            </div>

            {/* Inactive */}
            <div className="ui-card hover:border-[var(--border-hover)] transition-all group">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[var(--danger)]/10 group-hover:bg-[var(--danger)]/20 transition">
                  <UserX className="w-4 h-4 text-[var(--danger)]" />
                </div>
                <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Inactive</span>
              </div>
              <p className="text-2xl font-bold text-[var(--danger)] mt-2">{inactiveEmployees}</p>
              <p className="text-[10px] text-[var(--text-muted)] mt-1">Inactive employees</p>
            </div>

            {/* Projects */}
            <div className="ui-card hover:border-[var(--border-hover)] transition-all group">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[var(--accent-light)]/20 group-hover:bg-[var(--accent-light)]/30 transition">
                  <Briefcase className="w-4 h-4 text-[var(--accent-primary)]" />
                </div>
                <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Projects</span>
              </div>
              <p className="text-2xl font-bold text-[var(--text-primary)] mt-2">{totalProjects}</p>
              <p className="text-[10px] text-[var(--text-muted)] mt-1">Active projects</p>
            </div>

            {/* Missed Deadlines */}
            <div className="ui-card hover:border-[var(--border-hover)] transition-all group">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[var(--warning)]/10 group-hover:bg-[var(--warning)]/20 transition">
                  <AlertTriangle className="w-4 h-4 text-[var(--warning)]" />
                </div>
                <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Missed</span>
              </div>
              <p className="text-2xl font-bold text-[var(--warning)] mt-2">{deadlineStats.totalMissed}</p>
              <p className="text-[10px] text-[var(--text-muted)] mt-1">Deadlines missed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Top Performers + Deadline Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <div className="lg:col-span-1">
          <TopPerformers performers={topPerformers} loading={performerLoading} compact />
        </div>

        {/* Deadline Performance - Using ui-card */}
        <div className="lg:col-span-1 ui-card overflow-hidden">
          <div className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)] px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-[var(--warning)]" />
              <h3 className="text-sm font-medium text-[var(--text-primary)]">Deadline Performance</h3>
            </div>
            <button 
              onClick={() => navigate("/admin/deadline-ranking")}
              className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition flex items-center gap-1"
            >
              View All
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {deadlineLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-[var(--warning)] animate-spin" />
            </div>
          ) : deadlineStats.topMissed.length === 0 ? (
            <div className="p-6 text-center">
              <Target className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-2" />
              <p className="text-[var(--text-secondary)] text-sm">No deadline data available</p>
            </div>
          ) : (
            <div className="p-3 divide-y divide-[var(--border-color)]">
              {/* Top Missed Deadlines */}
              <div className="pb-2">
                <div className="flex items-center gap-1.5 mb-1.5 text-[10px] text-[var(--warning)] font-medium">
                  <AlertTriangle className="w-3 h-3" />
                  Most Missed Deadlines
                </div>
                {deadlineStats.topMissed.slice(0, 5).map((item, index) => (
                  <div key={item.userId || index} className="flex items-center gap-2 py-1.5">
                    <div className="w-6 h-6 rounded-full bg-[var(--warning)]/20 flex items-center justify-center text-[8px] font-bold text-[var(--warning)] flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[var(--text-primary)] truncate">{item.user?.name || "Unknown"}</p>
                    </div>
                    <span className="text-xs font-bold text-[var(--warning)]">{item.missedDeadlines}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;