// Backend/src/Routes/attendance.routes.js
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
  createAttendanceWithValidation,
  autoMarkAbsent,
  canMarkAttendance,
  getTodayStatus,
  canEditRequest,
  getEditHistory,
} from "../Controllers/attendance.controller.js";

const router = express.Router();

// ============================================
// ATTENDANCE ROUTES
// ============================================

// Check if employee can mark attendance (dynamic deadline)
router.get("/can-mark", canMarkAttendance);

// Get today's status for employee
router.get("/today-status", getTodayStatus);

// Check if employee can edit request
router.get("/:id/can-edit", canEditRequest);

// Get edit history
router.get("/:id/edit-history", getEditHistory);

// Create attendance with validation (time window check)
router.post("/create", createAttendanceWithValidation);

// Create attendance request (original)
router.post("/create-request", createAttendanceRequest);

// Edit attendance request (with dynamic window)
router.put("/:id/edit", editAttendanceRequest);

// Get all pending requests
router.get("/pending", getPendingRequests);

// Get all requests with filters
router.get("/all", getAllRequests);

// Handle attendance action (Approve/Reject)
router.put("/:id/action", handleAttendanceAction);

// Get employee-specific requests
router.get("/employee", getEmployeeRequests);

// Get attendance by date range
router.get("/date-range", getAttendanceByDateRange);

// Get attendance statistics
router.get("/stats", getAttendanceStats);

// Delete request
router.delete("/:id", deleteRequest);

// Auto-mark absent (manual trigger)
router.post('/auto-mark-absent', async (req, res) => {
  try {
    const result = await autoMarkAbsent();
    
    if (result.success) {
      res.json({ 
        success: true, 
        message: result.message,
        absentCount: result.absentCount || 0,
        absentEmployees: result.absentEmployees || [],
        time: result.time || new Date().toISOString(),
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: result.error || 'Auto-mark absent failed' 
      });
    }
  } catch (error) {
    console.error('❌ Auto-mark absent route error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

export default router;