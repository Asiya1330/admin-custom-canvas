"use client";
import Layout from "../../components/Layout";
import DataTable from "../../components/DataTable";
import { useState, useEffect } from "react";
import { getSubjects, deleteDocument } from "../../services/crud";

interface Subject {
  id: string;
  category: string;
  subjects: string[];
}

const mockSubjects: Subject[] = [
  {
    id: "1",
    category: "Nature",
    subjects: ["Mountains", "Forests", "Oceans", "Deserts", "Rivers"],
  },
  {
    id: "2",
    category: "Urban",
    subjects: ["Cityscapes", "Architecture", "Street Life", "Transportation"],
  },
  {
    id: "3",
    category: "Abstract",
    subjects: ["Geometric", "Organic", "Minimalist", "Expressionist"],
  },
];

interface Column {
  key: string;
  label: string;
  render?: (value: any) => React.ReactNode | string;
}

const columns: Column[] = [
  { key: "category", label: "Category" },
  {
    key: "subjects",
    label: "Subjects",
    render: (value: string[] | string | undefined) => (
      <div className="flex flex-wrap gap-1">
        {(Array.isArray(value)
          ? value
          : typeof value === "string" && value
          ? value.split(",")
          : []
        ).map((subject, index) => (
          <span
            key={index}
            className="px-2 py-1 text-xs bg-violet-500/20 text-violet-400 rounded-full"
          >
            {subject}
          </span>
        ))}
      </div>
    ),
  },
];

export default function Subjects() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const subjectsData = await getSubjects();
        setSubjects(subjectsData);
      } catch (error) {
        console.error("Error fetching subjects:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSubjects();
  }, []);

  const handleEdit = (item: Subject) => {
    setEditingItem(item);
    setShowModal(true);
  };

  const handleDelete = async (item: Subject) => {
    try {
      await deleteDocument("subjects", item.id);
      setSubjects(subjects.filter((s) => s.id !== item.id));
    } catch (error) {
      console.error("Error deleting subject:", error);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-white">Loading subjects...</div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-8">
        <DataTable
          data={subjects}
          columns={columns}
          title="Subjects Management"
          editable={true}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onCreate={() => setShowModal(true)}
        />

        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="glass-effect bg-slate-900 rounded-2xl p-6 w-full max-w-md">
              <h2 className="text-xl font-bold text-white mb-6">
                {editingItem
                  ? "Edit Subject Category"
                  : "Add New Subject Category"}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-2">
                    Category
                  </label>
                  <input
                    type="text"
                    defaultValue={editingItem?.category || ""}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-violet-400 text-white"
                    placeholder="Enter category name"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm mb-2">
                    Subjects (comma separated)
                  </label>
                  <textarea
                    defaultValue={editingItem?.subjects?.join(", ") || ""}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-violet-400 text-white h-24 resize-none"
                    placeholder="Subject 1, Subject 2, Subject 3"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors"
                >
                  {editingItem ? "Update" : "Create"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
