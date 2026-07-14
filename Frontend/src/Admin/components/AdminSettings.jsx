import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../service/api.js";
import {
  Save,
  Settings as SettingsIcon,
  Loader2,
  ArrowLeft,
  Briefcase,
  Clock,
  AlertCircle,
  Shield,
  Bell,
  Globe,
  Moon,
  Sun,
  CheckCircle,
  XCircle,
  Palette,
  Layout,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";

const AdminSettings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingKey, setSavingKey] = useState(null);
  const [settings, setSettings] = useState({});

  // Theme name mapping
  const themeNames = {
    "vscode-dark": "VS Code Dark",
    "win-dark": "Windows Dark",
    "win-light": "Windows Light",
    "github-dark": "GitHub Dark",
    "dracula": "Dracula",
    "nord": "Nord",
    "one-dark": "One Dark Pro",
    "monokai": "Monokai Pro",
    "solarized-dark": "Solarized Dark",
    "solarized-light": "Solarized Light",
    "dark": "Dark",
    "light": "Light",
  };

  // UI Style names mapping
  const uiStyleNames = {
    "material": "Material Elevated",
    "glass": "Glass Studio",
    "neumorph": "Soft Neumorph",
    "flat": "Flat Minimal",
    "corporate": "Corporate Sharp",
  };

  // ================= FETCH ALL SETTINGS =================
  const fetchAllSettings = async () => {
    setLoading(true);
    try {
      const res = await api.get("/settings");

      if (res.data && Array.isArray(res.data)) {
        const settingsMap = {};
        res.data.forEach(setting => {
          let value = setting.value;
          if (value === "true") value = true;
          if (value === "false") value = false;
          if (!isNaN(value) && typeof value !== 'boolean' && value !== null) {
            value = Number(value);
          }
          settingsMap[setting.key] = value;
        });
        setSettings(settingsMap);
      }
    } catch (error) {
      console.error("Fetch Settings Error:", error);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllSettings();
  }, []);

  // ================= UPDATE SINGLE SETTING =================
  const updateSetting = async (key, value) => {
    setSavingKey(key);
    try {
      await api.put(`/settings/${key}`, { value });
      setSettings(prev => ({ ...prev, [key]: value }));
      toast.success(`${formatKey(key)} updated successfully!`);
    } catch (error) {
      console.error(`Update ${key} Error:`, error);
      toast.error(`Failed to update ${formatKey(key)}`);
    } finally {
      setSavingKey(null);
    }
  };

  // ================= SAVE ALL SETTINGS =================
  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const promises = Object.entries(settings).map(([key, value]) =>
        api.put(`/settings/${key}`, { value })
      );
      await Promise.all(promises);
      toast.success("All settings saved successfully!");
    } catch (error) {
      console.error("Save All Settings Error:", error);
      toast.error("Failed to save some settings");
    } finally {
      setSaving(false);
    }
  };

  // ================= HANDLE SETTING CHANGE =================
  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  // ================= FORMAT KEY NAME =================
  const formatKey = (key) => {
    return key.replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .replace(/([a-z])([A-Z])/g, '$1 $2');
  };

  // ================= GET DISPLAY NAME =================
  const getDisplayName = (key, value) => {
    if (key === "theme") {
      return themeNames[value] || value || "Dark";
    }
    if (key === "uiStyle") {
      return uiStyleNames[value] || value || "Material Elevated";
    }
    return value;
  };

  // ================= RENDER SETTING INPUT =================
  const renderSettingInput = (key, value) => {
    const isBoolean = typeof value === 'boolean';
    const isNumber = typeof value === 'number';

    if (isBoolean) {
      return (
        <button
          onClick={() => handleChange(key, !value)}
          className={`relative w-11 h-6 rounded-full transition-all duration-300 flex-shrink-0 ${value ? "bg-[var(--accent-primary)]" : "bg-[var(--bg-input)]"
            }`}
        >
          <div
            className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-lg transition-all duration-300 ${value ? "right-0.5" : "left-0.5"
              }`}
          />
        </button>
      );
    }

    if (isNumber) {
      return (
        <input
          type="number"
          min="0"
          max="100"
          value={value || 0}
          onChange={(e) => handleChange(key, Number(e.target.value))}
          className="w-20 bg-[var(--bg-secondary)] border border-[var(--border-color)] focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] text-[var(--text-primary)] rounded-lg px-3 py-2 text-sm outline-none transition-colors"
        />
      );
    }

    if (key === "defaultProjectStatus") {
      return (
        <select
          value={value || "Pending"}
          onChange={(e) => handleChange(key, e.target.value)}
          className="bg-[var(--bg-secondary)] border border-[var(--border-color)] focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] text-[var(--text-primary)] rounded-lg px-3 py-2 text-sm outline-none transition-colors"
        >
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
      );
    }

    if (key === "theme") {
      return (
        <select
          value={value || "dark"}
          onChange={(e) => handleChange(key, e.target.value)}
          className="bg-[var(--bg-secondary)] border border-[var(--border-color)] focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] text-[var(--text-primary)] rounded-lg px-3 py-2 text-sm outline-none transition-colors min-w-[160px]"
        >
          <option value="vscode-dark">VS Code Dark</option>
          <option value="win-dark">Windows Dark</option>
          <option value="win-light">Windows Light</option>
          <option value="github-dark">GitHub Dark</option>
          <option value="dracula">Dracula</option>
          <option value="nord">Nord</option>
          <option value="one-dark">One Dark Pro</option>
          <option value="monokai">Monokai Pro</option>
          <option value="solarized-dark">Solarized Dark</option>
          <option value="solarized-light">Solarized Light</option>
        </select>
      );
    }

    if (key === "uiStyle") {
      return (
        <select
          value={value || "material"}
          onChange={(e) => handleChange(key, e.target.value)}
          className="bg-[var(--bg-secondary)] border border-[var(--border-color)] focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] text-[var(--text-primary)] rounded-lg px-3 py-2 text-sm outline-none transition-colors min-w-[160px]"
        >
          <option value="material">Material Elevated</option>
          <option value="glass">Glass Studio</option>
          <option value="neumorph">Soft Neumorph</option>
          <option value="flat">Flat Minimal</option>
          <option value="corporate">Corporate Sharp</option>
        </select>
      );
    }

    return (
      <input
        type="text"
        value={value || ""}
        onChange={(e) => handleChange(key, e.target.value)}
        className="bg-[var(--bg-secondary)] border border-[var(--border-color)] focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] text-[var(--text-primary)] rounded-lg px-3 py-2 text-sm outline-none transition-colors"
      />
    );
  };

  // ================= GET VALUE DISPLAY =================
  const getValueDisplay = (key, value) => {
    if (typeof value === 'boolean') {
      return value ? (
        <span className="flex items-center gap-1 text-[var(--success)] text-xs font-medium">
          <CheckCircle className="w-3 h-3" /> Enabled
        </span>
      ) : (
        <span className="flex items-center gap-1 text-[var(--danger)] text-xs font-medium">
          <XCircle className="w-3 h-3" /> Disabled
        </span>
      );
    }
    return getDisplayName(key, value);
  };

  // ================= RENDER SETTING ROW =================
  const SettingRow = ({ label, description, settingKey }) => {
    const value = settings[settingKey];

    if (value === undefined) {
      return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 border-b border-[var(--border-color)]/50 last:border-0">
          <div className="flex-1">
            <label className="text-sm font-medium text-[var(--text-primary)]">{label}</label>
            <p className="text-xs text-[var(--text-muted)]">{description}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-20 h-8 bg-[var(--bg-input)]/50 rounded-lg animate-pulse"></div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 border-b border-[var(--border-color)]/50 last:border-0 hover:bg-[var(--bg-hover)] px-3 rounded-lg transition-colors">
        <div className="flex-1">
          <label className="text-sm font-medium text-[var(--text-primary)]">{label}</label>
          <p className="text-xs text-[var(--text-muted)]">{description}</p>
          <div className="mt-1">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--bg-input)]/80 border border-[var(--border-color)] text-xs text-[var(--text-secondary)]">
              Current: {getValueDisplay(settingKey, value)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {renderSettingInput(settingKey, value)}
          <button
            onClick={() => updateSetting(settingKey, settings[settingKey])}
            disabled={savingKey === settingKey}
            className={`p-2 rounded-lg transition ${savingKey === settingKey
              ? "text-[var(--accent-primary)]"
              : "text-[var(--text-muted)] hover:text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/10"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            title="Save this setting"
          >
            {savingKey === settingKey ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    );
  };

  // ================= LOADING STATE =================
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-8 h-8 text-[var(--accent-primary)] animate-spin" />
        <p className="text-sm text-[var(--text-secondary)]">Loading settings...</p>
      </div>
    );
  }

  // Check if theme and uiStyle settings exist
  const hasThemeSetting = settings.theme !== undefined;
  const hasUiStyleSetting = settings.uiStyle !== undefined;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] overflow-hidden">
        {/* HEADER */}
        <div className="px-6 py-5 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/admin/dashboard")}
                className="p-2 hover:bg-[var(--bg-hover)] rounded-lg transition text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-transparent hover:border-[var(--border-color)]"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-10 h-10 rounded-xl bg-[var(--accent-primary)]/10 flex items-center justify-center border border-[var(--accent-primary)]/20">
                <SettingsIcon className="w-5 h-5 text-[var(--accent-primary)]" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">System Settings</h2>
                <p className="text-xs text-[var(--text-muted)]">Configure application settings</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveAll}
                disabled={saving}
                className="inline-flex items-center gap-2 bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-[var(--text-inverse)] px-4 py-2 rounded-lg text-sm font-medium transition shadow-lg shadow-[var(--accent-primary)]/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save All Settings
              </button>
            </div>
          </div>
        </div>

        {/* SETTINGS SECTIONS */}
        <div className="p-6 space-y-6">

          {/* ==================== TASK SETTINGS ==================== */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg overflow-hidden">
            <div className="px-5 py-3 bg-[var(--bg-secondary)] border-b border-[var(--border-color)] flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[var(--accent-primary)]" />
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Task Settings</h3>
              <span className="ml-auto text-xs text-[var(--text-muted)]">4 settings</span>
            </div>
            <div className="p-4 space-y-1">
              <SettingRow
                label="Max Employees Per Task"
                description="Maximum employees that can be assigned to one task"
                settingKey="maxEmployeesPerTask"
              />
              <SettingRow
                label="Max Tasks Per Project"
                description="Maximum tasks allowed in a single project"
                settingKey="maxTasksPerProject"
              />
              <SettingRow
                label="Default Project Status"
                description="Default status for newly created projects"
                settingKey="defaultProjectStatus"
              />
              <SettingRow
                label="Allow Multiple Assignees"
                description="Allow assigning multiple employees to a single task"
                settingKey="allowMultipleAssignees"
              />
            </div>
          </div>

          {/* ==================== ATTENDANCE SETTINGS ==================== */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg overflow-hidden">
            <div className="px-5 py-3 bg-[var(--bg-secondary)] border-b border-[var(--border-color)] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[var(--success)]" />
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Attendance Settings</h3>
              <span className="ml-auto text-xs text-[var(--text-muted)]">3 settings</span>
            </div>
            <div className="p-4 space-y-1">
              <SettingRow
                label="Attendance Time Window"
                description="Minutes allowed before/after scheduled time"
                settingKey="attendanceTimeWindow"
              />
              <SettingRow
                label="Auto Mark Absent"
                description="Automatically mark absent if no attendance"
                settingKey="autoMarkAbsent"
              />
              <SettingRow
                label="Allow Geo Location"
                description="Enable location-based attendance marking"
                settingKey="allowGeoLocation"
              />
            </div>
          </div>

          {/* ==================== SECURITY SETTINGS ==================== */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg overflow-hidden">
            <div className="px-5 py-3 bg-[var(--bg-secondary)] border-b border-[var(--border-color)] flex items-center gap-2">
              <Shield className="w-4 h-4 text-[var(--danger)]" />
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Security Settings</h3>
              <span className="ml-auto text-xs text-[var(--text-muted)]">3 settings</span>
            </div>
            <div className="p-4 space-y-1">
              <SettingRow
                label="Two Factor Authentication"
                description="Enable 2FA for admin accounts"
                settingKey="twoFactorAuth"
              />
              <SettingRow
                label="Session Timeout"
                description="Minutes of inactivity before auto logout"
                settingKey="sessionTimeout"
              />
              <SettingRow
                label="Max Login Attempts"
                description="Failed login attempts before lockout"
                settingKey="maxLoginAttempts"
              />
            </div>
          </div>

          {/* ==================== APPEARANCE SETTINGS ==================== */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg overflow-hidden">
            <div className="px-5 py-3 bg-[var(--bg-secondary)] border-b border-[var(--border-color)] flex items-center gap-2">
              <Palette className="w-4 h-4 text-[var(--accent-primary)]" />
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Appearance Settings</h3>
              <span className="ml-auto text-xs text-[var(--text-muted)]">
                {hasThemeSetting && hasUiStyleSetting ? '2 settings' : hasThemeSetting || hasUiStyleSetting ? '1 setting' : '0 settings'}
              </span>
            </div>

            {/* Quick Access Buttons - Top of Appearance Section */}
            <div className="px-5 pt-4 pb-2 flex justify-center gap-3 items-center">
              <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                Quick Access:
              </span>
              <button
                onClick={() => navigate("/admin/theme-settings")}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--accent-primary)]/10 hover:bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] rounded-lg text-sm font-medium transition border border-[var(--accent-primary)]/20 hover:border-[var(--accent-primary)]/40 group"
              >
                <Palette className="w-4 h-4" />
                <span>Theme Settings</span>
                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>

              <button
                onClick={() => navigate("/admin/ui-settings")}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--info)]/10 hover:bg-[var(--info)]/20 text-[var(--info)] rounded-lg text-sm font-medium transition border border-[var(--info)]/20 hover:border-[var(--info)]/40 group"
              >
                <Layout className="w-4 h-4" />
                <span>UI Settings</span>
                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>

            <div className="p-4 space-y-1 border-t border-[var(--border-color)]">
             
              <SettingRow
                label="Compact Mode"
                description="Reduce spacing for more content"
                settingKey="compactMode"
              />
            </div>
          </div>

          {/* INFO BOX */}
          <div className="bg-[var(--warning)]/5 border border-[var(--warning)]/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-[var(--warning)] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-[var(--warning)] font-medium">Settings Information</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Changes are saved immediately when you click the individual save button.
                  Use <span className="text-[var(--accent-primary)]">"Save All Settings"</span> to save all changes at once.
                  Some settings may require a page refresh to take effect.
                </p>
              </div>
            </div>
          </div>

          {/* QUICK NAVIGATION */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-medium text-[var(--text-muted)]">Quick Navigation:</span>
              <button
                onClick={() => navigate("/admin/dashboard")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--bg-hover)] hover:bg-[var(--bg-input)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg text-xs font-medium transition border border-[var(--border-color)] hover:border-[var(--text-muted)]"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Dashboard
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminSettings;