import Project from "../models/Project.js";
import User from "../models/Users.js";

// ============================================
// GET EMPLOYEE RANKINGS
// ============================================
export const getEmployeeRankings = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      filterBy = "marks",
      sortOrder = "desc",
      search = "",
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get all projects with tasks
    const projects = await Project.find()
      .populate({
        path: "tasks.user",
        model: "User",
        select: "name email role isActive",
      });

    // Collect all tasks with user data
    const allTasks = [];
    projects.forEach((project) => {
      if (project.tasks && Array.isArray(project.tasks)) {
        project.tasks.forEach((task) => {
          if (task.user) {
            allTasks.push({
              userId: task.user._id || task.user,
              userName: task.user.name || "Unknown",
              userEmail: task.user.email || "",
              userRole: task.user.role || "employee",
              isActive: task.user.isActive !== undefined ? task.user.isActive : true,
              taskName: task.name,
              obtainedMarks: task.obtainedMarks || 0,
              completed: task.completed || false,
              projectName: project.projectName,
              projectId: project._id,
            });
          }
        });
      }
    });

    // Group tasks by user
    const userStats = {};
    allTasks.forEach((task) => {
      const userId = task.userId.toString();
      if (!userStats[userId]) {
        userStats[userId] = {
          userId: userId,
          user: {
            _id: userId,
            name: task.userName,
            email: task.userEmail,
            role: task.userRole,
            isActive: task.isActive,
          },
          totalMarks: 0,
          taskCount: 0,
          completedTasks: 0,
          tasks: [],
        };
      }
      userStats[userId].totalMarks += task.obtainedMarks;
      userStats[userId].taskCount += 1;
      if (task.completed) {
        userStats[userId].completedTasks += 1;
      }
      userStats[userId].tasks.push(task);
    });

    // Calculate percentage
    let rankings = Object.values(userStats).map((user) => {
      const totalPossibleMarks = user.taskCount * 100;
      const percentage = totalPossibleMarks > 0 
        ? Math.round((user.totalMarks / totalPossibleMarks) * 100) 
        : 0;
      
      return {
        userId: user.userId,
        user: user.user,
        totalMarks: user.totalMarks,
        percentage: percentage,
        taskCount: user.taskCount,
        completedTasks: user.completedTasks,
        tasks: user.tasks,
      };
    });

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      rankings = rankings.filter(
        (item) =>
          item.user.name?.toLowerCase().includes(searchLower) ||
          item.user.email?.toLowerCase().includes(searchLower)
      );
    }

    // Sort
    const sortField = filterBy === "marks" ? "totalMarks" : "percentage";
    rankings.sort((a, b) => {
      const valA = a[sortField] || 0;
      const valB = b[sortField] || 0;
      return sortOrder === "desc" ? valB - valA : valA - valB;
    });

    // Add rank
    const rankedEmployees = rankings.map((item, index) => ({
      ...item,
      rank: index + 1,
    }));

    // Paginate
    const totalEmployees = rankedEmployees.length;
    const paginatedEmployees = rankedEmployees.slice(skip, skip + parseInt(limit));

    res.status(200).json({
      success: true,
      data: paginatedEmployees,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalEmployees / parseInt(limit)),
        totalEmployees: totalEmployees,
        limit: parseInt(limit),
        hasNextPage: skip + parseInt(limit) < totalEmployees,
        hasPrevPage: parseInt(page) > 1,
      },
    });
  } catch (error) {
    console.error("Get Rankings Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================
// GET TOP PERFORMERS
// ============================================
export const getTopPerformers = async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const projects = await Project.find()
      .populate({
        path: "tasks.user",
        model: "User",
        select: "name email role isActive",
      });

    const allTasks = [];
    projects.forEach((project) => {
      if (project.tasks && Array.isArray(project.tasks)) {
        project.tasks.forEach((task) => {
          if (task.user) {
            allTasks.push({
              userId: task.user._id || task.user,
              userName: task.user.name || "Unknown",
              userEmail: task.user.email || "",
              obtainedMarks: task.obtainedMarks || 0,
              completed: task.completed || false,
            });
          }
        });
      }
    });

    const userStats = {};
    allTasks.forEach((task) => {
      const userId = task.userId.toString();
      if (!userStats[userId]) {
        userStats[userId] = {
          userId: userId,
          name: task.userName,
          email: task.userEmail,
          totalMarks: 0,
          taskCount: 0,
          completedTasks: 0,
        };
      }
      userStats[userId].totalMarks += task.obtainedMarks;
      userStats[userId].taskCount += 1;
      if (task.completed) {
        userStats[userId].completedTasks += 1;
      }
    });

    const performers = Object.values(userStats)
      .map((user) => {
        const totalPossibleMarks = user.taskCount * 100;
        const percentage = totalPossibleMarks > 0 
          ? Math.round((user.totalMarks / totalPossibleMarks) * 100) 
          : 0;
        return {
          ...user,
          percentage: percentage,
          avgMarks: user.taskCount > 0 ? Math.round(user.totalMarks / user.taskCount) : 0,
        };
      })
      .filter((user) => user.taskCount > 0)
      .sort((a, b) => b.avgMarks - a.avgMarks)
      .slice(0, parseInt(limit));

    res.status(200).json({
      success: true,
      data: performers,
    });
  } catch (error) {
    console.error("Get Top Performers Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// ============================================
// GET DEADLINE RANKINGS - Cleaned Version
// ============================================
export const getDeadlineRankings = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortOrder = "desc",
      search = "",
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get all projects with tasks
    const projects = await Project.find()
      .populate({
        path: "tasks.user",
        model: "User",
        select: "name email role isActive",
      });

    const today = new Date();
    const userDeadlineStats = {};

    projects.forEach((project) => {
      (project.tasks || []).forEach((task) => {
        if (!task.user) return;
        
        const userId = task.user._id || task.user;
        
        if (!userDeadlineStats[userId]) {
          userDeadlineStats[userId] = {
            userId: userId,
            user: {
              _id: userId,
              name: task.user.name || "Unknown",
              email: task.user.email || "",
              role: task.user.role || "employee",
              isActive: task.user.isActive !== undefined ? task.user.isActive : true,
            },
            totalTasks: 0,
            completedTasks: 0,
            missedDeadlines: 0,
            onTimeTasks: 0,
            totalDaysOverdue: 0,
            tasksWithDeadline: 0,
          };
        }

        const stats = userDeadlineStats[userId];
        stats.totalTasks++;

        if (task.completed === true) {
          stats.completedTasks++;
        }

        const deadline = task.endDate ? new Date(task.endDate) : null;
        
        if (deadline) {
          stats.tasksWithDeadline++;
          const isOverdue = deadline < today;
          
          if (isOverdue && !task.completed) {
            stats.missedDeadlines++;
            const daysOverdue = Math.floor((today - deadline) / (1000 * 60 * 60 * 24));
            stats.totalDaysOverdue += daysOverdue;
          } else if (!isOverdue || task.completed) {
            stats.onTimeTasks++;
          }
        }
      });
    });

    // ✅ Only include users with missed deadlines
    let rankings = Object.values(userDeadlineStats)
      .filter(user => user.missedDeadlines > 0)
      .map((user) => {
        const avgDaysOverdue = user.missedDeadlines > 0 
          ? Math.round(user.totalDaysOverdue / user.missedDeadlines) 
          : 0;

        return {
          ...user,
          avgDaysOverdue,
        };
      });

    // ✅ Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      rankings = rankings.filter(
        (item) =>
          item.user.name?.toLowerCase().includes(searchLower) ||
          item.user.email?.toLowerCase().includes(searchLower)
      );
    }

    // ✅ Sort by missed deadlines
    rankings.sort((a, b) => {
      return sortOrder === "desc" 
        ? b.missedDeadlines - a.missedDeadlines 
        : a.missedDeadlines - b.missedDeadlines;
    });

    // ✅ Add rank
    const rankedEmployees = rankings.map((item, index) => ({
      ...item,
      rank: index + 1,
    }));

    // ✅ Paginate
    const totalEmployees = rankedEmployees.length;
    const paginatedEmployees = rankedEmployees.slice(skip, skip + parseInt(limit));

    res.status(200).json({
      success: true,
      data: paginatedEmployees,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalEmployees / parseInt(limit)),
        totalEmployees: totalEmployees,
        limit: parseInt(limit),
        hasNextPage: skip + parseInt(limit) < totalEmployees,
        hasPrevPage: parseInt(page) > 1,
      },
    });
  } catch (error) {
    console.error("Get Deadline Rankings Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};