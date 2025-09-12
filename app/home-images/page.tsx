"use client";
import Layout from "../../components/Layout";
import DataTable from "../../components/DataTable";
import { useState, useEffect } from "react";
import {
  getHomeImages,
  addDocument,
  updateDocument,
  uploadFileToFirebaseStorage,
} from "../../services/crud";
import Image from "next/image";
import { withAuth } from "../../components/withAuth";
import Loader from "../../components/Loader";
import ImageRender from "@/components/ImageRender";
import { Upload } from "lucide-react";
import { toast } from "react-hot-toast";

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
  width?: string;
}

const columns: Column[] = [
  {
    key: "file_link",
    label: "Preview",
    render: (value: string) => (
      // if value is empty string pass dummy image 1BkfbQKBEvDvXVcSx9fk1_fCiPO1ULBlK
      //https://drive.google.com/uc?export=view&id=FILE_ID

      <ImageRender
        containerClassName="w-16"
        width={64}
        height={64}
        className="w-16 h-16 rounded-lg object-cover"
        url={value}
        // !!value
        //   ? `https://drive.google.com/uc?export=view&id=${
        //       value.split("/")[5]
        //     }`
        //   : "/images/dummy_image.png"
      />
    ),
  },
  { key: "title", label: "Title", width: "200px" },
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

function HomeImages() {
  const [homeImages, setHomeImages] = useState<HomeImage[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<HomeImage | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

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

  const handleDelete = async (item: HomeImage) => {
    console.log(item, "delete not implimented");
  };

  const handleCreate = async (formData: any) => {
    try {
      setUploading(true);
      if (
        !formData.title ||
        !formData.aspect_ratio ||
        !formData.dimensions ||
        !formData.tags.length ||
        !formData.suggested_locations.length ||
        !file
      ) {
        return toast.error("Please fill all the fields");
      }

        const fileLink = await uploadFileToFirebaseStorage(file);
        formData.file_link = fileLink;
        const newId = await addDocument("home-images", {
          title: formData.title,
          file_link: fileLink,
          aspect_ratio: formData.aspect_ratio,
          dimensions: formData.dimensions,
          tags: formData.tags,
          suggested_locations: formData.suggested_locations,
        });
        const newImage = { id: newId, ...{ ...formData, file_link: fileLink } };
        setHomeImages([...homeImages, newImage]);
      setShowModal(false);
    } catch (error) {
      console.error("Error creating home image:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleUpdate = async (formData: any) => {
    if (!editingItem) return;
    try {
      setUploading(true);
      if (
        !formData.title ||
        !formData.aspect_ratio ||
        !formData.dimensions ||
        !formData.tags.length ||
        !formData.suggested_locations.length ||
        !file
      ) {
        return toast.error("Please fill all the fields");
      }
      
        const fileLink = await uploadFileToFirebaseStorage(file);

        await updateDocument("home-images", editingItem.id, {
          ...formData,
          file_link: fileLink,
        });
        setHomeImages(
          homeImages.map((img) =>
            img.id === editingItem.id
              ? { ...img, ...{ ...formData, file_link: fileLink } }
              : img
          )
        );
      
      setShowModal(false);
      setEditingItem(null);
    } catch (error) {
      console.error("Error updating home image:", error);
    } finally {
      setUploading(false);
    }
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
          data={homeImages}
          columns={columns}
          title="Home Images Management"
          editable={true}
          onEdit={(item: HomeImage) => {
            setMode("edit");
            setEditingItem(item);
            setShowModal(true);
          }}
          onDelete={handleDelete}
          onCreate={() => {
            setMode("create");
            setEditingItem(null);
            setShowModal(true);
          }}
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
                      className="::placeholder:text-xs w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-violet-400 text-white text-xs"
                      placeholder="Enter image title"
                      id="edit-title"
                    />
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-gray-300 text-sm mb-2">
                      Tags (comma separated)
                    </label>
                    <div className="flex flex-wrap gap-2 bg-white/5 border border-white/10 rounded-lg px-2 py-2">
                      {(typeof editingItem?.tags === "string"
                        ? editingItem.tags
                        : Array.isArray(editingItem?.tags)
                        ? (editingItem.tags as string[]).join(",")
                        : ""
                      )
                        .split(",")
                        .map((t: string) => t.trim())
                        .filter((t: string) => Boolean(t))
                        .map((tag: string, idx: number, arr: string[]) => (
                          <span
                            key={idx}
                            className="flex items-center px-2 py-1 text-xs bg-violet-500/20 text-violet-400 rounded-full"
                          >
                            {tag}
                            <button
                              type="button"
                              className="ml-1 text-violet-400 hover:text-red-400"
                              onClick={() => {
                                const newTags = arr
                                  .filter((_: string, i: number) => i !== idx)
                                  .join(", ");
                                setEditingItem({
                                  id: editingItem?.id ?? "",
                                  title: editingItem?.title ?? "",
                                  file_link: editingItem?.file_link ?? "",
                                  aspect_ratio: editingItem?.aspect_ratio ?? "",
                                  dimensions: editingItem?.dimensions ?? "",
                                  tags: newTags
                                    .split(",")
                                    .map((t: string) => t.trim())
                                    .filter((t: string) => Boolean(t)),
                                  suggested_locations:
                                    editingItem?.suggested_locations ?? [],
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
                            const currentTags = (
                              typeof editingItem?.tags === "string"
                                ? editingItem.tags
                                : Array.isArray(editingItem?.tags)
                                ? (editingItem.tags as string[]).join(",")
                                : ""
                            )
                              .split(",")
                              .map((t: string) => t.trim())
                              .filter((t: string) => Boolean(t));
                            setEditingItem({
                              id: editingItem?.id ?? "",
                              title: editingItem?.title ?? "",
                              file_link: editingItem?.file_link ?? "",
                              aspect_ratio: editingItem?.aspect_ratio ?? "",
                              dimensions: editingItem?.dimensions ?? "",
                              tags: [...currentTags, newTag],
                              suggested_locations:
                                editingItem?.suggested_locations ?? [],
                            });
                            e.currentTarget.value = "";
                          }
                        }}
                      />
                    </div>
                  </div>

                  {/* Suggested Locations */}
                  <div>
                    <label className="block text-gray-300 text-sm mb-2">
                      Suggested Locations (comma separated)
                    </label>
                    <div className="flex flex-wrap gap-2 bg-white/5 border border-white/10 rounded-lg px-2 py-2">
                      {(typeof editingItem?.suggested_locations === "string"
                        ? editingItem.suggested_locations
                        : Array.isArray(editingItem?.suggested_locations)
                        ? (editingItem.suggested_locations as string[]).join(
                            ","
                          )
                        : ""
                      )
                        .split(",")
                        .map((l: string) => l.trim())
                        .filter((l: string) => Boolean(l))
                        .map((location: string, idx: number, arr: string[]) => (
                          <span
                            key={idx}
                            className="flex items-center px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded-full"
                          >
                            {location}
                            <button
                              type="button"
                              className="ml-1 text-blue-400 hover:text-red-400"
                              onClick={() => {
                                const newLocations = arr
                                  .filter((_: string, i: number) => i !== idx)
                                  .join(", ");
                                setEditingItem({
                                  id: editingItem?.id ?? "",
                                  title: editingItem?.title ?? "",
                                  file_link: editingItem?.file_link ?? "",
                                  aspect_ratio: editingItem?.aspect_ratio ?? "",
                                  dimensions: editingItem?.dimensions ?? "",
                                  tags: editingItem?.tags ?? [],
                                  suggested_locations: newLocations
                                    .split(",")
                                    .map((l: string) => l.trim())
                                    .filter((l: string) => Boolean(l)),
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
                            const newLocation = e.currentTarget.value.trim();
                            const currentLocations = (
                              typeof editingItem?.suggested_locations ===
                              "string"
                                ? editingItem.suggested_locations
                                : Array.isArray(
                                    editingItem?.suggested_locations
                                  )
                                ? (
                                    editingItem.suggested_locations as string[]
                                  ).join(",")
                                : ""
                            )
                              .split(",")
                              .map((l: string) => l.trim())
                              .filter((l: string) => Boolean(l));
                            setEditingItem({
                              id: editingItem?.id ?? "",
                              title: editingItem?.title ?? "",
                              file_link: editingItem?.file_link ?? "",
                              aspect_ratio: editingItem?.aspect_ratio ?? "",
                              dimensions: editingItem?.dimensions ?? "",
                              tags: editingItem?.tags ?? [],
                              suggested_locations: [
                                ...currentLocations,
                                newLocation,
                              ],
                            });
                            e.currentTarget.value = "";
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* <div>
                    <label className="block text-gray-300 text-sm mb-2">
                      File Link
                    </label>
                    <input
                      type="text"
                      defaultValue={editingItem?.file_link || ""}
                      className="::placeholder:text-xs w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-violet-400 text-white text-xs"
                      placeholder="Enter file link"
                      id="edit-file_link"
                    />
                  </div> */}

                  <div>
                    <div className="flex items-center gap-2 border border-white/10 rounded-lg px-2 py-2 flex-col">
                      <h3>Upload Image</h3>
                      <input
                        type="file"
                        className="hidden ::placeholder:text-xs w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-violet-400 text-white text-xs"
                        placeholder="Upload image"
                        id="edit-file_link"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          const allowedExtensions = [
                            "jpg",
                            "jpeg",
                            "png",
                            "webp",
                          ];
                          console.log(file);
                          if (!file) {
                            return toast.error(
                              "Please upload a valid image file"
                            );
                          }
                          console.log(file?.name?.split(".")[1]);
                          if (
                            !allowedExtensions.includes(
                              file?.name?.split(".")[1] || ""
                            )
                          ) {
                            console.log("not allowed");
                            return toast.error(
                              "Please upload a valid image file. Allowed extensions: " +
                                allowedExtensions.join(", ")
                            );
                          }

                          setEditingItem({
                            id: editingItem?.id ?? "",
                            title: editingItem?.title ?? "",
                            aspect_ratio: editingItem?.aspect_ratio ?? "",
                            dimensions: editingItem?.dimensions ?? "",
                            tags: editingItem?.tags ?? [],
                            suggested_locations:
                              editingItem?.suggested_locations ?? [],
                            file_link: URL.createObjectURL(file),
                          });
                          setFile(file);
                        }}
                      />
                      <label
                        htmlFor="edit-file_link"
                        className="cursor-pointer"
                      >
                        <Upload className="w-4 h-4" />
                      </label>
                    </div>
                    {editingItem?.file_link && (
                      <Image
                        src={editingItem?.file_link}
                        alt="Uploaded Image"
                        width={100}
                        height={100}
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm mb-2">
                      Aspect Ratio
                    </label>
                    <input
                      type="text"
                      defaultValue={editingItem?.aspect_ratio || ""}
                      className="::placeholder:text-xs w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-violet-400 text-white text-xs"
                      placeholder="e.g., 16:9, 4:3"
                      id="edit-aspect_ratio"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm mb-2">
                      Dimensions
                    </label>
                    <input
                      type="text"
                      defaultValue={editingItem?.dimensions || ""}
                      className="::placeholder:text-xs w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-violet-400 text-white text-xs"
                      placeholder="e.g., 1920x1080"
                      id="edit-dimensions"
                    />
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingItem(null);
                  }}
                  className="flex-1 px-4 py-2 text-xs bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  disabled={uploading}
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
                          ) as HTMLInputElement
                        )?.value || "",
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

                    if (editingItem && mode === "edit") {
                      await handleUpdate(formData);
                    } else if (mode === "create" && editingItem) {
                      await handleCreate(formData);
                    }
                  }}
                  className={` flex-1 px-4 py-2 text-xs bg-violet-600 text-white rounded-md hover:bg-violet-700 transition-colors ${
                    uploading ? "opacity-50 cursor-not-allowed " : ""
                  }`}
                >
                  {mode === "edit" ? (
                    uploading ? (
                      <Loader size={4} />
                    ) : (
                      "Update"
                    )
                  ) : uploading ? (
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
    </Layout>
  );
}

export default withAuth(HomeImages);
