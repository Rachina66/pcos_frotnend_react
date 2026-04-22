import { useEffect, useState } from "react";
import { getAllAppointments } from "../../api/adminApi";
import toast from "react-hot-toast";
import { formatDate } from "../../lib/utils";
import { X, Stethoscope, Calendar, Clock, FileText } from "lucide-react";

const StatusBadge = ({ status }) => {
  const styles = {
    PENDING: "bg-pink-100 text-pink-700",
    CONFIRMED: "bg-purple-100 text-purple-700",
    COMPLETED: "bg-fuchsia-100 text-fuchsia-700",
    CANCELLED: "bg-gray-100 text-gray-500",
  };
  return (
    <span
      className={`px-2 py-1 rounded text-xs font-medium ${styles[status] || "bg-gray-100 text-gray-500"}`}
    >
      {status}
    </span>
  );
};

const AppointmentModal = ({ apt, onClose }) => {
  if (!apt) return null;
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-lg w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-pink-100">
          <h2 className="text-base font-semibold text-gray-800">
            Appointment Details
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-pink-50 rounded transition-colors"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Status */}
          <div className="flex justify-between items-center">
            <StatusBadge status={apt.status} />
            <span className="text-xs text-gray-400">
              {formatDate(apt.createdAt)}
            </span>
          </div>

          {/* Patient */}
          <div className="bg-pink-50 rounded-md p-4 space-y-1">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">
              Patient
            </p>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-pink-200 flex items-center justify-center">
                <span className="text-pink-700 text-xs font-bold">
                  {apt.user?.name?.charAt(0)}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  {apt.user?.name}
                </p>
                <p className="text-xs text-gray-500">{apt.user?.email}</p>
              </div>
            </div>
          </div>

          {/* Doctor */}
          <div className="bg-purple-50 rounded-md p-4 space-y-1">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">
              Doctor
            </p>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-purple-200 flex items-center justify-center">
                <Stethoscope size={14} className="text-purple-700" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  {apt.doctor?.name}
                </p>
                <p className="text-xs text-gray-500">
                  {apt.doctor?.specialization}
                </p>
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-md p-3">
              <div className="flex items-center gap-2 mb-1">
                <Calendar size={14} className="text-gray-400" />
                <p className="text-xs text-gray-400 font-medium">Date</p>
              </div>
              <p className="text-sm font-semibold text-gray-700">
                {formatDate(apt.date)}
              </p>
            </div>
            <div className="bg-gray-50 rounded-md p-3">
              <div className="flex items-center gap-2 mb-1">
                <Clock size={14} className="text-gray-400" />
                <p className="text-xs text-gray-400 font-medium">Time</p>
              </div>
              <p className="text-sm font-semibold text-gray-700">
                {apt.timeSlot}
              </p>
            </div>
          </div>

          {/* Reason */}
          {apt.reason && (
            <div className="bg-gray-50 rounded-md p-3">
              <div className="flex items-center gap-2 mb-1">
                <FileText size={14} className="text-gray-400" />
                <p className="text-xs text-gray-400 font-medium">Reason</p>
              </div>
              <p className="text-sm text-gray-700">{apt.reason}</p>
            </div>
          )}

          {/* Notes */}
          {apt.notes && (
            <div className="bg-pink-50 rounded-md p-3">
              <p className="text-xs text-pink-600 font-medium mb-1">Notes</p>
              <p className="text-sm text-gray-700">{apt.notes}</p>
            </div>
          )}

          {/* Diagnosis */}
          {apt.diagnosis && (
            <div className="bg-purple-50 rounded-md p-3">
              <p className="text-xs text-purple-600 font-medium mb-1">
                Diagnosis
              </p>
              <p className="text-sm text-gray-700">{apt.diagnosis}</p>
            </div>
          )}

          {apt.prescription && (
            <div className="bg-fuchsia-50 rounded-md p-3">
              <p className="text-xs text-fuchsia-600 font-medium mb-1">
                Prescription
              </p>
              <p className="text-sm text-gray-700">{apt.prescription}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    getAllAppointments()
      .then((res) => setAppointments(res.data.data))
      .catch(() => toast.error("Failed to load appointments"))
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    filter === "ALL"
      ? appointments
      : appointments.filter((a) => a.status === filter);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{filtered.length} appointments</p>
        <div className="flex gap-2 flex-wrap">
          {["ALL", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"].map(
            (s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  filter === s
                    ? "bg-purple-600 text-white"
                    : "bg-white text-gray-500 border border-pink-100 hover:border-purple-300"
                }`}
              >
                {s}
              </button>
            ),
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-pink-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-4 border-pink-300 border-t-purple-600 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">
            No appointments found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-pink-50">
                <tr className="text-left text-gray-400">
                  <th className="px-5 py-3 font-semibold uppercase tracking-wide text-xs">Patient</th>
                  <th className="px-5 py-3 font-semibold uppercase tracking-wide text-xs">Doctor</th>
                  <th className="px-5 py-3 font-semibold uppercase tracking-wide text-xs">Date</th>
                  <th className="px-5 py-3 font-semibold uppercase tracking-wide text-xs">Time</th>
                  <th className="px-5 py-3 font-semibold uppercase tracking-wide text-xs">Reason</th>
                  <th className="px-5 py-3 font-semibold uppercase tracking-wide text-xs">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pink-50">
                {filtered.map((apt) => (
                  <tr
                    key={apt.id}
                    onClick={() => setSelected(apt)}
                    className="hover:bg-pink-50/40 transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-3">
                      <p className="font-medium text-gray-800">
                        {apt.user?.name}
                      </p>
                      <p className="text-xs text-gray-400">{apt.user?.email}</p>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-gray-700">{apt.doctor?.name}</p>
                      <p className="text-xs text-gray-400">
                        {apt.doctor?.specialization}
                      </p>
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      {formatDate(apt.date)}
                    </td>
                    <td className="px-5 py-3 text-gray-600">{apt.timeSlot}</td>
                    <td className="px-5 py-3 text-gray-500 max-w-xs truncate">
                      {apt.reason || "—"}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={apt.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AppointmentModal apt={selected} onClose={() => setSelected(null)} />
    </div>
  );
}