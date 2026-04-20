import { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  Calendar,
  BookOpen,
  LogOut,
  Bell,
  CheckCheck,
  X,
} from "lucide-react";
import useAuthStore from "../stores/authStore";
import useNotificationStore from "../stores/notificationStore";
import toast from "react-hot-toast";
import axiosClient from "../api/axiosClient";

const navItems = [
  { to: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/admin/doctors", icon: Stethoscope, label: "Doctors" },
  { to: "/admin/users", icon: Users, label: "Users" },
  { to: "/admin/appointments", icon: Calendar, label: "Appointments" },
  { to: "/admin/content", icon: BookOpen, label: "Content" },
];

function iconBg(type) {
  const map = {
    APPOINTMENT_NEW: "bg-pink-100",
    APPOINTMENT_CANCELLED: "bg-red-100",
    APPOINTMENT_CONFIRMED: "bg-green-100",
    APPOINTMENT_COMPLETED: "bg-blue-100",
    USER_REGISTERED: "bg-blue-100",
    PREDICTION_NEW: "bg-purple-100",
  };
  return map[type] ?? "bg-gray-100";
}

function iconFor(type) {
  const map = {
    APPOINTMENT_NEW: <Calendar size={16} className="text-pink-600" />,
    APPOINTMENT_CANCELLED: <X size={16} className="text-red-500" />,
    APPOINTMENT_CONFIRMED: <Calendar size={16} className="text-green-600" />,
    APPOINTMENT_COMPLETED: <Calendar size={16} className="text-blue-600" />,
    USER_REGISTERED: <Users size={16} className="text-blue-500" />,
    PREDICTION_NEW: <Stethoscope size={16} className="text-purple-500" />,
  };
  return map[type] ?? <Bell size={16} className="text-gray-400" />;
}

function categoryLabel(type) {
  const map = {
    APPOINTMENT_NEW: "Appointments",
    APPOINTMENT_CANCELLED: "Appointments",
    APPOINTMENT_CONFIRMED: "Appointments",
    APPOINTMENT_COMPLETED: "Appointments",
    USER_REGISTERED: "Users",
    PREDICTION_NEW: "Predictions",
  };
  return map[type] ?? "General";
}

function categoryColor(type) {
  const map = {
    APPOINTMENT_NEW: "text-pink-400",
    APPOINTMENT_CANCELLED: "text-red-400",
    APPOINTMENT_CONFIRMED: "text-green-400",
    APPOINTMENT_COMPLETED: "text-blue-400",
    USER_REGISTERED: "text-blue-400",
    PREDICTION_NEW: "text-purple-400",
  };
  return map[type] ?? "text-gray-400";
}

function timeAgo(date) {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function Sidebar() {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);

  const notifications = useNotificationStore((s) => s.notifications);
  const markAsRead = useNotificationStore((s) => s.markAsRead);
  const markAllAsRead = useNotificationStore((s) => s.markAllAsRead);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const [showNotifs, setShowNotifs] = useState(false);
  const [pendingAppts, setPendingAppts] = useState(0);
  const [newUsersCount, setNewUsersCount] = useState(0);
  const panelRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Fetch live counts whenever notifications change
  useEffect(() => {
    // Pending appointments count
    axiosClient
      .get("/admin/appointments", { params: { status: "PENDING" } })
      .then((res) => setPendingAppts(res.data?.data?.length ?? 0))
      .catch(() => {});

    // New users — unread USER_REGISTERED notifications
    const unreadUserNotifs = notifications.filter(
      (n) => n.type === "USER_REGISTERED" && !n.read,
    ).length;
    setNewUsersCount(unreadUserNotifs);
  }, [notifications]);

  const handleLogout = () => {
    logout();
    toast.success("Logged out");
    navigate("/login");
  };

  const getBadgeCount = (to) => {
    if (to === "/admin/appointments") return pendingAppts;
    if (to === "/admin/users") return newUsersCount;
    return 0;
  };

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-pink-100 flex flex-col relative">
      {/* Brand + Bell */}
      <div className="px-6 py-6 border-b border-pink-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-pink-200 flex items-center justify-center">
            <span className="text-pink-700 font-bold text-sm">P</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-800">PCOS Care</p>
            <p className="text-xs text-pink-400">Admin Panel</p>
          </div>
          <button
            onClick={() => setShowNotifs((v) => !v)}
            className="relative p-1.5 rounded-lg hover:bg-pink-50 transition-colors"
          >
            <Bell size={18} className="text-gray-500" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Notification Panel */}
      {showNotifs && (
        <div
          ref={panelRef}
          className="absolute left-64 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
          style={{ top: "72px" }}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-800 text-sm">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="bg-pink-100 text-pink-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllAsRead()}
                  className="text-xs text-pink-500 hover:text-pink-700 flex items-center gap-1"
                >
                  <CheckCheck size={13} />
                  Mark all read
                </button>
              )}
              <button onClick={() => setShowNotifs(false)}>
                <X size={16} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto divide-y divide-gray-50">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <Bell size={22} className="text-gray-300" />
                </div>
                <p className="text-sm font-medium text-gray-400">
                  No notifications yet
                </p>
                <p className="text-xs text-gray-300 mt-1">
                  You're all caught up!
                </p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => markAsRead(n.id)}
                  className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer ${
                    !n.read ? "bg-pink-50/40" : ""
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${iconBg(n.type)}`}
                  >
                    {iconFor(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <p
                        className={`text-sm text-gray-800 ${!n.read ? "font-semibold" : "font-medium"}`}
                      >
                        {n.title}
                      </p>
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full bg-pink-500 flex-shrink-0 mt-1" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                      {n.body}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="text-[11px] text-gray-400">
                        {timeAgo(n.createdAt)}
                      </span>
                      <span className="text-[11px] text-gray-300">•</span>
                      <span className={`text-[11px] ${categoryColor(n.type)}`}>
                        {categoryLabel(n.type)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => {
          const count = getBadgeCount(to);
          return (
            <NavLink
              key={to}
              to={to}
              end={to === "/admin"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-pink-100 text-pink-700"
                    : "text-gray-500 hover:bg-pink-50 hover:text-pink-600"
                }`
              }
            >
              <Icon size={18} />
              <span className="flex-1">{label}</span>
              {count > 0 && (
                <span className="bg-pink-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                  {count > 99 ? "99+" : count}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-pink-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors w-full"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}
