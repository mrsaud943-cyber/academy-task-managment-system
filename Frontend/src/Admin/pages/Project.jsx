// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import api from "../../service/api.js";
// import {
//   Plus,
//   Edit2,
//   Trash2,
//   Eye,
//   Calendar,
//   Briefcase,
//   FolderKanban,
//   Loader2,
//   X,
//   Search,
//   ChevronRight,
// } from "lucide-react";
// import toast, { Toaster } from 'react-hot-toast';
// import { autoZeroMissedTasks } from "../utility/autoZero.js";

// const API_BASE_URL = "/projects";

// const Project = () => {
//   const navigate = useNavigate();
//   const [showForm, setShowForm] = useState(false);
//   const [projects, setProjects] = useState([]);
//   const [editingId, setEditingId] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState("");

//   const initialFormState = {
//     projectName: "",
//     description: "",
//     status: "",
//     client: "",
//     startDate: "",
//     endDate: "",
//   };

//   const [formData, setFormData] = useState(initialFormState);

//   const fetchProjects = async () => {
//     setLoading(true);
//     try {
//       const res = await api.get(API_BASE_URL);
//       setProjects(res.data);
//     } catch (err) {
//       console.error(err.message);
//       toast.error("Failed to fetch projects");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchProjects();
//   }, []);

//   useEffect(() => {
//     fetchProjects();
//   }, []);

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       if (editingId) {
//         const res = await api.put(`${API_BASE_URL}/${editingId}`, formData);
//         setProjects((prev) => prev.map((p) => (p._id === editingId ? res.data : p)));
//         setEditingId(null);
//         toast.success("Project updated successfully!");
//       } else {
//         const res = await api.post(API_BASE_URL, formData);
//         setProjects((prev) => [...prev, res.data]);
//         toast.success("Project created successfully!");
//       }
//       setFormData(initialFormState);
//       setShowForm(false);
//     } catch (err) {
//       console.error(err.message);
//       toast.error(err.response?.data?.message || "Failed to save project");
//     }
//   };

//   const handleEdit = (project) => {
//     setFormData(project);
//     setEditingId(project._id);
//     setShowForm(true);
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm("Delete project?")) return;
//     try {
//       await api.delete(`${API_BASE_URL}/${id}`);
//       setProjects((prev) => prev.filter((p) => p._id !== id));
//       toast.success("Project deleted successfully!");
//     } catch (err) {
//       console.error(err.message);
//       toast.error("Failed to delete project");
//     }
//   };

//   // ✅ FIXED: Navigate to project detail with correct path
//   const openProjectDetail = (projectId) => {
//     navigate(`/admin/project/${projectId}`);
//   };

//   const getStatusColor = (status) => {
//     const colors = {
//       Pending: "bg-[var(--warning)]/10 text-[var(--warning)] border-[var(--warning)]/20",
//       "In Progress": "bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border-[var(--accent-primary)]/20",
//       Completed: "bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/20",
//     };
//     return colors[status] || "bg-[var(--border-color)] text-[var(--text-muted)] border-[var(--border-color)]";
//   };

//   const getStatusIcon = (status) => {
//     const icons = {
//       Pending: "⏳",
//       "In Progress": "🔄",
//       Completed: "✅",
//     };
//     return icons[status] || "📌";
//   };

//   // Filter projects based on search
//   const filteredProjects = projects.filter((project) =>
//     project.projectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     project.client?.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   if (loading) {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
//         <Loader2 className="w-8 h-8 text-[var(--accent-primary)] animate-spin" />
//         <p className="text-[var(--text-secondary)] text-sm">Loading projects...</p>
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
//             background: 'var(--bg-card)',
//             color: 'var(--text-primary)',
//             border: '1px solid var(--border-color)',
//           },
//           success: {
//             iconTheme: { primary: 'var(--success)', secondary: 'var(--text-inverse)' },
//           },
//           error: {
//             iconTheme: { primary: 'var(--danger)', secondary: 'var(--text-inverse)' },
//           },
//         }}
//       />
//       <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] overflow-hidden">
//         {/* Header */}
//         <div className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)] px-6 py-5">
//           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//             <div className="flex items-center gap-3">
//               <div className="bg-[var(--accent-primary)]/10 p-2.5 rounded-xl">
//                 <FolderKanban className="w-5 h-5 text-[var(--accent-primary)]" />
//               </div>
//               <div>
//                 <h1 className="text-xl font-semibold text-[var(--text-primary)]">Projects</h1>
//                 <p className="text-sm text-[var(--text-secondary)]">Manage and track your company projects</p>
//               </div>
//             </div>
//             <div className="flex items-center gap-3">
//               <button
//                 onClick={() => {
//                   setShowForm(true);
//                   setEditingId(null);
//                   setFormData(initialFormState);
//                 }}
//                 className="inline-flex items-center gap-2 bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-[var(--text-inverse)] px-4 py-2.5 rounded-lg text-sm font-medium transition shadow-lg shadow-[var(--accent-primary)]/20"
//               >
//                 <Plus className="w-4 h-4" />
//                 Create Project
//               </button>
//             </div>
//           </div>

//           {/* Search Bar */}
//           <div className="mt-4 relative">
//             <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
//             <input
//               type="text"
//               placeholder="Search projects by name or client..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-muted)] pl-10 pr-4 py-2.5 rounded-lg text-sm focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] transition-colors"
//             />
//           </div>
//         </div>

//         {/* Project Table */}
//         <div className="overflow-x-auto">
//           {filteredProjects.length === 0 ? (
//             <div className="text-center py-16 px-6">
//               <FolderKanban className="w-16 h-16 text-[var(--text-muted)] mx-auto mb-4" />
//               <p className="text-[var(--text-secondary)] font-medium">No projects found</p>
//               <p className="text-[var(--text-muted)] text-sm mt-1">
//                 {searchTerm ? "Try adjusting your search" : "Click 'Create Project' to get started"}
//               </p>
//             </div>
//           ) : (
//             <table className="w-full text-sm">
//               <thead className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
//                 <tr>
//                   <th className="px-6 py-3.5 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
//                     Project
//                   </th>
//                   <th className="px-6 py-3.5 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider hidden md:table-cell">
//                     Client
//                   </th>
//                   <th className="px-6 py-3.5 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider hidden lg:table-cell">
//                     Timeline
//                   </th>
//                   <th className="px-6 py-3.5 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
//                     Status
//                   </th>
//                   <th className="px-6 py-3.5 text-right text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
//                     Actions
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-[var(--border-color)]">
//                 {filteredProjects.map((project) => (
//                   <tr
//                     key={project._id}
//                     className="hover:bg-[var(--bg-hover)] transition-colors cursor-pointer group"
//                     onClick={() => openProjectDetail(project._id)}
//                   >
//                     <td className="px-6 py-4">
//                       <div className="flex items-center gap-3">
//                         <div className="w-10 h-10 rounded-lg bg-[var(--accent-primary)]/10 flex items-center justify-center flex-shrink-0">
//                           <FolderKanban className="w-4 h-4 text-[var(--accent-primary)]" />
//                         </div>
//                         <div>
//                           <p className="font-medium text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition">
//                             {project.projectName}
//                           </p>
//                           <p className="text-xs text-[var(--text-secondary)] line-clamp-1 max-w-[200px]">
//                             {project.description || "No description"}
//                           </p>
//                         </div>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 hidden md:table-cell">
//                       <span className="text-[var(--text-primary)] flex items-center gap-1.5">
//                         <Briefcase className="w-3.5 h-3.5 text-[var(--text-muted)]" />
//                         {project.client || "N/A"}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 hidden lg:table-cell">
//                       <div className="flex items-center gap-2 text-[var(--text-secondary)] text-xs">
//                         <Calendar className="w-3.5 h-3.5 text-[var(--text-muted)]" />
//                         <span>
//                           {project.startDate
//                             ? new Date(project.startDate).toLocaleDateString()
//                             : "N/A"}
//                         </span>
//                         <ChevronRight className="w-3 h-3 text-[var(--text-muted)]" />
//                         <Calendar className="w-3.5 h-3.5 text-[var(--text-muted)]" />
//                         <span>
//                           {project.endDate
//                             ? new Date(project.endDate).toLocaleDateString()
//                             : "N/A"}
//                         </span>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4">
//                       {project.status ? (
//                         <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
//                           <span>{getStatusIcon(project.status)}</span>
//                           {project.status}
//                         </span>
//                       ) : (
//                         <span className="text-[var(--text-muted)] text-xs">Not set</span>
//                       )}
//                     </td>
//                     <td className="px-6 py-4">
//                       <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
//                         <button
//                           onClick={() => handleEdit(project)}
//                           className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/10 rounded-lg transition"
//                         >
//                           <Edit2 className="w-4 h-4" />
//                         </button>
//                         <button
//                           onClick={() => handleDelete(project._id)}
//                           className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--danger)] hover:bg-[var(--danger)]/10 rounded-lg transition"
//                         >
//                           <Trash2 className="w-4 h-4" />
//                         </button>
//                         <button
//                           onClick={() => openProjectDetail(project._id)}
//                           className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/10 rounded-lg transition"
//                         >
//                           <Eye className="w-4 h-4" />
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           )}
//         </div>

//         {/* Create/Edit Modal */}
//         {showForm && (
//           <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
//             <div className="absolute inset-0" onClick={() => setShowForm(false)} />
//             <form
//               onSubmit={handleSubmit}
//               className="bg-[var(--bg-card)] w-full max-w-2xl max-h-[90vh] flex flex-col border border-[var(--border-color)] rounded-xl overflow-hidden relative z-10"
//             >
//               <div className="flex items-center justify-between border-b border-[var(--border-color)] px-6 py-4">
//                 <div>
//                   <h2 className="text-xl font-semibold text-[var(--text-primary)]">
//                     {editingId ? "Edit Project" : "Create New Project"}
//                   </h2>
//                   <p className="text-sm text-[var(--text-secondary)]">
//                     {editingId ? "Update project details" : "Add a new project to your portfolio"}
//                   </p>
//                 </div>
//                 <button
//                   type="button"
//                   onClick={() => setShowForm(false)}
//                   className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-lg transition"
//                 >
//                   <X className="w-5 h-5" />
//                 </button>
//               </div>

//               <div className="p-6 space-y-5 overflow-y-auto">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
//                       Project Name <span className="text-[var(--danger)]">*</span>
//                     </label>
//                     <input
//                       type="text"
//                       name="projectName"
//                       value={formData.projectName || ''}
//                       onChange={handleChange}
//                       placeholder="Enter project name"
//                       required
//                       className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-muted)] px-3.5 py-2.5 rounded-lg text-sm focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] transition-colors"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
//                       Client
//                     </label>
//                     <input
//                       type="text"
//                       name="client"
//                       value={formData.client || ''}
//                       onChange={handleChange}
//                       placeholder="Enter client name"
//                       className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-muted)] px-3.5 py-2.5 rounded-lg text-sm focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] transition-colors"
//                     />
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
//                     Description
//                   </label>
//                   <textarea
//                     name="description"
//                     value={formData.description || ''}
//                     onChange={handleChange}
//                     rows="3"
//                     placeholder="Describe the project..."
//                     className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-muted)] px-3.5 py-2.5 rounded-lg text-sm focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] transition-colors resize-none"
//                   />
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                   <div>
//                     <label className="block text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
//                       Status
//                     </label>
//                     <select
//                       name="status"
//                       value={formData.status || ''}
//                       onChange={handleChange}
//                       className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] transition-colors"
//                     >
//                       <option value="" disabled>Select status...</option>
//                       <option value="Pending">Pending</option>
//                       <option value="In Progress">In Progress</option>
//                       <option value="Completed">Completed</option>
//                     </select>
//                   </div>
//                   <div>
//                     <label className="block text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
//                       Start Date
//                     </label>
//                     <input
//                       type="date"
//                       name="startDate"
//                       value={formData.startDate || ''}
//                       onChange={handleChange}
//                       className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] px-3.5 py-2.5 rounded-lg text-sm focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] transition-colors"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
//                       End Date
//                     </label>
//                     <input
//                       type="date"
//                       name="endDate"
//                       value={formData.endDate || ''}
//                       onChange={handleChange}
//                       className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] px-3.5 py-2.5 rounded-lg text-sm focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] transition-colors"
//                     />
//                   </div>
//                 </div>
//               </div>

//               <div className="flex gap-3 justify-end px-6 py-4 border-t border-[var(--border-color)] bg-[var(--bg-secondary)]">
//                 <button
//                   type="button"
//                   onClick={() => setShowForm(false)}
//                   className="px-4 py-2 border border-[var(--border-color)] hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] font-medium rounded-lg text-sm transition"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-[var(--text-inverse)] font-medium px-5 py-2 rounded-lg text-sm transition shadow-lg shadow-[var(--accent-primary)]/20"
//                 >
//                   {editingId ? "Update Project" : "Create Project"}
//                 </button>
//               </div>
//             </form>
//           </div>
//         )}
//       </div>
//     </>
//   );
// };

// export default Project;




import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../service/api.js";
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  Calendar,
  Briefcase,
  FolderKanban,
  Loader2,
  X,
  Search,
  ChevronRight,
  CheckCircle,
  Clock,
  AlertCircle,
  Users,
  FileText,
  ArrowUpRight,
} from "lucide-react";
import toast, { Toaster } from 'react-hot-toast';

const API_BASE_URL = "/projects";

const Project = () => {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [projects, setProjects] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const initialFormState = {
    projectName: "",
    description: "",
    status: "",
    client: "",
    startDate: "",
    endDate: "",
  };

  const [formData, setFormData] = useState(initialFormState);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await api.get(API_BASE_URL);
      setProjects(res.data);
    } catch (err) {
      console.error(err.message);
      toast.error("Failed to fetch projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        const res = await api.put(`${API_BASE_URL}/${editingId}`, formData);
        setProjects((prev) => prev.map((p) => (p._id === editingId ? res.data : p)));
        setEditingId(null);
        toast.success("Project updated successfully!");
      } else {
        const res = await api.post(API_BASE_URL, formData);
        setProjects((prev) => [...prev, res.data]);
        toast.success("Project created successfully!");
      }
      setFormData(initialFormState);
      setShowForm(false);
    } catch (err) {
      console.error(err.message);
      toast.error(err.response?.data?.message || "Failed to save project");
    }
  };

  const handleEdit = (project) => {
    setFormData({
      projectName: project.projectName || "",
      description: project.description || "",
      status: project.status || "",
      client: project.client || "",
      startDate: project.startDate ? new Date(project.startDate).toISOString().split("T")[0] : "",
      endDate: project.endDate ? new Date(project.endDate).toISOString().split("T")[0] : "",
    });
    setEditingId(project._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete project?")) return;
    try {
      await api.delete(`${API_BASE_URL}/${id}`);
      setProjects((prev) => prev.filter((p) => p._id !== id));
      toast.success("Project deleted successfully!");
    } catch (err) {
      console.error(err.message);
      toast.error("Failed to delete project");
    }
  };

  const openProjectDetail = (projectId) => {
    navigate(`/admin/project/${projectId}`);
  };

  // ✅ CALCULATE PROJECT STATUS FROM TASKS
  const calculateProjectStatus = (tasks) => {
    if (!tasks || tasks.length === 0) return "Pending";
    
    let completedCount = 0;
    let inProgressCount = 0;
    let pendingCount = 0;
    
    tasks.forEach(task => {
      // ✅ Task is COMPLETED only if completed is true AND tested is true
      if (task.completed === true && task.tested === true) {
        completedCount++;
      } 
      // ✅ Task is IN PROGRESS if basicWork is true but not completed
      else if (task.basicWork === true && task.completed === false) {
        inProgressCount++;
      } 
      // ✅ Task is PENDING if no basicWork and not completed
      else if (task.basicWork === false && task.completed === false) {
        pendingCount++;
      }
      // ✅ If completed is true but tested is false, it's still IN PROGRESS
      else if (task.completed === true && task.tested === false) {
        inProgressCount++;
      }
    });
    
    // ✅ If ALL tasks are completed AND tested
    if (completedCount === tasks.length && completedCount > 0) {
      return "Completed";
    }
    
    // ✅ If ANY task is in progress
    if (inProgressCount > 0) {
      return "In Progress";
    }
    
    // ✅ If ALL tasks are pending
    if (pendingCount === tasks.length) {
      return "Pending";
    }
    
    // ✅ Fallback - If some completed but not all, and no inProgress
    if (completedCount > 0 && pendingCount > 0) {
      return "In Progress";
    }
    
    return "Pending";
  };

  // ✅ Get status info with real icons
  const getStatusInfo = (status) => {
    const statusMap = {
      "Pending": {
        color: "bg-[var(--warning)]/10 text-[var(--warning)] border-[var(--warning)]/20",
        icon: <AlertCircle className="w-3.5 h-3.5" />,
        label: "Pending"
      },
      "In Progress": {
        color: "bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border-[var(--accent-primary)]/20",
        icon: <Clock className="w-3.5 h-3.5" />,
        label: "In Progress"
      },
      "Completed": {
        color: "bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/20",
        icon: <CheckCircle className="w-3.5 h-3.5" />,
        label: "Completed"
      }
    };
    return statusMap[status] || {
      color: "bg-[var(--border-color)] text-[var(--text-muted)] border-[var(--border-color)]",
      icon: <AlertCircle className="w-3.5 h-3.5" />,
      label: status || "Unknown"
    };
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // ✅ Calculate task stats for each project
  const getProjectStats = (project) => {
    const tasks = project.tasks || [];
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed && t.tested).length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const documents = project.documents?.length || 0;
    return { totalTasks, completedTasks, progress, documents };
  };

  const filteredProjects = projects.filter((project) =>
    project.projectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.client?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-[var(--accent-primary)] animate-spin" />
        <p className="text-[var(--text-secondary)] text-sm">Loading projects...</p>
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
        <div className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)] px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-[var(--accent-primary)]/10 p-2.5 rounded-xl">
                <FolderKanban className="w-5 h-5 text-[var(--accent-primary)]" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-[var(--text-primary)]">Projects</h1>
                <p className="text-sm text-[var(--text-secondary)]">Manage and track your company projects</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setShowForm(true);
                  setEditingId(null);
                  setFormData(initialFormState);
                }}
                className="inline-flex items-center gap-2 bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-[var(--text-inverse)] px-4 py-2.5 rounded-lg text-sm font-medium transition shadow-lg shadow-[var(--accent-primary)]/20"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Create Project</span>
                <span className="sm:hidden">New</span>
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-4 relative">
            <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search projects by name or client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-muted)] pl-10 pr-4 py-2.5 rounded-lg text-sm focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] transition-colors"
            />
          </div>
        </div>

        {/* Project Cards - Responsive Grid */}
        <div className="p-4 sm:p-6">
          {filteredProjects.length === 0 ? (
            <div className="text-center py-16 px-6">
              <FolderKanban className="w-16 h-16 text-[var(--text-muted)] mx-auto mb-4" />
              <p className="text-[var(--text-secondary)] font-medium">No projects found</p>
              <p className="text-[var(--text-muted)] text-sm mt-1">
                {searchTerm ? "Try adjusting your search" : "Click 'Create Project' to get started"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredProjects.map((project) => {
                const stats = getProjectStats(project);
                // ✅ Calculate status from tasks
                const calculatedStatus = calculateProjectStatus(project.tasks);
                const statusInfo = getStatusInfo(calculatedStatus);

                return (
                  <div
                    key={project._id}
                    className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl overflow-hidden hover:border-[var(--border-hover)] transition-all duration-300 group cursor-pointer"
                    onClick={() => openProjectDetail(project._id)}
                  >
                    {/* Card Header */}
                    <div className="p-4 border-b border-[var(--border-color)]">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-[var(--accent-primary)]/10 flex items-center justify-center flex-shrink-0">
                              <FolderKanban className="w-4 h-4 text-[var(--accent-primary)]" />
                            </div>
                            <h3 className="font-semibold text-[var(--text-primary)] truncate">
                              {project.projectName}
                            </h3>
                          </div>
                          <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-2">
                            {project.description || "No description"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 space-y-3">
                      {/* Client */}
                      <div className="flex items-center gap-2 text-sm">
                        <Briefcase className="w-4 h-4 text-[var(--text-muted)]" />
                        <span className="text-[var(--text-secondary)]">
                          {project.client || "No Client"}
                        </span>
                      </div>

                      {/* Dates */}
                      <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{formatDate(project.startDate)}</span>
                        </div>
                        <span>→</span>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{formatDate(project.endDate)}</span>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                          <span className="text-[var(--text-secondary)]">{stats.totalTasks} tasks</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                          <span className="text-[var(--text-secondary)]">{stats.documents} docs</span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-[var(--text-muted)]">Progress</span>
                          <span className="text-xs font-medium text-[var(--text-secondary)]">
                            {stats.progress}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-[var(--bg-input)] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--success)]"
                            style={{ width: `${stats.progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Status Badge - NOW USING CALCULATED STATUS */}
                      <div className="flex items-center justify-between pt-2 border-t border-[var(--border-color)]">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}>
                          {statusInfo.icon}
                          {statusInfo.label}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openProjectDetail(project._id);
                          }}
                          className="p-1.5 text-[var(--text-muted)] hover:text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/10 rounded-lg transition group"
                        >
                          <ArrowUpRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Create/Edit Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="absolute inset-0" onClick={() => setShowForm(false)} />
            <form
              onSubmit={handleSubmit}
              className="bg-[var(--bg-card)] w-full max-w-2xl max-h-[90vh] flex flex-col border border-[var(--border-color)] rounded-xl overflow-hidden relative z-10"
            >
              <div className="flex items-center justify-between border-b border-[var(--border-color)] px-6 py-4">
                <div>
                  <h2 className="text-xl font-semibold text-[var(--text-primary)]">
                    {editingId ? "Edit Project" : "Create New Project"}
                  </h2>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {editingId ? "Update project details" : "Add a new project to your portfolio"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-5 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
                      Project Name <span className="text-[var(--danger)]">*</span>
                    </label>
                    <input
                      type="text"
                      name="projectName"
                      value={formData.projectName || ''}
                      onChange={handleChange}
                      placeholder="Enter project name"
                      required
                      className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-muted)] px-3.5 py-2.5 rounded-lg text-sm focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
                      Client
                    </label>
                    <input
                      type="text"
                      name="client"
                      value={formData.client || ''}
                      onChange={handleChange}
                      placeholder="Enter client name"
                      className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-muted)] px-3.5 py-2.5 rounded-lg text-sm focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description || ''}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Describe the project..."
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-muted)] px-3.5 py-2.5 rounded-lg text-sm focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] transition-colors resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status || ''}
                      onChange={handleChange}
                      className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] transition-colors"
                    >
                      <option value="">Select status...</option>
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
                      Start Date
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate || ''}
                      onChange={handleChange}
                      className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] px-3.5 py-2.5 rounded-lg text-sm focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
                      End Date
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate || ''}
                      onChange={handleChange}
                      className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] px-3.5 py-2.5 rounded-lg text-sm focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-end px-6 py-4 border-t border-[var(--border-color)] bg-[var(--bg-secondary)]">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-[var(--border-color)] hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] font-medium rounded-lg text-sm transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-[var(--text-inverse)] font-medium px-5 py-2 rounded-lg text-sm transition shadow-lg shadow-[var(--accent-primary)]/20"
                >
                  {editingId ? "Update Project" : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </>
  );
};

export default Project;