import { useEffect, useState } from "react";
import {
  X,
  Calendar,
  Clock,
  FileText,
  CheckCircle,
  XCircle,
  ClipboardList,
  Download,
} from "lucide-react";
import {
  getDoctorAppointments,
  updateAppointmentStatus,
  addConsultationNotes,
  downloadPatientReport,
} from "../../api/doctorApi";
import toast from "react-hot-toast";
import { formatDate } from "../../lib/utils";

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

const AppointmentModal = ({ apt, onClose, onUpdate }) => {
  const [notes, setNotes] = useState("");
  const [consultationNotes, setConsultationNotes] = useState("");
  const [prescription, setPrescription] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [expandedAssessment, setExpandedAssessment] = useState(false);

  useEffect(() => {
    if (!apt) return;
    setNotes(apt.notes || "");
    setConsultationNotes(apt.consultationNotes || "");
    setPrescription(apt.prescription || "");
    setDiagnosis(apt.diagnosis || "");
    setActiveTab("details");
    setExpandedAssessment(false);
  }, [apt]);

  if (!apt) return null;

  const isNotesDisabled =
    apt.status !== "CONFIRMED" && apt.status !== "COMPLETED";

  const handleStatusUpdate = async (status) => {
    setLoading(true);
    try {
      await updateAppointmentStatus(apt.id, { status, notes });
      toast.success(`Appointment ${status.toLowerCase()} successfully`);
      onUpdate();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndComplete = async () => {
    if (!consultationNotes && !prescription && !diagnosis) {
      toast.error("Please fill at least one field");
      return;
    }
    setLoading(true);
    try {
      await addConsultationNotes(apt.id, {
        consultationNotes,
        prescription,
        diagnosis,
      });
      await updateAppointmentStatus(apt.id, {
        status: "COMPLETED",
        notes: consultationNotes || diagnosis || prescription,
      });
      toast.success("Appointment completed successfully");
      onUpdate();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to complete");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async () => {
    try {
      const res = await downloadPatientReport(apt.id);
      const contentDisposition = res.headers["content-disposition"];
      const filename = contentDisposition
        ? contentDisposition.split("filename=")[1]
        : `report-${apt.id}`;
      const contentType =
        res.headers["content-type"] || "application/octet-stream";
      const url = window.URL.createObjectURL(
        new Blob([res.data], { type: contentType }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error("Failed to download report");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl border border-pink-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-pink-100 sticky top-0 bg-white">
          <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
            Appointment Details
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-pink-50 rounded-md transition-colors"
          >
            <X size={16} className="text-gray-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-pink-100">
          {["details", "notes", "assessment"].map((tab) => {
            const isDisabled = tab === "notes" && isNotesDisabled;
            const hasNoAssessment = tab === "assessment" && !apt.prediction;
            return (
              <button
                key={tab}
                onClick={() =>
                  !isDisabled && !hasNoAssessment && setActiveTab(tab)
                }
                className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wide transition-colors ${
                  activeTab === tab
                    ? "text-purple-700 border-b-2 border-purple-500"
                    : isDisabled || hasNoAssessment
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {tab === "details"
                  ? "Details"
                  : tab === "notes"
                    ? "Consultation Notes"
                    : "Assessment"}
                {hasNoAssessment && (
                  <span className="ml-1 text-xs text-gray-300">(None)</span>
                )}
                {isDisabled && (
                  <span className="ml-1 text-xs text-gray-300">
                    (Confirm first)
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="p-6 space-y-4">
          {activeTab === "details" ? (
            <>
              <div className="flex justify-between items-center">
                <StatusBadge status={apt.status} />
                <span className="text-xs text-gray-400">
                  {formatDate(apt.createdAt)}
                </span>
              </div>

              {/* Patient */}
              <div className="bg-pink-50 rounded-lg p-4 border border-pink-100">
                <p className="text-xs text-pink-400 font-semibold uppercase tracking-widest mb-2">
                  Patient
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-pink-200 flex items-center justify-center">
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

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar size={13} className="text-purple-400" />
                    <p className="text-xs text-gray-400 font-medium">Date</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-700">
                    {formatDate(apt.date)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock size={13} className="text-purple-400" />
                    <p className="text-xs text-gray-400 font-medium">Time</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-700">
                    {apt.timeSlot}
                  </p>
                </div>
              </div>

              {/* Reason */}
              {apt.reason && (
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText size={13} className="text-purple-400" />
                    <p className="text-xs text-gray-400 font-medium">Reason</p>
                  </div>
                  <p className="text-sm text-gray-700">{apt.reason}</p>
                </div>
              )}

              {/* Report */}
              {apt.reportFile && (
                <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText size={13} className="text-purple-500" />
                      <p className="text-xs text-purple-600 font-medium">
                        Patient Report Attached
                      </p>
                    </div>
                    <button
                      onClick={handleDownloadReport}
                      className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
                    >
                      <Download size={12} />
                      Download
                    </button>
                  </div>
                </div>
              )}

              {/* Completed notes display */}
              {apt.status === "COMPLETED" && (
                <>
                  {apt.diagnosis && (
                    <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
                      <p className="text-xs text-purple-600 font-medium mb-1">
                        Diagnosis
                      </p>
                      <p className="text-sm text-gray-700">{apt.diagnosis}</p>
                    </div>
                  )}
                  {apt.consultationNotes && (
                    <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
                      <p className="text-xs text-purple-600 font-medium mb-1">
                        Consultation Notes
                      </p>
                      <p className="text-sm text-gray-700">
                        {apt.consultationNotes}
                      </p>
                    </div>
                  )}
                  {apt.prescription && (
                    <div className="bg-pink-50 rounded-lg p-3 border border-pink-100">
                      <p className="text-xs text-pink-600 font-medium mb-1">
                        Prescription
                      </p>
                      <p className="text-sm text-gray-700">
                        {apt.prescription}
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* Notes textarea */}
              {(apt.status === "PENDING" || apt.status === "CONFIRMED") && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Notes (optional — shown to patient on cancel)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                    placeholder="Add a note..."
                  />
                </div>
              )}

              {/* Action buttons — PENDING */}
              <div className="flex gap-2 pt-2">
                {apt.status === "PENDING" && (
                  <>
                    <button
                      onClick={() => handleStatusUpdate("CONFIRMED")}
                      disabled={loading}
                      className="flex-1 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-md text-sm font-semibold transition-colors disabled:opacity-50"
                    >
                      <CheckCircle size={15} /> Confirm
                    </button>
                    <button
                      onClick={() => handleStatusUpdate("CANCELLED")}
                      disabled={loading}
                      className="flex-1 flex items-center justify-center gap-2 bg-pink-100 hover:bg-pink-200 text-pink-700 border border-pink-200 px-4 py-2.5 rounded-md text-sm font-semibold transition-colors disabled:opacity-50"
                    >
                      <XCircle size={15} /> Cancel
                    </button>
                  </>
                )}
                {apt.status === "CONFIRMED" && (
                  <>
                    <button
                      onClick={() => setActiveTab("notes")}
                      className="flex-1 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-md text-sm font-semibold transition-colors"
                    >
                      <ClipboardList size={15} /> Add Notes & Complete
                    </button>
                    <button
                      onClick={() => handleStatusUpdate("CANCELLED")}
                      disabled={loading}
                      className="flex items-center justify-center gap-2 bg-pink-100 hover:bg-pink-200 text-pink-700 border border-pink-200 px-4 py-2.5 rounded-md text-sm font-semibold transition-colors disabled:opacity-50"
                    >
                      <XCircle size={15} /> Cancel
                    </button>
                  </>
                )}
              </div>
            </>
          ) : activeTab === "assessment" && apt.prediction ? (
            <div className="space-y-4">
              <div
                className={`rounded-lg p-4 border ${
                  apt.prediction.riskLevel?.toLowerCase().includes("high")
                    ? "bg-pink-50 border-pink-200"
                    : "bg-purple-50 border-purple-200"
                }`}
              >
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
                  PCOS Assessment Summary
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-400">Risk Level</p>
                    <p
                      className={`text-sm font-bold mt-0.5 ${
                        apt.prediction.riskLevel?.toLowerCase().includes("high")
                          ? "text-pink-600"
                          : "text-purple-600"
                      }`}
                    >
                      {apt.prediction.riskLevel}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Confidence</p>
                    <p className="text-sm font-bold text-gray-700 mt-0.5">
                      {apt.prediction.confidence.toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Probability</p>
                    <p className="text-sm font-bold text-gray-700 mt-0.5">
                      {apt.prediction.probability.toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Result</p>
                    <p className="text-sm font-bold text-gray-700 mt-0.5">
                      {apt.prediction.prediction === 1
                        ? "PCOS Detected"
                        : "No PCOS"}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setExpandedAssessment((p) => !p)}
                className="w-full flex items-center justify-between px-4 py-2.5 bg-purple-50 hover:bg-purple-100 border border-purple-100 rounded-md text-sm font-semibold text-purple-700 transition-colors"
              >
                <span>View Full Clinical Data</span>
                <span className="text-lg leading-none">
                  {expandedAssessment ? "−" : "+"}
                </span>
              </button>

              {expandedAssessment && (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                    Biometrics
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "Age", value: apt.prediction.age },
                      { label: "Weight (kg)", value: apt.prediction.weight },
                      { label: "Height (cm)", value: apt.prediction.height },
                      { label: "BMI", value: apt.prediction.bmi?.toFixed(1) },
                      { label: "Blood Group", value: apt.prediction.bloodGroup },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-gray-50 rounded-md p-2.5 border border-gray-100">
                        <p className="text-xs text-gray-400">{label}</p>
                        <p className="text-sm font-semibold text-gray-700 mt-0.5">{value}</p>
                      </div>
                    ))}
                  </div>

                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mt-2">
                    Cycle Info
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "Cycle Length", value: `${apt.prediction.cycleLengthDays} days` },
                      { label: "Period Length", value: `${apt.prediction.periodLengthDays} days` },
                      { label: "Regular Ovulation", value: apt.prediction.regularOvulation ? "Yes" : "No" },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-gray-50 rounded-md p-2.5 border border-gray-100">
                        <p className="text-xs text-gray-400">{label}</p>
                        <p className="text-sm font-semibold text-gray-700 mt-0.5">{value}</p>
                      </div>
                    ))}
                  </div>

                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mt-2">
                    Hormonal Levels
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "FSH Level", value: apt.prediction.fshLevel },
                      { label: "LH Level", value: apt.prediction.lhLevel },
                      { label: "Androgen", value: apt.prediction.androgenLevel },
                      { label: "Cyst Count", value: apt.prediction.cystCount },
                      { label: "Hirsutism", value: apt.prediction.hirsutism ? "Yes" : "No" },
                      { label: "Fasting Glucose", value: apt.prediction.fastingGlucose },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-gray-50 rounded-md p-2.5 border border-gray-100">
                        <p className="text-xs text-gray-400">{label}</p>
                        <p className="text-sm font-semibold text-gray-700 mt-0.5">{value}</p>
                      </div>
                    ))}
                  </div>

                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mt-2">
                    Lifestyle
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "Activity Level", value: `${apt.prediction.activityLevel}/10` },
                      { label: "Stress Level", value: `${apt.prediction.stressLevel}/10` },
                      { label: "Pregnant", value: apt.prediction.pregnant ? "Yes" : "No" },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-gray-50 rounded-md p-2.5 border border-gray-100">
                        <p className="text-xs text-gray-400">{label}</p>
                        <p className="text-sm font-semibold text-gray-700 mt-0.5">{value}</p>
                      </div>
                    ))}
                  </div>

                  <p className="text-xs text-gray-400 text-center pt-1">
                    Assessment taken on{" "}
                    {new Date(apt.prediction.createdAt).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <>
              {apt.status === "COMPLETED" ? (
                <div className="space-y-4">
                  <p className="text-xs text-gray-400 text-center">
                    This appointment has been completed
                  </p>
                  {apt.diagnosis && (
                    <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
                      <p className="text-xs text-purple-600 font-medium mb-1">Diagnosis</p>
                      <p className="text-sm text-gray-700">{apt.diagnosis}</p>
                    </div>
                  )}
                  {apt.consultationNotes && (
                    <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
                      <p className="text-xs text-purple-600 font-medium mb-1">Consultation Notes</p>
                      <p className="text-sm text-gray-700">{apt.consultationNotes}</p>
                    </div>
                  )}
                  {apt.prescription && (
                    <div className="bg-pink-50 rounded-lg p-3 border border-pink-100">
                      <p className="text-xs text-pink-600 font-medium mb-1">Prescription</p>
                      <p className="text-sm text-gray-700">{apt.prescription}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Diagnosis
                    </label>
                    <textarea
                      value={diagnosis}
                      onChange={(e) => setDiagnosis(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                      placeholder="Patient diagnosis..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Consultation Notes
                    </label>
                    <textarea
                      value={consultationNotes}
                      onChange={(e) => setConsultationNotes(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                      placeholder="Notes from the consultation..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Prescription
                    </label>
                    <textarea
                      value={prescription}
                      onChange={(e) => setPrescription(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                      placeholder="Medicines and dosage..."
                    />
                  </div>
                  <button
                    onClick={handleSaveAndComplete}
                    disabled={loading}
                    className="w-full bg-fuchsia-600 hover:bg-fuchsia-700 text-white px-4 py-2.5 rounded-md text-sm font-semibold transition-colors disabled:opacity-50"
                  >
                    {loading ? "Saving..." : "Save Notes & Complete"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [selected, setSelected] = useState(null);

  const load = () => {
    setLoading(true);
    getDoctorAppointments()
      .then((res) => setAppointments(res.data.data))
      .catch(() => toast.error("Failed to load appointments"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const filtered =
    filter === "ALL"
      ? appointments
      : appointments.filter((a) => a.status === filter);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{filtered.length} appointments</p>
        <div className="flex gap-2 flex-wrap">
          {["ALL", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors tracking-wide ${
                filter === s
                  ? "bg-purple-600 text-white"
                  : "bg-white text-gray-500 border border-gray-200 hover:border-purple-300 hover:text-purple-600"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-pink-100 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">
            No appointments found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-purple-50 border-b border-purple-100">
                <tr className="text-left">
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Patient</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Time</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Reason</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Report</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Assessment</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((apt) => (
                  <tr
                    key={apt.id}
                    onClick={() => setSelected(apt)}
                    className="hover:bg-purple-50/40 transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                          <span className="text-purple-700 text-xs font-bold">
                            {apt.user?.name?.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{apt.user?.name}</p>
                          <p className="text-xs text-gray-400">{apt.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-600">{formatDate(apt.date)}</td>
                    <td className="px-5 py-3 text-gray-600">{apt.timeSlot}</td>
                    <td className="px-5 py-3 text-gray-500 max-w-xs truncate">{apt.reason || "—"}</td>
                    <td className="px-5 py-3">
                      {apt.reportFile ? (
                        <span className="px-2.5 py-0.5 bg-purple-100 text-purple-600 border border-purple-200 rounded text-xs font-semibold">
                          Attached
                        </span>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      {apt.prediction ? (
                        <span
                          className={`px-2.5 py-0.5 rounded text-xs font-semibold border ${
                            apt.prediction.riskLevel?.toLowerCase().includes("high")
                              ? "bg-pink-100 text-pink-700 border-pink-200"
                              : "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200"
                          }`}
                        >
                          {apt.prediction.riskLevel}
                        </span>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
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

      <AppointmentModal
        apt={selected}
        onClose={() => setSelected(null)}
        onUpdate={load}
      />
    </div>
  );
}