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

  const handleEdit = (item: Artist) => {
    setEditingItem(item);
    setShowModal(true);
  };

  const handleDelete = async (item: Artist) => {
    try {
      await deleteDocument("artists", item.id);
      setArtists(artists.filter((artist) => artist.id !== item.id));
    } catch (error) {
      console.error("Error deleting artist:", error);
    }
  };

  if (loading) {
    return (
      <Layout>
        <Loader />
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
          onEdit={handleEdit}
          onDelete={handleDelete}
          onCreate={() => setShowModal(true)}
        />

        <EditModal
          open={showModal}
          onClose={() => {
            setShowModal(false);
            setEditingItem(null);
          }}
          title={editingItem ? "Edit Artist" : "Add New Artist"}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm mb-2">
                Artist Name
              </label>
              <input
                type="text"
                defaultValue={editingItem?.name || ""}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-violet-400 text-white"
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
                defaultValue={editingItem?.artist_name || ""}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-violet-400 text-white"
                placeholder="Enter username"
                id="edit-artist_name"
              />
            </div>
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
                            name: editingItem?.name ?? "",
                            artist_name: editingItem?.artist_name ?? "",
                            tags: newTags,
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
                        tags: [...currentTags, newTag].join(", "),
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
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
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
                  tags: (editingItem?.tags || "")
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean)
                    .join(", "),
                };

                if (editingItem) {
                  try {
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
                } else {
                  // Create new artist
                  try {
                    const newId = await addDocument("artists", formData);
                    const newArtist = { id: newId, ...formData };
                    setArtists([...artists, newArtist]);
                    setShowModal(false);
                  } catch (error) {
                    console.error("Error creating artist:", error);
                  }
                }
              }}
              className="px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors"
            >
              {editingItem ? "Update" : "Create"}
            </button>
          </div>
        </EditModal>
      </div>
    </Layout>
  );
}

export default withAuth(Artists);
