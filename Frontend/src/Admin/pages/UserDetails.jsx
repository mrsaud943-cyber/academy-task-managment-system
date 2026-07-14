// import React, { useState, useEffect } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import api from "../../service/api.js";
// import {
//   ArrowLeft,
//   User,
//   Mail,
//   Calendar,
//   Shield,
//   Award,
//   CheckCircle2,
//   Clock,
//   AlertCircle,
//   Loader2,
//   FolderKanban,
//   Briefcase,
//   Trophy,
//   GraduationCap,
//   Edit2,
//   Trash2,
//   Save,
//   X,
//   Check,
//   AlertTriangle,
//   Zap,
//   TrendingUp,
//   TrendingDown,
//   BarChart3,
//   PieChart,
//   Star,
//   Target,
// } from "lucide-react";
// import toast, { Toaster } from 'react-hot-toast';

// const UserDetail = () => {
//   const { userId } = useParams();
//   const navigate = useNavigate();
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [userTasks, setUserTasks] = useState([]);
//   const [projects, setProjects] = useState([]);
//   const [isEditing, setIsEditing] = useState(false);
//   const [editFormData, setEditFormData] = useState({
//     name: "",
//     email: "",
//     role: "",
//     isActive: true,
//     marks: 0,
//   });
//   const [submitting, setSubmitting] = useState(false);
//   const [deadlineStats, setDeadlineStats] = useState({
//     totalMissed: 0,
//     missedTasks: [],
//     autoZeroedTasks: [],
//   });
//   const [marksPercentage, setMarksPercentage] = useState({
//     total: 0,
//     average: 0,
//     highest: 0,
//     lowest: 100,
//     grade: "",
//     status: "",
//   });

//   useEffect(() => {
//     fetchUserDetails();
//     fetchUserTasks();
//   }, [userId]);

//   const fetchUserDetails = async () => {
//     try {
//       const res = await api.get("/user/all-users");
//       let usersData = res.data.users || res.data.data || res.data || [];
//       const allUsers = Array.isArray(usersData) ? usersData : [];
//       const foundUser = allUsers.find(u => u._id === userId);

//       if (foundUser) {
//         setUser(foundUser);
//         setEditFormData({
//           name: foundUser.name || "",
//           email: foundUser.email || "",
//           role: foundUser.role || "employee",
//           isActive: foundUser.isActive !== undefined ? foundUser.isActive : true,
//           marks: foundUser.marks || 0,
//         });
//       } else {
//         toast.error("User not found");
//         navigate("/admin/users");
//       }
//     } catch (error) {
//       console.error("Error fetching user details:", error);
//       toast.error("Failed to load user details");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ✅ FIXED: Update task marks with correct URL
//   const updateTaskMarks = async (taskId, marks, projectId) => {
//     try {
//       const response = await api.put(`/projects/${projectId}/tasks/${taskId}`, {
//         obtainedMarks: marks,
//         completed: false
//       });
//       console.log(`✅ Task ${taskId} marks updated to ${marks} in database`);
//       return response.data;
//     } catch (error) {
//       console.error(`❌ Error updating task ${taskId} marks:`, error);
//       return null;
//     }
//   };


//   // ✅ FIXED: Fetch user tasks WITHOUT auto-zeroing
// // const fetchUserTasks = async () => {
// //   try {
// //     console.log("🔍 Fetching tasks for user:", userId);
    
// //     const res = await api.get("/projects");
// //     const allProjects = res.data || [];
// //     setProjects(allProjects);

// //     const tasks = [];
// //     let missedCount = 0;
// //     const missedTasksList = [];
// //     const autoZeroedList = [];

// //     allProjects.forEach((project) => {
// //       (project.tasks || []).forEach((task) => {
// //         const taskUser = task.user?._id || task.user;
// //         const isUserTask = taskUser === userId || taskUser?._id === userId;
        
// //         if (isUserTask) {
// //           const today = new Date();
// //           const deadline = task.endDate ? new Date(task.endDate) : null;
// //           const isMissed = deadline && deadline < today && !task.completed;

// //           if (isMissed) {
// //             missedCount++;
// //             missedTasksList.push(task._id);
// //           }

// //           // ✅ Check if marks should be zero (but DON'T update here)
// //           const shouldZero = deadline && deadline < today && !task.completed;
// //           const taskCopy = { ...task };

// //           // ✅ Mark as auto-zeroed in UI only
// //           if (shouldZero && task.obtainedMarks > 0) {
// //             autoZeroedList.push(task._id);
// //             taskCopy.obtainedMarks = 0;
// //             taskCopy.completed = false;
// //           }

// //           tasks.push({
// //             ...taskCopy,
// //             projectName: project.projectName,
// //             projectId: project._id,
// //             isMissed: isMissed,
// //             daysOverdue: isMissed ? Math.floor((today - deadline) / (1000 * 60 * 60 * 24)) : 0,
// //           });
// //         }
// //       });
// //     });

// //     setDeadlineStats({
// //       totalMissed: missedCount,
// //       missedTasks: missedTasksList,
// //       autoZeroedTasks: autoZeroedList,
// //     });

// //     setUserTasks(tasks);

// //     if (autoZeroedList.length > 0) {
// //       toast.warning(`⚠️ ${autoZeroedList.length} task(s) have missed deadline. Marks will show as 0.`);
// //     }
// //   } catch (error) {
// //     console.error("❌ Error fetching user tasks:", error);
// //     toast.error("Failed to load user tasks");
// //   }
// // };

// const fetchUserTasks = async () => {
//   try {
//     console.log("🔍 Fetching tasks for user:", userId);
    
//     const res = await api.get("/projects");
//     const allProjects = res.data || [];
//     setProjects(allProjects);

//     const tasks = [];
//     let missedCount = 0;
//     const missedTasksList = [];
//     const autoZeroedList = [];

//     allProjects.forEach((project) => {
//       (project.tasks || []).forEach((task) => {
//         const taskUser = task.user?._id || task.user;
//         const isUserTask = taskUser === userId || taskUser?._id === userId;
        
//         if (isUserTask) {
//           const today = new Date();
//           const deadline = task.endDate ? new Date(task.endDate) : null;
          
//           // ✅ Check if deadline is missed AND task is NOT completed
//           const isMissed = deadline && deadline < today && !task.completed;

//           if (isMissed) {
//             missedCount++;
//             missedTasksList.push(task._id);
//             console.log(`⚠️ Missed deadline: ${task.name} - ${task.endDate}`);
//           }

//           // ✅ Check if marks should be zeroed
//           const shouldZero = deadline && deadline < today && !task.completed;
//           const taskCopy = { ...task };

//           if (shouldZero && task.obtainedMarks > 0) {
//             autoZeroedList.push(task._id);
//             taskCopy.obtainedMarks = 0;
//             taskCopy.completed = false;
//           }

//           tasks.push({
//             ...taskCopy,
//             projectName: project.projectName,
//             projectId: project._id,
//             isMissed: isMissed,
//             daysOverdue: isMissed ? Math.floor((today - deadline) / (1000 * 60 * 60 * 24)) : 0,
//           });
//         }
//       });
//     });

//     console.log(`📊 Total missed deadlines for user: ${missedCount}`);

//     setDeadlineStats({
//       totalMissed: missedCount,
//       missedTasks: missedTasksList,
//       autoZeroedTasks: autoZeroedList,
//     });

//     setUserTasks(tasks);

//     if (autoZeroedList.length > 0) {
//       toast.warning(`⚠️ ${autoZeroedList.length} task(s) have missed deadline. Marks will show as 0.`);
//     }
//   } catch (error) {
//     console.error("❌ Error fetching user tasks:", error);
//     toast.error("Failed to load user tasks");
//   }
// };

//   // ✅ Function to manually zero marks (if needed)
//   const zeroMarksForAllMissedTasks = async () => {
//     try {
//       const res = await api.get("/projects");
//       const allProjects = res.data || [];
//       const updatePromises = [];

//       allProjects.forEach((project) => {
//         (project.tasks || []).forEach((task) => {
//           const taskUser = task.user?._id || task.user;
//           if (taskUser === userId || taskUser?._id === userId) {
//             const today = new Date();
//             const deadline = task.endDate ? new Date(task.endDate) : null;
//             const shouldZero = deadline && deadline < today && !task.completed;
            
//             if (shouldZero && task.obtainedMarks > 0) {
//               updatePromises.push(
//                 updateTaskMarks(task._id, 0, project._id)
//               );
//             }
//           }
//         });
//       });

//       if (updatePromises.length > 0) {
//         await Promise.all(updatePromises);
//         toast.success(`✅ ${updatePromises.length} task(s) zeroed successfully!`);
//         await fetchUserTasks(); // Refresh
//       }
//     } catch (error) {
//       console.error("Error zeroing marks:", error);
//       toast.error("Failed to zero marks");
//     }
//   };

//   // ==================== CRUD OPERATIONS ====================

//   const handleUpdateUser = async () => {
//     setSubmitting(true);
//     try {
//       const res = await api.put(`/user/update/${userId}`, editFormData);
//       setUser(res.data.user);
//       toast.success("User updated successfully!");
//       setIsEditing(false);
//       fetchUserTasks();
//     } catch (error) {
//       console.error("Error updating user:", error);
//       toast.error(error.response?.data?.message || "Failed to update user");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleDeleteUser = async () => {
//     if (!window.confirm(`Are you sure you want to delete ${user?.name}? This action cannot be undone.`)) {
//       return;
//     }

//     setSubmitting(true);
//     try {
//       await api.delete(`/user/delete/${userId}`);
//       toast.success("User deleted successfully!");
//       navigate("/admin/users");
//     } catch (error) {
//       console.error("Error deleting user:", error);
//       toast.error(error.response?.data?.message || "Failed to delete user");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleToggleStatus = async () => {
//     const newStatus = !editFormData.isActive;
//     setSubmitting(true);
//     try {
//       await api.put(`/user/status/${userId}`, { isActive: newStatus });
//       setUser({ ...user, isActive: newStatus });
//       setEditFormData({ ...editFormData, isActive: newStatus });
//       toast.success(`User ${newStatus ? 'activated' : 'deactivated'} successfully!`);
//     } catch (error) {
//       console.error("Error toggling status:", error);
//       toast.error(error.response?.data?.message || "Failed to update status");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleResetPassword = async () => {
//     const newPassword = prompt("Enter new password (min 6 characters):");
//     if (!newPassword) return;

//     if (newPassword.length < 6) {
//       toast.error("Password must be at least 6 characters");
//       return;
//     }

//     setSubmitting(true);
//     try {
//       await api.put(`/user/update/${userId}`, { password: newPassword });
//       toast.success("Password reset successfully!");
//     } catch (error) {
//       console.error("Error resetting password:", error);
//       toast.error(error.response?.data?.message || "Failed to reset password");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const getStatusColor = (status) => {
//     const colors = {
//       Completed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
//       "In Progress": "bg-blue-500/10 text-blue-400 border-blue-500/20",
//       Pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
//     };
//     return colors[status] || "bg-neutral-500/10 text-neutral-400 border-neutral-500/20";
//   };

//   const getStatusIcon = (status) => {
//     const icons = {
//       Completed: CheckCircle2,
//       "In Progress": Clock,
//       Pending: AlertCircle,
//     };
//     return icons[status] || AlertCircle;
//   };

//   const getMarksColor = (marks) => {
//     if (marks >= 80) return "text-emerald-400";
//     if (marks >= 60) return "text-blue-400";
//     if (marks >= 40) return "text-amber-400";
//     return "text-rose-400";
//   };

//   const formatDate = (date) => {
//     if (!date) return "N/A";
//     return new Date(date).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//     });
//   };

//   const calculateStats = () => {
//     const total = userTasks.length;
//     const completed = userTasks.filter(t => t.completed).length;
//     const inProgress = userTasks.filter(t => t.status === "In Progress").length;
//     const pending = userTasks.filter(t => t.status === "Pending").length;
//     const totalMarks = userTasks.reduce((sum, t) => sum + (t.obtainedMarks || 0), 0);
//     const avgMarks = total > 0 ? Math.round(totalMarks / total) : 0;

//     return { total, completed, inProgress, pending, totalMarks, avgMarks };
//   };

//   if (loading) {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
//         <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
//         <p className="text-neutral-400 text-sm">Loading user details...</p>
//       </div>
//     );
//   }

//   if (!user) {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-[60vh]">
//         <User className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
//         <p className="text-neutral-400 text-lg">User not found</p>
//         <button
//           onClick={() => navigate("/admin/users")}
//           className="mt-4 text-blue-400 hover:text-blue-300 text-sm font-medium transition"
//         >
//           Go back to users
//         </button>
//       </div>
//     );
//   }

//   const stats = calculateStats();

//   return (
//     <>
//       <Toaster
//         position="top-right"
//         toastOptions={{
//           duration: 4000,
//           style: {
//             background: '#1a1a1a',
//             color: '#fff',
//             border: '1px solid #333',
//           },
//           success: {
//             iconTheme: { primary: '#10b981', secondary: '#fff' },
//           },
//           error: {
//             iconTheme: { primary: '#ef4444', secondary: '#fff' },
//           },
//         }}
//       />
//       <div className="bg-[#121212] rounded-xl border border-neutral-800 overflow-hidden">
//         {/* Header */}
//         <div className="bg-[#0a0a0a] border-b border-neutral-800 px-6 py-5">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-4">
//               <button
//                 onClick={() => navigate("/admin/users")}
//                 className="p-2 hover:bg-neutral-800 rounded-lg transition text-neutral-400 hover:text-white border border-transparent hover:border-neutral-700"
//               >
//                 <ArrowLeft className="w-5 h-5" />
//               </button>

//               {!isEditing ? (
//                 <div className="flex items-center gap-4">
//                   <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xl font-bold shadow-lg ring-2 ring-blue-500/30">
//                     {user.name?.charAt(0) || "U"}
//                   </div>
//                   <div>
//                     <h1 className="text-xl font-semibold text-white">{user.name}</h1>
//                     <div className="flex items-center gap-3 mt-1 flex-wrap">
//                       <span className="text-sm text-neutral-400 flex items-center gap-1">
//                         <Mail className="w-3.5 h-3.5" />
//                         {user.email}
//                       </span>
//                       <span className="text-xs px-2 py-0.5 bg-blue-600/10 text-blue-400 border border-blue-500/20 rounded-full capitalize">
//                         {user.role}
//                       </span>
//                       <span className={`text-xs px-2 py-0.5 rounded-full border ${user.isActive
//                           ? "bg-emerald-600/10 text-emerald-400 border-emerald-500/20"
//                           : "bg-rose-600/10 text-rose-400 border-rose-500/20"
//                         }`}>
//                         {user.isActive ? "Active" : "Inactive"}
//                       </span>
//                       {deadlineStats.totalMissed > 0 && (
//                         <span className="text-xs px-2 py-0.5 rounded-full border bg-rose-600/10 text-rose-400 border-rose-500/20 flex items-center gap-1">
//                           <AlertTriangle className="w-3 h-3" />
//                           {deadlineStats.totalMissed} Missed Deadlines
//                         </span>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="flex items-center gap-4 flex-1">
//                   <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xl font-bold shadow-lg ring-2 ring-blue-500/30">
//                     {editFormData.name?.charAt(0) || "U"}
//                   </div>
//                   <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
//                     <input
//                       type="text"
//                       value={editFormData.name}
//                       onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
//                       className="bg-[#0a0a0a] border border-neutral-800 text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500"
//                       placeholder="Name"
//                     />
//                     <input
//                       type="email"
//                       value={editFormData.email}
//                       onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
//                       className="bg-[#0a0a0a] border border-neutral-800 text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500"
//                       placeholder="Email"
//                     />
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* Action Buttons */}
//             <div className="flex items-center gap-2">
//               {!isEditing ? (
//                 <>
//                   <button
//                     onClick={() => setIsEditing(true)}
//                     className="p-2 text-neutral-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition"
//                     title="Edit User"
//                   >
//                     <Edit2 className="w-4 h-4" />
//                   </button>
//                   <button
//                     onClick={handleToggleStatus}
//                     disabled={submitting}
//                     className={`p-2 rounded-lg transition ${user.isActive
//                         ? "text-amber-400 hover:bg-amber-500/10 hover:text-amber-300"
//                         : "text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300"
//                       }`}
//                     title={user.isActive ? "Deactivate" : "Activate"}
//                   >
//                     {user.isActive ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
//                   </button>
//                   <button
//                     onClick={handleResetPassword}
//                     disabled={submitting}
//                     className="p-2 text-neutral-400 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition"
//                     title="Reset Password"
//                   >
//                     <Shield className="w-4 h-4" />
//                   </button>
//                   <button
//                     onClick={handleDeleteUser}
//                     disabled={submitting}
//                     className="p-2 text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
//                     title="Delete User"
//                   >
//                     <Trash2 className="w-4 h-4" />
//                   </button>
//                 </>
//               ) : (
//                 <>
//                   <button
//                     onClick={handleUpdateUser}
//                     disabled={submitting}
//                     className="p-2 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition"
//                     title="Save Changes"
//                   >
//                     {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
//                   </button>
//                   <button
//                     onClick={() => {
//                       setIsEditing(false);
//                       setEditFormData({
//                         name: user.name || "",
//                         email: user.email || "",
//                         role: user.role || "employee",
//                         isActive: user.isActive !== undefined ? user.isActive : true,
//                         marks: user.marks || 0,
//                       });
//                     }}
//                     className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition"
//                   >
//                     <X className="w-4 h-4" />
//                   </button>
//                 </>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Deadline Warning Banner */}
//         {deadlineStats.totalMissed > 0 && (
//           <div className="bg-rose-600/10 border-b border-rose-500/20 px-6 py-3 flex items-center gap-3">
//             <AlertTriangle className="w-5 h-5 text-rose-400" />
//             <div>
//               <span className="text-sm text-rose-400 font-medium">
//                 ⚠️ {deadlineStats.totalMissed} task(s) missed deadline
//               </span>
//               <span className="text-xs text-rose-400/70 ml-2">
//                 Marks will show as 0 for these tasks
//               </span>
//             </div>
//           </div>
//         )}

//         {/* Stats Cards */}
//         <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 p-4 border-b border-neutral-800">
//           <div className="bg-[#0a0a0a] p-3 rounded-lg border border-neutral-800">
//             <div className="flex items-center gap-2">
//               <FolderKanban className="w-3.5 h-3.5 text-blue-400" />
//               <span className="text-[10px] text-neutral-500 font-medium">Total Tasks</span>
//             </div>
//             <p className="text-lg font-bold text-white mt-1">{stats.total}</p>
//           </div>
//           <div className="bg-[#0a0a0a] p-3 rounded-lg border border-neutral-800">
//             <div className="flex items-center gap-2">
//               <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
//               <span className="text-[10px] text-neutral-500 font-medium">Completed</span>
//             </div>
//             <p className="text-lg font-bold text-emerald-400 mt-1">{stats.completed}</p>
//           </div>
//           <div className="bg-[#0a0a0a] p-3 rounded-lg border border-neutral-800">
//             <div className="flex items-center gap-2">
//               <Clock className="w-3.5 h-3.5 text-blue-400" />
//               <span className="text-[10px] text-neutral-500 font-medium">In Progress</span>
//             </div>
//             <p className="text-lg font-bold text-blue-400 mt-1">{stats.inProgress}</p>
//           </div>
//           <div className="bg-[#0a0a0a] p-3 rounded-lg border border-neutral-800">
//             <div className="flex items-center gap-2">
//               <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
//               <span className="text-[10px] text-neutral-500 font-medium">Pending</span>
//             </div>
//             <p className="text-lg font-bold text-amber-400 mt-1">{stats.pending}</p>
//           </div>
//           <div className="bg-[#0a0a0a] p-3 rounded-lg border border-neutral-800">
//             <div className="flex items-center gap-2">
//               <Trophy className="w-3.5 h-3.5 text-rose-400" />
//               <span className="text-[10px] text-neutral-500 font-medium">Total Marks</span>
//             </div>
//             <p className="text-lg font-bold text-white mt-1">{stats.totalMarks}</p>
//           </div>
//           <div className="bg-[#0a0a0a] p-3 rounded-lg border border-neutral-800">
//             <div className="flex items-center gap-2">
//               <GraduationCap className="w-3.5 h-3.5 text-purple-400" />
//               <span className="text-[10px] text-neutral-500 font-medium">Avg Marks</span>
//             </div>
//             <p className={`text-lg font-bold mt-1 ${getMarksColor(stats.avgMarks)}`}>
//               {stats.avgMarks}
//             </p>
//           </div>
//           <div className="bg-[#0a0a0a] p-3 rounded-lg border border-neutral-800">
//             <div className="flex items-center gap-2">
//               <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
//               <span className="text-[10px] text-neutral-500 font-medium">Missed</span>
//             </div>
//             <p className="text-lg font-bold text-rose-400 mt-1">{deadlineStats.totalMissed}</p>
//           </div>
//         </div>

//         {/* Tasks List */}
//         <div className="p-6">
//           <div className="flex items-center justify-between mb-4">
//             <h3 className="text-sm font-semibold text-white">Assigned Tasks</h3>
//             <span className="text-xs text-neutral-500 bg-neutral-800/50 px-3 py-1 rounded-full border border-neutral-700">
//               {userTasks.length} tasks
//             </span>
//           </div>

//           {userTasks.length === 0 ? (
//             <div className="text-center py-12 border border-dashed border-neutral-800 rounded-xl bg-[#0a0a0a]">
//               <FolderKanban className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
//               <p className="text-neutral-400 text-sm">No tasks assigned to this user</p>
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 gap-3">
//               {userTasks.map((task) => {
//                 const StatusIcon = getStatusIcon(task.status);
//                 const isMissed = task.isMissed;

//                 return (
//                   <div
//                     key={task._id}
//                     className={`bg-[#0a0a0a] border p-4 rounded-xl transition-all duration-300 ${isMissed
//                         ? "border-rose-500/30 hover:border-rose-500/50 bg-rose-600/5"
//                         : "border-neutral-800 hover:border-neutral-700"
//                       }`}
//                   >
//                     <div className="flex items-start justify-between gap-4">
//                       <div className="flex-1 min-w-0">
//                         <div className="flex items-center gap-3 mb-2 flex-wrap">
//                           <h4 className={`font-semibold text-sm ${isMissed ? "text-rose-400" : "text-white"}`}>
//                             {task.name}
//                           </h4>
//                           <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
//                             <StatusIcon className="w-3 h-3" />
//                             {task.status || "Pending"}
//                           </span>
//                           <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${isMissed
//                               ? "text-rose-400 bg-rose-500/10 border-rose-500/20"
//                               : getMarksColor(task.obtainedMarks || 0) + " bg-neutral-800/50 border border-neutral-700"
//                             }`}>
//                             Marks: {task.obtainedMarks || 0}
//                           </span>
//                           {isMissed && (
//                             <span className="px-2 py-0.5 rounded-lg text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1">
//                               <AlertTriangle className="w-3 h-3" />
//                               {task.daysOverdue} day{task.daysOverdue > 1 ? 's' : ''} overdue
//                             </span>
//                           )}
//                         </div>
//                         {task.description && (
//                           <p className={`text-sm mb-2 ${isMissed ? "text-rose-400/70" : "text-neutral-400"}`}>
//                             {task.description}
//                           </p>
//                         )}
//                         <div className="flex items-center gap-4 text-xs text-neutral-500 flex-wrap">
//                           <span className="flex items-center gap-1">
//                             <Briefcase className="w-3 h-3" />
//                             {task.projectName}
//                           </span>
//                           {task.startDate && (
//                             <span className="flex items-center gap-1">
//                               <Calendar className="w-3 h-3" />
//                               Start: {formatDate(task.startDate)}
//                             </span>
//                           )}
//                           {task.endDate && (
//                             <span className={`flex items-center gap-1 ${isMissed ? "text-rose-400" : "text-rose-400"}`}>
//                               <Calendar className="w-3 h-3" />
//                               Deadline: {formatDate(task.endDate)}
//                               {isMissed && (
//                                 <span className="ml-1 text-rose-400 font-medium">
//                                   (Missed!)
//                                 </span>
//                               )}
//                             </span>
//                           )}
//                         </div>
//                         <div className="flex items-center gap-2 mt-2">
//                           {task.basicWork && (
//                             <span className="text-[10px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">Basic</span>
//                           )}
//                           {task.completed && (
//                             <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Completed</span>
//                           )}
//                           {task.tested && (
//                             <span className="text-[10px] text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">Tested</span>
//                           )}
//                           {isMissed && (
//                             <span className="text-[10px] text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 flex items-center gap-1">
//                               <Zap className="w-2.5 h-2.5" />
//                               Auto-Zeroed
//                             </span>
//                           )}
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           )}
//         </div>
//       </div>
//     </>
//   );
// };

// export default UserDetail;




import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../service/api.js";
import {
  ArrowLeft,
  User,
  Mail,
  Calendar,
  Shield,
  Award,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  FolderKanban,
  Briefcase,
  Trophy,
  GraduationCap,
  Edit2,
  Trash2,
  Save,
  X,
  Check,
  AlertTriangle,
  Zap,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Star,
  Target,
} from "lucide-react";
import toast, { Toaster } from 'react-hot-toast';

const UserDetail = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userTasks, setUserTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    role: "",
    isActive: true,
    marks: 0,
  });
  const [submitting, setSubmitting] = useState(false);
  const [deadlineStats, setDeadlineStats] = useState({
    totalMissed: 0,
    missedTasks: [],
    autoZeroedTasks: [],
  });

  useEffect(() => {
    fetchUserDetails();
    fetchUserTasks();
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      const res = await api.get("/user/all-users");
      let usersData = res.data.users || res.data.data || res.data || [];
      const allUsers = Array.isArray(usersData) ? usersData : [];
      const foundUser = allUsers.find(u => u._id === userId);

      if (foundUser) {
        setUser(foundUser);
        setEditFormData({
          name: foundUser.name || "",
          email: foundUser.email || "",
          role: foundUser.role || "employee",
          isActive: foundUser.isActive !== undefined ? foundUser.isActive : true,
          marks: foundUser.marks || 0,
        });
      } else {
        toast.error("User not found");
        navigate("/admin/users");
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
      toast.error("Failed to load user details");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserTasks = async () => {
    try {
      const res = await api.get("/projects");
      const allProjects = res.data || [];
      setProjects(allProjects);

      const tasks = [];
      let missedCount = 0;
      const missedTasksList = [];
      const autoZeroedList = [];

      allProjects.forEach((project) => {
        (project.tasks || []).forEach((task) => {
          const taskUser = task.user?._id || task.user;
          const isUserTask = taskUser === userId || taskUser?._id === userId;
          
          if (isUserTask) {
            const today = new Date();
            const deadline = task.endDate ? new Date(task.endDate) : null;
            const isMissed = deadline && deadline < today && !task.completed;

            if (isMissed) {
              missedCount++;
              missedTasksList.push(task._id);
            }

            const shouldZero = deadline && deadline < today && !task.completed;
            const taskCopy = { ...task };

            if (shouldZero && task.obtainedMarks > 0) {
              autoZeroedList.push(task._id);
              taskCopy.obtainedMarks = 0;
              taskCopy.completed = false;
            }

            tasks.push({
              ...taskCopy,
              projectName: project.projectName,
              projectId: project._id,
              isMissed: isMissed,
              daysOverdue: isMissed ? Math.floor((today - deadline) / (1000 * 60 * 60 * 24)) : 0,
            });
          }
        });
      });

      setDeadlineStats({
        totalMissed: missedCount,
        missedTasks: missedTasksList,
        autoZeroedTasks: autoZeroedList,
      });

      setUserTasks(tasks);

      if (autoZeroedList.length > 0) {
        toast.warning(`⚠️ ${autoZeroedList.length} task(s) have missed deadline. Marks will show as 0.`);
      }
    } catch (error) {
      console.error("Error fetching user tasks:", error);
      toast.error("Failed to load user tasks");
    }
  };

  const handleUpdateUser = async () => {
    setSubmitting(true);
    try {
      const res = await api.put(`/user/update/${userId}`, editFormData);
      setUser(res.data.user);
      toast.success("User updated successfully!");
      setIsEditing(false);
      fetchUserTasks();
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error(error.response?.data?.message || "Failed to update user");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!window.confirm(`Are you sure you want to delete ${user?.name}? This action cannot be undone.`)) {
      return;
    }

    setSubmitting(true);
    try {
      await api.delete(`/user/delete/${userId}`);
      toast.success("User deleted successfully!");
      navigate("/admin/users");
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error(error.response?.data?.message || "Failed to delete user");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async () => {
    const newStatus = !editFormData.isActive;
    setSubmitting(true);
    try {
      await api.put(`/user/status/${userId}`, { isActive: newStatus });
      setUser({ ...user, isActive: newStatus });
      setEditFormData({ ...editFormData, isActive: newStatus });
      toast.success(`User ${newStatus ? 'activated' : 'deactivated'} successfully!`);
    } catch (error) {
      console.error("Error toggling status:", error);
      toast.error(error.response?.data?.message || "Failed to update status");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    const newPassword = prompt("Enter new password (min 6 characters):");
    if (!newPassword) return;

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setSubmitting(true);
    try {
      await api.put(`/user/update/${userId}`, { password: newPassword });
      toast.success("Password reset successfully!");
    } catch (error) {
      console.error("Error resetting password:", error);
      toast.error(error.response?.data?.message || "Failed to reset password");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      Completed: "bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/20",
      "In Progress": "bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border-[var(--accent-primary)]/20",
      Pending: "bg-[var(--warning)]/10 text-[var(--warning)] border-[var(--warning)]/20",
    };
    return colors[status] || "bg-[var(--text-muted)]/10 text-[var(--text-muted)] border-[var(--text-muted)]/20";
  };

  const getStatusIcon = (status) => {
    const icons = {
      Completed: CheckCircle2,
      "In Progress": Clock,
      Pending: AlertCircle,
    };
    return icons[status] || AlertCircle;
  };

  const getMarksColor = (marks) => {
    if (marks >= 80) return "text-[var(--success)]";
    if (marks >= 60) return "text-[var(--accent-primary)]";
    if (marks >= 40) return "text-[var(--warning)]";
    return "text-[var(--danger)]";
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const calculateStats = () => {
    const total = userTasks.length;
    const completed = userTasks.filter(t => t.completed).length;
    const inProgress = userTasks.filter(t => t.status === "In Progress").length;
    const pending = userTasks.filter(t => t.status === "Pending").length;
    const totalMarks = userTasks.reduce((sum, t) => sum + (t.obtainedMarks || 0), 0);
    const avgMarks = total > 0 ? Math.round(totalMarks / total) : 0;

    return { total, completed, inProgress, pending, totalMarks, avgMarks };
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-[var(--accent-primary)] animate-spin" />
        <p className="text-[var(--text-secondary)] text-sm">Loading user details...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <User className="w-16 h-16 text-[var(--text-muted)] mx-auto mb-4" />
        <p className="text-[var(--text-secondary)] text-lg">User not found</p>
        <button
          onClick={() => navigate("/admin/users")}
          className="mt-4 text-[var(--accent-primary)] hover:text-[var(--accent-hover)] text-sm font-medium transition"
        >
          Go back to users
        </button>
      </div>
    );
  }

  const stats = calculateStats();

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1a1a1a',
            color: '#fff',
            border: '1px solid #333',
          },
          success: {
            iconTheme: { primary: '#10b981', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#fff' },
          },
        }}
      />
      <div className="ui-card">
        {/* Header */}
        <div className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)] px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/admin/users")}
                className="p-2 hover:bg-[var(--bg-hover)] rounded-lg transition text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-transparent hover:border-[var(--border-color)]"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              {!isEditing ? (
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-hover)] flex items-center justify-center text-white text-xl font-bold shadow-lg ring-2 ring-[var(--accent-primary)]/30">
                    {user.name?.charAt(0) || "U"}
                  </div>
                  <div>
                    <h1 className="text-xl font-semibold text-[var(--text-primary)]">{user.name}</h1>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="text-sm text-[var(--text-secondary)] flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" />
                        {user.email}
                      </span>
                      <span className="text-xs px-2 py-0.5 bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border border-[var(--accent-primary)]/20 rounded-full capitalize">
                        {user.role}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${user.isActive
                          ? "bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/20"
                          : "bg-[var(--danger)]/10 text-[var(--danger)] border-[var(--danger)]/20"
                        }`}>
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                      {deadlineStats.totalMissed > 0 && (
                        <span className="text-xs px-2 py-0.5 rounded-full border bg-[var(--danger)]/10 text-[var(--danger)] border-[var(--danger)]/20 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          {deadlineStats.totalMissed} Missed Deadlines
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-hover)] flex items-center justify-center text-white text-xl font-bold shadow-lg ring-2 ring-[var(--accent-primary)]/30">
                    {editFormData.name?.charAt(0) || "U"}
                  </div>
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={editFormData.name}
                      onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                      className="ui-input text-sm"
                      placeholder="Name"
                    />
                    <input
                      type="email"
                      value={editFormData.email}
                      onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                      className="ui-input text-sm"
                      placeholder="Email"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {!isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 text-[var(--text-muted)] hover:text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/10 rounded-lg transition"
                    title="Edit User"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleToggleStatus}
                    disabled={submitting}
                    className={`p-2 rounded-lg transition ${user.isActive
                        ? "text-[var(--warning)] hover:bg-[var(--warning)]/10 hover:text-[var(--warning)]"
                        : "text-[var(--success)] hover:bg-[var(--success)]/10 hover:text-[var(--success)]"
                      }`}
                    title={user.isActive ? "Deactivate" : "Activate"}
                  >
                    {user.isActive ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={handleResetPassword}
                    disabled={submitting}
                    className="p-2 text-[var(--text-muted)] hover:text-[var(--accent-light)] hover:bg-[var(--accent-light)]/10 rounded-lg transition"
                    title="Reset Password"
                  >
                    <Shield className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleDeleteUser}
                    disabled={submitting}
                    className="p-2 text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger)]/10 rounded-lg transition"
                    title="Delete User"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleUpdateUser}
                    disabled={submitting}
                    className="p-2 text-[var(--success)] hover:bg-[var(--success)]/10 rounded-lg transition"
                    title="Save Changes"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditFormData({
                        name: user.name || "",
                        email: user.email || "",
                        role: user.role || "employee",
                        isActive: user.isActive !== undefined ? user.isActive : true,
                        marks: user.marks || 0,
                      });
                    }}
                    className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-lg transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Deadline Warning Banner */}
        {deadlineStats.totalMissed > 0 && (
          <div className="bg-[var(--danger)]/10 border-b border-[var(--danger)]/20 px-6 py-3 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-[var(--danger)]" />
            <div>
              <span className="text-sm text-[var(--danger)] font-medium">
                ⚠️ {deadlineStats.totalMissed} task(s) missed deadline
              </span>
              <span className="text-xs text-[var(--danger)]/70 ml-2">
                Marks will show as 0 for these tasks
              </span>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 p-4 border-b border-[var(--border-color)]">
          <div className="ui-card p-3">
            <div className="flex items-center gap-2">
              <FolderKanban className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
              <span className="text-[10px] text-[var(--text-muted)] font-medium">Total Tasks</span>
            </div>
            <p className="text-lg font-bold text-[var(--text-primary)] mt-1">{stats.total}</p>
          </div>
          <div className="ui-card p-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[var(--success)]" />
              <span className="text-[10px] text-[var(--text-muted)] font-medium">Completed</span>
            </div>
            <p className="text-lg font-bold text-[var(--success)] mt-1">{stats.completed}</p>
          </div>
          <div className="ui-card p-3">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
              <span className="text-[10px] text-[var(--text-muted)] font-medium">In Progress</span>
            </div>
            <p className="text-lg font-bold text-[var(--accent-primary)] mt-1">{stats.inProgress}</p>
          </div>
          <div className="ui-card p-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-[var(--warning)]" />
              <span className="text-[10px] text-[var(--text-muted)] font-medium">Pending</span>
            </div>
            <p className="text-lg font-bold text-[var(--warning)] mt-1">{stats.pending}</p>
          </div>
          <div className="ui-card p-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-3.5 h-3.5 text-[var(--accent-light)]" />
              <span className="text-[10px] text-[var(--text-muted)] font-medium">Total Marks</span>
            </div>
            <p className="text-lg font-bold text-[var(--text-primary)] mt-1">{stats.totalMarks}</p>
          </div>
          <div className="ui-card p-3">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-3.5 h-3.5 text-[var(--accent-light)]" />
              <span className="text-[10px] text-[var(--text-muted)] font-medium">Avg Marks</span>
            </div>
            <p className={`text-lg font-bold mt-1 ${getMarksColor(stats.avgMarks)}`}>
              {stats.avgMarks}
            </p>
          </div>
          <div className="ui-card p-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-[var(--danger)]" />
              <span className="text-[10px] text-[var(--text-muted)] font-medium">Missed</span>
            </div>
            <p className="text-lg font-bold text-[var(--danger)] mt-1">{deadlineStats.totalMissed}</p>
          </div>
        </div>

        {/* Tasks List */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Assigned Tasks</h3>
            <span className="text-xs text-[var(--text-muted)] bg-[var(--bg-secondary)]/50 px-3 py-1 rounded-full border border-[var(--border-color)]">
              {userTasks.length} tasks
            </span>
          </div>

          {userTasks.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-[var(--border-color)] ui-card">
              <FolderKanban className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
              <p className="text-[var(--text-secondary)] text-sm">No tasks assigned to this user</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {userTasks.map((task) => {
                const StatusIcon = getStatusIcon(task.status);
                const isMissed = task.isMissed;

                return (
                  <div
                    key={task._id}
                    className={`ui-card transition-all duration-300 ${isMissed
                        ? "border-[var(--danger)]/30 hover:border-[var(--danger)]/50 bg-[var(--danger)]/5"
                        : "border-[var(--border-color)] hover:border-[var(--border-hover)]"
                      }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h4 className={`font-semibold text-sm ${isMissed ? "text-[var(--danger)]" : "text-[var(--text-primary)]"}`}>
                            {task.name}
                          </h4>
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                            <StatusIcon className="w-3 h-3" />
                            {task.status || "Pending"}
                          </span>
                          <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${isMissed
                              ? "text-[var(--danger)] bg-[var(--danger)]/10 border-[var(--danger)]/20"
                              : getMarksColor(task.obtainedMarks || 0) + " bg-[var(--bg-secondary)]/50 border border-[var(--border-color)]"
                            }`}>
                            Marks: {task.obtainedMarks || 0}
                          </span>
                          {isMissed && (
                            <span className="px-2 py-0.5 rounded-lg text-xs font-bold bg-[var(--danger)]/10 text-[var(--danger)] border border-[var(--danger)]/20 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              {task.daysOverdue} day{task.daysOverdue > 1 ? 's' : ''} overdue
                            </span>
                          )}
                        </div>
                        {task.description && (
                          <p className={`text-sm mb-2 ${isMissed ? "text-[var(--danger)]/70" : "text-[var(--text-secondary)]"}`}>
                            {task.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-[var(--text-muted)] flex-wrap">
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-3 h-3" />
                            {task.projectName}
                          </span>
                          {task.startDate && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Start: {formatDate(task.startDate)}
                            </span>
                          )}
                          {task.endDate && (
                            <span className={`flex items-center gap-1 ${isMissed ? "text-[var(--danger)]" : "text-[var(--text-muted)]"}`}>
                              <Calendar className="w-3 h-3" />
                              Deadline: {formatDate(task.endDate)}
                              {isMissed && (
                                <span className="ml-1 text-[var(--danger)] font-medium">
                                  (Missed!)
                                </span>
                              )}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          {task.basicWork && (
                            <span className="text-[10px] text-[var(--accent-primary)] bg-[var(--accent-primary)]/10 px-2 py-0.5 rounded border border-[var(--accent-primary)]/20">Basic</span>
                          )}
                          {task.completed && (
                            <span className="text-[10px] text-[var(--success)] bg-[var(--success)]/10 px-2 py-0.5 rounded border border-[var(--success)]/20">Completed</span>
                          )}
                          {task.tested && (
                            <span className="text-[10px] text-[var(--accent-light)] bg-[var(--accent-light)]/10 px-2 py-0.5 rounded border border-[var(--accent-light)]/20">Tested</span>
                          )}
                          {isMissed && (
                            <span className="text-[10px] text-[var(--danger)] bg-[var(--danger)]/10 px-2 py-0.5 rounded border border-[var(--danger)]/20 flex items-center gap-1">
                              <Zap className="w-2.5 h-2.5" />
                              Auto-Zeroed
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default UserDetail;