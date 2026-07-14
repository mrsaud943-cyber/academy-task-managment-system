import express from "express";
import {
  createAttendanceRequest,
  getPendingRequests,
  handleAttendanceAction,
  getEmployeeRequests,
  getAllRequests,
  deleteRequest,
  editAttendanceRequest,
  getAttendanceByDateRange,
  getAttendanceStats,
} from "../Controllers/attendance.controller.js";

const router = express.Router();

// ✅ Create attendance request
router.post("/create", createAttendanceRequest);

// ✅ Get all pending requests (with filters)
router.get("/pending", getPendingRequests);

// ✅ Get all requests with filters & pagination
router.get("/all", getAllRequests);

// ✅ Handle attendance action (Approve/Reject)
router.put("/:id/action", handleAttendanceAction);

// ✅ Get employee-specific requests
router.get("/employee", getEmployeeRequests);

// ✅ Get attendance by date range
router.get("/date-range", getAttendanceByDateRange);

// ✅ Get attendance statistics
router.get("/stats", getAttendanceStats);

// ✅ Edit attendance request
router.put("/:id/edit", editAttendanceRequest);

// ✅ Delete request
router.delete("/:id", deleteRequest);

export default router;