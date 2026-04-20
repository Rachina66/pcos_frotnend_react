import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import DoctorSidebar from "./DoctorSidebar";
import Topbar from "./Topbar";
import socket from "../lib/socket";
import useNotificationStore from "../stores/notificationStore";
import useAuthStore from "../stores/authStore";

const pageTitles = {
  "/doctor": "Dashboard",
  "/doctor/appointments": "Appointments",
  "/doctor/patients": "Patients",
};

export default function DoctorLayout() {
  const location = useLocation();
  const title = pageTitles[location.pathname] || "Doctor";
  const user = useAuthStore((s) => s.user);
  const { increment, addLive, fetchNotifications } = useNotificationStore();
  useEffect(() => {
    if (!user?.id) return;

    fetchNotifications();

    socket.connect();

    socket.on("connect", () => {
      console.log("[Socket] connected:", socket.id);
      socket.emit("join", { type: "doctor", doctorId: user.id });
    });

    socket.on("appointment:new", (data) => {
      console.log("[Socket] appointment:new received:", data);
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
        body: `${data.patientName} cancelled their appointment on ${data.date} at ${data.timeSlot}`,
        data,
        read: false,
        createdAt: new Date().toISOString(),
      });
    });

    return () => {
      socket.off("connect");
      socket.off("appointment:new");
      socket.off("appointment:cancelled_by_user");
      // NO socket.disconnect() here
    };
  }, [user?.id]);
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
