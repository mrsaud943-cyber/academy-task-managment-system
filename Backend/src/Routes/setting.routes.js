// // Backend/src/Routes/setting.routes.js
// import express from "express";
// import {
//   getAllSettings,
//   getSetting,
//   updateSetting,
//   deleteSetting,
//   getSettingsGrouped,
//   updateTheme,
//   getTheme,
//   updateUIStyle,
//   getUIStyleValue,
//   getSettingsStatus,
// } from "../Controllers/setting.controller.js";

// const router = express.Router();

// // ============================================
// // SETTINGS ROUTES
// // ============================================

// // Get all settings
// router.get("/", getAllSettings);

// // Get settings grouped by category
// router.get("/grouped", getSettingsGrouped);

// // Get settings status (for dashboard)
// router.get("/status", getSettingsStatus);

// // ============================================
// // THEME ROUTES
// // ============================================

// router.get("/theme", getTheme);
// router.put("/theme", updateTheme);

// // ============================================
// // UI STYLE ROUTES
// // ============================================

// router.get("/uiStyle", getUIStyleValue);
// router.put("/uiStyle", updateUIStyle);

// // ============================================
// // GENERIC SETTINGS ROUTES
// // ============================================

// router.get("/:key", getSetting);
// router.put("/:key", updateSetting);
// router.delete("/:key", deleteSetting);

// export default router;


// Backend/src/Routes/setting.routes.js
import express from "express";
import {
  getAllSettings,
  getSetting,
  updateSetting,
  deleteSetting,
  getSettingsGrouped,
  updateTheme,
  getTheme,
  updateUIStyle,
  getUIStyleValue,
  getSettingsStatus,
} from "../Controllers/setting.controller.js";

const router = express.Router();

// ============================================
// SETTINGS ROUTES
// ============================================

// Get all settings
router.get("/", getAllSettings);

// Get settings grouped by category
router.get("/grouped", getSettingsGrouped);

// Get settings status (for dashboard)
router.get("/status", getSettingsStatus);

// ============================================
// THEME ROUTES
// ============================================

router.get("/theme", getTheme);
router.put("/theme", updateTheme);

// ============================================
// UI STYLE ROUTES
// ============================================

router.get("/uiStyle", getUIStyleValue);
router.put("/uiStyle", updateUIStyle);

// ============================================
// GENERIC SETTINGS ROUTES
// ============================================

router.get("/:key", getSetting);
router.put("/:key", updateSetting);
router.delete("/:key", deleteSetting);

export default router;