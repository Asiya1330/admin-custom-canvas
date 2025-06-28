"use client";
import Layout from "../../components/Layout";
import DataTable from "../../components/DataTable";
import { useState, useEffect } from "react";
import {
  getHomeImages,
  addDocument,
  updateDocument,
  deleteDocument,
} from "../../services/crud";

interface HomeImage {
  id: string;
  title: string;
  file_link: string;
  aspect_ratio: string;
  dimensions: string;
  tags: string[];
  suggested_locations: string[];
}

interface Column {
  key: string;
  label: string;
  render?: (value: any) => React.ReactNode | string;
}

const columns: Column[] = [
  {
    key: "file_link",
    label: "Preview",
    render: (value: string) => (
      <img src={value} alt="" className="w-20 h-16 rounded-lg object-cover" />
    ),
  },
  { key: "title", label: "Title" },
  { key: "aspect_ratio", label: "Aspect Ratio" },
  { key: "dimensions", label: "Dimensions" },
  {
    key: "tags",
    label: "Tags",
    render: (value: string[] | string | undefined) => (
      <div className="flex flex-wrap gap-1">
        {(Array.isArray(value)
          ? value
          : typeof value === "string" && value
          ? value.split(",")
          : []
        ).map((tag, index) => (
          <span
            key={index}
            className="px-2 py-1 text-xs bg-violet-500/20 text-violet-400 rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>
    ),
  },
  {
    key: "suggested_locations",
    label: "Locations",
    render: (value: string[] | string | undefined) => (
      <div className="flex flex-wrap gap-1">
        {(Array.isArray(value)
          ? value
          : typeof value === "string" && value
          ? value.split(",")
          : []
        ).map((location, index) => (
          <span
            key={index}
            className="px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded-full"
          >
            {location}
          </span>
        ))}
      </div>
    ),
  },
];

export default function HomeImages() {
  const [homeImages, setHomeImages] = useState<HomeImage[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<HomeImage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeImages = async () => {
      try {
        const imagesData = await getHomeImages();
        setHomeImages(imagesData);
      } catch (error) {
        console.error("Error fetching home images:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeImages();
  }, []);

  const handleEdit = (item: HomeImage) => {
    setEditingItem(item);
    setShowModal(true);
  };

  const handleDelete = async (item: HomeImage) => {
    try {
      await deleteDocument("home-images", item.id);
      setHomeImages(homeImages.filter((img) => img.id !== item.id));
    } catch (error) {
      console.error("Error deleting home image:", error);
    }
  };

  const handleCreate = async (formData: any) => {
    try {
      const newId = await addDocument("home-images", formData);
      const newImage = { id: newId, ...formData };
      setHomeImages([...homeImages, newImage]);
      setShowModal(false);
    } catch (error) {
      console.error("Error creating home image:", error);
    }
  };

  const handleUpdate = async (formData: any) => {
    if (!editingItem) return;
    try {
      await updateDocument("home-images", editingItem.id, formData);
      setHomeImages(
        homeImages.map((img) =>
          img.id === editingItem.id ? { ...img, ...formData } : img
        )
      );
      setShowModal(false);
      setEditingItem(null);
    } catch (error) {
      console.error("Error updating home image:", error);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-white">Loading home images...</div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="">
        <DataTable
          data={homeImages}
          columns={columns}
          title="Home Images Management"
          editable={true}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onCreate={() => setShowModal(true)}
        />

        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="glass-effect rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900">
              <h2 className="text-xl font-bold text-white mb-6">
                {editingItem ? "Edit Home Image" : "Add New Home Image"}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-300 text-sm mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      defaultValue={editingItem?.title || ""}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-violet-400 text-white"
                      placeholder="Enter image title"
                      id="edit-title"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm mb-2">
                      File URL
                    </label>
                    <input
                      type="url"
                      defaultValue={editingItem?.file_link || ""}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-violet-400 text-white"
                      placeholder="https://example.com/image.jpg"
                      id="edit-file_link"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm mb-2">
                      Tags (comma separated)
                    </label>
                    <input
                      type="text"
                      defaultValue={
                        Array.isArray(editingItem?.tags)
                          ? editingItem?.tags?.join(", ")
                          : editingItem?.tags
                      }
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-violet-400 text-white"
                      placeholder="e.g. modern, abstract, colorful"
                      id="edit-tags"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-300 text-sm mb-2">
                      Aspect Ratio
                    </label>
                    <select
                      defaultValue={editingItem?.aspect_ratio || "16:9"}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-violet-400 text-white"
                      id="edit-aspect_ratio"
                    >
                      <option value="16:9">16:9</option>
                      <option value="4:3">4:3</option>
                      <option value="1:1">1:1</option>
                      <option value="3:2">3:2</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm mb-2">
                      Dimensions
                    </label>
                    <input
                      type="text"
                      defaultValue={editingItem?.dimensions || ""}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-violet-400 text-white"
                      placeholder="1920x1080"
                      id="edit-dimensions"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm mb-2">
                      Locations (comma separated)
                    </label>
                    <input
                      type="text"
                      defaultValue={
                        Array.isArray(editingItem?.suggested_locations)
                          ? editingItem?.suggested_locations?.join(", ")
                          : editingItem?.suggested_locations
                      }
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-violet-400 text-white"
                      placeholder="e.g. living room, office, bedroom"
                      id="edit-suggested_locations"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  className="px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600"
                  onClick={() => {
                    setShowModal(false);
                    setEditingItem(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 rounded-lg bg-violet-600 text-white hover:bg-violet-500"
                  onClick={async () => {
                    const formData = {
                      title:
                        (
                          document.getElementById(
                            "edit-title"
                          ) as HTMLInputElement
                        )?.value || "",
                      file_link:
                        (
                          document.getElementById(
                            "edit-file_link"
                          ) as HTMLInputElement
                        )?.value || "",
                      aspect_ratio:
                        (
                          document.getElementById(
                            "edit-aspect_ratio"
                          ) as HTMLSelectElement
                        )?.value || "16:9",
                      dimensions:
                        (
                          document.getElementById(
                            "edit-dimensions"
                          ) as HTMLInputElement
                        )?.value || "",
                      tags: (
                        document.getElementById("edit-tags") as HTMLInputElement
                      )?.value
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean),
                      suggested_locations: (
                        document.getElementById(
                          "edit-suggested_locations"
                        ) as HTMLInputElement
                      )?.value
                        .split(",")
                        .map((l) => l.trim())
                        .filter(Boolean),
                    };
                    await handleUpdate(formData);
                  }}
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
