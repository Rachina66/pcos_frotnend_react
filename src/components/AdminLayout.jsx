import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useLocation } from "react-router-dom";

const pageTitles = {
  "/admin": "Dashboard",
  "/admin/doctors": "Doctors",
  "/admin/users": "Users",
  "/admin/appointments": "Appointments",
  "/admin/content": "Educational Content",
};

export default function AdminLayout() {
  const location = useLocation();
  const title = pageTitles[location.pathname] || "Admin";

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar title={title} />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
