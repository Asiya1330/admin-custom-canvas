"use client";
import Layout from "../../components/Layout";
import DataTable from "../../components/DataTable";
import { useState, useEffect } from "react";
import {
  getSubjects,
  deleteDocument,
  updateDocument,
} from "../../services/crud";
import { withAuth } from "../../components/withAuth";

interface Subject {
  id: string;
  category: string | undefined;
  subjects: string | string[] | undefined;
}

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
      <div className="flex flex-nowrap gap-1 overflow-x-auto w-full">
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

function Subjects() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(true);

  const getTagsArray = (subjects: string) => {
    if (Array.isArray(subjects)) return subjects;
    if (typeof subjects === "string") {
      try {
        // Try to parse as JSON array
        const parsed = JSON.parse(subjects);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        // Fallback: split by comma
        return subjects
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }
    }
    return [];
  };

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

  console.log(subjects);
  return (
    <Layout>
      <div className="">
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
                    Subjects (tags)
                  </label>
                  <div className="flex flex-wrap gap-2 bg-white/5 border border-white/10 rounded-lg px-2 py-2">
                    {(Array.isArray(editingItem?.subjects)
                      ? editingItem.subjects
                      : typeof editingItem?.subjects === "string"
                      ? editingItem.subjects
                          .split(",")
                          .map((s) => s.trim().replace(/^\[+|\]+$/g, "")) // Remove brackets
                          .filter(Boolean)
                      : []
                    ).map((tag, idx, arr) => (
                      <span
                        key={idx}
                        className="flex items-center px-2 py-1 text-xs bg-violet-500/20 text-violet-400 rounded-full"
                      >
                        {tag}
                        <button
                          type="button"
                          className="ml-1 text-violet-400 hover:text-red-400"
                          onClick={() => {
                            const newTags = arr.filter((_, i) => i !== idx);
                            setEditingItem({
                              id: editingItem?.id || "",
                              category: editingItem?.category || "",
                              subjects: newTags.join(", "),
                            });
                          }}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      className="bg-transparent outline-none text-xs text-white flex-1 min-w-[80px]"
                      placeholder="Add tag"
                      onKeyDown={(e) => {
                        if (
                          (e.key === "Enter" || e.key === ",") &&
                          e.currentTarget.value.trim()
                        ) {
                          e.preventDefault();
                          const currentTags = Array.isArray(
                            editingItem?.subjects
                          )
                            ? editingItem.subjects
                            : typeof editingItem?.subjects === "string"
                            ? editingItem.subjects
                                .split(",")
                                .map((s) => s.trim())
                                .filter(Boolean)
                            : [];
                          const newTag = e.currentTarget.value.trim();
                          setEditingItem({
                            id: editingItem?.id || "",
                            category: editingItem?.category || "",
                            subjects: [...currentTags, newTag].join(", "),
                          });
                          e.currentTarget.value = "";
                        }
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (editingItem) {
                      // Convert subjects to array of strings
                      const tagsArray = Array.isArray(editingItem.subjects)
                        ? editingItem.subjects
                        : typeof editingItem.subjects === "string"
                        ? editingItem.subjects
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean)
                        : [];
                      await updateDocument("subjects", editingItem.id, {
                        ...editingItem,
                        subjects: tagsArray,
                      });
                      setSubjects((prev) => {
                        const updatedSubjects = prev.map((s) =>
                          s.id === editingItem.id ? { ...editingItem, subjects: tagsArray } : s
                        );
                        return updatedSubjects;
                      });
                    }
                    setShowModal(false);
                  }}
                  className="flex-1 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default withAuth(Subjects)
