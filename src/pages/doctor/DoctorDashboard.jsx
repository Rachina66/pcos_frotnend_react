import { useEffect, useState } from "react";
import {
  Calendar,
  Users,
  Clock,
  CheckCircle,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import { getDoctorStats, getTodayAppointments } from "../../api/doctorApi";
import toast from "react-hot-toast";

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white rounded-2xl p-5 border border-pink-100 flex items-center gap-4">
    <div
      className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}
    >
      <Icon size={22} />
    </div>
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-800">{value ?? "—"}</p>
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const styles = {
    PENDING: "bg-amber-100 text-amber-700",
    CONFIRMED: "bg-green-100 text-green-700",
    COMPLETED: "bg-blue-100 text-blue-700",
    CANCELLED: "bg-red-100 text-red-500",
  };
  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}
    >
      {status}
    </span>
  );
};

export default function DoctorDashboard() {
  const [stats, setStats] = useState(null);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getDoctorStats(), getTodayAppointments()])
      .then(([statsRes, todayRes]) => {
        setStats(statsRes.data.data);
        setTodayAppointments(todayRes.data.data);
      })
      .catch(() => toast.error("Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-purple-300 border-t-purple-600 rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          icon={Calendar}
          label="Total Appointments"
          value={stats?.totalAppointments}
          color="bg-purple-100 text-purple-600"
        />
        <StatCard
          icon={Clock}
          label="Today's Appointments"
          value={stats?.todayAppointments}
          color="bg-pink-100 text-pink-600"
        />
        <StatCard
          icon={TrendingUp}
          label="Upcoming"
          value={stats?.upcomingAppointments}
          color="bg-blue-100 text-blue-600"
        />
        <StatCard
          icon={CheckCircle}
          label="Pending Confirmations"
          value={stats?.pendingAppointments}
          color="bg-amber-100 text-amber-600"
        />
        <StatCard
          icon={Users}
          label="Total Patients"
          value={stats?.totalPatients}
          color="bg-green-100 text-green-600"
        />
        <StatCard
          icon={DollarSign}
          label="Total Earnings"
          value={`Rs. ${stats?.totalEarnings ?? 0}`}
          color="bg-emerald-100 text-emerald-600"
        />
      </div>

      {/* Today's appointments */}
      <div className="bg-white rounded-2xl border border-pink-100 p-5">
        <h2 className="text-base font-semibold text-gray-800 mb-4">
          Today's Appointments
        </h2>
        {todayAppointments.length === 0 ? (
          <p className="text-sm text-gray-400">No appointments today</p>
        ) : (
          <div className="space-y-3">
            {todayAppointments.map((apt) => (
              <div
                key={apt.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center">
                    <span className="text-purple-700 text-xs font-bold">
                      {apt.user?.name?.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {apt.user?.name}
                    </p>
                    <p className="text-xs text-gray-400">{apt.timeSlot}</p>
                  </div>
                </div>
                <StatusBadge status={apt.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
