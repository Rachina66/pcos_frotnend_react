import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Calendar, Users, LogOut } from "lucide-react";
import useAuthStore from "../stores/authStore";
import toast from "react-hot-toast";

const navItems = [
  { to: "/doctor", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/doctor/appointments", icon: Calendar, label: "Appointments" },
  { to: "/doctor/patients", icon: Users, label: "Patients" },
];

export default function DoctorSidebar() {
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();

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
          <div className="w-9 h-9 rounded-full bg-purple-200 flex items-center justify-center">
            <span className="text-purple-700 font-bold text-sm">D</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">PCOS Care</p>
            <p className="text-xs text-purple-400">Doctor Panel</p>
          </div>
        </div>
      </div>

      {/* Doctor info */}
      <div className="px-6 py-4 border-b border-pink-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center">
            <span className="text-pink-600 text-xs font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-800">{user?.name}</p>
            <p className="text-xs text-gray-400">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/doctor"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? "bg-purple-100 text-purple-700"
                  : "text-gray-500 hover:bg-purple-50 hover:text-purple-600"
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
