import { useEffect, useState } from "react";
import { X, Calendar, Mail } from "lucide-react";
import { getDoctorPatients, getPatientAppointments } from "../../api/doctorApi";
import toast from "react-hot-toast";
import { formatDate } from "../../lib/utils";

const StatusBadge = ({ status }) => {
  const styles = {
    PENDING: "bg-amber-100 text-amber-700",
    CONFIRMED: "bg-green-100 text-green-700",
    COMPLETED: "bg-blue-100 text-blue-700",
    CANCELLED: "bg-red-100 text-red-500",
  };
  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || "bg-gray-100 text-gray-500"}`}
    >
      {status}
    </span>
  );
};

const PatientModal = ({ patient, onClose }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!patient) return;
    getPatientAppointments(patient.id)
      .then((res) => setAppointments(res.data.data))
      .catch(() => toast.error("Failed to load patient appointments"))
      .finally(() => setLoading(false));
  }, [patient]);

  if (!patient) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-pink-100 sticky top-0 bg-white">
          <h2 className="text-base font-semibold text-gray-800">
            Patient Details
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-pink-50 rounded-lg transition-colors"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Patient info */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center">
              <span className="text-purple-600 text-xl font-bold">
                {patient.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-800">
                {patient.name}
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Mail size={13} />
                {patient.email}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-purple-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-purple-700">
                {patient.totalAppointments}
              </p>
              <p className="text-xs text-gray-500 mt-1">Total Visits</p>
            </div>
            <div className="bg-pink-50 rounded-xl p-3 text-center">
              <p className="text-sm font-semibold text-gray-700">
                {patient.lastVisit ? formatDate(patient.lastVisit) : "—"}
              </p>
              <p className="text-xs text-gray-500 mt-1">Last Visit</p>
            </div>
          </div>

          {/* Appointment history */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-3">
              Appointment History
            </p>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-4 border-purple-300 border-t-purple-600 rounded-full animate-spin" />
              </div>
            ) : appointments.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">
                No appointments found
              </p>
            ) : (
              <div className="space-y-2">
                {appointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                  >
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-700">
                          {formatDate(apt.date)}
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
      </div>
    </div>
  );
};

export default function DoctorPatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    getDoctorPatients()
      .then((res) => setPatients(res.data.data))
      .catch(() => toast.error("Failed to load patients"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{patients.length} patients</p>
      </div>

      <div className="bg-white rounded-2xl border border-pink-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-4 border-purple-300 border-t-purple-600 rounded-full animate-spin" />
          </div>
        ) : patients.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">
            No patients yet
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-purple-50">
                <tr className="text-left text-gray-500">
                  <th className="px-5 py-3 font-medium">Patient</th>
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium">Total Visits</th>
                  <th className="px-5 py-3 font-medium">Last Visit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-50">
                {patients.map((patient) => (
                  <tr
                    key={patient.id}
                    onClick={() => setSelected(patient)}
                    className="hover:bg-purple-50/40 transition-colors cursor-pointer"
                  >
                    {/* Patient */}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                          <span className="text-purple-700 text-xs font-semibold">
                            {patient.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="font-medium text-gray-800">
                          {patient.name}
                        </span>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-5 py-3 text-gray-500">{patient.email}</td>

                    {/* Total Visits */}
                    <td className="px-5 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          patient.totalAppointments > 0
                            ? "bg-purple-100 text-purple-700"
                            : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        {patient.totalAppointments > 0
                          ? patient.totalAppointments
                          : "No visits yet"}
                      </span>
                    </td>

                    {/* Last Visit */}
                    <td className="px-5 py-3 text-gray-500">
                      {patient.lastVisit ? formatDate(patient.lastVisit) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <PatientModal patient={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
