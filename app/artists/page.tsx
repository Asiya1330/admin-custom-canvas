"use client";

import Layout from "../../components/Layout";
import DataTable from "../../components/DataTable";
import { useState, useEffect } from "react";
import {
  getArtists,
  addDocument,
  updateDocument,
  deleteDocument,
} from "../../services/crud";
import EditModal from "../../components/EditModal";
import { withAuth } from "../../components/withAuth";
import Loader from "../../components/Loader";

interface Artist {
  id: string;
  artist_name: string;
  name: string;
  tags: string;
}

interface Column {
  key: string;
  label: string;
  render?: (value: any) => React.ReactNode | string;
}

const columns: Column[] = [
  { key: "name", label: "Artist Name" },
  { key: "artist_name", label: "Username" },
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
];

function Artists() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"edit" | "create">("create");

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const artistsData = await getArtists();
        setArtists(artistsData);
      } catch (error) {
        console.error("Error fetching artists:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArtists();
  }, []);

  const handleCreate = async (formData: any) => {
    try {
      setLoading(true);
      const newId = await addDocument("artists", {
        name: formData.name,
        artist_name: formData.artist_name,
        tags: formData.tags,
      });
      const newArtist = { id: newId, ...formData };
      setArtists([...artists, newArtist]);
      setShowModal(false);
    } catch (error) {
      console.error("Error creating artist:", error);
    } finally {
      setLoading(false);
    }
  };

  const tags = (mode: "edit" | "create"): string => {
    if (mode === "edit") {
      return editingItem?.tags || "";
    }
    return editingItem?.tags || "";
  };

  const handleDelete = async (item: Artist) => {
   console.log(item, "delete not implimented");
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
      <div className=" ">
        <DataTable
          data={artists}
          columns={columns}
          title="Artists Management"
          editable={true}
          onEdit={(item: Artist) => {
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

        <EditModal
          open={showModal}
          onClose={() => {
            setShowModal(false);
            setEditingItem(null);
          }}
          title={mode === "edit" ? "Edit Artist" : "Add New Artist"}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm mb-2">
                Artist Name
              </label>
              <input
                type="text"
                defaultValue={mode === "edit" ? editingItem?.name || "" : ""}
                onChange={(e) => {
                  setEditingItem({
                    id: editingItem?.id ?? "",
                    name: e.target.value,
                    artist_name: editingItem?.artist_name ?? "",
                    tags: editingItem?.tags ?? "",
                  });
                }}
                className="::placeholder:text-xs w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-violet-400 text-white text-xs"
                placeholder="Enter artist name"
                id="edit-name"
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm mb-2">
                Username
              </label>
              <input
                type="text"
                defaultValue={
                  mode === "edit" ? editingItem?.artist_name || "" : ""
                }
                onChange={(e) => {
                  setEditingItem({
                    id: editingItem?.id ?? "",
                    name: editingItem?.name ?? "",
                    artist_name: e.target.value,
                    tags: editingItem?.tags ?? "",
                  });
                }}
                className="::placeholder:text-xs w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-violet-400 text-white text-xs"
                placeholder="Enter username"
                id="edit-artist_name"
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm mb-2">
                Tags (comma separated)
              </label>
              <div className="flex flex-wrap gap-2 bg-white/5 border border-white/10 rounded-lg px-2 py-2">
                {tags(mode)
                  .split(",")
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
                          const newTags = arr.filter(
                            (_: string, i: number) => i !== idx
                          );

                          setEditingItem({
                            id: editingItem?.id ?? "",
                            name: editingItem?.name ?? "",
                            artist_name: editingItem?.artist_name ?? "",
                            tags: newTags.join(","),
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
                        name: editingItem?.name ?? "",
                        artist_name: editingItem?.artist_name ?? "",
                        tags: [...currentTags, newTag].join(","),
                      });
                      e.currentTarget.value = "";
                    }
                  }}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => {
                setShowModal(false);
                setEditingItem(null);
              }}
              className="px-4 py-2 text-xs bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              disabled={loading}
              onClick={async () => {
                const formData = {
                  name:
                    (document.getElementById("edit-name") as HTMLInputElement)
                      ?.value || "",
                  artist_name:
                    (
                      document.getElementById(
                        "edit-artist_name"
                      ) as HTMLInputElement
                    )?.value || "",
                  tags: tags(mode),
                };

                if (mode === "edit" && editingItem) {
                  try {
                    setLoading(true);
                    await updateDocument("artists", editingItem.id, formData);
                    setArtists(
                      artists.map((artist) =>
                        artist.id === editingItem.id
                          ? { ...artist, ...formData }
                          : artist
                      )
                    );
                    setShowModal(false);
                    setEditingItem(null);
                  } catch (error) {
                    console.error("Error updating artist:", error);
                  }
                } else if (mode === "create" && editingItem) {
                 handleCreate(formData)
                }
              }}
              className={`px-4 py-2 text-xs bg-violet-600 text-white rounded-md hover:bg-violet-700 transition-colors ${loading ? "opacity-50 cursor-not-allowed " : ""}`}
            >
              {mode === "edit" ? loading ? <Loader size={4} /> : "Update" : loading ? <Loader size={4} /> : "Create"}
            </button>
          </div>
        </EditModal>
      </div>
    </Layout>
  );
}

export default withAuth(Artists);
