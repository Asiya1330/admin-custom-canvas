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
import Image from "next/image";

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
      // if value is empty string pass dummy image
      <Image
        width={80}
        height={64}
        src={!!value ? value : "/images/placeholder.png"}
        alt=""
        className="w-20 h-16 rounded-lg object-cover"
      />
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

                  {/* Tags */}
                  <div>
                    <label className="block text-gray-300 text-sm mb-2">
                      Tags
                    </label>
                    <div className="flex flex-wrap gap-2 bg-white/5 border border-white/10 rounded-lg px-2 py-2">
                      {(Array.isArray(editingItem?.tags)
                        ? editingItem.tags
                        : typeof editingItem?.tags === "string" && editingItem?.tags
                        ? (editingItem.tags as string).split(",").map((t: string) => t.trim()).filter(Boolean)
                        : []
                      ).map((tag: string, idx: number, arr: string[]) => (
                        <span
                          key={idx}
                          className="flex items-center px-2 py-1 text-xs bg-violet-500/20 text-violet-400 rounded-full"
                        >
                          {tag}
                          <button
                            type="button"
                            className="ml-1 text-violet-400 hover:text-red-400"
                            onClick={() => {
                              const newTags = arr.filter((_: string, i: number) => i !== idx);
                              setEditingItem({
                                id: editingItem?.id || "",
                                title: editingItem?.title || "",
                                file_link: editingItem?.file_link || "",
                                aspect_ratio: editingItem?.aspect_ratio || "16:9",
                                dimensions: editingItem?.dimensions || "",
                                tags: newTags,
                                suggested_locations: editingItem?.suggested_locations || [],
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
                            const newTag = e.currentTarget.value.trim();
                            const currentTags = Array.isArray(editingItem?.tags)
                              ? editingItem.tags
                              : typeof editingItem?.tags === "string" && editingItem?.tags
                              ? (editingItem.tags as string).split(",").map((t: string) => t.trim()).filter(Boolean)
                              : [];
                            if (!currentTags.includes(newTag)) {
                              setEditingItem({
                                id: editingItem?.id || "",
                                title: editingItem?.title || "",
                                file_link: editingItem?.file_link || "",
                                aspect_ratio: editingItem?.aspect_ratio || "16:9",
                                dimensions: editingItem?.dimensions || "",
                                tags: [...currentTags, newTag],
                                suggested_locations: editingItem?.suggested_locations || [],
                              });
                            }
                            e.currentTarget.value = "";
                          }
                        }}
                      />
                    </div>
                  </div>

                  {/* Suggested Locations */}
                  <div>
                    <label className="block text-gray-300 text-sm mb-2">
                      Locations
                    </label>
                    <div className="flex flex-wrap gap-2 bg-white/5 border border-white/10 rounded-lg px-2 py-2">
                      {(Array.isArray(editingItem?.suggested_locations)
                        ? editingItem.suggested_locations
                        : typeof editingItem?.suggested_locations === "string" && editingItem?.suggested_locations
                        ? (editingItem.suggested_locations as string).split(",").map((l: string) => l.trim()).filter(Boolean)
                        : []
                      ).map((loc: string, idx: number, arr: string[]) => (
                        <span
                          key={idx}
                          className="flex items-center px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded-full"
                        >
                          {loc}
                          <button
                            type="button"
                            className="ml-1 text-blue-400 hover:text-red-400"
                            onClick={() => {
                              const newLocs = arr.filter((_: string, i: number) => i !== idx);
                              setEditingItem({
                                id: editingItem?.id || "",
                                title: editingItem?.title || "",
                                file_link: editingItem?.file_link || "",
                                aspect_ratio: editingItem?.aspect_ratio || "16:9",
                                dimensions: editingItem?.dimensions || "",
                                tags: editingItem?.tags || [],
                                suggested_locations: newLocs,
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
                        placeholder="Add location"
                        onKeyDown={(e) => {
                          if (
                            (e.key === "Enter" || e.key === ",") &&
                            e.currentTarget.value.trim()
                          ) {
                            e.preventDefault();
                            const newLoc = e.currentTarget.value.trim();
                            const currentLocs = Array.isArray(editingItem?.suggested_locations)
                              ? editingItem.suggested_locations
                              : typeof editingItem?.suggested_locations === "string" && editingItem?.suggested_locations
                              ? (editingItem.suggested_locations as string).split(",").map((l: string) => l.trim()).filter(Boolean)
                              : [];
                            if (!currentLocs.includes(newLoc)) {
                              setEditingItem({
                                id: editingItem?.id || "",
                                title: editingItem?.title || "",
                                file_link: editingItem?.file_link || "",
                                aspect_ratio: editingItem?.aspect_ratio || "16:9",
                                dimensions: editingItem?.dimensions || "",
                                tags: editingItem?.tags || [],
                                suggested_locations: [...currentLocs, newLoc],
                              });
                            }
                            e.currentTarget.value = "";
                          }
                        }}
                      />
                    </div>
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
                      File URL
                    </label>
                    <input
                      type="url"
                      disabled={true}
                      defaultValue={editingItem?.file_link || ""}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-violet-400 text-white"
                      placeholder="https://example.com/image.jpg"
                      id="edit-file_link"
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
                      tags: editingItem?.tags || [],
                      suggested_locations:
                        editingItem?.suggested_locations || [],
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
