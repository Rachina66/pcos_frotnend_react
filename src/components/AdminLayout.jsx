import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import socket from "../lib/socket";
import useNotificationStore from "../stores/notificationStore";

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
  const { increment, addLive, fetchNotifications } = useNotificationStore();

  useEffect(() => {
    // ── Fetch persisted notifications on mount ──
    fetchNotifications();

    socket.connect();
    socket.emit("join", { type: "admin" });

    socket.on("appointment:new", (data) => {
      increment("newAppointments");
      addLive({
        id: Date.now().toString(),
        type: "APPOINTMENT_NEW",
        title: "New Appointment",
        body: `${data.patientName} booked on ${data.date} at ${data.timeSlot}`,
        data,
        read: false,
        createdAt: new Date().toISOString(),
      });
    });

    socket.on("appointment:cancelled_by_user", (data) => {
      increment("cancelledAppointments");
      addLive({
        id: Date.now().toString(),
        type: "APPOINTMENT_CANCELLED",
        title: "Appointment Cancelled",
        body: `A patient cancelled their appointment`,
        data,
        read: false,
        createdAt: new Date().toISOString(),
      });
    });

    socket.on("user:registered", (data) => {
      increment("newUsers");
      addLive({
        id: Date.now().toString(),
        type: "USER_REGISTERED",
        title: "New User Registered",
        body: `${data.name} just joined the platform`,
        data,
        read: false,
        createdAt: new Date().toISOString(),
      });
    });

    socket.on("prediction:new", (data) => {
      increment("newPredictions");
      addLive({
        id: Date.now().toString(),
        type: "PREDICTION_NEW",
        title: "New PCOS Prediction",
        body: `A user submitted a prediction. Risk: ${data.riskLevel}`,
        data,
        read: false,
        createdAt: new Date().toISOString(),
      });
    });

    return () => {
      socket.off("appointment:new");
      socket.off("appointment:cancelled_by_user");
      socket.off("user:registered");
      socket.off("prediction:new");
      socket.disconnect();
    };
  }, []);

  return (
    <div className="flex min-h-screen bg-pink-50/30">
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
