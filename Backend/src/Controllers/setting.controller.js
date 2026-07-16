// import Setting from "../models/Setting.js";

// // ============================================
// // UI DESIGN SYSTEMS CONFIG
// // ============================================
// const UI_STYLES_CONFIG = [
//   'material',
//   'glass',
//   'neumorph',
//   'flat',
//   'corporate',
// ];

// // ============================================
// // CRUD OPERATIONS
// // ============================================

// export const getAllSettings = async (req, res) => {
//   try {
//     const settings = await Setting.find().sort({ key: 1 });
//     res.status(200).json(settings);
//   } catch (error) {
//     console.error("Get All Settings Error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// export const getSetting = async (req, res) => {
//   try {
//     const { key } = req.params;
//     const setting = await Setting.findOne({ key });

//     if (!setting) {
//       return res.status(404).json({ message: "Setting not found" });
//     }

//     res.status(200).json(setting);
//   } catch (error) {
//     console.error("Get Setting Error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// export const updateSetting = async (req, res) => {
//   try {
//     const { key } = req.params;
//     const { value, description } = req.body;

//     if (value === undefined || value === null) {
//       return res.status(400).json({ message: "Value is required" });
//     }

//     let setting = await Setting.findOne({ key });

//     if (setting) {
//       setting.value = value;
//       if (description !== undefined) setting.description = description;
//       setting.updatedAt = new Date();
//       await setting.save();
//     } else {
//       setting = await Setting.create({
//         key,
//         value,
//         description: description || "",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: "Setting updated successfully",
//       setting,
//     });
//   } catch (error) {
//     console.error("Update Setting Error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// export const deleteSetting = async (req, res) => {
//   try {
//     const { key } = req.params;
//     const setting = await Setting.findOneAndDelete({ key });

//     if (!setting) {
//       return res.status(404).json({ message: "Setting not found" });
//     }

//     res.status(200).json({
//       success: true,
//       message: "Setting deleted successfully",
//     });
//   } catch (error) {
//     console.error("Delete Setting Error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// export const updateTheme = async (req, res) => {
//   try {
//     const { theme } = req.body;

//     const validThemes = [
//       'win-light', 'win-dark', 'vscode-dark', 'github-dark',
//       'dracula', 'nord', 'one-dark', 'monokai',
//       'solarized-dark', 'solarized-light',
//     ];

//     if (!theme || !validThemes.includes(theme)) {
//       return res.status(400).json({
//         success: false,
//         message: `Invalid theme. Available: ${validThemes.join(', ')}`,
//       });
//     }

//     let setting = await Setting.findOne({ key: 'theme' });

//     if (setting) {
//       setting.value = theme;
//       setting.updatedAt = new Date();
//       await setting.save();
//     } else {
//       setting = await Setting.create({
//         key: 'theme',
//         value: theme,
//         description: 'Website theme preference',
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: 'Theme updated',
//       theme: setting.value,
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// export const getTheme = async (req, res) => {
//   try {
//     const setting = await Setting.findOne({ key: 'theme' });
//     res.status(200).json({
//       success: true,
//       value: setting?.value || 'vscode-dark',
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// export const updateUIStyle = async (req, res) => {
//   try {
//     const { value } = req.body;
//     const validStyles = ["material", "glass", "neumorph", "flat", "corporate"];

//     if (!validStyles.includes(value)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid UI Style",
//       });
//     }

//     const setting = await Setting.findOneAndUpdate(
//       { key: "uiStyle" },
//       {
//         key: "uiStyle",
//         value,
//         description: "Layout / component design system",
//       },
//       {
//         new: true,
//         upsert: true,
//         runValidators: true,
//       }
//     );

//     return res.status(200).json({
//       success: true,
//       value: setting.value,
//       message: "UI Style Updated Successfully",
//     });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// export const getUIStyleValue = async (req, res) => {
//   try {
//     const setting = await Setting.findOne({ key: 'uiStyle' });
//     res.status(200).json({
//       success: true,
//       value: setting?.value || 'material',
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ============================================
// // HELPER FUNCTIONS
// // ============================================

// export const getSettingValue = async (key, defaultValue = null) => {
//   try {
//     const setting = await Setting.findOne({ key });
//     return setting ? setting.value : defaultValue;
//   } catch (error) {
//     console.error(`Get Setting Value Error (${key}):`, error);
//     return defaultValue;
//   }
// };

// // ============================================
// // EXPORTED SETTINGS GETTERS
// // ============================================

// // Task Settings
// export const getMaxEmployeesPerTask = async () => {
//   return await getSettingValue("maxEmployeesPerTask", 5);
// };

// export const getMaxTasksPerProject = async () => {
//   return await getSettingValue("maxTasksPerProject", 100);
// };

// export const getDefaultProjectStatus = async () => {
//   return await getSettingValue("defaultProjectStatus", "Pending");
// };

// export const allowMultipleAssignees = async () => {
//   return await getSettingValue("allowMultipleAssignees", true);
// };

// // Attendance Settings
// export const allowGeoLocation = async () => {
//   return await getSettingValue("allowGeoLocation", true);
// };

// export const getAttendanceTimeWindow = async () => {
//   return await getSettingValue("attendanceTimeWindow", 15);
// };

// export const getAutoMarkAbsent = async () => {
//   return await getSettingValue("autoMarkAbsent", false);
// };

// export const getTaskAssignmentNotifications = async () => {
//   return await getSettingValue("taskAssignmentNotifications", true);
// };

// // Security Settings
// export const getTwoFactorAuth = async () => {
//   return await getSettingValue("twoFactorAuth", false);
// };

// export const getSessionTimeout = async () => {
//   return await getSettingValue("sessionTimeout", 60);
// };

// export const getMaxLoginAttempts = async () => {
//   return await getSettingValue("maxLoginAttempts", 5);
// };

// export const getCompactMode = async () => {
//   return await getSettingValue("compactMode", false);
// };

// export const getAttendanceEditWindow = async () => {
//   return await getSettingValue("attendanceEditWindow", 15);
// };

// // ============================================
// // GET SETTINGS STATUS
// // ============================================
// export const getSettingsStatus = async (req, res) => {
//   try {
//     const status = {
//       autoMarkAbsent: await getSettingValue('autoMarkAbsent', false),
//       attendanceTimeWindow: await getSettingValue('attendanceTimeWindow', 15),
//       sessionTimeout: await getSettingValue('sessionTimeout', 60),
//       maxLoginAttempts: await getSettingValue('maxLoginAttempts', 5),
//     };

//     res.status(200).json({
//       success: true,
//       data: status,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// // ============================================
// // INITIALIZE DEFAULT SETTINGS
// // ============================================

// export const initializeSettings = async () => {
//   try {
//     console.log("🔄 Initializing default settings...");

//     const defaultSettings = [
//       // Task Settings
//       { key: "employeeTheme", value: "dark", description: "Employee theme preference (dark/light)" },
//       { key: "employeeEmailNotifications", value: true, description: "Enable email notifications for employees" },
//       { key: "employeeTaskAlerts", value: true, description: "Enable task assignment alerts for employees" },
//       { key: "attendanceEditWindow", value: 15, description: "Minutes allowed for employees to edit their attendance request", },
//       { key: "employeeDisplayName", value: "", description: "Employee display name" },
//       { key: "employeeLanguage", value: "en", description: "Employee language preference" },
//       { key: "employeeSessionTimeout", value: 30, description: "Employee session timeout in minutes" },
//       { key: "maxEmployeesPerTask", value: 5, description: "Maximum number of employees that can be assigned to a single task" },
//       { key: "maxTasksPerProject", value: 100, description: "Maximum number of tasks allowed per project" },
//       { key: "defaultProjectStatus", value: "Pending", description: "Default status for newly created projects" },
//       { key: "allowMultipleAssignees", value: true, description: "Allow assigning multiple employees to a single task" },

//       // Attendance Settings
//       { key: "attendanceTimeWindow", value: 15, description: "Minutes allowed before/after scheduled time for attendance" },
//       { key: "autoMarkAbsent", value: false, description: "Automatically mark employees as absent if no attendance recorded" },
//       { key: "allowGeoLocation", value: true, description: "Require location data for attendance marking" },

//       // Security Settings
//       { key: "twoFactorAuth", value: false, description: "Enable two-factor authentication for admin accounts" },
//       { key: "sessionTimeout", value: 60, description: "Minutes of inactivity before automatic logout" },
//       { key: "maxLoginAttempts", value: 5, description: "Maximum failed login attempts before account lockout" },

//       // Appearance Settings
//       { key: "theme", value: "vscode-dark", description: "Website theme preference" },
//       { key: "uiStyle", value: "material", description: "UI Design System - Layout, shape & spacing" },
//       { key: "compactMode", value: false, description: "Reduce spacing for more content visibility" },
//     ];

//     let createdCount = 0;
//     let existingCount = 0;

//     for (const setting of defaultSettings) {
//       try {
//         const exists = await Setting.findOne({ key: setting.key });
//         if (!exists) {
//           await Setting.create(setting);
//           createdCount++;
//           console.log(`✅ Setting created: ${setting.key} = ${setting.value}`);
//         } else {
//           existingCount++;
//         }
//       } catch (error) {
//         console.error(`❌ Error creating setting ${setting.key}:`, error.message);
//       }
//     }

//     console.log(`📊 Settings initialized: ${createdCount} created, ${existingCount} existing`);
//     return { createdCount, existingCount };
//   } catch (error) {
//     console.error("❌ Initialize Settings Error:", error);
//     throw error;
//   }
// };

// // ============================================
// // GET SETTINGS GROUPED BY CATEGORY
// // ============================================
// export const getSettingsGrouped = async (req, res) => {
//   try {
//     const allSettings = await Setting.find().sort({ key: 1 });

//     const grouped = {
//       task: [],
//       attendance: [],
//       theme: [],
//       security: [],
//       appearance: [],
//     };

//     const taskKeys = ["maxEmployeesPerTask", "maxTasksPerProject", "defaultProjectStatus", "allowMultipleAssignees"];
//     const attendanceKeys = ["attendanceTimeWindow", "autoMarkAbsent", "allowGeoLocation"];
//     const themeKeys = ["theme"];
//     const securityKeys = ["twoFactorAuth", "sessionTimeout", "maxLoginAttempts"];
//     const appearanceKeys = ["compactMode", "uiStyle"];

//     allSettings.forEach(setting => {
//       if (taskKeys.includes(setting.key)) grouped.task.push(setting);
//       else if (attendanceKeys.includes(setting.key)) grouped.attendance.push(setting);
//       else if (themeKeys.includes(setting.key)) grouped.theme.push(setting);
//       else if (securityKeys.includes(setting.key)) grouped.security.push(setting);
//       else if (appearanceKeys.includes(setting.key)) grouped.appearance.push(setting);
//     });

//     res.status(200).json({
//       success: true,
//       data: grouped,
//     });
//   } catch (error) {
//     console.error("Get Settings Grouped Error:", error);
//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };



// Backend/src/Controllers/setting.controller.js
import Setting from "../models/Setting.js";

// ============================================
// UI DESIGN SYSTEMS CONFIG
// ============================================
const UI_STYLES_CONFIG = [
  'material',
  'glass',
  'neumorph',
  'flat',
  'corporate',
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

    // ✅ If value is null or undefined, set default based on key
    let finalValue = value;
    
    if (value === undefined || value === null) {
      // Set default values for specific keys
      if (key === "theme") {
        finalValue = "vscode-dark";
      } else if (key === "uiStyle") {
        finalValue = "material";
      } else {
        finalValue = "";
      }
    }

    let setting = await Setting.findOne({ key });

    if (setting) {
      setting.value = finalValue;
      if (description !== undefined) setting.description = description;
      setting.updatedAt = new Date();
      await setting.save();
    } else {
      setting = await Setting.create({
        key,
        value: finalValue,
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

    // ✅ If theme is null, undefined, or empty, use default
    const validThemes = [
      'win-light', 'win-dark', 'vscode-dark', 'github-dark',
      'dracula', 'nord', 'one-dark', 'monokai',
      'solarized-dark', 'solarized-light',
    ];

    let finalTheme = theme || "vscode-dark";

    // ✅ If theme is not valid, set to default
    if (!validThemes.includes(finalTheme)) {
      finalTheme = "vscode-dark";
    }

    let setting = await Setting.findOne({ key: 'theme' });

    if (setting) {
      setting.value = finalTheme;
      setting.updatedAt = new Date();
      await setting.save();
    } else {
      setting = await Setting.create({
        key: 'theme',
        value: finalTheme,
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
    const validStyles = ["material", "glass", "neumorph", "flat", "corporate"];

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
// ✅ HELPER FUNCTIONS
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
// ✅ ATTENDANCE DEADLINE FUNCTIONS
// ============================================

export const getAttendanceDeadline = async () => {
  return await getSettingValue("attendanceDeadline", "17:00");
};

export const getAttendanceEditWindow = async () => {
  return await getSettingValue("attendanceEditWindow", 15);
};

export const isAttendanceAllowed = async () => {
  try {
    const deadline = await getAttendanceDeadline();
    const [hours, minutes] = deadline.split(':').map(Number);
    
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    
    const currentTotalMinutes = currentHour * 60 + currentMinutes;
    const deadlineTotalMinutes = hours * 60 + minutes;
    
    return currentTotalMinutes < deadlineTotalMinutes;
  } catch (error) {
    console.error("Check attendance allowed error:", error);
    return true;
  }
};

export const getRemainingAttendanceTime = async () => {
  try {
    const deadline = await getAttendanceDeadline();
    const [hours, minutes] = deadline.split(':').map(Number);
    
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    
    const currentTotalMinutes = currentHour * 60 + currentMinutes;
    const deadlineTotalMinutes = hours * 60 + minutes;
    
    const remainingMinutes = Math.max(0, deadlineTotalMinutes - currentTotalMinutes);
    const remainingHours = Math.floor(remainingMinutes / 60);
    const remainingMins = remainingMinutes % 60;
    
    return {
      remainingMinutes,
      remainingHours,
      remainingMins,
      deadline: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`,
      isPastDeadline: remainingMinutes <= 0,
    };
  } catch (error) {
    console.error("Get remaining time error:", error);
    return { 
      remainingMinutes: 0, 
      remainingHours: 0, 
      remainingMins: 0, 
      deadline: "17:00", 
      isPastDeadline: true 
    };
  }
};

// ============================================
// ✅ EXPORTED SETTINGS GETTERS
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
// ✅ GET SETTINGS STATUS
// ============================================
export const getSettingsStatus = async (req, res) => {
  try {
    const status = {
      autoMarkAbsent: await getSettingValue('autoMarkAbsent', false),
      attendanceTimeWindow: await getSettingValue('attendanceTimeWindow', 15),
      sessionTimeout: await getSettingValue('sessionTimeout', 60),
      maxLoginAttempts: await getSettingValue('maxLoginAttempts', 5),
      attendanceDeadline: await getAttendanceDeadline(),
      attendanceEditWindow: await getAttendanceEditWindow(),
    };
    
    res.status(200).json({
      success: true,
      data: status,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================
// ✅ INITIALIZE DEFAULT SETTINGS
// ============================================

export const initializeSettings = async () => {
  try {
    console.log("🔄 Initializing default settings...");
    console.log("📡 Checking database connection...");

    // ✅ Check if Setting model exists
    const count = await Setting.countDocuments();
    console.log(`📊 Existing settings count: ${count}`);

    const defaultSettings = [
      // Task Settings
      { key: "employeeTheme", value: "dark", description: "Employee theme preference" },
      { key: "employeeEmailNotifications", value: true, description: "Enable email notifications" },
      { key: "employeeTaskAlerts", value: true, description: "Enable task assignment alerts" },
      { key: "employeeDisplayName", value: "", description: "Employee display name" },
      { key: "employeeLanguage", value: "en", description: "Employee language preference" },
      { key: "employeeSessionTimeout", value: 30, description: "Employee session timeout" },
      { key: "maxEmployeesPerTask", value: 5, description: "Maximum employees per task" },
      { key: "maxTasksPerProject", value: 100, description: "Maximum tasks per project" },
      { key: "defaultProjectStatus", value: "Pending", description: "Default project status" },
      { key: "allowMultipleAssignees", value: true, description: "Allow multiple assignees" },
      
      // Attendance Settings
      { key: "attendanceTimeWindow", value: 15, description: "Minutes allowed before/after scheduled time" },
      { key: "autoMarkAbsent", value: false, description: "Auto mark absent" },
      { key: "allowGeoLocation", value: true, description: "Allow location tracking" },
      { key: "attendanceDeadline", value: "17:00", description: "Attendance deadline" },
      { key: "attendanceEditWindow", value: 15, description: "Minutes to edit attendance" },
      
      // Security Settings
      { key: "twoFactorAuth", value: false, description: "Enable 2FA" },
      { key: "sessionTimeout", value: 60, description: "Session timeout in minutes" },
      { key: "maxLoginAttempts", value: 5, description: "Max login attempts" },
      
      // Appearance Settings
      { key: "theme", value: "vscode-dark", description: "Website theme" },
      { key: "uiStyle", value: "material", description: "UI Design System" },
      { key: "compactMode", value: false, description: "Compact mode" },
    ];

    let createdCount = 0;
    let existingCount = 0;

    // ✅ Use try-catch for each setting
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
        // Continue with next setting instead of stopping
      }
    }

    console.log(`📊 Settings initialized: ${createdCount} created, ${existingCount} existing`);
    return { createdCount, existingCount };

  } catch (error) {
    console.error("❌ Initialize Settings Error:", error.message);
    console.error("❌ Error Stack:", error.stack);
    // ✅ Don't throw error, just return partial success
    return { createdCount: 0, existingCount: 0, error: error.message };
  }
};
// ============================================
// ✅ GET SETTINGS GROUPED BY CATEGORY
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
    const attendanceKeys = ["attendanceTimeWindow", "autoMarkAbsent", "allowGeoLocation", "attendanceDeadline", "attendanceEditWindow"];
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