import { Outlet, useLocation } from "react-router-dom";
import DoctorSidebar from "./DoctorSidebar";
import Topbar from "./Topbar";

const pageTitles = {
  "/doctor": "Dashboard",
  "/doctor/appointments": "Appointments",
  "/doctor/patients": "Patients",
};

export default function DoctorLayout() {
  const location = useLocation();
  const title = pageTitles[location.pathname] || "Doctor";

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DoctorSidebar />
      <div className="flex-1 flex flex-col">
        <Topbar title={title} />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
