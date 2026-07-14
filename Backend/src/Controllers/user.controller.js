import User from "../models/Users.js";
import bcrypt from "bcryptjs";

// ============================================
// GET ALL USERS (with search, filter, sort)
// ============================================
export const getAllUsers = async (req, res) => {
  try {
    const { search, role, isActive, sortBy = "createdAt", order = "desc" } = req.query;

    // Build filter
    let filter = {};
    
    if (role && role !== "all") {
      filter.role = role;
    }
    
    if (isActive && isActive !== "all") {
      filter.isActive = isActive === "true";
    }

    // Search filter
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // Sort
    const sortOptions = {};
    sortOptions[sortBy] = order === "asc" ? 1 : -1;

    const users = await User.find(filter)
      .select("-password")
      .sort(sortOptions);

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Get All Users Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================
// GET SINGLE USER
// ============================================
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get User By ID Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================
// CREATE USER
// ============================================
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role, marks } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Validate role
    const allowedRoles = ["employee", "admin"];
    const finalRole = allowedRoles.includes(role) ? role : "employee";

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: finalRole,
      isActive: true,
      marks: marks || 0,
    });

    await newUser.save();

    // Remove password from response
    const userResponse = newUser.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: userResponse,
    });
  } catch (error) {
    console.error("Create User Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================
// UPDATE USER
// ============================================

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, currentPassword } = req.body;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update name
    if (name) {
      user.name = name;
    }

    // Update email
    if (email) {
      user.email = email;
    }

    // Update password
    if (password) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);

      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: "Current password is incorrect",
        });
      }

      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    const updatedUser = await User.findById(id).select("-password");

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================
// DELETE USER
// ============================================
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete User Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ============================================
// TOGGLE USER STATUS (Activate/Deactivate)
// ============================================
export const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    console.log("Toggle Status - ID:", id, "isActive:", isActive);

    const user = await User.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: isActive ? "User activated successfully" : "User deactivated successfully",
      user,
    });
  } catch (error) {
    console.error("Toggle User Status Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================
// UPDATE USER ROLE
// ============================================
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({
        success: false,
        message: "Role is required",
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User role updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update User Role Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================
// BULK DELETE USERS
// ============================================
export const bulkDeleteUsers = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No user IDs provided",
      });
    }

    const result = await User.deleteMany({ _id: { $in: ids } });

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} users deleted successfully`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Bulk Delete Users Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================
// GET USER STATS
// ============================================
export const getUserStats = async (req, res) => {
  try {
    const total = await User.countDocuments();
    const active = await User.countDocuments({ isActive: true });
    const inactive = await User.countDocuments({ isActive: false });
    const admins = await User.countDocuments({ role: "admin" });
    const employees = await User.countDocuments({ role: "employee" });

    res.status(200).json({
      success: true,
      stats: {
        total,
        active,
        inactive,
        admins,
        employees,
      },
    });
  } catch (error) {
    console.error("Get User Stats Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================
// UPDATE USER MARKS
// ============================================
export const updateUserMarks = async (req, res) => {
  try {
    const { id } = req.params;
    const { marks } = req.body;

    if (marks === undefined || marks === null) {
      return res.status(400).json({
        success: false,
        message: "Marks are required",
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { marks: Number(marks) },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User marks updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update User Marks Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};