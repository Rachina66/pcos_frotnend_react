import { useEffect, useState } from "react";
import {
  Users,
  Stethoscope,
  Calendar,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Clock,
} from "lucide-react";
import { getStats } from "../../api/adminApi";
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

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStats()
      .then((res) => setStats(res.data.data))
      .catch(() => toast.error("Failed to load stats"))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-pink-300 border-t-pink-600 rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Total Users"
          value={stats?.totalUsers}
          color="bg-pink-100 text-pink-600"
        />
        <StatCard
          icon={Stethoscope}
          label="Active Doctors"
          value={stats?.totalDoctors}
          color="bg-purple-100 text-purple-600"
        />
        <StatCard
          icon={TrendingUp}
          label="Total Predictions"
          value={stats?.totalPredictions}
          color="bg-blue-100 text-blue-600"
        />
        <StatCard
          icon={Calendar}
          label="Total Appointments"
          value={stats?.totalAppointments}
          color="bg-green-100 text-green-600"
        />
      </div>

      {/* Second row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={AlertTriangle}
          label="High Risk Cases"
          value={stats?.highRiskCount}
          color="bg-red-100 text-red-500"
        />
        <StatCard
          icon={CheckCircle}
          label="Low Risk Cases"
          value={stats?.lowRiskCount}
          color="bg-emerald-100 text-emerald-600"
        />
        <StatCard
          icon={Clock}
          label="Pending Appointments"
          value={stats?.pendingAppointments}
          color="bg-amber-100 text-amber-600"
        />
      </div>

      {/* Recent Appointments */}
      <div className="bg-white rounded-2xl border border-pink-100 p-5">
        <h2 className="text-base font-semibold text-gray-800 mb-4">
          Recent Appointments
        </h2>
        {stats?.recentAppointments?.length === 0 ? (
          <p className="text-sm text-gray-400">No appointments yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-pink-50">
                  <th className="pb-3 font-medium">Patient</th>
                  <th className="pb-3 font-medium">Doctor</th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pink-50">
                {stats?.recentAppointments?.map((apt) => (
                  <tr key={apt.id}>
                    <td className="py-3 text-gray-700">{apt.user?.name}</td>
                    <td className="py-3 text-gray-700">{apt.doctor?.name}</td>
                    <td className="py-3 text-gray-500">
                      {new Date(apt.date).toLocaleDateString()}
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          apt.status === "CONFIRMED"
                            ? "bg-green-100 text-green-700"
                            : apt.status === "PENDING"
                              ? "bg-amber-100 text-amber-700"
                              : apt.status === "COMPLETED"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-red-100 text-red-700"
                        }`}
                      >
                        {apt.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
