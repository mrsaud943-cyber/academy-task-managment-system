// Backend/index.js
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./src/config/db.js";
import dotenv from 'dotenv';

// Import Models
import "./src/models/Users.js";
import "./src/models/Project.js";
import "./src/models/Setting.js";
import "./src/models/Attendance.js";

// Import Routes
import userroutes from "./src/Routes/user.Routes.js";
import projectroutes from "./src/Routes/project.routes.js";
import attendanceroutes from "./src/Routes/attendance.routes.js";
import authRoutes from "./src/Auth/routes/auth.routes.js";
import rankingRoutes from "./src/Routes/ranking.routes.js";
import settingRoutes from "./src/Routes/setting.routes.js";
import geocodeRoutes from './src/Routes/geocode.routes.js';
import memberRoutes from "./src/Routes/members.routes.js";
import locationRoutes from './src/Routes/location.routes.js';

import { startCronJobs } from "./src/services/cron.job.js";

// Import Controllers
import { initializeSettings } from "./src/Controllers/setting.controller.js";

dotenv.config();

// ============================================
// CREATE EXPRESS APP
// ============================================
const app = express();

// ============================================
// MIDDLEWARE
// ============================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL
].filter(Boolean);

// app.use(
//   cors({
//     origin: process.env.FRONTEND_URL || "http://localhost:5173",
//     credentials: true,
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
//     allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
//   })
// );

// ============================================
// TEST ROUTE
// ============================================

app.use(
  cors({
    origin: function (origin, callback) {

      if (!origin) return callback(null, true);

      // Check if origin is allowed
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.warn(`⚠️ CORS blocked request from origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  })
);

app.get("/testing", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend is working!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// ============================================
// API ROUTES
// ============================================
app.use("/api/settings", settingRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/user", userroutes);
app.use("/api/projects", projectroutes);
app.use("/api/attendance", attendanceroutes);
app.use("/api/ranking", rankingRoutes);
app.use('/api/geocode', geocodeRoutes);
// app.use('/api', locationRoutes);
app.use("/api", locationRoutes);
app.use("/api/members", memberRoutes);


// ============================================
// 404 HANDLER
// ============================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ============================================
// ERROR HANDLER
// ============================================
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.stack);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    message: message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// ============================================
// CONNECT TO DATABASE (for Vercel)
// ============================================
let dbConnected = false;

const connectToDatabase = async () => {
  if (!dbConnected) {
    try {
      await connectDB();
      console.log("✅ Database connected successfully");
      await initializeSettings();
      console.log("✅ Settings initialized successfully");
      dbConnected = true;
    } catch (error) {
      console.error("❌ Database connection error:", error.message);
    }
  }
};

// ============================================
// START SERVER (Local development)
// ============================================
const PORT = process.env.PORT || 5000;

// Only start server if not in Vercel environment
if (!process.env.VERCEL) {
  connectToDatabase().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  });
}

// ============================================
// EXPORT FOR VERCEL
// ============================================
// ✅ This is the key export that Vercel needs
export default async function handler(req, res) {
  // Connect to database on first request
  await connectToDatabase();

  // Let Express handle the request
  return app(req, res);
}

// ✅ Also export the app for Vercel serverless functions
export { app };