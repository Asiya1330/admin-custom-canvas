"use client";
import Layout from "../../components/Layout";
import DataTable from "../../components/DataTable";
import { useState, useEffect } from "react";
import {
  getSubjects,
  updateDocument,
  addDocument,
  deleteDocument,
} from "../../services/crud";
import { withAuth } from "../../components/withAuth";
import Loader from "../../components/Loader";
import { toast } from "react-hot-toast";

interface Subject {
  id: string;
  category: string | undefined;
  subjects: string[] | undefined;
}

interface Column {
  key: string;
  label: string;
  render?: (value: any) => React.ReactNode | string;
  width?: string;
  align?: "left" | "center" | "right";
}

const columns: Column[] = [
  { key: "category", label: "Category", width: "100px" },
  {
    key: "subjects",
    label: "Subjects",
    width: "calc(100vw - 100px)",
    align: "left",
    render: (value: string[] | string | undefined) => (
      <div
        className="flex flex-wrap gap-1 overflow-x-auto w-full"
        style={{ width: "100%" }}
      >
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
  const [mode, setMode] = useState<"edit" | "create">("create");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingItem, setDeletingItem] = useState<Subject | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [creating, setCreating] = useState(false);

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

  const showDeleteModalHandler = (show: boolean, item: Subject | null) => {
    setShowDeleteModal(show);
    setDeletingItem(item || deletingItem);
  };

  const handleEdit = (item: Subject) => {
    setMode("edit");
    setEditingItem(item);
    setShowModal(true);
  };

  const handleDelete = async () => {
    try {
      if(!deletingItem) return;
      setDeleting(true);
      await deleteDocument("subjects", deletingItem?.id);
      setSubjects(subjects.filter((s) => s.id !== deletingItem?.id));
    } catch (error) {
      console.error("Error deleting subject:", error);
      toast.error("Error deleting subject");
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
      setDeletingItem(null);
    }
  };

  const handleCreate = async (formData: any) => {
    try {
      setCreating(true);
      const newId = await addDocument("subjects", {
        category: formData.category,
        subjects: formData.subjects,
      });
      setSubjects([...subjects, {id: newId, category: formData.category, subjects: formData.subjects}]);
    } catch (error) {
      console.error("Error creating subject:", error);
      toast.error("Error creating subject");
    } finally {
      setCreating(false);
    }
  };
  console.log(subjects, "subjects");
  console.log(editingItem, "editingItem");


  const tags = (mode: "edit" | "create"): string[] => {
    if (mode === "edit") {
      return editingItem?.subjects || []
    }
    return editingItem?.subjects || [];
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <Loader />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="">
        <DataTable
          data={subjects}
          columns={columns}
          title="Subjects Management"
          editable={true}
          onEdit={handleEdit}
          onDelete={(item: Subject) => showDeleteModalHandler(true, item)}
          onCreate={() => {
            setMode("create");
            setEditingItem({
              id: "",
              category: "",
              subjects: [],
            });
            setShowModal(true);
          }}
          disabledDelete={false}
        />

        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="glass-effect bg-slate-900 rounded-2xl p-6 w-full max-w-md">
              <h2 className="text-xl font-bold text-white mb-6">
                {mode === "edit"
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
                    defaultValue={
                      mode === "edit" ? editingItem?.category || "" : ""
                    }
                    onChange={(e) => {
                      setEditingItem({  
                        id: editingItem?.id || "",
                        category: e.target.value,
                        subjects: editingItem?.subjects || [],
                      });
                    }}
                    className="::placeholder:text-xs w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-violet-400 text-white text-xs"
                    placeholder="Enter category name"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm mb-2">
                    Subjects (tags)
                  </label>
                  <div className="flex flex-wrap gap-2 bg-white/5 border border-white/10 rounded-lg px-2 py-2">
                    { tags(mode).map(
                      (tag: string, idx: number, arr: string[]) => (
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
                                subjects: newTags,
                              });
                            }}
                          >
                            ×
                          </button>
                        </span>
                      )
                    )}
                    <input
                      type="text"
                      className="::placeholder:text-xs bg-transparent outline-none text-xs text-white flex-1 min-w-[80px]"
                      placeholder="Add tag"
                      onKeyDown={(e) => {
                        if (
                          (e.key === "Enter" || e.key === ",") &&
                          e.currentTarget.value.trim()
                        ) {
                          e.preventDefault();
                          const currentTags = editingItem?.subjects || []
                           
                          const newTag = e.currentTarget.value.trim();
                          setEditingItem({
                            id: editingItem?.id || "",
                            category: editingItem?.category || "",
                            subjects: [...currentTags, newTag],
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
                  className="flex-1 px-2 py-2 text-xs bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (mode === "edit" && editingItem) {
                      const tagsArray = editingItem.subjects || []
                      setUpdating(true);
                      await updateDocument("subjects", editingItem.id, {
                        ...editingItem,
                        subjects: tagsArray,
                      });
                      setSubjects((prev) => {
                        const updatedSubjects = prev.map((s) =>
                          s.id === editingItem.id
                            ? { ...editingItem, subjects: tagsArray }
                            : s
                        );
                        return updatedSubjects;
                      });
                    } else if (mode === "create" && editingItem) {
                      handleCreate(editingItem);
                    }
                    setUpdating(false);
                    setShowModal(false);
                  }}
                  className={`flex-1 px-2 py-2 text-xs bg-violet-600 text-white rounded-md hover:bg-violet-700 transition-colors ${
                    updating || creating ? "opacity-50 cursor-not-allowed " : ""
                  }`}
                >
                  {mode === "edit" ? (
                    updating ? (
                      <Loader size={4} />
                    ) : (
                      "Update"
                    )
                  ) : creating ? (
                    <Loader size={4} />
                  ) : (
                    "Create"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 ">
          <div className="flex glass-effect rounded-2xl p-6 max-w-2xl max-h-[90vh] overflow-y-auto flex-col gap-4 bg-slate-900">
            <h2 className="text-xl font-bold text-white ">
              Delete Subject
            </h2>
            <p className="text-gray-300 mb-4">
              Are you sure you want to delete this subject?
            </p>
            <div className="flex space-x-3">
              <button 
                onClick={()=>showDeleteModalHandler(false, null)}
                className="flex-1 px-4 py-2 text-xs bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors">
                  Cancel
                </button>
                <button 
                onClick={handleDelete}
                disabled={deleting}
                className={`flex-1 px-4 ${deleting ? "opacity-50 cursor-not-allowed " : ""} py-2 text-xs bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors`}>
                  {deleting ? <Loader size={4} /> : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
    </Layout>
  );
}

export default withAuth(Subjects);
