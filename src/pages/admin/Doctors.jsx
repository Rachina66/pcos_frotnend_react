import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import {
  getAllDoctors,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  registerDoctorAccount,
} from "../../api/adminApi";
import toast from "react-hot-toast";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const SLOTS = [
  "09:00 AM",
  "09:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "12:30 PM",
  "01:00 PM",
  "01:30 PM",
  "02:00 PM",
  "02:30 PM",
  "03:00 PM",
  "03:30 PM",
  "04:00 PM",
  "04:30 PM",
  "05:00 PM",
];

const empty = {
  name: "",
  specialization: "",
  qualification: "",
  experience: "",
  hospital: "",
  location: "",
  phone: "",
  email: "",
  password: "",
  bio: "",
  imageUrl: "",
  consultFee: "",
  isActive: true,
  availableDays: [],
  timeSlots: [],
};

const StatusBadge = ({ active }) => (
  <span
    className={`px-2.5 py-0.5 rounded text-xs font-semibold border ${
      active
        ? "bg-purple-100 text-purple-700 border-purple-200"
        : "bg-gray-100 text-gray-500 border-gray-200"
    }`}
  >
    {active ? "Active" : "Inactive"}
  </span>
);

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    getAllDoctors()
      .then((res) => setDoctors(res.data.data))
      .catch(() => toast.error("Failed to load doctors"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm(empty);
    setShowModal(true);
  };
  const openEdit = (doc) => {
    setEditing(doc);
    setForm({ ...doc, password: "" });
    setShowModal(true);
  };
  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    setForm(empty);
  };

  const toggleDay = (day) => {
    setForm((f) => ({
      ...f,
      availableDays: f.availableDays.includes(day)
        ? f.availableDays.filter((d) => d !== day)
        : [...f.availableDays, day],
    }));
  };

  const toggleSlot = (slot) => {
    setForm((f) => ({
      ...f,
      timeSlots: f.timeSlots.includes(slot)
        ? f.timeSlots.filter((s) => s !== slot)
        : [...f.timeSlots, slot],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        const { password, ...updateData } = form;
        await updateDoctor(editing.id, {
          ...updateData,
          experience: Number(updateData.experience),
          consultFee: Number(updateData.consultFee),
        });
        toast.success("Doctor updated!");
      } else {
        await registerDoctorAccount({
          name: form.name,
          email: form.email,
          password: form.password,
        });
        const { password, ...doctorData } = form;
        await createDoctor({
          ...doctorData,
          experience: Number(form.experience),
          consultFee: Number(form.consultFee),
        });
        toast.success("Doctor created!");
      }
      closeModal();
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this doctor?")) return;
    try {
      await deleteDoctor(id);
      toast.success("Doctor deleted");
      load();
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
          {doctors.length} doctors found
        </p>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-semibold transition-colors"
        >
          <Plus size={15} /> Add Doctor
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-pink-100 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin" />
          </div>
        ) : doctors.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">
            No doctors yet. Add one!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-purple-50 border-b border-purple-100">
                <tr className="text-left">
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Name
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Specialization
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Hospital
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Fee
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {doctors.map((doc) => (
                  <tr
                    key={doc.id}
                    className="hover:bg-purple-50/30 transition-colors"
                  >
                    <td className="px-5 py-3">
                      <p className="font-medium text-gray-800">{doc.name}</p>
                      <p className="text-xs text-gray-400">{doc.email}</p>
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      {doc.specialization}
                    </td>
                    <td className="px-5 py-3 text-gray-600">{doc.hospital}</td>
                    <td className="px-5 py-3 text-gray-600">
                      Rs. {doc.consultFee}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge active={doc.isActive} />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(doc)}
                          className="p-1.5 rounded-md hover:bg-purple-100 text-purple-500 transition-colors"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="p-1.5 rounded-md hover:bg-pink-100 text-pink-500 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl border border-pink-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-pink-100 sticky top-0 bg-white">
              <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
                {editing ? "Edit Doctor" : "Add New Doctor"}
              </h2>
              <button
                onClick={closeModal}
                className="p-1.5 hover:bg-pink-50 rounded-md transition-colors"
              >
                <X size={16} className="text-gray-400" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                    Full Name
                  </label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                    placeholder="Enter name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                    Email
                  </label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                    placeholder="doctor@example.com"
                  />
                </div>
                {!editing && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                      Password
                    </label>
                    <input
                      required={!editing}
                      type="password"
                      value={form.password}
                      onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                      placeholder="••••••••"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                    Specialization
                  </label>
                  <input
                    required
                    value={form.specialization}
                    onChange={(e) =>
                      setForm({ ...form, specialization: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                    placeholder="Gynecologist"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                    Qualification
                  </label>
                  <input
                    required
                    value={form.qualification}
                    onChange={(e) =>
                      setForm({ ...form, qualification: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                    placeholder="MBBS, MD"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                    Experience (years)
                  </label>
                  <input
                    required
                    type="number"
                    value={form.experience}
                    onChange={(e) =>
                      setForm({ ...form, experience: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                    placeholder="5"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                    Hospital
                  </label>
                  <input
                    required
                    value={form.hospital}
                    onChange={(e) =>
                      setForm({ ...form, hospital: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                    placeholder="City Hospital"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                    Location
                  </label>
                  <input
                    required
                    value={form.location}
                    onChange={(e) =>
                      setForm({ ...form, location: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                    placeholder="Kathmandu"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                    Phone
                  </label>
                  <input
                    required
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                    placeholder="98XXXXXXXX"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                    Consult Fee (Rs.)
                  </label>
                  <input
                    required
                    type="number"
                    value={form.consultFee}
                    onChange={(e) =>
                      setForm({ ...form, consultFee: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                    placeholder="500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                  Bio
                </label>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                  placeholder="Brief description..."
                />
              </div>

              {/* Available Days */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                  Available Days
                </label>
                <div className="flex flex-wrap gap-2">
                  {DAYS.map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`px-3 py-1 rounded-md text-xs font-semibold border transition-colors ${
                        form.availableDays.includes(day)
                          ? "bg-pink-500 text-white border-pink-500"
                          : "bg-white text-gray-500 border-gray-200 hover:border-pink-300 hover:text-pink-600"
                      }`}
                    >
                      {day.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Slots */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                  Time Slots
                </label>
                <div className="flex flex-wrap gap-2">
                  {SLOTS.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => toggleSlot(slot)}
                      className={`px-3 py-1 rounded-md text-xs font-semibold border transition-colors ${
                        form.timeSlots.includes(slot)
                          ? "bg-purple-600 text-white border-purple-600"
                          : "bg-white text-gray-500 border-gray-200 hover:border-purple-300 hover:text-purple-600"
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active toggle */}
              <div className="flex items-center gap-3">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Active
                </label>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, isActive: !form.isActive })}
                  className={`w-10 h-5 rounded-full transition-colors ${form.isActive ? "bg-purple-500" : "bg-gray-200"}`}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full mx-0.5 transition-transform shadow-sm ${form.isActive ? "translate-x-5" : "translate-x-0"}`}
                  />
                </button>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-md text-sm text-gray-500 border border-gray-200 hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-md text-sm bg-purple-600 hover:bg-purple-700 text-white font-semibold transition-colors disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editing
                      ? "Update Doctor"
                      : "Add Doctor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
