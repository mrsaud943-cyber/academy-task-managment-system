import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../service/api.js";
import {
  ArrowLeft,
  Calendar,
  FileText,
  CheckCircle,
  FolderOpen,
  User,
  Plus,
  Edit2,
  Trash2,
  Upload,
  X,
  Eye,
  Briefcase,
  Search,
  Users,
  Check,
  Clock,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronRight,
  Award,
} from "lucide-react";
import toast, { Toaster } from 'react-hot-toast';

const API_BASE_URL = "/projects";

const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [users, setUsers] = useState([]);
  const [currentTab, setCurrentTab] = useState("Tasks");
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState({});

  const [editTask, setEditTask] = useState(null);
  const [isEditingMultiple, setIsEditingMultiple] = useState(false);
  const [allTasksWithSameName, setAllTasksWithSameName] = useState([]);

  // ✅ Task Form - Multiple Employees
  const [taskForm, setTaskForm] = useState({
    name: "",
    description: "",
    obtainedMarks: 0,
    client: "",
    selectedEmployees: [],
    startDate: "",
    deadline: "",
  });

  const initialTaskFormState = {
    name: "",
    description: "",
    obtainedMarks: 0,
    client: "",
    selectedEmployees: [],
    startDate: "",
    deadline: "",
  };

  const [searchEmployee, setSearchEmployee] = useState("");
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);

  // ✅ Give Numbers Modal State
  const [showGiveNumbersModal, setShowGiveNumbersModal] = useState(false);
  const [selectedTaskForNumbers, setSelectedTaskForNumbers] = useState(null);
  const [numbersForm, setNumbersForm] = useState({
    marks: 0,
    basicWork: false,
    completed: false,
    tested: false,
  });

  // ✅ SETTINGS STATE
  const [settings, setSettings] = useState({
    maxEmployeesPerTask: 5,
    allowMultipleAssignees: true,
    defaultTaskStatus: "Pending",
    maxTasksPerProject: 100,
  });

  // ✅ FETCH ALL SETTINGS
  useEffect(() => {
    fetchProject();
    fetchEmployees();
    fetchAllSettings();
  }, [projectId]);

  const fetchAllSettings = async () => {
    try {
      const res = await api.get("/settings");
      if (res.data && Array.isArray(res.data)) {
        const settingsMap = {};
        res.data.forEach(setting => {
          settingsMap[setting.key] = setting.value;
        });
        setSettings(prev => ({ ...prev, ...settingsMap }));
      }
    } catch (error) {
      console.error("Fetch Settings Error:", error);
    }
  };

  const fetchProject = async () => {
    setLoading(true);
    try {
      const res = await api.get(`${API_BASE_URL}/${projectId}`);
      console.log("Fetched Project:", res.data);
      setProject(res.data);
    } catch (err) {
      console.error("Fetch Project Error:", err.message);
      toast.error("Failed to load project");
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    setUsersLoading(true);
    try {
      const res = await api.get("/user/all-users");
      let usersData = res.data.users || res.data.data || res.data || [];
      const allUsers = Array.isArray(usersData) ? usersData : [];
      const onlyEmployees = allUsers.filter(user => user.role === "employee");
      setUsers(onlyEmployees);
    } catch (error) {
      console.error("Fetch Employees Error:", error);
      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
  };

  // ✅ CALCULATE PROJECT STATUS FROM TASKS - FIXED
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

  const handleTaskChange = (e) => {
    const { name, value } = e.target;
    setTaskForm({
      ...taskForm,
      [name]: value,
    });
  };

  // ✅ ADD EMPLOYEE TO TASK
  const addEmployeeToTask = (employee) => {
    // ✅ VALIDATION: Check if multiple assignees are allowed
    if (!settings.allowMultipleAssignees && taskForm.selectedEmployees.length >= 1) {
      toast.error("Multiple assignees are disabled by admin. Only one employee allowed per task.");
      return;
    }

    // ✅ VALIDATION: Check max employees per task
    if (taskForm.selectedEmployees.length >= settings.maxEmployeesPerTask) {
      toast.error(`You can assign maximum ${settings.maxEmployeesPerTask} employees to a task.`);
      return;
    }

    // ✅ VALIDATION: Check if employee already selected
    if (taskForm.selectedEmployees.find(emp => emp._id === employee._id)) {
      toast.warning(`${employee.name || employee.email} is already assigned to this task.`);
      return;
    }

    setTaskForm(prev => ({
      ...prev,
      selectedEmployees: [...prev.selectedEmployees, employee]
    }));

    setSearchEmployee("");
    setShowEmployeeDropdown(false);
    toast.success(`${employee.name || employee.email} added to task`);
  };

  // ✅ REMOVE EMPLOYEE FROM TASK
  const removeEmployeeFromTask = (employeeId) => {
    const employee = taskForm.selectedEmployees.find(emp => emp._id === employeeId);
    setTaskForm(prev => ({
      ...prev,
      selectedEmployees: prev.selectedEmployees.filter(emp => emp._id !== employeeId)
    }));
    if (employee) {
      toast.info(`${employee.name || employee.email} removed from task`);
    }
  };

  // ✅ FILTERED EMPLOYEES
  const filteredEmployees = users.filter(emp => {
    const matchesSearch = emp.name?.toLowerCase().includes(searchEmployee.toLowerCase());
    const alreadySelected = taskForm.selectedEmployees.find(selected => selected._id === emp._id);
    const limitReached = taskForm.selectedEmployees.length >= settings.maxEmployeesPerTask;
    const multipleDisabled = !settings.allowMultipleAssignees && taskForm.selectedEmployees.length >= 1;
    return matchesSearch && !alreadySelected && !limitReached && !multipleDisabled;
  });

  const getGroupedTasks = () => {
    if (!project?.tasks) return {};
    const groups = {};
    project.tasks.forEach(task => {
      const taskName = task.name || "Unnamed Task";
      if (!groups[taskName]) {
        groups[taskName] = [];
      }
      groups[taskName].push(task);
    });
    return groups;
  };

  const toggleGroup = (taskName) => {
    setExpandedGroups(prev => ({
      ...prev,
      [taskName]: !prev[taskName]
    }));
  };

  // ✅ ADD TASK - Multiple Employees
  const addTask = async () => {
    try {
      // ✅ Validate: Check max employees per task
      if (taskForm.selectedEmployees.length > settings.maxEmployeesPerTask) {
        toast.error(`You can assign maximum ${settings.maxEmployeesPerTask} employees to a task.`);
        return;
      }

      // ✅ Validate: Check if multiple assignees are allowed
      if (!settings.allowMultipleAssignees && taskForm.selectedEmployees.length > 1) {
        toast.error("Multiple assignees are disabled by admin. Only one employee allowed per task.");
        return;
      }

      // ✅ Validate: Check if any employee selected
      if (taskForm.selectedEmployees.length === 0) {
        toast.error("Please select at least one employee for this task.");
        return;
      }

      const promises = taskForm.selectedEmployees.map(employee => {
        const taskData = {
          name: taskForm.name,
          description: taskForm.description,
          basicWork: false,
          completed: false,
          tested: false,
          obtainedMarks: Number(taskForm.obtainedMarks),
          client: taskForm.client,
          user: employee._id,
          startDate: taskForm.startDate,
          endDate: taskForm.deadline,
        };
        return api.post(`${API_BASE_URL}/${projectId}/tasks`, taskData);
      });

      await Promise.all(promises);
      await fetchProject();
      resetTaskForm();
      setShowTaskForm(false);

      if (taskForm.name) {
        setExpandedGroups(prev => ({ ...prev, [taskForm.name]: true }));
      }

      toast.success(`${taskForm.selectedEmployees.length} task(s) added successfully!`);
    } catch (err) {
      console.error("Add Task Error:", err.message);
      toast.error("Failed to add tasks");
    }
  };

  // ✅ UPDATE TASK - Multiple Employees
  const updateTask = async () => {
    try {
      if (taskForm.selectedEmployees.length > settings.maxEmployeesPerTask) {
        toast.error(`You can assign maximum ${settings.maxEmployeesPerTask} employees to a task.`);
        return;
      }

      if (!settings.allowMultipleAssignees && taskForm.selectedEmployees.length > 1) {
        toast.error("Multiple assignees are disabled by admin. Only one employee allowed per task.");
        return;
      }

      const tasksWithSameName = project.tasks.filter(t => t.name === editTask.name);

      const selectedUserIds = taskForm.selectedEmployees.map(emp => emp._id);

      const currentUserIds = tasksWithSameName.map(t => {
        let uid = t.user;
        if (typeof uid === 'object' && uid?._id) uid = uid._id;
        return uid?.toString();
      }).filter(Boolean);

      const usersToAdd = selectedUserIds.filter(uid => !currentUserIds.includes(uid?.toString()));
      const usersToRemove = currentUserIds.filter(uid => !selectedUserIds.includes(uid?.toString()));

      // Delete tasks for removed employees
      for (const userId of usersToRemove) {
        const taskToDelete = tasksWithSameName.find(t => {
          let uid = t.user;
          if (typeof uid === 'object' && uid?._id) uid = uid._id;
          return uid?.toString() === userId;
        });
        if (taskToDelete) {
          await api.delete(`${API_BASE_URL}/${projectId}/tasks/${taskToDelete._id}`);
        }
      }

      // Update existing tasks
      const tasksToKeep = tasksWithSameName.filter(t => {
        let uid = t.user;
        if (typeof uid === 'object' && uid?._id) uid = uid._id;
        return selectedUserIds.includes(uid?.toString());
      });

      for (const task of tasksToKeep) {
        const taskData = {
          name: taskForm.name,
          description: taskForm.description,
          obtainedMarks: Number(taskForm.obtainedMarks),
          client: taskForm.client,
          startDate: taskForm.startDate,
          endDate: taskForm.deadline,
        };
        await api.put(`${API_BASE_URL}/${projectId}/tasks/${task._id}`, taskData);
      }

      // Create new tasks for added employees
      const templateTask = tasksWithSameName[0];
      for (const userId of usersToAdd) {
        const taskData = {
          name: taskForm.name,
          description: taskForm.description,
          basicWork: false,
          completed: false,
          tested: false,
          obtainedMarks: Number(taskForm.obtainedMarks),
          client: taskForm.client,
          user: userId,
          startDate: taskForm.startDate,
          endDate: taskForm.deadline,
        };
        await api.post(`${API_BASE_URL}/${projectId}/tasks`, taskData);
      }

      await fetchProject();
      resetTaskForm();
      setShowTaskForm(false);

      toast.success("Task updated successfully!");
    } catch (error) {
      console.error("Update Task Error:", error);
      toast.error("Failed to update task");
    }
  };

  // ✅ GIVE NUMBERS TO TASK
  const openGiveNumbersModal = (task) => {
    setSelectedTaskForNumbers(task);
    setNumbersForm({
      marks: task.obtainedMarks || 0,
      basicWork: task.basicWork || false,
      completed: task.completed || false,
      tested: task.tested || false,
    });
    setShowGiveNumbersModal(true);
  };

  const handleNumbersChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNumbersForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const submitNumbers = async () => {
    try {
      if (!selectedTaskForNumbers) return;

      const updateData = {
        obtainedMarks: Number(numbersForm.marks),
        basicWork: numbersForm.basicWork,
        completed: numbersForm.completed,
        tested: numbersForm.tested,
      };

      await api.put(`${API_BASE_URL}/${projectId}/tasks/${selectedTaskForNumbers._id}`, updateData);
      await fetchProject();
      setShowGiveNumbersModal(false);
      setSelectedTaskForNumbers(null);
      toast.success("Numbers assigned successfully!");
    } catch (error) {
      console.error("Error assigning numbers:", error);
      toast.error("Failed to assign numbers");
    }
  };

  const deleteTask = async (taskId) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await api.delete(`${API_BASE_URL}/${projectId}/tasks/${taskId}`);
      await fetchProject();
      toast.success("Task deleted successfully!");
    } catch (error) {
      console.error("Delete Task Error:", error);
      toast.error("Failed to delete task");
    }
  };

  const deleteGroup = async (taskName) => {
    const tasksToDelete = project.tasks.filter(t => t.name === taskName);
    if (!window.confirm(`Delete all ${tasksToDelete.length} tasks in "${taskName}" group?`)) return;

    try {
      const promises = tasksToDelete.map(task =>
        api.delete(`${API_BASE_URL}/${projectId}/tasks/${task._id}`)
      );
      await Promise.all(promises);
      await fetchProject();
      toast.success(`Group "${taskName}" deleted successfully!`);
    } catch (error) {
      console.error("Delete Group Error:", error);
      toast.error("Failed to delete group");
    }
  };

  const handleEditTask = (task) => {
    console.log("Editing Task:", task);
    setEditTask(task);

    const sameNameTasks = project.tasks.filter(t => t.name === task.name);
    setAllTasksWithSameName(sameNameTasks);
    setIsEditingMultiple(sameNameTasks.length > 1);

    const allEmployees = [];
    const seenIds = new Set();

    sameNameTasks.forEach(t => {
      if (t.user) {
        let userId = typeof t.user === 'object' ? t.user._id : t.user;
        let userObj = typeof t.user === 'object' ? t.user : null;

        if (!seenIds.has(userId?.toString())) {
          seenIds.add(userId?.toString());

          const foundUser = users.find(u => u._id === userId?.toString());
          if (foundUser) {
            allEmployees.push(foundUser);
          } else if (userObj && userObj.name) {
            allEmployees.push(userObj);
          } else {
            allEmployees.push({ _id: userId, name: "Unknown", email: "" });
          }
        }
      }

      if (t.users && Array.isArray(t.users)) {
        t.users.forEach(u => {
          let userId = typeof u === 'object' ? u._id : u;
          let userObj = typeof u === 'object' ? u : null;

          if (!seenIds.has(userId?.toString())) {
            seenIds.add(userId?.toString());

            const foundUser = users.find(user => user._id === userId?.toString());
            if (foundUser) {
              allEmployees.push(foundUser);
            } else if (userObj && userObj.name) {
              allEmployees.push(userObj);
            } else {
              allEmployees.push({ _id: userId, name: "Unknown", email: "" });
            }
          }
        });
      }
    });

    const firstTask = sameNameTasks[0] || task;

    setTaskForm({
      name: firstTask.name || "",
      description: firstTask.description || "",
      obtainedMarks: firstTask.obtainedMarks || 0,
      client: firstTask.client || "",
      selectedEmployees: allEmployees,
      startDate: firstTask.startDate ? new Date(firstTask.startDate).toISOString().split("T")[0] : "",
      deadline: firstTask.endDate ? new Date(firstTask.endDate).toISOString().split("T")[0] : "",
    });

    setShowTaskForm(true);
  };

  const resetTaskForm = () => {
    setEditTask(null);
    setIsEditingMultiple(false);
    setAllTasksWithSameName([]);
    setTaskForm(initialTaskFormState);
    setSearchEmployee("");
    setShowEmployeeDropdown(false);
  };

  const uploadFile = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post(`${API_BASE_URL}/${projectId}/documents`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await fetchProject();
      toast.success("Document uploaded successfully!");
    } catch (error) {
      console.error("Upload Error:", error);
      toast.error("Failed to upload document");
    }
  };

  const handleRemoveDocument = async (documentId) => {
    if (!window.confirm("Delete this document?")) return;
    try {
      await api.delete(`${API_BASE_URL}/${projectId}/documents/${documentId}`);
      await fetchProject();
      toast.success("Document deleted successfully!");
    } catch (error) {
      console.error("Delete Document Error:", error);
      toast.error("Failed to delete document");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      Completed: "bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/20",
      "In Progress": "bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border-[var(--accent-primary)]/20",
      Pending: "bg-[var(--warning)]/10 text-[var(--warning)] border-[var(--warning)]/20",
    };
    return colors[status] || "bg-[var(--border-color)] text-[var(--text-muted)] border-[var(--border-color)]";
  };

  const getStatusIcon = (status) => {
    const icons = {
      Completed: <CheckCircle className="w-3 h-3" />,
      "In Progress": <Clock className="w-3 h-3" />,
      Pending: <AlertCircle className="w-3 h-3" />,
    };
    return icons[status] || <AlertCircle className="w-3 h-3" />;
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getAssignedUser = (task) => {
    if (!task) return null;

    if (task.user && typeof task.user === 'object') {
      if (task.user._id && task.user.name) {
        return task.user;
      }
      if (task.user._id) {
        const found = users.find(u => u._id === task.user._id.toString());
        if (found) return found;
      }
    }

    if (typeof task.user === 'string') {
      const found = users.find(u => u._id === task.user);
      if (found) return found;
      return { _id: task.user, name: "Unknown", email: "", role: "employee" };
    }

    if (task.users && Array.isArray(task.users) && task.users.length > 0) {
      const firstUser = task.users[0];
      if (typeof firstUser === 'object' && firstUser._id) {
        const found = users.find(u => u._id === firstUser._id.toString());
        if (found) return found;
        return firstUser;
      }
      if (typeof firstUser === 'string') {
        const found = users.find(u => u._id === firstUser);
        if (found) return found;
      }
    }

    return null;
  };

  const getGroupStats = (tasks) => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const inProgress = tasks.filter(t => t.status === "In Progress").length;
    const totalMarks = tasks.reduce((sum, t) => sum + (t.obtainedMarks || 0), 0);
    const avgMarks = total > 0 ? Math.round(totalMarks / total) : 0;
    return { total, completed, inProgress, totalMarks, avgMarks };
  };

  // ✅ Calculate project status
  const projectStatus = calculateProjectStatus(project?.tasks);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-[var(--accent-primary)] animate-spin" />
        <p className="text-[var(--text-secondary)] text-sm">Loading project details...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <FolderOpen className="w-16 h-16 text-[var(--text-muted)] mx-auto mb-4" />
        <p className="text-[var(--text-secondary)] text-lg">Project not found</p>
        <button
          onClick={() => navigate("/admin/project")}
          className="mt-4 text-[var(--accent-primary)] hover:text-[var(--accent-hover)] text-sm font-medium transition"
        >
          Go back to projects
        </button>
      </div>
    );
  }

  const completedTasks = project.tasks?.filter((t) => t.completed && t.tested).length || 0;
  const totalTasks = project.tasks?.length || 0;
  const projectProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const groupedTasks = getGroupedTasks();

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
        }}
      />
      <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] overflow-hidden">
        {/* Header */}
        <div className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
          <div className="px-6 py-5">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate("/admin/project")}
                  className="p-2 hover:bg-[var(--bg-hover)] rounded-lg transition text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-transparent hover:border-[var(--border-color)]"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-xl font-semibold text-[var(--text-primary)]">{project.projectName}</h1>
                  <p className="text-sm text-[var(--text-secondary)] mt-0.5">{project.description}</p>
                </div>
              </div>
              {/* ✅ Dynamic Project Status - Calculated from tasks */}
              <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${getStatusColor(projectStatus)}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                {projectStatus || "Pending"}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-6 mt-4 text-sm">
              <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                <Briefcase className="w-4 h-4 text-[var(--text-muted)]" />
                <span className="text-[var(--text-muted)]">Client:</span>
                <span className="text-[var(--text-primary)] font-medium">{project.client || "N/A"}</span>
              </div>
              <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                <Calendar className="w-4 h-4 text-[var(--text-muted)]" />
                <span className="text-[var(--text-muted)]">Start:</span>
                <span className="text-[var(--text-primary)] font-medium">{formatDate(project.startDate)}</span>
              </div>
              <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                <Calendar className="w-4 h-4 text-[var(--text-muted)]" />
                <span className="text-[var(--text-muted)]">End:</span>
                <span className="text-[var(--text-primary)] font-medium">{formatDate(project.endDate)}</span>
              </div>
              <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                <CheckCircle className="w-4 h-4 text-[var(--text-muted)]" />
                <span className="text-[var(--text-muted)]">Tasks:</span>
                <span className="text-[var(--text-primary)] font-medium">{totalTasks}</span>
              </div>
              <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                <FileText className="w-4 h-4 text-[var(--text-muted)]" />
                <span className="text-[var(--text-muted)]">Docs:</span>
                <span className="text-[var(--text-primary)] font-medium">{project.documents?.length || 0}</span>
              </div>

              <div className="flex items-center gap-3 ml-auto">
                <span className="text-xs text-[var(--text-muted)]">Progress</span>
                <div className="w-32 h-2 bg-[var(--bg-input)] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--success)] transition-all duration-500"
                    style={{ width: `${projectProgress}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-[var(--text-secondary)]">{projectProgress}%</span>
              </div>
            </div>

            <div className="flex gap-1 mt-4 border-b border-[var(--border-color)]">
              {["Tasks", "Documents"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setCurrentTab(tab)}
                  className={`py-3 px-5 text-sm font-medium border-b-2 transition -mb-px ${currentTab === tab
                    ? "border-[var(--accent-primary)] text-[var(--accent-primary)]"
                    : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {currentTab === "Tasks" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h4 className="text-sm font-semibold text-[var(--text-primary)]">Sprint Backlog</h4>
                  <span className="text-xs text-[var(--text-muted)] bg-[var(--bg-hover)] px-3 py-1 rounded-full border border-[var(--border-color)]">
                    {Object.keys(groupedTasks).length} groups • {totalTasks} tasks
                  </span>
                  <span className="text-xs text-[var(--warning)] bg-[var(--warning)]/10 px-3 py-1 rounded-full border border-[var(--warning)]/20">
                    Max {settings.maxEmployeesPerTask} employees/task
                  </span>
                  {!settings.allowMultipleAssignees && (
                    <span className="text-xs text-[var(--accent-primary)] bg-[var(--accent-primary)]/10 px-3 py-1 rounded-full border border-[var(--accent-primary)]/20">
                      Single employee only
                    </span>
                  )}
                </div>
                <button
                  onClick={() => {
                    resetTaskForm();
                    setShowTaskForm(true);
                  }}
                  className="inline-flex items-center gap-2 bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-[var(--text-inverse)] px-4 py-2 rounded-lg text-sm font-medium transition shadow-lg shadow-[var(--accent-primary)]/20"
                >
                  <Plus className="w-4 h-4" />
                  Create Task
                </button>
              </div>

              <div className="space-y-3">
                {Object.keys(groupedTasks).length === 0 ? (
                  <div className="text-center py-16 border border-dashed border-[var(--border-color)] rounded-xl bg-[var(--bg-secondary)]">
                    <FolderOpen className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
                    <p className="text-[var(--text-secondary)] text-sm">No tasks yet.</p>
                    <p className="text-[var(--text-muted)] text-xs mt-1">Click "Create Task" to add your first task.</p>
                  </div>
                ) : (
                  Object.keys(groupedTasks).map((taskName) => {
                    const tasks = groupedTasks[taskName];
                    const isExpanded = expandedGroups[taskName];
                    const stats = getGroupStats(tasks);

                    return (
                      <div key={taskName} className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl overflow-hidden">
                        <div
                          className="flex items-center justify-between px-5 py-3 cursor-pointer hover:bg-[var(--bg-hover)] transition-colors"
                          onClick={() => toggleGroup(taskName)}
                        >
                          <div className="flex items-center gap-3">
                            <button className="text-[var(--text-secondary)]">
                              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </button>
                            <h4 className="font-semibold text-[var(--text-primary)]">{taskName}</h4>
                            <span className="text-xs text-[var(--text-muted)] bg-[var(--bg-input)] px-2 py-0.5 rounded-full">
                              {tasks.length} tasks
                            </span>
                            {stats.completed > 0 && (
                              <span className="text-xs text-[var(--success)]">{stats.completed} done</span>
                            )}
                            <span className="text-xs text-[var(--text-muted)]">Avg: {stats.avgMarks} marks</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditTask(tasks[0]);
                              }}
                              className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/10 rounded-lg transition"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteGroup(taskName);
                              }}
                              className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--danger)] hover:bg-[var(--danger)]/10 rounded-lg transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
                                <tr>
                                  <th className="px-4 py-2.5 text-left text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider">Employee</th>
                                  <th className="px-4 py-2.5 text-left text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider">Marks</th>
                                  <th className="px-4 py-2.5 text-left text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider">Basic Work</th>
                                  <th className="px-4 py-2.5 text-left text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider">Completed</th>
                                  <th className="px-4 py-2.5 text-left text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider">Tested</th>
                                  <th className="px-4 py-2.5 text-left text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider">Deadline</th>
                                  <th className="px-4 py-2.5 text-left text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider">Action</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-[var(--border-color)]">
                                {tasks.map((task) => {
                                  const assignedUser = getAssignedUser(task);
                                  const today = new Date();
                                  const deadline = task.endDate ? new Date(task.endDate) : null;
                                  const isDeadlineMissed = deadline && deadline < today && !task.completed;

                                  return (
                                    <tr key={task._id} className={`hover:bg-[var(--bg-hover)] transition-colors ${isDeadlineMissed ? "bg-[var(--danger)]/5" : ""}`}>
                                      <td className="px-4 py-3">
                                        {assignedUser ? (
                                          <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-full bg-[var(--accent-primary)] flex items-center justify-center text-[var(--text-inverse)] text-[10px] font-bold flex-shrink-0">
                                              {assignedUser.name?.charAt(0)?.toUpperCase() || "?"}
                                            </div>
                                            <span className="text-sm text-[var(--text-primary)]">{assignedUser.name || assignedUser.email || "Assigned"}</span>
                                            {isDeadlineMissed && (
                                              <span className="text-[10px] text-[var(--danger)] bg-[var(--danger)]/10 px-1.5 py-0.5 rounded border border-[var(--danger)]/20">⚠️ Missed</span>
                                            )}
                                          </div>
                                        ) : (
                                          <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-full bg-[var(--bg-input)] flex items-center justify-center text-[var(--text-primary)] text-[10px] font-bold flex-shrink-0">?</div>
                                            <span className="text-sm text-[var(--text-muted)]">Unassigned</span>
                                          </div>
                                        )}
                                      </td>

                                      <td className="px-4 py-3">
                                        <span className={`text-sm font-bold ${task.obtainedMarks >= 80 ? "text-[var(--success)]" : task.obtainedMarks >= 50 ? "text-[var(--accent-primary)]" : task.obtainedMarks >= 30 ? "text-[var(--warning)]" : "text-[var(--danger)]"}`}>
                                          {task.obtainedMarks || 0}
                                        </span>
                                      </td>

                                      <td className="px-4 py-3">
                                        {task.basicWork ? (
                                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[var(--accent-primary)]/20 text-[var(--accent-primary)]">
                                            <Check className="w-3.5 h-3.5" />
                                          </span>
                                        ) : (
                                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[var(--bg-input)]/50 text-[var(--text-muted)]">
                                            <X className="w-3.5 h-3.5" />
                                          </span>
                                        )}
                                      </td>

                                      <td className="px-4 py-3">
                                        {task.completed ? (
                                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[var(--success)]/20 text-[var(--success)]">
                                            <Check className="w-3.5 h-3.5" />
                                          </span>
                                        ) : (
                                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[var(--bg-input)]/50 text-[var(--text-muted)]">
                                            <X className="w-3.5 h-3.5" />
                                          </span>
                                        )}
                                      </td>

                                      <td className="px-4 py-3">
                                        {task.tested ? (
                                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[var(--accent-light)]/20 text-[var(--accent-light)]">
                                            <Check className="w-3.5 h-3.5" />
                                          </span>
                                        ) : (
                                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[var(--bg-input)]/50 text-[var(--text-muted)]">
                                            <X className="w-3.5 h-3.5" />
                                          </span>
                                        )}
                                      </td>

                                      <td className="px-4 py-3">
                                        {task.endDate ? (
                                          <span className={`text-xs ${isDeadlineMissed ? "text-[var(--danger)] font-medium" : "text-[var(--text-secondary)]"}`}>
                                            {formatDate(task.endDate)}
                                            {isDeadlineMissed && " 🚨"}
                                          </span>
                                        ) : (
                                          <span className="text-xs text-[var(--text-muted)]">-</span>
                                        )}
                                      </td>

                                      <td className="px-4 py-3">
                                        <button
                                          onClick={() => openGiveNumbersModal(task)}
                                          className="inline-flex items-center gap-1.5 bg-[var(--accent-primary)]/10 hover:bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] border border-[var(--accent-primary)]/20 px-3 py-1.5 rounded-lg text-xs font-medium transition"
                                        >
                                          <Award className="w-3.5 h-3.5" />
                                          Give Numbers
                                        </button>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Documents Tab */}
          {currentTab === "Documents" && (
            <div className="space-y-6">
              <div className="bg-[var(--bg-secondary)] border-2 border-dashed border-[var(--border-color)] hover:border-[var(--accent-primary)]/50 rounded-xl p-10 text-center transition-all duration-300 group">
                <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-[var(--accent-primary)]/10 flex items-center justify-center border border-[var(--accent-primary)]/20 group-hover:border-[var(--accent-primary)]/30 transition">
                  <Upload className="w-8 h-8 text-[var(--text-muted)] group-hover:text-[var(--accent-primary)] transition" />
                </div>
                <label className="cursor-pointer inline-flex items-center gap-2 bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-[var(--text-inverse)] px-6 py-2.5 rounded-lg text-sm font-medium transition shadow-lg shadow-[var(--accent-primary)]/20">
                  <Plus className="w-4 h-4" />
                  Upload Document
                  <input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0])} />
                </label>
                <p className="text-xs text-[var(--text-muted)] mt-3">PDF, Images, Figma files — max 10MB</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-semibold text-[var(--text-primary)]">Repository Assets</h4>
                  <span className="text-xs text-[var(--text-muted)] bg-[var(--bg-hover)] px-3 py-1 rounded-full border border-[var(--border-color)]">
                    {project.documents?.length || 0} files
                  </span>
                </div>

                {!project.documents || project.documents.length === 0 ? (
                  <div className="text-center py-16 border border-dashed border-[var(--border-color)] rounded-xl bg-[var(--bg-secondary)]">
                    <FileText className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
                    <p className="text-[var(--text-secondary)] text-sm">No documents uploaded yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {project.documents.map((doc) => {
                      const isImage = doc.fileUrl && /\.(jpg|jpeg|png|gif|webp)$/i.test(doc.fileUrl);
                      return (
                        <div key={doc._id} className="group bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[var(--border-hover)] rounded-xl overflow-hidden transition-all duration-300">
                          <div className="relative aspect-video bg-[var(--bg-card)]">
                            <button
                              onClick={() => handleRemoveDocument(doc._id)}
                              className="absolute top-2 right-2 z-10 bg-[var(--danger)]/90 hover:bg-[var(--danger)] text-white w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                            {isImage ? (
                              <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="block h-full">
                                <img src={doc.fileUrl} alt={doc.fileName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                              </a>
                            ) : (
                              <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center h-full text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition">
                                <FileText className="w-12 h-12" />
                                <span className="text-xs text-[var(--accent-primary)] mt-2 font-medium">View File</span>
                              </a>
                            )}
                          </div>
                          <div className="p-3 border-t border-[var(--border-color)]">
                            <p className="text-sm font-medium text-[var(--text-primary)] truncate">{doc.fileName || "Untitled"}</p>
                            <a
                              href={doc.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-[var(--accent-primary)] hover:text-[var(--accent-hover)] mt-1.5 inline-flex items-center gap-1 transition-colors"
                            >
                              <Eye className="w-3 h-3" />
                              Open File
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Task Form Modal - Multiple Employees */}
        {showTaskForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div
              className="absolute inset-0"
              onClick={() => {
                setShowTaskForm(false);
                resetTaskForm();
              }}
            />

            <div className="bg-[var(--bg-card)] w-full max-w-4xl max-h-[90vh] flex flex-col border border-[var(--border-color)] rounded-xl overflow-hidden relative z-10 shadow-2xl shadow-black/50">
              <div className="flex items-center justify-between border-b border-[var(--border-color)] px-6 py-4 bg-[var(--bg-secondary)]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--accent-primary)]/10 flex items-center justify-center border border-[var(--accent-primary)]/20">
                    {editTask ? <Edit2 className="w-5 h-5 text-[var(--accent-primary)]" /> : <Plus className="w-5 h-5 text-[var(--accent-primary)]" />}
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-[var(--text-primary)]">
                      {editTask ? "Edit Task" : "Create New Task"}
                    </h4>
                    <p className="text-xs text-[var(--text-muted)]">
                      {editTask ? "Update task details" : "Add a new task to the sprint"}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {!settings.allowMultipleAssignees && (
                        <span className="text-[8px] text-[var(--accent-primary)] bg-[var(--accent-primary)]/10 px-2 py-0.5 rounded border border-[var(--accent-primary)]/20">
                          Single employee only
                        </span>
                      )}
                      <span className="text-[8px] text-[var(--text-muted)]">
                        Max {settings.maxEmployeesPerTask} employees
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowTaskForm(false);
                    resetTaskForm();
                  }}
                  className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
                        Task Title <span className="text-[var(--danger)]">*</span>
                      </label>
                      <input
                        name="name"
                        placeholder="Enter task name"
                        value={taskForm.name}
                        onChange={handleTaskChange}
                        className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] text-[var(--text-primary)] placeholder-[var(--text-muted)] rounded-lg px-4 py-2.5 text-sm outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
                        Description
                      </label>
                      <textarea
                        name="description"
                        placeholder="Describe the task..."
                        value={taskForm.description}
                        onChange={handleTaskChange}
                        rows="3"
                        className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] text-[var(--text-primary)] placeholder-[var(--text-muted)] rounded-lg px-4 py-2.5 text-sm outline-none transition-colors resize-none"
                      />
                    </div>

                    {/* Multiple Employee Selector */}
                    <div className="relative">
                      <label className="block text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
                        Assign Employees <span className="text-[var(--danger)]">*</span>
                        <span className="text-[var(--text-muted)] ml-1">(Max {settings.maxEmployeesPerTask})</span>
                        {!settings.allowMultipleAssignees && (
                          <span className="text-[var(--accent-primary)] ml-1">(Single only)</span>
                        )}
                      </label>

                      {taskForm.selectedEmployees.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {taskForm.selectedEmployees.map(emp => (
                            <span
                              key={emp._id}
                              className="inline-flex items-center gap-1 bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border border-[var(--accent-primary)]/20 px-2.5 py-1 rounded-lg text-xs"
                            >
                              <User className="w-3 h-3" />
                              {emp.name || emp.email}
                              <button
                                type="button"
                                onClick={() => removeEmployeeFromTask(emp._id)}
                                className="hover:text-[var(--danger)] transition ml-0.5"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                          {editTask && (
                            <span className="text-[10px] text-[var(--warning)] ml-1">
                              ({taskForm.selectedEmployees.length} employees)
                            </span>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] text-[var(--text-muted)]">
                          {taskForm.selectedEmployees.length} / {settings.maxEmployeesPerTask} employees assigned
                          {!settings.allowMultipleAssignees && (
                            <span className="ml-2 text-[var(--accent-primary)]">(Single employee only)</span>
                          )}
                        </span>
                        {taskForm.selectedEmployees.length >= settings.maxEmployeesPerTask && (
                          <span className="text-[10px] text-[var(--warning)]">⚠️ Maximum limit reached</span>
                        )}
                        {!settings.allowMultipleAssignees && taskForm.selectedEmployees.length >= 1 && (
                          <span className="text-[10px] text-[var(--accent-primary)]">⚠️ Multiple disabled</span>
                        )}
                      </div>

                      <div className="relative">
                        <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={searchEmployee}
                          onChange={(e) => {
                            setSearchEmployee(e.target.value);
                            setShowEmployeeDropdown(true);
                          }}
                          onFocus={() => setShowEmployeeDropdown(true)}
                          placeholder={
                            taskForm.selectedEmployees.length >= settings.maxEmployeesPerTask
                              ? "Maximum limit reached"
                              : !settings.allowMultipleAssignees && taskForm.selectedEmployees.length >= 1
                                ? "Multiple assignees disabled"
                                : "Search employees..."
                          }
                          disabled={
                            taskForm.selectedEmployees.length >= settings.maxEmployeesPerTask ||
                            (!settings.allowMultipleAssignees && taskForm.selectedEmployees.length >= 1)
                          }
                          className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] text-[var(--text-primary)] placeholder-[var(--text-muted)] rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      </div>

                      {showEmployeeDropdown && filteredEmployees.length > 0 && (
                        <div className="absolute z-20 w-full mt-1 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg shadow-xl max-h-40 overflow-y-auto custom-scrollbar">
                          {filteredEmployees.map(emp => (
                            <button
                              key={emp._id}
                              type="button"
                              onClick={() => addEmployeeToTask(emp)}
                              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[var(--bg-hover)] transition text-left"
                            >
                              <div className="w-7 h-7 rounded-full bg-[var(--accent-primary)]/20 flex items-center justify-center flex-shrink-0">
                                <User className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                              </div>
                              <div>
                                <p className="text-sm text-[var(--text-primary)]">{emp.name || "Unknown"}</p>
                                <p className="text-[10px] text-[var(--text-muted)]">{emp.email}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                      {showEmployeeDropdown && filteredEmployees.length === 0 && searchEmployee && (
                        <div className="absolute z-20 w-full mt-1 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg shadow-xl p-3 text-center">
                          <p className="text-xs text-[var(--text-muted)]">
                            {taskForm.selectedEmployees.length >= settings.maxEmployeesPerTask
                              ? `Maximum ${settings.maxEmployeesPerTask} employees reached`
                              : !settings.allowMultipleAssignees && taskForm.selectedEmployees.length >= 1
                                ? "Multiple assignees disabled by admin"
                                : "No employees found"}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
                          Start Date
                        </label>
                        <input
                          type="date"
                          name="startDate"
                          value={taskForm.startDate}
                          onChange={handleTaskChange}
                          className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] text-[var(--text-primary)] rounded-lg px-4 py-2.5 text-sm outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
                          Deadline
                        </label>
                        <input
                          type="date"
                          name="deadline"
                          value={taskForm.deadline}
                          onChange={handleTaskChange}
                          className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] text-[var(--text-primary)] rounded-lg px-4 py-2.5 text-sm outline-none transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
                        Marks <span className="text-[var(--text-muted)]">(0-100)</span>
                      </label>
                      <input
                        type="number"
                        name="obtainedMarks"
                        min="0"
                        max="100"
                        value={taskForm.obtainedMarks}
                        onChange={handleTaskChange}
                        placeholder="Enter marks"
                        className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] text-[var(--text-primary)] placeholder-[var(--text-muted)] rounded-lg px-4 py-2.5 text-sm outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
                        Client
                      </label>
                      <input
                        name="client"
                        placeholder="Enter client name"
                        value={taskForm.client}
                        onChange={handleTaskChange}
                        className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] text-[var(--text-primary)] placeholder-[var(--text-muted)] rounded-lg px-4 py-2.5 text-sm outline-none transition-colors"
                      />
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={editTask ? updateTask : addTask}
                        disabled={
                          taskForm.selectedEmployees.length === 0 ||
                          !taskForm.name ||
                          taskForm.selectedEmployees.length > settings.maxEmployeesPerTask ||
                          (!settings.allowMultipleAssignees && taskForm.selectedEmployees.length > 1)
                        }
                        className={`flex-1 font-medium py-2.5 rounded-lg text-sm transition shadow-lg ${taskForm.selectedEmployees.length === 0 ||
                            !taskForm.name ||
                            taskForm.selectedEmployees.length > settings.maxEmployeesPerTask ||
                            (!settings.allowMultipleAssignees && taskForm.selectedEmployees.length > 1)
                            ? "bg-[var(--bg-input)] text-[var(--text-muted)] cursor-not-allowed"
                            : "bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-[var(--text-inverse)] shadow-[var(--accent-primary)]/20"
                          }`}
                      >
                        {editTask ? "Update Task" : `Assign to ${taskForm.selectedEmployees.length} Employee(s)`}
                      </button>

                      <button
                        onClick={() => {
                          resetTaskForm();
                          setShowTaskForm(false);
                        }}
                        className="px-5 py-2.5 rounded-lg bg-[var(--bg-input)] hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm font-medium transition border border-[var(--border-color)]"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Give Numbers Modal */}
        {showGiveNumbersModal && selectedTaskForNumbers && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div
              className="absolute inset-0"
              onClick={() => {
                setShowGiveNumbersModal(false);
                setSelectedTaskForNumbers(null);
              }}
            />

            <div className="bg-[var(--bg-card)] w-full max-w-md border border-[var(--border-color)] rounded-xl overflow-hidden relative z-10 shadow-2xl shadow-black/50">
              <div className="flex items-center justify-between border-b border-[var(--border-color)] px-6 py-4 bg-[var(--bg-secondary)]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--accent-primary)]/10 flex items-center justify-center border border-[var(--accent-primary)]/20">
                    <Award className="w-5 h-5 text-[var(--accent-primary)]" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-[var(--text-primary)]">Give Numbers</h4>
                    <p className="text-xs text-[var(--text-muted)]">{selectedTaskForNumbers.name}</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowGiveNumbersModal(false);
                    setSelectedTaskForNumbers(null);
                  }}
                  className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {getAssignedUser(selectedTaskForNumbers) && (
                  <div className="flex items-center gap-3 p-3 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
                    <div className="w-10 h-10 rounded-full bg-[var(--accent-primary)] flex items-center justify-center text-[var(--text-inverse)] text-sm font-bold flex-shrink-0">
                      {getAssignedUser(selectedTaskForNumbers)?.name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div>
                      <p className="font-medium text-[var(--text-primary)]">
                        {getAssignedUser(selectedTaskForNumbers)?.name || "Unknown"}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {getAssignedUser(selectedTaskForNumbers)?.email || ""}
                      </p>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
                    Marks <span className="text-[var(--text-muted)]">(0-100)</span>
                  </label>
                  <input
                    type="number"
                    name="marks"
                    min="0"
                    max="100"
                    value={numbersForm.marks}
                    onChange={handleNumbersChange}
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] text-[var(--text-primary)] rounded-lg px-4 py-2.5 text-sm outline-none transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-2 hover:bg-[var(--bg-hover)] rounded-lg transition">
                    <input
                      type="checkbox"
                      id="basicWork"
                      name="basicWork"
                      checked={numbersForm.basicWork}
                      onChange={handleNumbersChange}
                      className="w-4 h-4 rounded border-[var(--border-color)] text-[var(--accent-primary)] focus:ring-[var(--accent-primary)] focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--bg-card)]"
                    />
                    <label htmlFor="basicWork" className="text-sm text-[var(--text-primary)] cursor-pointer">
                      Basic Work Completed
                    </label>
                  </div>

                  <div className="flex items-center gap-3 p-2 hover:bg-[var(--bg-hover)] rounded-lg transition">
                    <input
                      type="checkbox"
                      id="completed"
                      name="completed"
                      checked={numbersForm.completed}
                      onChange={handleNumbersChange}
                      className="w-4 h-4 rounded border-[var(--border-color)] text-[var(--success)] focus:ring-[var(--success)] focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--bg-card)]"
                    />
                    <label htmlFor="completed" className="text-sm text-[var(--text-primary)] cursor-pointer">
                      Task Completed
                    </label>
                  </div>

                  <div className="flex items-center gap-3 p-2 hover:bg-[var(--bg-hover)] rounded-lg transition">
                    <input
                      type="checkbox"
                      id="tested"
                      name="tested"
                      checked={numbersForm.tested}
                      onChange={handleNumbersChange}
                      className="w-4 h-4 rounded border-[var(--border-color)] text-[var(--accent-light)] focus:ring-[var(--accent-light)] focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--bg-card)]"
                    />
                    <label htmlFor="tested" className="text-sm text-[var(--text-primary)] cursor-pointer">
                      Tested
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-[var(--border-color)]">
                  <button
                    onClick={submitNumbers}
                    className="flex-1 bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-[var(--text-inverse)] font-medium py-2.5 rounded-lg text-sm transition shadow-lg shadow-[var(--accent-primary)]/20"
                  >
                    Assign Numbers
                  </button>
                  <button
                    onClick={() => {
                      setShowGiveNumbersModal(false);
                      setSelectedTaskForNumbers(null);
                    }}
                    className="px-5 py-2.5 rounded-lg bg-[var(--bg-input)] hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm font-medium transition border border-[var(--border-color)]"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ProjectDetail;