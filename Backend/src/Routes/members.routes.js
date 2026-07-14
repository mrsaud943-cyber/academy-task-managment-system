import express from "express";
import {
  getAllMembers,
  getMemberById,
  updateMember,
  deleteMember,
} from "../Controllers/members.controller.js";

const router = express.Router();

// ============================================
// MEMBERS ROUTES
// ============================================

// Get all members (employees only)
router.get("/", getAllMembers);

// Get single member
router.get("/:id", getMemberById);

// Update member
router.put("/:id", updateMember);

// Delete member
router.delete("/:id", deleteMember);

export default router;