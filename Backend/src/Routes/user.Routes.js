import express from "express";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  updateUserRole,
  bulkDeleteUsers,
  getUserStats,
  updateUserMarks,
} from "../Controllers/user.controller.js";

const router = express.Router();

// ============================================
// USER STATS (Dashboard ke liye)
// ============================================
router.get("/stats", getUserStats);

// ============================================
// GET ALL USERS (with search, filter, sort)
// ✅ FIXED: Both /all-users and /all work
// ============================================
router.get("/all-users", getAllUsers);
router.get("/all", getAllUsers);

// ============================================
// GET SINGLE USER
// ============================================
router.get("/:id", getUserById);

// ============================================
// CREATE USER
// ============================================
router.post("/create", createUser);

// ============================================
// UPDATE USER (Full Update)
// ============================================
router.put("/update/:id", updateUser);

// ============================================
// UPDATE USER MARKS ONLY
// ============================================
router.put("/marks/:id", updateUserMarks);

// ============================================
// UPDATE USER ROLE ONLY
// ============================================
router.put("/role/:id", updateUserRole);

// ============================================
// TOGGLE USER STATUS (Activate/Deactivate)
// ✅ FIXED: This is the correct endpoint
// ============================================
router.put("/status/:id", toggleUserStatus);

// ============================================
// DELETE SINGLE USER
// ============================================
router.delete("/delete/:id", deleteUser);

// ============================================
// BULK DELETE USERS
// ============================================
router.post("/bulk-delete", bulkDeleteUsers);

export default router;