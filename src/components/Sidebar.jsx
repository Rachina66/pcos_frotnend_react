import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  Calendar,
  BookOpen,
  LogOut,
} from "lucide-react";
import useAuthStore from "../stores/authStore";
import toast from "react-hot-toast";

const navItems = [
  { to: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/admin/doctors", icon: Stethoscope, label: "Doctors" },
  { to: "/admin/users", icon: Users, label: "Users" },
  { to: "/admin/appointments", icon: Calendar, label: "Appointments" },
  { to: "/admin/content", icon: BookOpen, label: "Content" },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    toast.success("Logged out");
    navigate("/login");
  };

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-pink-100 flex flex-col">
      {/* Brand */}
      <div className="px-6 py-6 border-b border-pink-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-pink-200 flex items-center justify-center">
            <span className="text-pink-700 font-bold text-sm">P</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">PCOS Care</p>
            <p className="text-xs text-pink-400">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
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
            {label}
          </NavLink>
        ))}
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
