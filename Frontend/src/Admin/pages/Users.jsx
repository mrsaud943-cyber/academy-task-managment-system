// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import api from "../../service/api.js";
// import {
//   Mail,
//   Shield,
//   Loader2,
//   Eye,
//    X,
//   UserCheck,
//   UserX,
//   Calendar,
//   Plus,
//   EyeOff,
//   Users as UsersIcon,
// } from "lucide-react";
// import toast, { Toaster } from 'react-hot-toast';

// const Users = () => {
//   const navigate = useNavigate();
//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [submitting, setSubmitting] = useState(false);

//   const [confirmUser, setConfirmUser] = useState(null);
//   const [createModalOpen, setCreateModalOpen] = useState(false);

//   // Create form state
//   const [createFormData, setCreateFormData] = useState({
//     name: "",
//     email: "",
//     password: "",
//     role: "employee",
//   });
//   const [showPassword, setShowPassword] = useState(false);

//   // ================= FETCH USERS =================
//   useEffect(() => {
//     fetchUsers();
//   }, []);

//   const fetchUsers = async () => {
//     setLoading(true);
//     try {
//       const res = await api.get("/user/all-users");
//       const employees = (res.data.users || []).filter(
//         (user) => user.role === "employee"
//       );
//       setUsers(employees);
//     } catch (error) {
//       console.error("Error fetching users:", error);
//       toast.error("Failed to fetch users");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ================= CREATE USER =================
//   const handleCreateChange = (e) => {
//     setCreateFormData({
//       ...createFormData,
//       [e.target.name]: e.target.value,
//     });
//   };

//   const handleCreateSubmit = async () => {
//     if (!createFormData.name || !createFormData.email || !createFormData.password) {
//       toast.error("Name, Email and Password are required!");
//       return;
//     }

//     setSubmitting(true);
//     try {
//       await api.post("/user/create", createFormData);
//       await fetchUsers();
//       setCreateFormData({ name: "", email: "", password: "", role: "employee" });
//       setCreateModalOpen(false);
//       toast.success("User created successfully!");
//     } catch (err) {
//       console.error(err);
//       toast.error(err.response?.data?.message || "Failed to create user");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   // ================= STATUS (ACTIVATE/DEACTIVATE) =================
//   const handleStatusClick = (user) => {
//     setConfirmUser(user);
//   };

//   // const handleConfirm = async () => {
//   //   setSubmitting(true);
//   //   try {
//   //     const newStatus = !confirmUser.isActive;
//   //     await api.put(`/user/deactivate/${confirmUser._id}`, {
//   //       isActive: newStatus,
//   //     });

//   //     setUsers((prev) =>
//   //       prev.map((u) =>
//   //         u._id === confirmUser._id ? { ...u, isActive: newStatus } : u
//   //       )
//   //     );
//   //     setConfirmUser(null);
//   //     toast.success(`User ${newStatus ? 'activated' : 'deactivated'} successfully!`);
//   //   } catch (err) {
//   //     console.error(err);
//   //     toast.error(err.response?.data?.message || "Failed to update status");
//   //   } finally {
//   //     setSubmitting(false);
//   //   }
//   // };

// // In Users.jsx
// const handleConfirm = async () => {
//   setSubmitting(true);
//   try {
//     const newStatus = !confirmUser.isActive;
//     // ✅ Use /status/:id endpoint
//     await api.put(`/user/status/${confirmUser._id}`, {
//       isActive: newStatus,
//     });

//     setUsers((prev) =>
//       prev.map((u) =>
//         u._id === confirmUser._id ? { ...u, isActive: newStatus } : u
//       )
//     );
//     setConfirmUser(null);
//     toast.success(`User ${newStatus ? 'activated' : 'deactivated'} successfully!`);
//   } catch (err) {
//     console.error(err);
//     toast.error(err.response?.data?.message || "Failed to update status");
//   } finally {
//     setSubmitting(false);
//   }
// };

//   // ================= VIEW USER DETAILS =================
//   const handleViewDetails = (userId) => {
//     navigate(`/admin/users/${userId}`);
//   };

//   const formatDate = (date) => {
//     if (!date) return "N/A";
//     return new Date(date).toLocaleDateString(undefined, {
//       year: "numeric",
//       month: "short",
//       day: "numeric",
//     });
//   };

//   if (loading) {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
//         <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
//         <p className="text-neutral-400 text-sm">Loading users...</p>
//       </div>
//     );
//   }

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
//             iconTheme: {
//               primary: '#10b981',
//               secondary: '#fff',
//             },
//           },
//           error: {
//             iconTheme: {
//               primary: '#ef4444',
//               secondary: '#fff',
//             },
//           },
//         }}
//       />
//       <div className="bg-[#121212] rounded-xl border border-neutral-800 overflow-hidden">
//         {/* HEADER PANEL */}
//         <div className="bg-[#0a0a0a] border-b border-neutral-800 px-6 py-5">
//           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//             <div className="flex items-center gap-3">
//               <div className="bg-blue-600/10 p-2.5 rounded-xl">
//                 <Shield className="w-5 h-5 text-blue-400" />
//               </div>
//               <div>
//                 <h1 className="text-xl font-semibold text-white">User Management</h1>
//                 <p className="text-sm text-neutral-400">
//                   Manage internal employee accounts and permissions.
//                 </p>
//               </div>
//             </div>
//             <div className="flex items-center gap-3">
//               <span className="text-xs bg-[#121212] border border-neutral-800 text-neutral-400 px-3 py-1.5 font-semibold rounded-xl whitespace-nowrap">
//                 Total: {users.length}
//               </span>
//               <button
//               type="submit"
//                 onClick={() => setCreateModalOpen(true)}
//                 className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition shadow-lg shadow-blue-500/20"
//               >
//                 <Plus size={18} />
//                 Create User
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* MOBILE LIST LAYOUT */}
//         <div className="block lg:hidden p-4">
//           <div className="space-y-4">
//             {users.length === 0 ? (
//               <div className="bg-[#0a0a0a] border border-neutral-800 rounded-xl p-8 text-center text-neutral-400 font-medium">
//                 No employees found.
//               </div>
//             ) : (
//               users.map((user, index) => (
//                 <div
//                   key={user._id}
//                   className="bg-[#0a0a0a] border border-neutral-800 rounded-xl p-5 space-y-4 relative hover:border-neutral-700 transition-colors"
//                 >
//                   <div className="flex justify-between items-start">
//                     <div className="space-y-1 max-w-[60%]">
//                       <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">
//                         Employee #{index + 1}
//                       </span>
//                       <h3 className="font-bold text-white text-base truncate">
//                         {user.name || "N/A"}
//                       </h3>
//                       <div className="flex items-center gap-1.5 text-xs text-neutral-400 truncate">
//                         <Mail size={12} className="shrink-0" />
//                         <span className="truncate">{user.email}</span>
//                       </div>
//                     </div>

//                     <button
//                       onClick={() => handleViewDetails(user._id)}
//                       className="p-2 text-neutral-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors border border-neutral-700 hover:border-blue-500/30"
//                     >
//                       <Eye size={16} />
//                     </button>
//                   </div>

//                   <div className="grid grid-cols-2 gap-2 pt-3 border-t border-neutral-800 text-xs">
//                     <div>
//                       <span className="text-[10px] text-neutral-500 font-semibold uppercase block mb-0.5">
//                         Role
//                       </span>
//                       <span className="inline-flex items-center bg-blue-600/10 text-blue-400 font-medium px-2 py-0.5 rounded border border-blue-500/20 capitalize">
//                         {user.role}
//                       </span>
//                     </div>
//                     <div>
//                       <span className="text-[10px] text-neutral-500 font-semibold uppercase block mb-0.5">
//                         Joined
//                       </span>
//                       <span className="text-neutral-300 font-medium flex items-center gap-1">
//                         <Calendar size={12} className="text-neutral-500" />
//                         {formatDate(user.createdAt)}
//                       </span>
//                     </div>
//                   </div>

//                   <div className="pt-3 border-t border-neutral-800 flex items-center justify-between">
//                     <span className="text-xs text-neutral-500 font-medium">
//                       Account Status
//                     </span>
//                     <button
//                       onClick={() => handleStatusClick(user)}
//                       className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border transition-all active:scale-95 ${
//                         user.isActive
//                           ? "bg-emerald-600/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-600/20"
//                           : "bg-rose-600/10 text-rose-400 border-rose-500/20 hover:bg-rose-600/20"
//                       }`}
//                     >
//                       <span
//                         className={`w-1.5 h-1.5 rounded-full ${
//                           user.isActive ? "bg-emerald-400" : "bg-rose-400"
//                         }`}
//                       />
//                       {user.isActive ? "Active" : "Inactive"}
//                     </button>
//                   </div>
//                 </div>
//               ))
//             )}
//           </div>
//         </div>

//         {/* DESKTOP TABLE LAYOUT */}
//         <div className="hidden lg:block overflow-x-auto">
//           <table className="w-full text-sm">
//             <thead className="bg-[#0a0a0a] border-b border-neutral-800">
//               <tr>
//                 <th className="px-6 py-3.5 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider w-16">
//                   #
//                 </th>
//                 <th className="px-6 py-3.5 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
//                   Name
//                 </th>
//                 <th className="px-6 py-3.5 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
//                   Email
//                 </th>
//                 <th className="px-6 py-3.5 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
//                   Role
//                 </th>
//                 <th className="px-6 py-3.5 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
//                   Created On
//                 </th>
//                 <th className="px-6 py-3.5 text-center text-xs font-medium text-neutral-400 uppercase tracking-wider">
//                   Status
//                 </th>
//                 <th className="px-6 py-3.5 text-center text-xs font-medium text-neutral-400 uppercase tracking-wider">
//                   Actions
//                 </th>
//               </tr>
//             </thead>

//             <tbody className="divide-y divide-neutral-800">
//               {users.length === 0 ? (
//                 <tr>
//                   <td colSpan="7" className="px-6 py-12 text-center text-neutral-400 font-medium">
//                     No employees found.
//                   </td>
//                 </tr>
//               ) : (
//                 users.map((user, index) => (
//                   <tr
//                     key={user._id}
//                     className="hover:bg-neutral-800/50 transition-colors"
//                   >
//                     <td className="px-6 py-4 text-center font-medium text-neutral-500">
//                       {index + 1}
//                     </td>
//                     <td className="px-6 py-4 font-semibold text-white">
//                       {user.name || "N/A"}
//                     </td>
//                     <td className="px-6 py-4">
//                       <div className="flex items-center gap-2 text-neutral-300">
//                         <Mail size={14} className="text-neutral-500" />
//                         <span>{user.email}</span>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4">
//                       <span className="inline-flex items-center bg-blue-600/10 text-blue-400 font-medium text-xs px-2.5 py-1 rounded-md border border-blue-500/20 capitalize">
//                         {user.role}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 text-neutral-400">
//                       {formatDate(user.createdAt)}
//                     </td>

//                     {/* STATUS */}
//                     <td className="px-6 py-4 text-center">
//                       <button
//                         onClick={() => handleStatusClick(user)}
//                         className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border transition-all active:scale-95 ${
//                           user.isActive
//                             ? "bg-emerald-600/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-600/20"
//                             : "bg-rose-600/10 text-rose-400 border-rose-500/20 hover:bg-rose-600/20"
//                         }`}
//                       >
//                         <span
//                           className={`w-1.5 h-1.5 rounded-full ${
//                             user.isActive ? "bg-emerald-400" : "bg-rose-400"
//                           }`}
//                         />
//                         {user.isActive ? "Active" : "Inactive"}
//                       </button>
//                     </td>

//                     {/* ACTIONS - Only View Details Button */}
//                     <td className="px-6 py-4 text-center">
//                       <button
//                         onClick={() => handleViewDetails(user._id)}
//                         className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition border border-blue-500/20 hover:border-blue-500/40"
//                       >
//                         <Eye size={16} />
//                         View Details
//                       </button>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>

//         {/* ================= CREATE USER MODAL ================= */}
//         {createModalOpen && (
//           <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
//             <div className="absolute inset-0" onClick={() => setCreateModalOpen(false)} />
//             <div className="bg-[#121212] w-full max-w-md border border-neutral-800 rounded-xl overflow-hidden relative z-10">
//               <div className="flex items-center justify-between border-b border-neutral-800 px-6 py-4">
//                 <div className="flex items-center gap-2">
//                   <div className="bg-blue-600/10 p-1.5 rounded-lg">
//                     <Plus className="text-blue-400 w-4 h-4" />
//                   </div>
//                   <h2 className="text-lg font-semibold text-white">Create New User</h2>
//                 </div>
//                 <button
//                   onClick={() => setCreateModalOpen(false)}
//                   className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition"
//                 >
//                   <X size={18} />
//                 </button>
//               </div>

//               <div className="p-6 space-y-4">
//                 {/* Name */}
//                 <div>
//                   <label className="block text-xs font-medium text-neutral-400 uppercase tracking-wider mb-1.5">
//                     Full Name <span className="text-rose-400">*</span>
//                   </label>
//                   <input
//                     name="name"
//                     type="text"
//                     value={createFormData.name}
//                     onChange={handleCreateChange}
//                     className="w-full bg-[#0a0a0a] border border-neutral-800 text-white placeholder-neutral-600 px-3.5 py-2.5 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
//                     placeholder="John Doe"
//                   />
//                 </div>

//                 {/* Email */}
//                 <div>
//                   <label className="block text-xs font-medium text-neutral-400 uppercase tracking-wider mb-1.5">
//                     Email Address <span className="text-rose-400">*</span>
//                   </label>
//                   <input
//                     name="email"
//                     type="email"
//                     value={createFormData.email}
//                     onChange={handleCreateChange}
//                     className="w-full bg-[#0a0a0a] border border-neutral-800 text-white placeholder-neutral-600 px-3.5 py-2.5 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
//                     placeholder="john@company.com"
//                   />
//                 </div>

//                 {/* Password */}
//                 <div>
//                   <label className="block text-xs font-medium text-neutral-400 uppercase tracking-wider mb-1.5">
//                     Password <span className="text-rose-400">*</span>
//                   </label>
//                   <div className="relative">
//                     <input
//                       name="password"
//                       type={showPassword ? "text" : "password"}
//                       value={createFormData.password}
//                       onChange={handleCreateChange}
//                       className="w-full bg-[#0a0a0a] border border-neutral-800 text-white placeholder-neutral-600 px-3.5 py-2.5 pr-10 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
//                       placeholder="Min 6 characters"
//                     />
//                     <button
//                       type="button"
//                       onClick={() => setShowPassword(!showPassword)}
//                       className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition"
//                     >
//                       {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
//                     </button>
//                   </div>
//                 </div>
//               </div>

//               <div className="flex gap-3 px-6 py-4 border-t border-neutral-800 bg-[#0a0a0a]">
//                 <button
//                   disabled={submitting}
//                   onClick={() => setCreateModalOpen(false)}
//                   className="w-full border border-neutral-700 hover:bg-neutral-800 text-neutral-300 font-medium px-4 py-2 rounded-lg text-sm transition"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   disabled={submitting}
//                   onClick={handleCreateSubmit}
//                   className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition shadow-lg shadow-blue-500/20 flex items-center justify-center gap-1.5 disabled:opacity-70"
//                 >
//                   {submitting && <Loader2 size={16} className="animate-spin" />}
//                   Create User
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* ================= STATUS MODAL ================= */}
//         {confirmUser && (
//           <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
//             <div className="absolute inset-0" onClick={() => setConfirmUser(null)} />
//             <div className="bg-[#121212] w-full max-w-sm border border-neutral-800 rounded-xl overflow-hidden relative z-10">
//               <div className="flex items-center justify-between border-b border-neutral-800 px-6 py-4">
//                 <button
//                   onClick={() => setConfirmUser(null)}
//                   className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition"
//                 >
//                   <X size={18} />
//                 </button>
//               </div>

//               <div className="p-6 text-center">
//                 <div
//                   className={`mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-4 ${
//                     confirmUser.isActive ? "bg-rose-600/10" : "bg-emerald-600/10"
//                   }`}
//                 >
//                   {confirmUser.isActive ? (
//                     <UserX className="text-rose-400 w-7 h-7" />
//                   ) : (
//                     <UserCheck className="text-emerald-400 w-7 h-7" />
//                   )}
//                 </div>

//                 <h2 className="text-lg font-semibold text-white mb-1">
//                   {confirmUser.isActive ? "Deactivate Account?" : "Activate Account?"}
//                 </h2>

//                 <p className="text-sm text-neutral-400 mb-6">
//                   Are you sure you want to change the active status for{" "}
//                   <span className="font-semibold text-white">
//                     {confirmUser.name || "this user"}
//                   </span>
//                   ?
//                 </p>

//                 <div className="flex gap-3">
//                   <button
//                     disabled={submitting}
//                     onClick={() => setConfirmUser(null)}
//                     className="w-full border border-neutral-700 hover:bg-neutral-800 text-neutral-300 font-medium px-4 py-2 rounded-lg text-sm transition"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     disabled={submitting}
//                     onClick={handleConfirm}
//                     className={`w-full text-white font-medium px-4 py-2 rounded-lg text-sm transition shadow-lg flex items-center justify-center gap-1.5 disabled:opacity-70 ${
//                       confirmUser.isActive
//                         ? "bg-rose-600 hover:bg-rose-700 shadow-rose-500/20"
//                         : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20"
//                     }`}
//                   >
//                     {submitting && <Loader2 size={16} className="animate-spin" />}
//                     {confirmUser.isActive ? "Deactivate" : "Activate"}
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </>
//   );
// };

// export default Users;



import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../service/api.js";
import {
  Mail,
  Shield,
  Loader2,
  Eye,
  X,
  UserCheck,
  UserX,
  Calendar,
  Plus,
  EyeOff,
  Users as UsersIcon,
} from "lucide-react";
import toast, { Toaster } from 'react-hot-toast';

const Users = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [confirmUser, setConfirmUser] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const [createFormData, setCreateFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "employee",
  });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/user/all-users");
      const employees = (res.data.users || []).filter(
        (user) => user.role === "employee"
      );
      setUsers(employees);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChange = (e) => {
    setCreateFormData({
      ...createFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreateSubmit = async () => {
    if (!createFormData.name || !createFormData.email || !createFormData.password) {
      toast.error("Name, Email and Password are required!");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/user/create", createFormData);
      await fetchUsers();
      setCreateFormData({ name: "", email: "", password: "", role: "employee" });
      setCreateModalOpen(false);
      toast.success("User created successfully!");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to create user");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusClick = (user) => {
    setConfirmUser(user);
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      const newStatus = !confirmUser.isActive;
      await api.put(`/user/status/${confirmUser._id}`, {
        isActive: newStatus,
      });

      setUsers((prev) =>
        prev.map((u) =>
          u._id === confirmUser._id ? { ...u, isActive: newStatus } : u
        )
      );
      setConfirmUser(null);
      toast.success(`User ${newStatus ? 'activated' : 'deactivated'} successfully!`);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update status");
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewDetails = (userId) => {
    navigate(`/admin/users/${userId}`);
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <p className="text-neutral-400 text-sm">Loading users...</p>
      </div>
    );
  }

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
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <div className="ui-card">
        {/* HEADER PANEL */}
        <div className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)] px-6 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-[var(--accent-primary)]/10 p-2.5 rounded-lg">
                <Shield className="w-5 h-5 text-[var(--accent-primary)]" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-[var(--text-primary)]">User Management</h1>
                <p className="text-sm text-[var(--text-secondary)]">
                  Manage internal employee accounts and permissions.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-muted)] px-3 py-1.5 font-semibold rounded-lg whitespace-nowrap">
                Total: {users.length}
              </span>
              <button
                onClick={() => setCreateModalOpen(true)}
                className="ui-btn ui-btn-primary inline-flex items-center gap-2"
              >
                <Plus size={18} />
                Create User
              </button>
            </div>
          </div>
        </div>

        {/* MOBILE LIST LAYOUT */}
        <div className="block lg:hidden p-4">
          <div className="space-y-4">
            {users.length === 0 ? (
              <div className="ui-card text-center p-8 text-[var(--text-muted)] font-medium">
                No employees found.
              </div>
            ) : (
              users.map((user, index) => (
                <div
                  key={user._id}
                  className="ui-card p-5 space-y-4 relative hover:border-[var(--border-hover)] transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1 max-w-[60%]">
                      <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">
                        Employee #{index + 1}
                      </span>
                      <h3 className="font-bold text-[var(--text-primary)] text-base truncate">
                        {user.name || "N/A"}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] truncate">
                        <Mail size={12} className="shrink-0" />
                        <span className="truncate">{user.email}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleViewDetails(user._id)}
                      className="p-2 text-[var(--text-muted)] hover:text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/10 rounded-lg transition-colors border border-[var(--border-color)] hover:border-[var(--accent-primary)]/30"
                    >
                      <Eye size={16} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[var(--border-color)] text-xs">
                    <div>
                      <span className="text-[10px] text-[var(--text-muted)] font-semibold uppercase block mb-0.5">
                        Role
                      </span>
                      <span className="inline-flex items-center bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] font-medium px-2 py-0.5 rounded border border-[var(--accent-primary)]/20 capitalize">
                        {user.role}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[var(--text-muted)] font-semibold uppercase block mb-0.5">
                        Joined
                      </span>
                      <span className="text-[var(--text-secondary)] font-medium flex items-center gap-1">
                        <Calendar size={12} className="text-[var(--text-muted)]" />
                        {formatDate(user.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[var(--border-color)] flex items-center justify-between">
                    <span className="text-xs text-[var(--text-muted)] font-medium">
                      Account Status
                    </span>
                    <button
                      onClick={() => handleStatusClick(user)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg border transition-all active:scale-95 ${
                        user.isActive
                          ? "bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/20 hover:bg-[var(--success)]/20"
                          : "bg-[var(--danger)]/10 text-[var(--danger)] border-[var(--danger)]/20 hover:bg-[var(--danger)]/20"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          user.isActive ? "bg-[var(--success)]" : "bg-[var(--danger)]"
                        }`}
                      />
                      {user.isActive ? "Active" : "Inactive"}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* DESKTOP TABLE LAYOUT */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
              <tr>
                <th className="px-6 py-3.5 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider w-16">
                  #
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                  Created On
                </th>
                <th className="px-6 py-3.5 text-center text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3.5 text-center text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[var(--border-color)]">
              {users.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-[var(--text-muted)] font-medium">
                    No employees found.
                  </td>
                </tr>
              ) : (
                users.map((user, index) => (
                  <tr
                    key={user._id}
                    className="hover:bg-[var(--bg-hover)] transition-colors"
                  >
                    <td className="px-6 py-4 text-center font-medium text-[var(--text-muted)]">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 font-semibold text-[var(--text-primary)]">
                      {user.name || "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                        <Mail size={14} className="text-[var(--text-muted)]" />
                        <span>{user.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] font-medium text-xs px-2.5 py-1 rounded border border-[var(--accent-primary)]/20 capitalize">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[var(--text-secondary)]">
                      {formatDate(user.createdAt)}
                    </td>

                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleStatusClick(user)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg border transition-all active:scale-95 ${
                          user.isActive
                            ? "bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/20 hover:bg-[var(--success)]/20"
                            : "bg-[var(--danger)]/10 text-[var(--danger)] border-[var(--danger)]/20 hover:bg-[var(--danger)]/20"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            user.isActive ? "bg-[var(--success)]" : "bg-[var(--danger)]"
                          }`}
                        />
                        {user.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleViewDetails(user._id)}
                        className="ui-btn ui-btn-primary inline-flex items-center gap-2 text-sm"
                      >
                        <Eye size={16} />
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= CREATE USER MODAL ================= */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => setCreateModalOpen(false)} />
          <div className="ui-card w-full max-w-md relative z-10">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] px-6 py-4">
              <div className="flex items-center gap-2">
                <div className="bg-[var(--accent-primary)]/10 p-1.5 rounded-lg">
                  <Plus className="text-[var(--accent-primary)] w-4 h-4" />
                </div>
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">Create New User</h2>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-lg transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
                  Full Name <span className="text-[var(--danger)]">*</span>
                </label>
                <input
                  name="name"
                  type="text"
                  value={createFormData.name}
                  onChange={handleCreateChange}
                  className="ui-input w-full text-sm"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
                  Email Address <span className="text-[var(--danger)]">*</span>
                </label>
                <input
                  name="email"
                  type="email"
                  value={createFormData.email}
                  onChange={handleCreateChange}
                  className="ui-input w-full text-sm"
                  placeholder="john@company.com"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
                  Password <span className="text-[var(--danger)]">*</span>
                </label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={createFormData.password}
                    onChange={handleCreateChange}
                    className="ui-input w-full pr-10 text-sm"
                    placeholder="Min 6 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 px-6 py-4 border-t border-[var(--border-color)] bg-[var(--bg-secondary)]">
              <button
                disabled={submitting}
                onClick={() => setCreateModalOpen(false)}
                className="ui-btn w-full"
              >
                Cancel
              </button>
              <button
                disabled={submitting}
                onClick={handleCreateSubmit}
                className="ui-btn ui-btn-primary w-full flex items-center justify-center gap-1.5"
              >
                {submitting && <Loader2 size={16} className="animate-spin" />}
                Create User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= STATUS MODAL ================= */}
      {confirmUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => setConfirmUser(null)} />
          <div className="ui-card w-full max-w-sm relative z-10">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] px-6 py-4">
              <button
                onClick={() => setConfirmUser(null)}
                className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-lg transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 text-center">
              <div
                className={`mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-4 ${
                  confirmUser.isActive ? "bg-[var(--danger)]/10" : "bg-[var(--success)]/10"
                }`}
              >
                {confirmUser.isActive ? (
                  <UserX className="text-[var(--danger)] w-7 h-7" />
                ) : (
                  <UserCheck className="text-[var(--success)] w-7 h-7" />
                )}
              </div>

              <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-1">
                {confirmUser.isActive ? "Deactivate Account?" : "Activate Account?"}
              </h2>

              <p className="text-sm text-[var(--text-secondary)] mb-6">
                Are you sure you want to change the active status for{" "}
                <span className="font-semibold text-[var(--text-primary)]">
                  {confirmUser.name || "this user"}
                </span>
                ?
              </p>

              <div className="flex gap-3">
                <button
                  disabled={submitting}
                  onClick={() => setConfirmUser(null)}
                  className="ui-btn w-full"
                >
                  Cancel
                </button>
                <button
                  disabled={submitting}
                  onClick={handleConfirm}
                  className={`ui-btn w-full text-white flex items-center justify-center gap-1.5 ${
                    confirmUser.isActive
                      ? "bg-[var(--danger)] hover:bg-[var(--danger)]/80"
                      : "bg-[var(--success)] hover:bg-[var(--success)]/80"
                  }`}
                >
                  {submitting && <Loader2 size={16} className="animate-spin" />}
                  {confirmUser.isActive ? "Deactivate" : "Activate"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Users;