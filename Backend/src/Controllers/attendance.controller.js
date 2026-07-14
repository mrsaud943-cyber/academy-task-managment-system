import Attendance from "../models/Attendance.js";
import User from "../models/Users.js";
import { getSettingValue } from "./setting.controller.js";

// ============================================
// ✅ CREATE ATTENDANCE REQUEST
// ============================================
export const createAttendanceRequest = async (req, res) => {
  try {
    const {
      name,
      employeeId,
      date,
      type,
      reason,
      latitude,
      longitude,
      locationAddress,
    } = req.body;

    // Check if already marked for today
    const existing = await Attendance.findOne({
      employeeId,
      date: new Date(date),
    });

    if (existing) {
      return res.status(400).json({
        message: "Attendance already marked for this date",
      });
    }

    const attendance = await Attendance.create({
      name,
      employeeId,
      date: new Date(date),
      type: type || "Present",
      reason: reason || "",
      latitude: latitude || null,
      longitude: longitude || null,
      locationAddress: locationAddress || "",
      status: "Pending",
    });

    res.status(201).json({
      success: true,
      message: "Attendance request submitted successfully",
      data: attendance,
    });
  } catch (error) {
    console.error("Create Attendance Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ============================================
// ✅ GET PENDING REQUESTS
// ============================================
export const getPendingRequests = async (req, res) => {
  try {
    const { page = 1, limit = 15, search } = req.query;

    const query = { status: "Pending" };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [data, total] = await Promise.all([
      Attendance.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Attendance.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    console.error("Get Pending Requests Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ============================================
// ✅ GET ALL REQUESTS (Admin)
// ============================================
export const getAllRequests = async (req, res) => {
  try {
    const { page = 1, limit = 15, status, type, startDate, endDate, search } = req.query;

    const query = {};
    
    if (status && status !== 'all') query.status = status;
    if (type && type !== 'all') query.type = type;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
      ];
    }
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [data, total] = await Promise.all([
      Attendance.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Attendance.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    console.error("Get All Requests Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ============================================
// ✅ GET EMPLOYEE REQUESTS
// ============================================
export const getEmployeeRequests = async (req, res) => {
  try {
    const { employeeId } = req.query;
    const { page = 1, limit = 10, startDate, endDate, status, type } = req.query;

    if (!employeeId) {
      return res.status(400).json({ message: "employeeId is required" });
    }

    const query = { employeeId };
    
    if (status && status !== 'all') query.status = status;
    if (type && type !== 'all') query.type = type;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [data, total] = await Promise.all([
      Attendance.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Attendance.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    console.error("Get Employee Requests Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ============================================
// ✅ HANDLE ATTENDANCE ACTION (Approve/Reject)
// ============================================
export const handleAttendanceAction = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminRemarks } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const attendance = await Attendance.findById(id);
    if (!attendance) {
      return res.status(404).json({ message: "Attendance record not found" });
    }

    attendance.status = status;
    attendance.adminRemarks = adminRemarks || attendance.adminRemarks;
    attendance.processedAt = new Date();
    attendance.processedBy = req.user?._id;

    await attendance.save();

    // Send email notification
    try {
      const emailNotifications = await getSettingValue("emailNotifications", true);
      
      if (emailNotifications && attendance.email) {
        const emailData = getAttendanceApprovalEmail(
          attendance,
          status,
          req.user || { name: 'Admin' }
        );
        
        await sendEmail({
          to: attendance.email,
          subject: emailData.subject,
          html: emailData.html,
        });
        
        console.log(`✅ Attendance status email sent to ${attendance.email}`);
      }
    } catch (emailError) {
      console.error("❌ Failed to send attendance email:", emailError.message);
    }

    res.status(200).json({
      success: true,
      message: `Attendance ${status} successfully`,
      data: attendance,
    });
  } catch (error) {
    console.error("Handle Attendance Action Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ============================================
// ✅ DELETE REQUEST
// ============================================
export const deleteRequest = async (req, res) => {
  try {
    const { id } = req.params;
    
    const attendance = await Attendance.findByIdAndDelete(id);
    if (!attendance) {
      return res.status(404).json({ message: "Attendance record not found" });
    }

    res.status(200).json({
      success: true,
      message: "Attendance record deleted successfully",
    });
  } catch (error) {
    console.error("Delete Request Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ============================================
// ✅ EDIT ATTENDANCE REQUEST
// ============================================
export const editAttendanceRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, date, type, reason, locationAddress } = req.body;

    const attendance = await Attendance.findById(id);
    if (!attendance) {
      return res.status(404).json({ message: "Attendance record not found" });
    }

    if (name) attendance.name = name;
    if (date) attendance.date = new Date(date);
    if (type) attendance.type = type;
    if (reason !== undefined) attendance.reason = reason;
    if (locationAddress !== undefined) attendance.locationAddress = locationAddress;

    await attendance.save();

    res.status(200).json({
      success: true,
      message: "Attendance record updated successfully",
      data: attendance,
    });
  } catch (error) {
    console.error("Edit Attendance Request Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ============================================
// ✅ GET ATTENDANCE BY DATE RANGE
// ============================================
export const getAttendanceByDateRange = async (req, res) => {
  try {
    const { startDate, endDate, employeeId } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: "startDate and endDate are required" });
    }

    const query = {
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    };

    if (employeeId) {
      query.employeeId = employeeId;
    }

    const data = await Attendance.find(query).sort({ date: 1 });

    res.status(200).json({
      success: true,
      data,
      count: data.length,
    });
  } catch (error) {
    console.error("Get Attendance By Date Range Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ============================================
// ✅ GET ATTENDANCE STATS
// ============================================
export const getAttendanceStats = async (req, res) => {
  try {
    const { employeeId, startDate, endDate } = req.query;

    const query = {};
    if (employeeId) query.employeeId = employeeId;
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const [total, approved, rejected, pending] = await Promise.all([
      Attendance.countDocuments(query),
      Attendance.countDocuments({ ...query, status: "Approved" }),
      Attendance.countDocuments({ ...query, status: "Rejected" }),
      Attendance.countDocuments({ ...query, status: "Pending" }),
    ]);

    // Get present/leave/half day counts
    const present = await Attendance.countDocuments({ ...query, type: "Present" });
    const leave = await Attendance.countDocuments({ ...query, type: "Leave" });
    const halfDay = await Attendance.countDocuments({ ...query, type: "Half Day" });

    res.status(200).json({
      success: true,
      data: {
        total,
        approved,
        rejected,
        pending,
        present,
        leave,
        halfDay,
      },
    });
  } catch (error) {
    console.error("Get Attendance Stats Error:", error);
    res.status(500).json({ message: error.message });
  }
};