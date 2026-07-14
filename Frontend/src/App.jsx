import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import './index.css';

// ============================================
// ✅ REGULAR IMPORTS - Context Providers (Must be synchronous)
// ============================================
import { ThemeProvider } from "./Context/ThemeContext.jsx";
import { UIStyleProvider } from "./Context/Uistylecontext.jsx";

// ============================================
// ✅ LAZY LOADING - Only for route components
// ============================================

// Public Pages
const Signup = lazy(() => import("./Pages/Signup"));
const Login = lazy(() => import("./Pages/Login"));

// Employee Pages
const Layouts = lazy(() => import("./components/employeesidebar/Layouts"));
const Desboards = lazy(() => import("./Pages/Desboards"));
const TaskManager = lazy(() => import("./Pages/TaskManager"));
const ProjectManagment = lazy(() => import("./Pages/ProjectManagment"));
const Attendace = lazy(() => import("./Pages/Attenddance"));
const EmployeeProfile = lazy(() => import("./Pages/EmployeeProfile"));
const RankingEmployee = lazy(() => import("./Pages/RankingEmployee"));

// Admin Components
const Layout = lazy(() => import("./Admin/components/Layout"));
const Desboard = lazy(() => import("./Admin/pages/Desboard"));
const Users = lazy(() => import("./Admin/pages/Users"));
const Profile = lazy(() => import("./Admin/pages/Profile"));
const Project = lazy(() => import("./Admin/pages/Project"));
const AdminAttendance = lazy(() => import("./Admin/pages/AdminAttenddance"));
const EmployeesRanking = lazy(() => import("./Admin/pages/EmployeesRanking"));
const ProjectDetail = lazy(() => import("./Admin/pages/ProjectDetails.jsx"));
const UserDetail = lazy(() => import("./Admin/pages/UserDetails.jsx"));
const DeadlineRanking = lazy(() => import("./Admin/pages/DeadlineRanking.jsx"));
const History = lazy(() => import("./Admin/pages/History.jsx"));
const AttenddanceHistory = lazy(() => import("./Admin/pages/AttenddanceHistory.jsx"));

// Settings
const UIStyleSettings = lazy(() => import("./Admin/components/Uistylesettings.jsx"));
const AdminSettings = lazy(() => import("./Admin/components/AdminSettings.jsx"));
const ThemeSettings = lazy(() => import("./Admin/components/ThemeSettings.jsx"));

// Route Guards
const PrivateRoutes = lazy(() => import("./Admin/components/PrivateRoutes"));
const EmployeeRoutes = lazy(() => import("./Admin/components/EmployeeRoutes"));

// ============================================
// ✅ PAGE LOADER COMPONENT
// ============================================
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-[var(--bg-primary)]">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-[var(--border-color)] border-t-[var(--accent-primary)] rounded-full animate-spin"></div>
      <p className="text-sm text-[var(--text-secondary)]">Loading...</p>
    </div>
  </div>
);

// ============================================
// MAIN APP COMPONENT
// ============================================
const App = () => {
  return (
    // ✅ Context Providers - No Suspense needed around them
    <ThemeProvider>
      <UIStyleProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
              },
            }}
          />

          {/* ✅ Only route components are lazy loaded */}
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* ===== PUBLIC ROUTES ===== */}
              <Route element={<EmployeeRoutes />}>
                <Route path="/" element={<Signup />} />
                <Route path="/login" element={<Login />} />
              </Route>

              {/* ===== EMPLOYEE ROUTES ===== */}
              <Route path="/layout" element={<Layouts />}>
                <Route path="desboards" element={<Desboards />} />
                <Route path="taskmanager" element={<TaskManager />} />
                <Route path="projectmanagment" element={<ProjectManagment />} />
                <Route path="attendace" element={<Attendace />} />
                <Route path="profile" element={<EmployeeProfile />} />
                <Route path="ranking-employees" element={<RankingEmployee />} />
              </Route>

              {/* ===== ADMIN ROUTES ===== */}
              <Route element={<PrivateRoutes />}>
                <Route path="/admin" element={<Layout />}>
                  <Route path="dashboard" element={<Desboard />} />
                  <Route path="users" element={<Users />} />
                  <Route path="users/:userId" element={<UserDetail />} />
                  <Route path="project" element={<Project />} />
                  <Route path="project/:projectId" element={<ProjectDetail />} />
                  <Route path="attendance" element={<AdminAttendance />} />
                  <Route path="attendance-history" element={<AttenddanceHistory />} />
                  <Route path="employees-ranking" element={<EmployeesRanking />} />
                  <Route path="deadline-ranking" element={<DeadlineRanking />} />
                  <Route path="history" element={<History />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="theme-settings" element={<ThemeSettings />} />
                  <Route path="ui-settings" element={<UIStyleSettings />} />
                  <Route path="admin-setting" element={<AdminSettings />} />
                </Route>
              </Route>

              <Route path="/theme-settings" element={<ThemeSettings />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </UIStyleProvider>
    </ThemeProvider>
  );
};

export default App;