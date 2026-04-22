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

const StatCard = ({ icon: Icon, label, value, color, iconColor }) => (
  <div className="bg-white rounded-lg p-5 border border-pink-100 flex items-center gap-4 shadow-sm">
    <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${color}`}>
      <Icon size={20} className={iconColor} />
    </div>
    <div>
      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold text-gray-800 mt-0.5">{value ?? "—"}</p>
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const styles = {
    PENDING:   "bg-pink-100 text-pink-700 border border-pink-200",
    CONFIRMED: "bg-purple-100 text-purple-700 border border-purple-200",
    COMPLETED: "bg-fuchsia-100 text-fuchsia-700 border border-fuchsia-200",
    CANCELLED: "bg-gray-100 text-gray-500 border border-gray-200",
  };
  return (
    <span className={`px-2.5 py-0.5 rounded text-xs font-semibold tracking-wide ${styles[status] ?? "bg-gray-100 text-gray-500"}`}>
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
        <div className="w-8 h-8 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin" />
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
          color="bg-purple-100"
          iconColor="text-purple-600"
        />
        <StatCard
          icon={Clock}
          label="Today's Appointments"
          value={stats?.todayAppointments}
          color="bg-pink-100"
          iconColor="text-pink-600"
        />
        <StatCard
          icon={TrendingUp}
          label="Upcoming"
          value={stats?.upcomingAppointments}
          color="bg-fuchsia-100"
          iconColor="text-fuchsia-600"
        />
        <StatCard
          icon={CheckCircle}
          label="Pending Confirmations"
          value={stats?.pendingAppointments}
          color="bg-violet-100"
          iconColor="text-violet-600"
        />
        <StatCard
          icon={Users}
          label="Total Patients"
          value={stats?.totalPatients}
          color="bg-pink-100"
          iconColor="text-pink-500"
        />
        <StatCard
          icon={DollarSign}
          label="Total Earnings"
          value={`Rs. ${stats?.totalEarnings ?? 0}`}
          color="bg-purple-100"
          iconColor="text-purple-500"
        />
      </div>

      {/* Today's appointments */}
      <div className="bg-white rounded-lg border border-pink-100 p-5 shadow-sm">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
          Today's Appointments
        </h2>
        {todayAppointments.length === 0 ? (
          <p className="text-sm text-gray-400">No appointments today</p>
        ) : (
          <div className="space-y-2">
            {todayAppointments.map((apt) => (
              <div
                key={apt.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                    <span className="text-purple-700 text-xs font-bold">
                      {apt.user?.name?.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{apt.user?.name}</p>
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