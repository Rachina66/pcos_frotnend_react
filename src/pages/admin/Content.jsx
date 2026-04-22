import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import {
  getAllContent,
  createContent,
  updateContent,
  deleteContent,
} from "../../api/adminApi";
import toast from "react-hot-toast";
import { formatDate } from "../../lib/utils";

const CATEGORIES = [
  "PCOS_BASICS",
  "NUTRITION",
  "EXERCISE",
  "MENTAL_HEALTH",
  "TREATMENT",
  "LIFESTYLE",
];

const empty = {
  title: "",
  content: "",
  category: "PCOS_BASICS",
  imageUrl: "",
  tags: "",
  isPublished: true,
};

export default function Content() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    getAllContent()
      .then((res) => setItems(res.data.data))
      .catch(() => toast.error("Failed to load content"))
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
  const openEdit = (item) => {
    setEditing(item);
    setForm({ ...item, tags: item.tags?.join(", ") || "" });
    setShowModal(true);
  };
  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    setForm(empty);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      };
      if (editing) {
        await updateContent(editing.id, payload);
        toast.success("Content updated!");
      } else {
        await createContent(payload);
        toast.success("Content created!");
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
    if (!confirm("Delete this content?")) return;
    try {
      await deleteContent(id);
      toast.success("Content deleted");
      load();
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{items.length} articles found</p>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
        >
          <Plus size={16} /> Add Content
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-pink-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-4 border-pink-300 border-t-purple-600 rounded-full animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">
            No content yet. Add some!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-pink-50">
                <tr className="text-left text-gray-400">
                  <th className="px-5 py-3 font-semibold uppercase tracking-wide text-xs">Title</th>
                  <th className="px-5 py-3 font-semibold uppercase tracking-wide text-xs">Category</th>
                  <th className="px-5 py-3 font-semibold uppercase tracking-wide text-xs">Tags</th>
                  <th className="px-5 py-3 font-semibold uppercase tracking-wide text-xs">Status</th>
                  <th className="px-5 py-3 font-semibold uppercase tracking-wide text-xs">Created</th>
                  <th className="px-5 py-3 font-semibold uppercase tracking-wide text-xs">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pink-50">
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-pink-50/40 transition-colors"
                  >
                    <td className="px-5 py-3">
                      <p className="font-medium text-gray-800 max-w-xs truncate">
                        {item.title}
                      </p>
                    </td>
                    <td className="px-5 py-3">
                      <span className="px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-700">
                        {item.category.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-1">
                        {item.tags?.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                        {item.tags?.length > 2 && (
                          <span className="text-xs text-gray-400">
                            +{item.tags.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${item.isPublished ? "bg-pink-100 text-pink-700" : "bg-gray-100 text-gray-500"}`}
                      >
                        {item.isPublished ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-500">
                      {formatDate(item.createdAt)}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(item)}
                          className="p-1.5 rounded hover:bg-pink-100 text-pink-500 transition-colors"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 rounded hover:bg-pink-100 text-pink-400 transition-colors"
                        >
                          <Trash2 size={15} />
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
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-pink-100 sticky top-0 bg-white">
              <h2 className="text-base font-semibold text-gray-800">
                {editing ? "Edit Content" : "Add New Content"}
              </h2>
              <button
                onClick={closeModal}
                className="p-1.5 hover:bg-pink-50 rounded transition-colors"
              >
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Title
                </label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 rounded border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                  placeholder="Article title"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Content
                </label>
                <textarea
                  required
                  value={form.content}
                  onChange={(e) =>
                    setForm({ ...form, content: e.target.value })
                  }
                  rows={5}
                  className="w-full px-3 py-2 rounded border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                  placeholder="Write your article content here..."
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  className="w-full px-3 py-2 rounded border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                  placeholder="pcos, hormones, diet"
                />
              </div>

              <div className="flex items-center gap-3">
                <label className="text-xs font-medium text-gray-600">
                  Published
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setForm({ ...form, isPublished: !form.isPublished })
                  }
                  className={`w-10 h-5 rounded-full transition-colors ${form.isPublished ? "bg-purple-600" : "bg-gray-300"}`}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full mx-0.5 transition-transform ${form.isPublished ? "translate-x-5" : "translate-x-0"}`}
                  />
                </button>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded text-sm text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded text-sm bg-purple-600 hover:bg-purple-700 text-white font-medium transition-colors disabled:opacity-50"
                >
                  {saving ? "Saving..." : editing ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}