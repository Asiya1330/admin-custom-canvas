"use client";
import Layout from "../../components/Layout";
import DataTable from "../../components/DataTable";
import { useState, useEffect, useCallback } from "react";
import {
  getHomeImages,
  addDocument,
  updateDocument,
  uploadFileToFirebaseStorage,
  deleteDocument,
} from "../../services/crud";
import Image from "next/image";
import { withAuth } from "../../components/withAuth";
import Loader from "../../components/Loader";
import ImageRender from "@/components/ImageRender";
import { Upload } from "lucide-react";
import { toast } from "react-hot-toast";
import { getAspectRatio } from "@/utils/helper-functions";
import { Camera } from "lucide-react";

interface HomeImage {
  id: string | undefined;
  title: string | undefined;
  file_link: string | undefined;
  aspect_ratio: string | undefined;
  dimensions: string | undefined;
  tags: string[] | undefined;
  suggested_locations: string[] | undefined;
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingItem, setDeletingItem] = useState<HomeImage | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showUploadIconAboveImage, setShowUploadIconAboveImage] =
    useState(false);

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

  const handleImageMouseOver = useCallback(() => {
    setShowUploadIconAboveImage(true);
  }, []);

  const handleImageMouseLeave = useCallback(() => {
    setShowUploadIconAboveImage(false);
  }, []);

  const handleDelete = async () => {
    try {
      if (!deletingItem || !deletingItem.id) return;
      setDeleting(true);
      await deleteDocument("home-images", deletingItem?.id);
      setHomeImages(homeImages.filter((img) => img.id !== deletingItem?.id));
    } catch (error) {
      console.error("Error deleting home image:", error);
      toast.error("Error deleting home image");
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
      setDeletingItem(null);
    }
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
    if (!editingItem || !editingItem.id) return;
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
      // TODO: only update file if it is changed
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

  const showDeleteModalHandler = (show: boolean, item: HomeImage | null) => {
    setShowDeleteModal(show);
    setDeletingItem(item || deletingItem);
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
            setShowDeleteModal(false);
            setMode("edit");
            setEditingItem(item);
            setShowModal(true);
          }}
          onDelete={(item: HomeImage) => showDeleteModalHandler(true, item)}
          onCreate={() => {
            setShowDeleteModal(false);
            setMode("create");
            setEditingItem(null);
            setShowModal(true);
          }}
          disabledDelete={false}
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
                  <div>
                    <div className="flex items-center gap-2  rounded-lg flex-col">
                      <input
                        type="file"
                        className="hidden"
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
                          if (
                            !allowedExtensions.includes(
                              file?.type?.split("/")[1]
                            )
                          ) {
                            console.log("not allowed");
                            return toast.error(
                              "Please upload a valid image file. Allowed extensions: " +
                                allowedExtensions.join(", ")
                            );
                          }

                          const img = new window.Image();
                          img.src = URL.createObjectURL(file);
                          img.onload = () => {
                            const widthOfImageInPx = img.naturalWidth;
                            const heightOfImageInPx = img.naturalHeight;
                            const aspectRatio = getAspectRatio(
                              widthOfImageInPx,
                              heightOfImageInPx
                            );
                            setEditingItem({
                              id: editingItem?.id ?? "",
                              title: editingItem?.title ?? "",
                              aspect_ratio: aspectRatio,
                              dimensions: `${widthOfImageInPx}x${heightOfImageInPx}`,
                              tags: editingItem?.tags ?? [],
                              suggested_locations:
                                editingItem?.suggested_locations ?? [],
                              file_link: URL.createObjectURL(file),
                            });
                          };
                          setFile(file);
                        }}
                      />
                      <label
                        htmlFor="edit-file_link"
                        className="cursor-pointer relative group"
                        onMouseEnter={() => setShowUploadIconAboveImage(true)}
                        onMouseLeave={() => setShowUploadIconAboveImage(false)}
                      >
                        {/* Overlay that appears on hover */}
                        {showUploadIconAboveImage && editingItem?.file_link && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer z-10 rounded-lg">
                            <Camera className="w-6 h-6 text-white" />
                          </div>
                        )}

                        {editingItem?.file_link ? (
                          <Image
                            src={editingItem?.file_link}
                            alt="Uploaded Image"
                            width={200}
                            height={200}
                            className="rounded-lg object-cover max-w-[100px] max-h-[100px] w-20 h-20 border border-white/10"
                          />
                        ) : (
                          <div className="w-32 h-32 border-2 border-dashed border-gray-400 rounded-lg flex items-center justify-center">
                            <Upload className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm mb-2">
                      Aspect Ratio
                    </label>
                    <input
                      type="text"
                      value={editingItem?.aspect_ratio || ""}
                      className="::placeholder:text-xs w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-violet-400 text-white text-xs"
                      placeholder="e.g., 16:9, 4:3"
                      id="edit-aspect_ratio"
                      onChange={(e) => {
                        setEditingItem({
                          id: editingItem?.id ?? "",
                          suggested_locations:
                            editingItem?.suggested_locations ?? [],
                          title: editingItem?.title ?? "",
                          file_link: editingItem?.file_link ?? "",
                          dimensions: editingItem?.dimensions ?? "",
                          tags: editingItem?.tags ?? [],
                          aspect_ratio: e.target.value,
                        });
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm mb-2">
                      Dimensions
                    </label>
                    <input
                      type="text"
                      value={editingItem?.dimensions || ""}
                      className="::placeholder:text-xs w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-violet-400 text-white text-xs"
                      placeholder="e.g., 1920x1080"
                      id="edit-dimensions"
                      onChange={(e) => {
                        setEditingItem({
                          id: editingItem?.id ?? "",
                          suggested_locations:
                            editingItem?.suggested_locations ?? [],
                          title: editingItem?.title ?? "",
                          file_link: editingItem?.file_link ?? "",
                          dimensions: e.target.value,
                          tags: editingItem?.tags ?? [],
                          aspect_ratio: editingItem?.aspect_ratio ?? "",
                        });
                      }}
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

        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 ">
            <div className="flex glass-effect rounded-2xl p-6 max-w-2xl max-h-[90vh] overflow-y-auto flex-col gap-4 bg-slate-900">
              <h2 className="text-xl font-bold text-white ">
                Delete Home Image
              </h2>
              <p className="text-gray-300 mb-4">
                Are you sure you want to delete this home image?
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => showDeleteModalHandler(false, null)}
                  className="flex-1 px-4 py-2 text-xs bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className={`flex-1 px-4 ${
                    deleting ? "opacity-50 cursor-not-allowed " : ""
                  } py-2 text-xs bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors`}
                >
                  {deleting ? <Loader size={4} /> : "Delete"}
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
