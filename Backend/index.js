// // Backend/index.js
// import express from "express";
// import cors from "cors";
// import cookieParser from "cookie-parser";
// import dotenv from 'dotenv';
// import connectDB from "./src/config/db.js";

// // Import Models
// import "./src/models/Users.js";
// import "./src/models/Project.js";
// import "./src/models/Setting.js";
// import "./src/models/Attendance.js";

// // Import Routes
// import userroutes from "./src/Routes/user.Routes.js";
// import projectroutes from "./src/Routes/project.routes.js";
// import attendanceroutes from "./src/Routes/attendance.routes.js";
// import authRoutes from "./src/Auth/routes/auth.routes.js";
// import rankingRoutes from "./src/Routes/ranking.routes.js";
// import settingRoutes from "./src/Routes/setting.routes.js";
// import geocodeRoutes from './src/Routes/geocode.routes.js';
// import memberRoutes from "./src/Routes/members.routes.js";
// import locationRoutes from './src/Routes/location.routes.js';

// // Import Controllers
// import { initializeSettings } from "./src/Controllers/setting.controller.js";

// // Load environment variables
// dotenv.config();

// // ============================================
// // EXPRESS APP
// // ============================================
// const app = express();

// // ============================================
// // MIDDLEWARE
// // ============================================
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true, limit: '10mb' }));
// app.use(cookieParser());

// // CORS Configuration
// const allowedOrigins = [
//   'http://localhost:5173',
//   'http://localhost:3000',
//   process.env.FRONTEND_URL,
//   'https://academy-task-managment-system.vercel.app',
//   'https://academy-task-system.vercel.app'
// ].filter(Boolean);

// app.use(
//   cors({
//     origin: function (origin, callback) {
//       if (!origin) return callback(null, true);
//       if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
//         callback(null, true);
//       } else {
//         console.warn(`⚠️ CORS blocked: ${origin}`);
//         callback(new Error('Not allowed by CORS'));
//       }
//     },
//     credentials: true,
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
//     allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
//   })
// );

// // ============================================
// // TEST ROUTE
// // ============================================
// app.get("/testing", (req, res) => {
//   res.status(200).json({
//     success: true,
//     message: "Backend is working!",
//     timestamp: new Date().toISOString(),
//     environment: process.env.NODE_ENV || "development",
//   });
// });

// // ============================================
// // API ROUTES
// // ============================================
// app.use("/api/settings", settingRoutes);
// app.use("/api/auth", authRoutes);
// app.use("/api/user", userroutes);
// app.use("/api/projects", projectroutes);
// app.use("/api/attendance", attendanceroutes);
// app.use("/api/ranking", rankingRoutes);
// app.use('/api/geocode', geocodeRoutes);
// app.use('/api/location', locationRoutes);
// app.use("/api/members", memberRoutes);

// // ============================================
// // 404 HANDLER
// // ============================================
// app.use((req, res) => {
//   res.status(404).json({
//     success: false,
//     message: `Route not found: ${req.method} ${req.originalUrl}`,
//   });
// });

// // ============================================
// // ERROR HANDLER
// // ============================================
// app.use((err, req, res, next) => {
//   console.error("❌ Server Error:", err.stack || err.message);
//   res.status(err.statusCode || 500).json({
//     success: false,
//     message: err.message || "Internal Server Error",
//     ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
//   });
// });

// // ============================================
// // DATABASE CONNECTION
// // ============================================
// let dbConnected = false;

// const connectToDatabase = async () => {
//   if (dbConnected) return;
  
//   try {
//     await connectDB();
//     console.log("✅ Database connected successfully");
    
//     try {
//       await initializeSettings();
//       console.log("✅ Settings initialized successfully");
//     } catch (settingsError) {
//       console.warn("⚠️ Settings initialization warning:", settingsError.message);
//     }
    
//     dbConnected = true;
//   } catch (error) {
//     console.error("❌ Database connection error:", error.message);
//     // Don't throw, let server start anyway
//   }
// };

// // ============================================
// // START SERVER
// // ============================================
// const PORT = process.env.PORT || 5000;

// const startServer = async () => {
//   // Connect to database (don't await, let it run in background)
//   connectToDatabase();
  
//   app.listen(PORT, () => {
//     console.log(`✅ Server running on port ${PORT}`);
//     console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
//     console.log(`🔗 API: http://localhost:${PORT}/api`);
//   });
// };

// // Start server
// startServer();

// // ============================================
// // EXPORT FOR VERCEL
// // ============================================
// export default async function handler(req, res) {
//   await connectToDatabase();
//   return app(req, res);
// }

// export { app };



// Backend/index.js
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from 'dotenv';
import connectDB from "./src/config/db.js";

// ✅ Set timezone for production
process.env.TZ = 'Asia/Karachi';
console.log('🕐 Timezone set to:', process.env.TZ);

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

// Import Controllers
import { initializeSettings } from "./src/Controllers/setting.controller.js";

// Load environment variables
dotenv.config();

// ============================================
// EXPRESS APP
// ============================================
const app = express();

// ============================================
// MIDDLEWARE
// ============================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// CORS Configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
  'https://academy-task-managment-system.vercel.app',
  'https://academy-task-system.vercel.app',
  'https://academy-task-managment-system-4r59.vercel.app'
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
        callback(null, true);
      } else {
        console.warn(`⚠️ CORS blocked: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  })
);

// ============================================
// TEST ROUTE
// ============================================
app.get("/testing", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend is working!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    timezone: process.env.TZ || "UTC",
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
app.use('/api/location', locationRoutes);
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
  console.error("❌ Server Error:", err.stack || err.message);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// ============================================
// DATABASE CONNECTION
// ============================================
let dbConnected = false;

const connectToDatabase = async () => {
  if (dbConnected) return;
  
  try {
    await connectDB();
    console.log("✅ Database connected successfully");
    
    try {
      const result = await initializeSettings();
      console.log("✅ Settings initialized successfully");
    } catch (settingsError) {
      console.warn("⚠️ Settings initialization warning:", settingsError.message);
    }
    
    dbConnected = true;
  } catch (error) {
    console.error("❌ Database connection error:", error.message);
  }
};

// ============================================
// START SERVER
// ============================================
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  connectToDatabase();
  
  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🕐 Timezone: ${process.env.TZ || 'UTC'}`);
    console.log(`🔗 API: http://localhost:${PORT}/api`);
  });
};

startServer();

// ============================================
// EXPORT FOR VERCEL
// ============================================
export default async function handler(req, res) {
  await connectToDatabase();
  return app(req, res);
}

export { app };