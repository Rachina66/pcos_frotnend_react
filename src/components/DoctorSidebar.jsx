import { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  Users,
  LogOut,
  Bell,
  CheckCheck,
  X,
} from "lucide-react";
import { getDoctorAppointments } from "../api/doctorApi";
import useAuthStore from "../stores/authStore";
import useNotificationStore from "../stores/notificationStore";
import toast from "react-hot-toast";

const navItems = [
  { to: "/doctor", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/doctor/appointments", icon: Calendar, label: "Appointments" },
  { to: "/doctor/patients", icon: Users, label: "Patients" },
];

function iconBg(type) {
  const map = {
    APPOINTMENT_NEW: "bg-purple-100",
    APPOINTMENT_CANCELLED: "bg-pink-100",
    APPOINTMENT_CONFIRMED: "bg-fuchsia-100",
    APPOINTMENT_COMPLETED: "bg-violet-100",
    USER_REGISTERED: "bg-purple-100",
    PREDICTION_NEW: "bg-pink-100",
  };
  return map[type] ?? "bg-gray-100";
}

function iconFor(type) {
  const map = {
    APPOINTMENT_NEW: <Calendar size={16} className="text-purple-600" />,
    APPOINTMENT_CANCELLED: <X size={16} className="text-pink-500" />,
    APPOINTMENT_CONFIRMED: <Calendar size={16} className="text-fuchsia-600" />,
    APPOINTMENT_COMPLETED: <Calendar size={16} className="text-violet-600" />,
    USER_REGISTERED: <Users size={16} className="text-purple-500" />,
    PREDICTION_NEW: <Calendar size={16} className="text-pink-500" />,
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
    APPOINTMENT_NEW: "text-purple-400",
    APPOINTMENT_CANCELLED: "text-pink-400",
    APPOINTMENT_CONFIRMED: "text-fuchsia-400",
    APPOINTMENT_COMPLETED: "text-violet-400",
    USER_REGISTERED: "text-purple-400",
    PREDICTION_NEW: "text-pink-400",
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

export default function DoctorSidebar() {
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();

  const notifications = useNotificationStore((s) => s.notifications);
  const markAsRead = useNotificationStore((s) => s.markAsRead);
  const markAllAsRead = useNotificationStore((s) => s.markAllAsRead);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const [showNotifs, setShowNotifs] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const panelRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    getDoctorAppointments({ status: "PENDING" })
      .then((res) => setPendingCount(res.data?.data?.length ?? 0))
      .catch(() => {});
  }, [notifications]);

  const handleLogout = () => {
    logout();
    toast.success("Logged out");
    navigate("/login");
  };

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-pink-100 flex flex-col relative">
      {/* Brand */}
      <div className="px-6 py-5 border-b border-pink-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">D</span>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-800 tracking-tight">PCOS Care</p>
            <p className="text-xs text-purple-400 font-medium">Doctor Panel</p>
          </div>
        </div>
      </div>

      {/* Doctor Info + Bell */}
      <div className="px-6 py-4 border-b border-pink-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center">
            <span className="text-pink-600 text-xs font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-800 truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
          <button
            onClick={() => setShowNotifs((v) => !v)}
            className="relative p-1.5 rounded-md hover:bg-purple-50 transition-colors"
          >
            <Bell size={17} className="text-gray-400" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
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
          className="absolute left-64 w-80 bg-white rounded-lg shadow-2xl border border-pink-100 z-50 overflow-hidden"
          style={{ top: "80px" }}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-pink-50">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-800 text-sm">Notifications</span>
              {unreadCount > 0 && (
                <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllAsRead()}
                  className="text-xs text-purple-500 hover:text-purple-700 flex items-center gap-1"
                >
                  <CheckCheck size={13} />
                  Mark all read
                </button>
              )}
              <button onClick={() => setShowNotifs(false)}>
                <X size={15} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto divide-y divide-gray-50">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center mb-3">
                  <Bell size={20} className="text-gray-300" />
                </div>
                <p className="text-sm font-medium text-gray-400">No notifications yet</p>
                <p className="text-xs text-gray-300 mt-1">You're all caught up!</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => markAsRead(n.id)}
                  className={`flex items-start gap-3 px-4 py-3 hover:bg-pink-50/40 transition-colors cursor-pointer ${
                    !n.read ? "bg-purple-50/40" : ""
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg(n.type)}`}>
                    {iconFor(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <p className={`text-sm text-gray-800 ${!n.read ? "font-semibold" : "font-medium"}`}>
                        {n.title}
                      </p>
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full bg-purple-500 flex-shrink-0 mt-1" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.body}</p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="text-[11px] text-gray-400">{timeAgo(n.createdAt)}</span>
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
          const count = to === "/doctor/appointments" ? pendingCount : 0;
          return (
            <NavLink
              key={to}
              to={to}
              end={to === "/doctor"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-purple-100 text-purple-700"
                    : "text-gray-500 hover:bg-pink-50 hover:text-pink-600"
                }`
              }
            >
              <Icon size={17} />
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
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-pink-50 hover:text-pink-600 transition-colors w-full"
        >
          <LogOut size={17} />
          Logout
        </button>
      </div>
    </aside>
  );
}