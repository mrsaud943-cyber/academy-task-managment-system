import React, { useState, useEffect, useRef } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import api from "../../service/api.js";
import { 
  LogOut, 
  Menu, 
  X, 
  LayoutDashboard, 
  Users, 
  FolderKanban, 
  UserSquare2, 
  CalendarCheck, 
  User, 
  Briefcase,
  ChevronRight,
  Sparkles,
  Settings,
  Trophy,
  Clock,
  History,
  ChevronDown,
  Shield,
  Edit2,
} from "lucide-react";

const Layout = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const dropdownRef = useRef(null);

  // ================= FETCH ADMIN USER =================
  useEffect(() => {
    const fetchAdminUser = async () => {
      try {
        const userData = localStorage.getItem("user");
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setAdminUser(parsedUser);
        }
      } catch (error) {
        console.error("Error fetching admin user:", error);
      }
    };
    fetchAdminUser();
  }, []);

  // ================= CLOSE DROPDOWN ON OUTSIDE CLICK =================
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      localStorage.removeItem("user");
      localStorage.removeItem("token"); 
      sessionStorage.clear();
      navigate("/login", { replace: true });
    } catch (error) {
      console.log("Logout error:", error);
      localStorage.clear();
      navigate("/login", { replace: true });
    }
  };

  const navItems = [
    { path: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard", description: "Overview" },
    { path: "/admin/users", icon: Users, label: "Users", description: "Manage employees" },
    { path: "/admin/project", icon: FolderKanban, label: "Projects", description: "Track progress" },
    { path: "/admin/attendance", icon: CalendarCheck, label: "Attendance", description: "Track presence" },
    { path: "/admin/admin-setting", icon: Settings, label: "Settings", description: "System settings" },
  ];

  // Profile dropdown items
  const profileItems = [
    { path: "/admin/profile", icon: User, label: "My Profile" },
    { path: "/admin/admin-setting", icon: Settings, label: "Settings" },
    { type: "divider" },
    { action: "logout", icon: LogOut, label: "Sign Out", danger: true },
  ];

  return (
    <div className="flex min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] antialiased relative">

      {/* ================= MOBILE MENU OVERLAY ================= */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* ================= SIDEBAR ================= */}
      <aside className={`
        ui-sidebar flex flex-col fixed h-full z-50
        transition-transform duration-300 ease-in-out
        lg:translate-x-0 w-[260px] bg-[var(--bg-card)] border-r border-[var(--border-color)]
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
      `}>

        {/* BRANDING / LOGO */}
        <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between lg:justify-start gap-3">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="bg-[var(--accent-primary)] p-2 rounded-lg text-[var(--text-inverse)] shadow-lg shadow-[var(--accent-primary)]/20">
                <UserSquare2 size={18} className="relative z-10" />
              </div>
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-[var(--success)] rounded-full border-2 border-[var(--bg-card)] animate-pulse"></div>
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-[var(--text-primary)] leading-none">Admin</h2>
              <p className="text-[8px] text-[var(--accent-primary)] font-medium mt-0.5 tracking-widest uppercase flex items-center gap-1">
                <Sparkles size={8} />
                Management
              </p>
            </div>
          </div>
          
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* SIDEBAR NAVIGATION LINKS */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto custom-scrollbar">
          <div className="px-3 mb-3">
            <p className="text-[9px] font-semibold text-[var(--text-muted)] uppercase tracking-[0.15em]">Main Navigation</p>
            <div className="h-px bg-[var(--border-color)] mt-1.5"></div>
          </div>
          
          <ul className="space-y-0.5">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink 
                  to={item.path} 
                  className={({ isActive }) => `
                    ui-sidebar-item relative flex items-center gap-2.5 px-3 py-2 text-sm font-medium transition-all duration-300 group rounded-lg
                    ${isActive 
                      ? "bg-[var(--accent-primary)]/10 text-[var(--text-primary)] border border-[var(--accent-primary)]/20" 
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                    }
                  `}
                  onClick={() => setIsMobileMenuOpen(false)}
                  onMouseEnter={() => setHoveredItem(item.path)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <div className={`
                    p-1 rounded-lg transition-all duration-300
                    ${({ isActive }) => isActive 
                      ? "bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]" 
                      : "text-[var(--text-muted)] group-hover:text-[var(--accent-primary)] group-hover:bg-[var(--accent-primary)]/10"
                    }
                  `}>
                    <item.icon size={16} className="transition-transform group-hover:scale-110" />
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="leading-tight text-xs">{item.label}</span>
                    <span className="text-[8px] text-[var(--text-muted)] group-hover:text-[var(--text-secondary)] transition-colors truncate">
                      {item.description}
                    </span>
                  </div>
                  {hoveredItem === item.path && (
                    <ChevronRight size={12} className="text-[var(--accent-primary)]" />
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* ================= LOGOUT BUTTON IN SIDEBAR (Mobile Only) ================= */}
        <div className="lg:hidden p-3 border-t border-[var(--border-color)]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-[var(--danger)]/80 hover:text-[var(--danger)] hover:bg-[var(--danger)]/10 transition-all duration-300 group"
          >
            <LogOut size={16} className="transition-transform group-hover:scale-110" />
            <span className="text-xs">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ================= MAIN CONTENT WRAPPER ================= */}
      <div className="flex-1 flex flex-col lg:pl-[260px] min-w-0">

        {/* TOP NAVBAR */}
        <header className="bg-[var(--bg-card)] border-b border-[var(--border-color)] h-16 px-4 sm:px-6 flex justify-between items-center sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-1.5 -ml-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-hover)] rounded-lg lg:hidden transition-all duration-300 hover:scale-105"
            >
              <Menu size={18} />
            </button>
            <div className="hidden sm:flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[var(--accent-primary)]/10 flex items-center justify-center text-[var(--accent-primary)] text-xs font-bold border border-[var(--accent-primary)]/20">
                {adminUser?.name?.charAt(0)?.toUpperCase() || "A"}
              </div>
              <div>
                <h1 className="text-xs font-medium text-[var(--text-primary)]">
                  Welcome back, {adminUser?.name || "Admin"}
                </h1>
                <p className="text-[9px] text-[var(--text-muted)]">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Online status indicator */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-[var(--success)]/10 border border-[var(--success)]/20 rounded-lg">
              <div className="w-1.5 h-1.5 bg-[var(--success)] rounded-full animate-pulse"></div>
              <span className="text-[9px] text-[var(--success)] font-medium">Live</span>
            </div>

            {/* ================= PROFILE DROPDOWN ================= */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center gap-2 px-2.5 py-1.5 hover:bg-[var(--bg-hover)] rounded-lg transition-all duration-200 border border-transparent hover:border-[var(--border-color)] group"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-hover)] flex items-center justify-center text-[var(--text-inverse)] font-bold text-sm shadow-lg shadow-[var(--accent-primary)]/20">
                  {adminUser?.name?.charAt(0)?.toUpperCase() || "A"}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-medium text-[var(--text-primary)] leading-none">
                    {adminUser?.name || "Admin"}
                  </p>
                  <p className="text-[9px] text-[var(--text-muted)] flex items-center gap-1">
                    <Shield size={10} className="text-[var(--accent-primary)]" />
                    {adminUser?.role || "Admin"}
                  </p>
                </div>
                <ChevronDown 
                  size={14} 
                  className={`text-[var(--text-muted)] transition-transform duration-200 ${
                    isProfileDropdownOpen ? "rotate-180" : ""
                  }`} 
                />
              </button>

              {/* Dropdown Menu */}
              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl shadow-2xl shadow-black/20 py-1 z-30 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
                  {/* User Info Header */}
                  <div className="px-4 py-3 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-hover)] flex items-center justify-center text-[var(--text-inverse)] font-bold text-sm shadow-lg shadow-[var(--accent-primary)]/20">
                        {adminUser?.name?.charAt(0)?.toUpperCase() || "A"}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[var(--text-primary)]">
                          {adminUser?.name || "Admin"}
                        </p>
                        <p className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                          <Shield size={12} className="text-[var(--accent-primary)]" />
                          {adminUser?.role || "Admin"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Dropdown Items */}
                  <div className="py-1">
                    {profileItems.map((item, index) => {
                      if (item.type === "divider") {
                        return (
                          <div key={`divider-${index}`} className="h-px bg-[var(--border-color)] my-1" />
                        );
                      }

                      if (item.action === "logout") {
                        return (
                          <button
                            key={item.label}
                            onClick={() => {
                              setIsProfileDropdownOpen(false);
                              handleLogout();
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--danger)] hover:bg-[var(--danger)]/10 transition-colors"
                          >
                            <LogOut size={16} />
                            <span>{item.label}</span>
                          </button>
                        );
                      }

                      return (
                        <NavLink
                          key={item.path}
                          to={item.path}
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className={({ isActive }) => `
                            flex items-center gap-3 px-4 py-2.5 text-sm transition-colors
                            ${isActive 
                              ? "bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]" 
                              : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                            }
                          `}
                        >
                          <item.icon size={16} />
                          <span>{item.label}</span>
                        </NavLink>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* WORKSPACE CONTENT LAYOUT INJECTION */}
        <main className="p-4 sm:p-6 bg-[var(--bg-primary)] flex-grow min-h-[calc(100vh-64px)] overflow-y-auto custom-scrollbar">
          <Outlet />
        </main>

      </div>

      {/* ================= GLOBAL SCROLLBAR STYLES ================= */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: var(--border-color);
          border-radius: 8px;
          transition: background 0.2s ease;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: var(--text-muted);
        }

        .custom-scrollbar::-webkit-scrollbar-corner {
          background: transparent;
        }

        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: var(--border-color) transparent;
        }

        ::-webkit-scrollbar {
          width: 7px;
          height: 7px;
        }

        ::-webkit-scrollbar-track {
          background: var(--bg-primary);
        }

        ::-webkit-scrollbar-thumb {
          background: var(--border-color);
          border-radius: 10px;
          border: 2px solid var(--bg-primary);
          transition: background 0.3s ease;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: var(--text-muted);
        }

        ::-webkit-scrollbar-corner {
          background: var(--bg-primary);
        }

        * {
          scrollbar-width: thin;
          scrollbar-color: var(--border-color) var(--bg-primary);
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-in {
          animation: fadeIn 0.2s ease-out;
        }

        .fade-in {
          animation: fadeIn 0.2s ease-out;
        }

        .slide-in-from-top-2 {
          animation: fadeIn 0.2s ease-out;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
};

export default Layout;