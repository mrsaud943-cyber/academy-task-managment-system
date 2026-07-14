import Setting from "../models/Setting.js";

// ============================================
// UI DESIGN SYSTEMS CONFIG
// ============================================
const UI_STYLES_CONFIG = [
  'material',  // Google Material 3 — layered elevation, pill buttons
  'glass',     // Frosted glass panels, soft blur, floating sidebar
  'neumorph',  // Embossed soft-UI, dual shadows, low contrast
  'flat',      // No shadows, thin borders, dense whitespace
  'corporate', // Sharp corners, strong borders, SaaS dashboard density
];

// ============================================
// CRUD OPERATIONS
// ============================================

export const getAllSettings = async (req, res) => {
  try {
    const settings = await Setting.find().sort({ key: 1 });
    res.status(200).json(settings);
  } catch (error) {
    console.error("Get All Settings Error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const setting = await Setting.findOne({ key });

    if (!setting) {
      return res.status(404).json({ message: "Setting not found" });
    }

    res.status(200).json(setting);
  } catch (error) {
    console.error("Get Setting Error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const updateSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const { value, description } = req.body;

    if (value === undefined || value === null) {
      return res.status(400).json({ message: "Value is required" });
    }

    let setting = await Setting.findOne({ key });

    if (setting) {
      setting.value = value;
      if (description !== undefined) setting.description = description;
      setting.updatedAt = new Date();
      await setting.save();
    } else {
      setting = await Setting.create({
        key,
        value,
        description: description || "",
      });
    }

    res.status(200).json({
      success: true,
      message: "Setting updated successfully",
      setting,
    });
  } catch (error) {
    console.error("Update Setting Error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const deleteSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const setting = await Setting.findOneAndDelete({ key });

    if (!setting) {
      return res.status(404).json({ message: "Setting not found" });
    }

    res.status(200).json({
      success: true,
      message: "Setting deleted successfully",
    });
  } catch (error) {
    console.error("Delete Setting Error:", error);
    res.status(500).json({ message: error.message });
  }
};


export const updateTheme = async (req, res) => {
  try {
    const { theme } = req.body;

    // ✅ 10 professional developer themes
    const validThemes = [
      'win-light',
      'win-dark',
      'vscode-dark',
      'github-dark',
      'dracula',
      'nord',
      'one-dark',
      'monokai',
      'solarized-dark',
      'solarized-light',
    ];

    if (!theme || !validThemes.includes(theme)) {
      return res.status(400).json({
        success: false,
        message: `Invalid theme. Available: ${validThemes.join(', ')}`,
      });
    }

    let setting = await Setting.findOne({ key: 'theme' });

    if (setting) {
      setting.value = theme;
      setting.updatedAt = new Date();
      await setting.save();
    } else {
      setting = await Setting.create({
        key: 'theme',
        value: theme,
        description: 'Website theme preference',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Theme updated',
      theme: setting.value,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// GET current theme (used by ThemeContext.fetchTheme)
// ============================================
export const getTheme = async (req, res) => {
  try {
    const setting = await Setting.findOne({ key: 'theme' });
    res.status(200).json({
      success: true,
      value: setting?.value || 'vscode-dark',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateUIStyle = async (req, res) => {

  try {

    const { value } = req.body;

    const validStyles = [
      "material",
      "glass",
      "neumorph",
      "flat",
      "corporate",
    ];

    if (!validStyles.includes(value)) {
      return res.status(400).json({
        success: false,
        message: "Invalid UI Style",
      });
    }

    const setting = await Setting.findOneAndUpdate(
      { key: "uiStyle" },
      {
        key: "uiStyle",
        value,
        description: "Layout / component design system",
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    return res.status(200).json({
      success: true,
      value: setting.value,
      message: "UI Style Updated Successfully",
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }

};

// ============================================
// GET current UI style
// ============================================
export const getUIStyleValue = async (req, res) => {
  try {
    const setting = await Setting.findOne({ key: 'uiStyle' });
    res.status(200).json({
      success: true,
      value: setting?.value || 'material',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

export const getSettingValue = async (key, defaultValue = null) => {
  try {
    const setting = await Setting.findOne({ key });
    return setting ? setting.value : defaultValue;
  } catch (error) {
    console.error(`Get Setting Value Error (${key}):`, error);
    return defaultValue;
  }
};

// ============================================
// EXPORTED SETTINGS GETTERS
// ============================================

// Task Settings
export const getMaxEmployeesPerTask = async () => {
  return await getSettingValue("maxEmployeesPerTask", 5);
};

export const getMaxTasksPerProject = async () => {
  return await getSettingValue("maxTasksPerProject", 100);
};

export const getDefaultProjectStatus = async () => {
  return await getSettingValue("defaultProjectStatus", "Pending");
};

export const allowMultipleAssignees = async () => {
  return await getSettingValue("allowMultipleAssignees", true);
};

// Attendance Settings
export const allowGeoLocation = async () => {
  return await getSettingValue("allowGeoLocation", true);
};

export const getAttendanceTimeWindow = async () => {
  return await getSettingValue("attendanceTimeWindow", 15);
};

export const getAutoMarkAbsent = async () => {
  return await getSettingValue("autoMarkAbsent", false);
};

export const getTaskAssignmentNotifications = async () => {
  return await getSettingValue("taskAssignmentNotifications", true);
};

// Security Settings
export const getTwoFactorAuth = async () => {
  return await getSettingValue("twoFactorAuth", false);
};

export const getSessionTimeout = async () => {
  return await getSettingValue("sessionTimeout", 60);
};

export const getMaxLoginAttempts = async () => {
  return await getSettingValue("maxLoginAttempts", 5);
};

export const getCompactMode = async () => {
  return await getSettingValue("compactMode", false);
};


// ============================================
// INITIALIZE DEFAULT SETTINGS
// ============================================

export const initializeSettings = async () => {
  try {
    console.log("🔄 Initializing default settings...");

    const defaultSettings = [
      // Task Settings
      {
        key: "employeeTheme",
        value: "dark",
        description: "Employee theme preference (dark/light)",
      },
      {
        key: "employeeEmailNotifications",
        value: true,
        description: "Enable email notifications for employees",
      },
      {
        key: "employeeTaskAlerts",
        value: true,
        description: "Enable task assignment alerts for employees",
      },
      {
        key: "employeeDisplayName",
        value: "",
        description: "Employee display name",
      },
      {
        key: "employeeLanguage",
        value: "en",
        description: "Employee language preference",
      },
      {
        key: "employeeSessionTimeout",
        value: 30,
        description: "Employee session timeout in minutes",
      },
      {
        key: "maxEmployeesPerTask",
        value: 5,
        description: "Maximum number of employees that can be assigned to a single task",
      },
      {
        key: "maxTasksPerProject",
        value: 100,
        description: "Maximum number of tasks allowed per project",
      },
      {
        key: "defaultProjectStatus",
        value: "Pending",
        description: "Default status for newly created projects",
      },
      {
        key: "allowMultipleAssignees",
        value: true,
        description: "Allow assigning multiple employees to a single task",
      },

      // Attendance Settings
      {
        key: "attendanceTimeWindow",
        value: 15,
        description: "Minutes allowed before/after scheduled time for attendance",
      },
      {
        key: "autoMarkAbsent",
        value: false,
        description: "Automatically mark employees as absent if no attendance recorded",
      },
      {
        key: "allowGeoLocation",
        value: true,
        description: "Require location data for attendance marking",
      },

      // Security Settings
      {
        key: "twoFactorAuth",
        value: false,
        description: "Enable two-factor authentication for admin accounts",
      },
      {
        key: "sessionTimeout",
        value: 60,
        description: "Minutes of inactivity before automatic logout",
      },
      {
        key: "maxLoginAttempts",
        value: 5,
        description: "Maximum failed login attempts before account lockout",
      },

      // Appearance Settings
      {
        key: "theme",
        value: "vscode-dark",
        description: "Website theme (ocean-breeze, earthy-green, deep-sea, monochrome-beach, neutral-elegance, midnight-sky, earth-tones, cool-waters)",
      },
      {
        key: "uiStyle",
        value: "material",
        description: "UI Design System - Layout, shape & spacing (material, glass, neumorph, flat, corporate)",
      },
      {
        key: "compactMode",
        value: false,
        description: "Reduce spacing for more content visibility",
      },
    ];

    let createdCount = 0;
    let existingCount = 0;

    for (const setting of defaultSettings) {
      try {
        const exists = await Setting.findOne({ key: setting.key });
        if (!exists) {
          await Setting.create(setting);
          createdCount++;
          console.log(`✅ Setting created: ${setting.key} = ${setting.value}`);
        } else {
          existingCount++;
        }
      } catch (error) {
        console.error(`❌ Error creating setting ${setting.key}:`, error.message);
      }
    }

    console.log(`📊 Settings initialized: ${createdCount} created, ${existingCount} existing`);
    return { createdCount, existingCount };

  } catch (error) {
    console.error("❌ Initialize Settings Error:", error);
    throw error;
  }
};

// ============================================
// GET SETTINGS GROUPED BY CATEGORY
// ============================================
export const getSettingsGrouped = async (req, res) => {
  try {
    const allSettings = await Setting.find().sort({ key: 1 });

    const grouped = {
      task: [],
      attendance: [],
      theme: [],
      security: [],
      appearance: [],
    };

    const taskKeys = ["maxEmployeesPerTask", "maxTasksPerProject", "defaultProjectStatus", "allowMultipleAssignees"];
    const attendanceKeys = ["attendanceTimeWindow", "autoMarkAbsent", "allowGeoLocation"];
    const themeKeys = ["theme"];
    const securityKeys = ["twoFactorAuth", "sessionTimeout", "maxLoginAttempts"];
    const appearanceKeys = ["compactMode", "uiStyle"];

    allSettings.forEach(setting => {
      if (taskKeys.includes(setting.key)) grouped.task.push(setting);
      else if (attendanceKeys.includes(setting.key)) grouped.attendance.push(setting);
      else if (themeKeys.includes(setting.key)) grouped.theme.push(setting);
      else if (securityKeys.includes(setting.key)) grouped.security.push(setting);
      else if (appearanceKeys.includes(setting.key)) grouped.appearance.push(setting);
    });

    res.status(200).json({
      success: true,
      data: grouped,
    });
  } catch (error) {
    console.error("Get Settings Grouped Error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};