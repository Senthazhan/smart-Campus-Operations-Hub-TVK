import React, { useState, useEffect, useRef } from "react";
import CampusLogo from '../../assets/CampusOpslogo.svg';
import { Link, Outlet, useLocation, useNavigate, NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  CalendarCheck, 
  Ticket, 
  Bell, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Search, 
  Command, 
  ChevronRight, 
  Sparkles,
  ShieldCheck,
  ClipboardList,
  Home,
  CheckCheck,
  PanelLeftClose,
  PanelLeftOpen,
  BookOpen
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import ThemeToggle from "../common/ThemeToggle";
import { listNotifications, markNotificationRead, markAllNotificationsRead } from "../../api/notificationsApi";
import { getAvatarUrl } from "../../api/profileApi";
import clsx from "clsx";

const formatRoleLabel = (role) => {
  if (!role) return "User";
  const value = typeof role === "string" ? role : role.name;
  switch (value) {
    case "ADMIN":
      return "Admin";
    case "TECHNICIAN":
      return "Technician";
    case "USER":
      return "User";
    default:
      // Normalize any unexpected roles like OIDC_USER to "User"
      return "User";
  }
};

const adminItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/users", label: "User Governance", icon: Users },
  { to: "/admin/resources", label: "Resource Management", icon: Package },
  { to: "/admin/bookings", label: "Booking Approvals", icon: CalendarCheck },
  { to: "/admin/tickets", label: "Ticket Governance", icon: Ticket },
];

const technicianItems = [
  { to: "/technician/dashboard", label: "Maintenance Queue", icon: ClipboardList },
];

const navItems = [
  { to: "/welcome", label: "Home", icon: Home },
  { to: "/resources", label: "Resource Catalogue", icon: Package },
  { to: "/my-bookings", label: "My Bookings", icon: ClipboardList },
  { to: "/tickets", label: "Support Tickets", icon: Ticket },
];

const NavLinkItem = ({ to, label, icon: Icon, onClick, collapsed }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link
      to={to}
      onClick={onClick}
      className={clsx(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group relative",
        isActive 
          ? "bg-primary text-white shadow-lg shadow-primary/25 font-bold" 
          : "text-[var(--color-text-secondary)] hover:bg-primary/5 hover:text-primary font-medium",
        collapsed && "justify-center px-2"
      )}
      title={collapsed ? label : ""}
    >
      <Icon className={clsx(
        "w-5 h-5 transition-transform duration-300 group-hover:scale-110 shrink-0",
        isActive ? "text-white" : "text-[var(--color-muted)] group-hover:text-primary"
      )} />
      {!collapsed && (
        <span className="text-sm tracking-tight truncate">
          {label}
        </span>
      )}
      
      {isActive && !collapsed && (
        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse shrink-0" />
      )}
      
      {isActive && collapsed && (
        <div className="absolute right-1 top-1/2 -translate-y-1/2 w-1 h-4 rounded-l-full bg-white" />
      )}
    </Link>
  );
};

/** e-Books: own row below Notifications; dashed border + softer fill vs solid nav pills. */
function EBooksSidebarLink({ onClick, collapsed }) {
  const location = useLocation();
  const isActive =
    location.pathname === "/e-books" ||
    location.pathname.startsWith("/e-books/") ||
    location.pathname.startsWith("/admin/e-books");
  return (
    <Link
      to="/e-books"
      onClick={onClick}
      title={collapsed ? "e-Books" : ""}
      className={clsx(
        "flex items-center gap-3 rounded-xl transition-all duration-300 border-2 border-dashed relative w-full px-3 py-2.5",
        isActive
          ? "border-primary/70 bg-gradient-to-br from-primary/12 to-primary/5 text-primary font-black shadow-sm"
          : "border-[var(--color-border)] bg-[var(--color-surface)]/60 text-[var(--color-muted)] hover:border-primary/35 hover:text-primary hover:bg-primary/[0.06] font-semibold",
        collapsed && "justify-center px-2"
      )}
    >
      <BookOpen
        className={clsx(
          "w-5 h-5 shrink-0",
          isActive ? "text-primary" : "text-primary/60"
        )}
      />
      {!collapsed && (
        <span className="text-sm tracking-tight font-black uppercase truncate">
          e-Books
        </span>
      )}
      {isActive && !collapsed && (
        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse shrink-0" />
      )}
      {isActive && collapsed && (
        <span className="absolute right-1 top-1/2 -translate-y-1/2 w-1 h-4 rounded-l-full bg-primary" />
      )}
    </Link>
  );
}

export function AppShell() {
  const { user, logout } = useAuth();
  const { isDarkMode } = useTheme();
  const isAdmin = user?.role?.name === "ADMIN" || user?.role === "ADMIN";
  const isTechnician = user?.role?.name === "TECHNICIAN" || user?.role === "TECHNICIAN";
  const location = useLocation();
  const navigate = useNavigate();
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notiOpen, setNotiOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notiRef = useRef(null);

  const closeMobile = () => setMobileOpen(false);

  // Get current breadcrumb
  const getCurrentPage = () => {
    const path = location.pathname.split("/").filter(Boolean);
    if (path.length === 0) return "Dashboard";
    const last = path[path.length - 1];
    return last.charAt(0).toUpperCase() + last.slice(1).replace(/-/g, " ");
  };

  useEffect(() => {
    let alive = true;
    const fetchNotis = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const d = await listNotifications({ page: 0, size: 5 });
        if (alive) {
          setNotifications(d?.content || []);
          setUnreadCount(d?.content?.filter((x) => !x.read).length || 0);
        }
      } catch (e) {
        if (alive) {
          setNotifications([]);
          setUnreadCount(0);
        }
      }
    };

    if (user && localStorage.getItem("token")) {
      fetchNotis();
      const interval = setInterval(fetchNotis, 30000);
      return () => {
        alive = false;
        clearInterval(interval);
      };
    }
    return () => { alive = false; };
  }, [user, location.pathname]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (notiRef.current && !notiRef.current.contains(event.target)) {
        setNotiOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkRead = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await markNotificationRead(id);
      const updated = notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n,
      );
      setNotifications(updated);
      setUnreadCount(updated.filter((x) => !x.read).length);
    } catch (err) {}
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      const updated = notifications.map((n) => ({ ...n, read: true }));
      setNotifications(updated);
      setUnreadCount(0);
    } catch (err) {}
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const currentNavItems = isAdmin ? adminItems : (isTechnician ? technicianItems : navItems);

  return (
    <div className={clsx(
      "flex h-screen bg-[var(--color-bg)] overflow-hidden font-sans transition-colors duration-300",
      isDarkMode && "dark"
    )}>
      {/* Sidebar - Desktop */}
      <aside className={clsx(
        "hidden lg:flex flex-col bg-[var(--color-sidebar)] border-r border-[var(--color-border)] z-40 shadow-soft transition-all duration-500 ease-in-out relative",
        collapsed ? "w-20" : "w-64"
      )}>
        <div className="p-4 flex items-center justify-between">
          <Link
            to={isAdmin ? "/dashboard" : isTechnician ? "/technician/dashboard" : "/welcome"}
            className="flex items-center gap-2.5 group"
          >
            <img
              src={CampusLogo}
              alt="CampusOps"
              className="w-9 h-9 object-contain shrink-0 transition-transform duration-500 group-hover:scale-110"
            />
            {!collapsed && (
              <div className="animate-in fade-in slide-in-from-left-4 duration-500 leading-none">
                <div className="text-sm font-black text-[var(--color-text)] tracking-tight">Smart Campus</div>
                <div className="text-[9px] font-bold text-primary uppercase tracking-widest mt-0.5">Operations Hub</div>
              </div>
            )}
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-8 custom-scrollbar">
          <div>
            <div className={clsx(
              "px-3 mb-4 text-[10px] font-black text-[var(--color-muted)] uppercase tracking-[0.2em] opacity-80",
              collapsed && "text-center px-0 overflow-hidden"
            )}>
              {collapsed ? "•••" : (isAdmin ? "Console" : isTechnician ? "Technical" : "Platform")}
            </div>
            <div className="space-y-1.5">
              {currentNavItems.map((item) => (
                <NavLinkItem key={item.to} {...item} collapsed={collapsed} />
              ))}
              <NavLinkItem
                to="/notifications"
                label="Notifications"
                icon={Bell}
                collapsed={collapsed}
              />
              <EBooksSidebarLink collapsed={collapsed} />
            </div>
          </div>
        </nav>

        {/* Collapse Toggle */}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-full flex items-center justify-center text-[var(--color-muted)] hover:text-primary hover:border-primary transition-all shadow-sm z-50"
        >
          {collapsed ? <PanelLeftOpen className="w-3.5 h-3.5" /> : <PanelLeftClose className="w-3.5 h-3.5" />}
        </button>

        <div className="p-4 border-t border-[var(--color-border)] mt-auto">
          <div className={clsx(
            "flex items-center gap-3 p-2 bg-[var(--color-surface-soft)] rounded-2xl border border-[var(--color-border)] transition-all",
            collapsed ? "justify-center p-1" : "p-2"
          )}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white text-sm font-black border border-primary/20 shadow-sm shrink-0 overflow-hidden">
              {user?.avatarUrl ? (
                <img src={getAvatarUrl(user.avatarUrl)} alt="" className="w-full h-full object-cover" />
              ) : (
                user?.fullName?.[0]?.toUpperCase() || "U"
              )}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1 animate-in fade-in duration-500">
                <div className="text-xs font-black text-[var(--color-text)] truncate leading-none mb-1">
                  {user?.fullName || "User"}
                </div>
                <div className="text-[10px] font-bold text-[var(--color-muted)] uppercase truncate tracking-tighter">
                  {formatRoleLabel(user?.role)}
                </div>
              </div>
            )}
            {!collapsed && (
              <button
                onClick={handleLogout}
                className="p-2 text-[var(--color-muted)] hover:text-error transition-colors rounded-xl hover:bg-error/10"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-6 bg-[var(--color-navbar)] backdrop-blur-xl border-b border-[var(--color-border)] sticky top-0 z-30 transition-all duration-300">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-soft)] rounded-xl border border-[var(--color-border)]"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <div className="hidden md:flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--color-bg-alt)] rounded-lg text-[var(--color-muted)]">
                <Search className="w-3.5 h-3.5" />
                <span className="text-[10px] font-black uppercase tracking-widest leading-none mt-0.5">Navigation</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-[var(--color-muted)]/30" />
              <div className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-black tracking-tight">
                {getCurrentPage()}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* Dark Mode Toggle */}
            <ThemeToggle />

            {/* Notification Bell */}
            <div className="relative" ref={notiRef}>
              <button
                type="button"
                className={clsx(
                  "relative p-2.5 rounded-xl transition-all duration-300 border",
                  notiOpen 
                    ? "bg-primary/10 text-primary border-primary/20" 
                    : "text-[var(--color-text-secondary)] bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--color-primary-border)] hover:text-primary"
                )}
                onClick={() => setNotiOpen(!notiOpen)}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-lg bg-primary text-[10px] font-black text-white shadow-lg shadow-primary/30 border-2 border-[var(--color-surface)] animate-bounce">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {/* Enhanced Notification Dropdown */}
              {notiOpen && (
                <div className="absolute right-0 mt-4 w-80 sm:w-96 glass-surface rounded-3xl border border-[var(--color-border)] shadow-premium overflow-hidden animate-in fade-in zoom-in-95 duration-300 z-50">
                  <div className="px-6 py-5 border-b border-[var(--color-border)] flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-black text-[var(--color-text)] tracking-tight">Recent Activity</h4>
                      <p className="text-[10px] font-bold text-[var(--color-muted)] uppercase tracking-widest mt-0.5">System Alerts</p>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-[10px] font-black uppercase tracking-wider rounded-lg hover:shadow-lg transition-all"
                      >
                        <CheckCheck className="w-3.5 h-3.5" /> Mark All
                      </button>
                    )}
                  </div>
                  
                  <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                    {notifications.length ? (
                      <div className="divide-y divide-[var(--color-border)]">
                        {notifications.map((n) => (
                          <Link
                            key={n.id}
                            to="/notifications"
                            onClick={() => setNotiOpen(false)}
                            className={clsx(
                              "block px-6 py-5 transition-all duration-300 hover:bg-[var(--color-primary-soft)]",
                              !n.read && "bg-primary/5 border-l-4 border-primary"
                            )}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className={clsx(
                                "text-sm font-bold tracking-tight",
                                n.read ? "text-[var(--color-text-secondary)]" : "text-[var(--color-text)]"
                              )}>
                                {n.title}
                              </div>
                              {!n.read && (
                                <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                              )}
                            </div>
                            <p className="mt-1.5 text-xs text-[var(--color-muted)] font-medium line-clamp-2 leading-relaxed">
                              {n.message}
                            </p>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="py-16 text-center">
                        <div className="w-16 h-16 bg-[var(--color-bg-alt)] rounded-full flex items-center justify-center mx-auto mb-4 opacity-40">
                          <Bell className="w-8 h-8 text-[var(--color-muted)]" />
                        </div>
                        <p className="text-sm font-black text-[var(--color-muted)] uppercase tracking-widest">Workspace Clean</p>
                      </div>
                    )}
                  </div>
                  
                  <Link
                    to="/notifications"
                    onClick={() => setNotiOpen(false)}
                    className="block py-4 text-center text-[10px] font-black text-primary hover:bg-primary/5 transition-colors border-t border-[var(--color-border)] uppercase tracking-[0.2em]"
                  >
                    Enter Notification Center
                  </Link>
                </div>
              )}
            </div>

            <div className="w-px h-6 bg-[var(--color-border)] hidden sm:block"></div>

            <Link
              to="/profile"
              className="flex items-center gap-3 p-1 rounded-2xl hover:bg-[var(--color-primary-soft)] transition-all group border border-transparent hover:border-primary/10"
            >
              <div className="w-10 h-10 rounded-xl bg-[var(--color-surface-soft)] border border-[var(--color-border)] flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-soft group-hover:shadow-lg group-hover:shadow-primary/20 overflow-hidden">
                {user?.avatarUrl ? (
                  <img src={getAvatarUrl(user.avatarUrl)} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-5 h-5" />
                )}
              </div>
              <div className="hidden lg:block text-left pr-2">
                <div className="text-xs font-black text-[var(--color-text)] leading-none mb-1 group-hover:text-primary transition-colors">
                  {user?.fullName?.split(" ")[0] || "Member"}
                </div>
                <div className="text-[9px] text-[var(--color-muted)] font-black uppercase tracking-tighter">
                  View Space
                </div>
              </div>
            </Link>
          </div>
        </header>

        {/* Content Area with background accents */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 custom-scrollbar relative z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="max-w-7xl mx-auto relative z-20">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Sidebar - Redesigned as Premium Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity duration-500"
            onClick={closeMobile}
          />
          <nav className="relative w-72 h-full bg-[var(--color-bg)] border-r border-[var(--color-border)] flex flex-col animate-in slide-in-from-left duration-500 shadow-2xl">
            <div className="p-5 flex items-center justify-between border-b border-[var(--color-border)]">
              <div className="flex items-center gap-2.5">
                <img src={CampusLogo} alt="CampusOps" className="w-9 h-9 object-contain" />
                <div className="leading-none">
                  <div className="text-sm font-black text-[var(--color-text)] tracking-tight">Smart Campus</div>
                  <div className="text-[9px] font-bold text-primary uppercase tracking-widest mt-0.5">Operations Hub</div>
                </div>
              </div>
              <button
                onClick={closeMobile}
                className="p-2 text-[var(--color-muted)] hover:text-[var(--color-text)] rounded-xl bg-[var(--color-surface-soft)] border border-[var(--color-border)] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto px-6 py-8 space-y-10 custom-scrollbar">
              <div>
                <div className="px-3 mb-4 text-[10px] font-black text-[var(--color-muted)] uppercase tracking-[0.2em] opacity-80">
                  {isAdmin ? "Admin Console" : isTechnician ? "Technical Center" : "Member Services"}
                </div>
                <div className="space-y-2">
                  {currentNavItems.map((item) => (
                    <NavLinkItem
                      key={item.to}
                      {...item}
                      onClick={closeMobile}
                    />
                  ))}
                  <NavLinkItem
                    to="/notifications"
                    label="Notifications"
                    icon={Bell}
                    onClick={closeMobile}
                  />
                  <EBooksSidebarLink onClick={closeMobile} collapsed={false} />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-[var(--color-border)] bg-[var(--color-surface-soft)]">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white text-lg font-black shadow-lg shadow-primary/20 overflow-hidden">
                   {user?.avatarUrl ? (
                     <img src={getAvatarUrl(user.avatarUrl)} alt="" className="w-full h-full object-cover" />
                   ) : (
                     user?.fullName?.[0]?.toUpperCase() || "U"
                   )}
                </div>
                <div>
                  <div className="font-black text-[var(--color-text)] leading-none mb-1">{user?.fullName || "User"}</div>
                  <div className="text-[10px] font-bold text-[var(--color-muted)] uppercase tracking-widest">{formatRoleLabel(user?.role)}</div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-error/10 text-error rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-error/20 transition-all active:scale-95"
              >
                <LogOut className="w-5 h-5" />
                Close Session
              </button>
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
