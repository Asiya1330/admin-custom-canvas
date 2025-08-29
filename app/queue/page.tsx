"use client";
import Layout from "../../components/Layout";
import QueueModal from "../../components/QueueModal";
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  ArrowUpDown,
  Eye,
} from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import {
  getQueueItems,
  getQueueItemWithOrder,
  getSingleUser,
} from "../../services/crud";
import { withAuth } from "../../components/withAuth";
import Loader from "../../components/Loader";
import OrderModal from "@/components/OrderModal";
import { User } from "../../contexts/AuthContext";
import { notFound } from "next/navigation";

interface ProcessingData {
  status: string;
  lumaprintStatus: string;
  topazStatus: string;
  lumaprintError: string | null;
  topazError: string | null;
  completedAt: any;
  queuedAt: any;
}

interface QueueItem {
  id: string;
  orderId: string;
  status: "queued" | "processing" | "completed" | "failed" | "unknown";
  priority: "low" | "medium" | "high";
  createdAt: any;
  processedAt?: any;
  processed: boolean;
  processingData: ProcessingData | null;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "completed":
      return <CheckCircle size={16} className="text-green-400" />;
    case "success":
      return <CheckCircle size={16} className="text-green-400" />;
    case "processing":
      return <Clock size={16} className="text-yellow-400" />;
    case "failed":
      return <XCircle size={16} className="text-red-400" />;
    case "queued":
      return <Clock size={16} className="text-blue-400" />;
    default:
      return <AlertCircle size={16} className="text-gray-400" />;
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high":
      return "bg-red-500/20 text-red-400";
    case "medium":
      return "bg-yellow-500/20 text-yellow-400";
    default:
      return "bg-green-500/20 text-green-400";
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-green-500/20 text-green-400";
    case "success":
      return "bg-green-500/20 text-green-400";
    case "processing":
      return "bg-yellow-500/20 text-yellow-400";
    case "failed":
      return "bg-red-500/20 text-red-400";
    case "queued":
      return "bg-blue-500/20 text-blue-400";
    default:
      return "bg-gray-500/20 text-gray-400";
  }
};

type SortField = "createdAt" | "status" | "priority" | "orderId";
type SortDirection = "asc" | "desc";

function Queue() {
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [selectedItem, setSelectedItem] = useState<QueueItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchQueueItems = async () => {
      try {
        const items = await getQueueItems();
        setQueueItems(items);
      } catch (error) {
        console.error("Error fetching queue items:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQueueItems();
  }, []);

  // Filter and sort queue items
  const filteredAndSortedItems = useMemo(() => {
    let filtered = queueItems.filter((item) => {
      const matchesSearch = item.orderId
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;
      const matchesPriority =
        priorityFilter === "all" || item.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });

    // Sort items
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case "createdAt":
          aValue = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0);
          bValue = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0);
          break;
        case "status":
          aValue = a.status;
          bValue = b.status;
          break;
        case "priority":
          aValue = a.priority;
          bValue = b.priority;
          break;
        case "orderId":
          aValue = a.orderId;
          bValue = b.orderId;
          break;
        default:
          aValue = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0);
          bValue = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0);
      }

      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [
    queueItems,
    searchTerm,
    statusFilter,
    priorityFilter,
    sortField,
    sortDirection,
  ]);

  const handleViewDetails = async (item: QueueItem) => {
    setLoadingOrder(true);
    try {
      const itemWithOrder = await getQueueItemWithOrder(item.orderId);
      if (itemWithOrder) {
        const user = await getSingleUser(itemWithOrder.order.userId);
        setUser(user as User);
        if (!user) return;
        setSelectedItem(itemWithOrder);
        setModalOpen(true);
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
    } finally {
      setLoadingOrder(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const getStatusCount = (status: string) => {
    return queueItems.filter((item) => item.status === status).length;
  };

  const getPriorityCount = (priority: string) => {
    return queueItems.filter((item) => item.priority === priority).length;
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
        <div className="mb-8 animate-fadeInUp">
          <h1 className="text-3xl font-bold text-white mb-2">Orders Details</h1>
          <p className="text-gray-400">
            Monitor and manage order processing status.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="glass-effect rounded-xl p-4  border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Orders</p>
                <p className="text-2xl font-bold text-white">
                  {queueItems.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="glass-effect rounded-xl p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Queued</p>
                <p className="text-2xl font-bold text-blue-400">
                  {getStatusCount("queued")}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="glass-effect rounded-xl p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Processing</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {getStatusCount("processing")}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
          </div>

          <div className="glass-effect rounded-xl p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Completed</p>
                <p className="text-2xl font-bold text-green-400">
                  {getStatusCount("completed")}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="glass-effect rounded-xl mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"
                size={16}
              />
              <input
                type="text"
                placeholder="Search by Order ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-xs ::placeholder:text-xs w-full pl-10 pr-4 py-2 bg-white/10  border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs w-full px-4 py-2 bg-gray-800 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all" className="bg-gray-800 text-white">
                  All Status
                </option>
                <option value="queued" className="bg-gray-800 text-white">
                  Queued
                </option>
                <option value="processing" className="bg-gray-800 text-white">
                  Processing
                </option>
                <option value="completed" className="bg-gray-800 text-white">
                  Completed
                </option>
                <option value="failed" className="bg-gray-800 text-white">
                  Failed
                </option>
              </select>
            </div>

            {/* Sort */}
            <div className="flex gap-2">
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value as SortField)}
                className="text-xs flex-1 px-4 py-2 bg-gray-800 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="createdAt" className="bg-gray-800 text-white">
                  Created Date
                </option>
                <option value="status" className="bg-gray-800 text-white">
                  Status
                </option>
                <option value="priority" className="bg-gray-800 text-white">
                  Priority
                </option>
                <option value="orderId" className="bg-gray-800 text-white">
                  Order ID
                </option>
              </select>
              <button
                onClick={() =>
                  setSortDirection(sortDirection === "asc" ? "desc" : "asc")
                }
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors"
              >
                <ArrowUpDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-400">
            Showing {filteredAndSortedItems.length} of {queueItems.length} items
          </p>
        </div>

        {/* Queue Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedItems.length > 0 ? (
            filteredAndSortedItems.map((item) => (
              <div
                key={item.id}
                className="relative border border-white/20 glass-effect rounded-xl p-6 hover:scale-[1.02] transition-transform duration-300 cursor-pointer"
                onClick={() => handleViewDetails(item)}
              >
                <div className="mb-10">
                  {/* Card Header */}

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex gap-1">
                      <p className="text-gray-400 text-xs">Order ID:</p>
                      <p className="text-gray-400 text-xs">
                        {item.orderId.slice(-10)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(item.status)}
                    </div>
                  </div>

                  {/* Order Info */}
                  <div className="mb-4">
                    <p className="text-gray-400 text-xs">
                      Created:{" "}
                      {item.createdAt?.toDate
                        ? new Date(item.createdAt.toDate()).toLocaleDateString()
                        : "Unknown"}
                    </p>
                    {item.processedAt && (
                      <p className="text-gray-400 text-xs">
                        Processed:{" "}
                        {item.processedAt?.toDate
                          ? new Date(
                              item.processedAt.toDate()
                            ).toLocaleDateString()
                          : "Unknown"}
                      </p>
                    )}
                  </div>

                  {/* Processing Status */}
                  {item.processingData && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400 text-xs">
                          Lumaprint:
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                            item.processingData.lumaprintStatus
                          )}`}
                        >
                          {item.processingData.lumaprintStatus}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400 text-xs">Topaz:</span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                            item.processingData.topazStatus
                          )}`}
                        >
                          {item.processingData.topazStatus}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* View Details Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewDetails(item);
                  }}
                  disabled={
                    loadingOrder && item.orderId === selectedItem?.orderId
                  }
                  className="absolute bottom-0 right-0 left-0 m-2 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors disabled:opacity-50 text-xs"
                >
                  <Eye className="w-4 h-4" />
                  {loadingOrder && item.orderId === selectedItem?.orderId
                    ? "Loading..."
                    : "View Details"}
                </button>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-400">
                No queue items found matching your criteria
              </p>
            </div>
          )}
        </div>

        {/* Modal */}
        <QueueModal
          user={user}
          item={selectedItem}
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedItem(null);
            setUser(null);
          }}
        />
      </div>
    </Layout>
  );
}

export default withAuth(Queue);
