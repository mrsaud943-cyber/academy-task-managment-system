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
} from "../Controllers/setting.controller.js";

const router = express.Router();

// ============================================
// SETTINGS ROUTES
// ============================================

// Get all settings
router.get("/", getAllSettings);

// Get settings grouped by category
router.get("/grouped", getSettingsGrouped);

// ============================================
// THEME ROUTES - ADD THIS
// ============================================

// Get current theme
router.get("/theme", getTheme);

// Update theme
router.put("/theme", updateTheme);

// ============================================
// UI STYLE ROUTES
// ============================================

// Get current UI style
router.get("/uiStyle", getUIStyleValue);

// Update UI style
router.put("/uiStyle", updateUIStyle);

// ============================================
// GENERIC SETTINGS ROUTES
// ============================================

// Get single setting by key
router.get("/:key", getSetting);

// Update or create setting
router.put("/:key", updateSetting);

// Delete setting
router.delete("/:key", deleteSetting);

export default router;