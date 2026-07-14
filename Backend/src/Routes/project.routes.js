import express from "express";
import multer from "multer";

import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  addTask,
  updateTask,
  deleteTask,
  uploadDocument,
  deleteDocument,
  getProjectById,
} from "../Controllers/project.controller.js";

const router = express.Router();

// ============================================
// MULTER CONFIGURATION - WORKING
// ============================================
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    // Allow images, PDFs, and common document types
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, PDFs, and documents are allowed.'), false);
    }
  }
});

// ============================================
// PROJECT ROUTES
// ============================================

// Get all projects & Create project
router.route("/")
  .get(getProjects)
  .post(createProject);

// Get single project, Update, Delete
router.route("/:id")
  .get(getProjectById) 
  .put(updateProject)
  .delete(deleteProject);

// ============================================
// TASK ROUTES
// ============================================

// Add task to project
router.post("/:id/tasks", addTask);

// Update and Delete task
router
  .route("/:projectId/tasks/:taskId")
  .put(updateTask)
  .delete(deleteTask);


// Upload document (with multer)
router.post(
  "/:id/documents",
  upload.single("file"),
  uploadDocument
);

// Delete document
router.delete(
  "/:projectId/documents/:documentId",
  deleteDocument
);

export default router;