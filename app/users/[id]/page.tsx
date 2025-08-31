"use client";
import {
  getSingleUser,
  getImagesByUserId,
  getOrdersByUserId,
  getSingleOrder,
} from "../../../services/crud";
import Image from "next/image";
import { use, useEffect, useState } from "react";
import { User } from "../../../contexts/AuthContext";
import Layout from "@/components/Layout";
import OrderModal from "@/components/OrderModal";
import { Crown, Search, Package, Calendar, DollarSign } from "lucide-react";
import { getDocs, collection } from "firebase/firestore";
import { db } from "../../../services/firebase";
import { withAuth } from "@/components/withAuth";
import ImageRender from "@/components/ImageRender";

interface Props {
  params: Promise<{ id: string }>;
}

function UserProfilePage({ params }: Props) {
  const { id } = use(params);
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [images, setImages] = useState<any[]>([]);
  const [isVIP, setIsVIP] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewLoadingId, setViewLoadingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("date-desc");

  // Fetch user
  useEffect(() => {
    const func = async () => {
      const user = await getSingleUser(id);
      setUser(user as User);
      if (!user) return;

      // Fetch orders for this user
      let orders = await getOrdersByUserId(id);

      // Fetch statuses from orders-processing-queue and merge
      const queueSnapshot = await getDocs(
        collection(db, "order-processing-queue")
      );
      const queueStatuses: Record<string, string> = {};
      queueSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.orderId) {
          queueStatuses[data.orderId] = data.status || "unknown";
        }
      });
      orders = orders.map((order) => ({
        ...order,
        processingStatus: queueStatuses[order.id] || order.status || "unknown",
      }));

      setOrders(orders);

      // Fetch images for this user
      const images = await getImagesByUserId(id);
      setImages(images);

      // VIP logic: more than 10 orders
      const isVIP = orders.length > 10;
      setIsVIP(isVIP);
    };
    if (id) func();
  }, [id]);

  const handleViewOrder = async (orderId: string) => {
    setViewLoadingId(orderId);
    const orderDetails = await getSingleOrder(orderId);
    setSelectedOrder(orderDetails);
    setIsModalOpen(true);
    setViewLoadingId(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const renderImages = (images: any[], countOfImages: number) => {
    const count =countOfImages;
    console.log(images, count);

    if (count === 1) {
      // Single image
      return (
        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-gray-100">
          <Image
            src={images[0]}
            alt="Product preview"
            width={64}
            height={64}
            className="w-full h-full object-cover"
          />
        </div>
      );
    } else if (count === 2) {
      // Two overlapping images
      return (
        <div className="relative w-12 h-12 sm:w-16 sm:h-16">
          <div className="absolute w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden bg-gray-100 shadow-sm">
            <Image
              src={images[0]}
              alt="Product 1"
              width={48}
              height={48}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute top-2 left-2 w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden bg-gray-100 shadow-md border-2 border-white">
            <Image
              src={images[1]}
              alt="Product 2"
              width={48}
              height={48}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      );
    } else if (count === 3) {
      // Three images in a triangle layout
      return (
        <div className="relative w-12 h-12 sm:w-16 sm:h-16">
          <div className="absolute w-8 h-8 sm:w-10 sm:h-10 rounded-lg overflow-hidden bg-gray-100 shadow-sm">
            <Image
              src={images[0]}
              alt="Product 1"
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute top-0 right-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg overflow-hidden bg-gray-100 shadow-sm border border-white">
            <Image
              src={images[1]}
              alt="Product 2"
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-lg overflow-hidden bg-gray-100 shadow-sm border border-white">
            <Image
              src={images[2]}
              alt="Product 3"
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      );
    } else {
      // Four or more images in a 2x2 grid
      return (
        <div className="relative w-12 h-12 sm:w-16 sm:h-16">
          <div className="grid grid-cols-2 gap-0.5 w-full h-full">
            {images.slice(0, 4).map((image, index) => (
              <div
                key={index}
                className="rounded-md overflow-hidden bg-gray-100 relative"
              >
                <Image
                  src={image}
                  alt={`Product ${index + 1}`}
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                />
                {index === 3 && count > 4 && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      +{count - 4}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
          {count > 4 && (
            <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              {count}
            </div>
          )}
        </div>
      );
    }
  };
  
  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-4">
        <div className="flex items-center space-x-4 mb-6">
          <Image
            src={user?.photoURL || "/default-avatar.png"}
            alt="avatar"
            width={48}
            height={48}
            className="w-12 h-12 rounded-full"
          />
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              {user?.displayName || user?.email}
              {isVIP && (
                <span
                  className={`px-2 py-0.5 rounded text-xs font-semibold ${
                    isVIP
                      ? "bg-yellow-500/20 text-yellow-400"
                      : "bg-gray-500/20 text-gray-300"
                  }`}
                >
                  <Crown className="w-4 h-4" color="yellow" />
                </span>
              )}
            </h1>
            <p className="text-gray-400 text-sm">{user?.email}</p>
          </div>
        </div>

        {/* Controls: Search, Filter, Sort */}
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-2 md:space-y-0 mb-6">
          <input
            type="text"
            placeholder="Search by product name or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-white/10 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-48"
          >
            <option className="bg-gray-800 text-white" value="">
              All Statuses
            </option>
            <option className="bg-gray-800 text-white" value="completed">Completed</option>
            <option className="bg-gray-800 text-white" value="processing">Processing</option>
            <option className="bg-gray-800 text-white" value="queued">Queued</option>
            <option className="bg-gray-800 text-white" value="failed">Failed</option>
            <option className="bg-gray-800 text-white" value="unknown">Unknown</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-48"
          >
            <option className="bg-gray-800 text-white" value="date-desc">Date (Newest)</option>
            <option className="bg-gray-800 text-white" value="date-asc">Date (Oldest)</option>
            <option className="bg-gray-800 text-white" value="total-desc">Total (High to Low)</option>
            <option className="bg-gray-800 text-white" value="total-asc">Total (Low to High)</option>
            <option className="bg-gray-800 text-white" value="status-asc">Status (A-Z)</option>
            <option className="bg-gray-800 text-white" value="status-desc">Status (Z-A)</option>
          </select>
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-bold text-white mb-4">
            Order History ({orders.length})
          </h2>
          {/* Filter, search, and sort orders */}
          {(() => {
            let filtered = orders;
            // Search by product name or description
            if (search.trim()) {
              const s = search.trim().toLowerCase();
              filtered = filtered.filter((order) =>
                (order.products || []).some(
                  (p: any) =>
                    p.productDetails?.name?.toLowerCase().includes(s) ||
                    "" ||
                    p.productDetails?.description?.toLowerCase().includes(s) ||
                    ""
                )
              );
            }
            // Filter by status
            if (statusFilter) {
              filtered = filtered.filter(
                (order) =>
                  (order.processingStatus || order.status) === statusFilter
              );
            }
            // Sort
            filtered = [...filtered].sort((a, b) => {
              if (sortBy === "date-desc") {
                return (
                  (b.createdAt?.toDate?.() || 0) -
                  (a.createdAt?.toDate?.() || 0)
                );
              } else if (sortBy === "date-asc") {
                return (
                  (a.createdAt?.toDate?.() || 0) -
                  (b.createdAt?.toDate?.() || 0)
                );
              } else if (sortBy === "total-desc") {
                return (b.totalAmount || 0) - (a.totalAmount || 0);
              } else if (sortBy === "total-asc") {
                return (a.totalAmount || 0) - (b.totalAmount || 0);
              } else if (sortBy === "status-asc") {
                return (a.processingStatus || a.status || "").localeCompare(
                  b.processingStatus || b.status || ""
                );
              } else if (sortBy === "status-desc") {
                return (b.processingStatus || b.status || "").localeCompare(
                  a.processingStatus || a.status || ""
                );
              }
              return 0;
            });
            return filtered.length === 0 ? (
              <p className="text-gray-400 text-sm">No orders found.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((order: any) => (
                  <div
                    key={order.id}
                    className="bg-white/5 rounded-lg p-3 shadow-sm border border-white/10 min-h-[180px] flex flex-col justify-between"
                  >
                    {/* Order Header */}
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-white font-semibold text-xs">
                        Order
                        {/* #{order.orderId || order.id} */}
                      </h3>
                      <span
                        className={`px-2 py-0.5 text-[10px] rounded-full ${
                          order.processingStatus === "completed"
                            ? "bg-green-500/20 text-green-400"
                            : order.processingStatus === "processing"
                            ? "bg-orange-500/20 text-orange-400"
                            : order.processingStatus === "queued"
                            ? "bg-blue-500/20 text-blue-400"
                            : order.processingStatus === "failed"
                            ? "bg-red-500/20 text-red-400"
                            : "bg-gray-500/20 text-gray-400"
                        }`}
                      >
                        {order.processingStatus}
                      </span>
                    </div>

                    <div className="">
                      {renderImages(order.products.map((product: any) => product?.productDetails?.imageUrl || "/images/dummy_image.png" ), order.products.length)}
                    </div>
                    {/* Order Details */}
                    <div className="space-y-1 mb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-gray-400 text-xs">
                          <DollarSign className="w-3 h-3" />
                          <span>Total</span>
                        </div>
                        <span className="text-white font-semibold text-sm">
                          ${order.totalAmount?.toFixed(2) ?? "0.00"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-gray-400 text-xs">
                          <Calendar className="w-3 h-3" />
                          <span>Date</span>
                        </div>
                        <span className="text-gray-300 text-xs">
                          {order.createdAt?.toDate
                            ? new Date(
                                order.createdAt.toDate()
                              ).toLocaleDateString()
                            : "Unknown"}
                        </span>
                      </div>
                    </div>

                    {/* View Button */}
                    <div className="flex justify-center">
                      <button
                        onClick={() => handleViewOrder(order.id)}
                        className={`border border-blue-600 text-blue-600 ${viewLoadingId === order.id ?'':'hover:bg-blue-600 hover:text-white'} text-xs font-medium py-1 px-4 rounded-full transition-colors flex items-center gap-1 shadow-sm ${
                          viewLoadingId === order.id
                            ? "opacity-70 cursor-not-allowed"
                            : ""
                        }`}
                        disabled={viewLoadingId === order.id}
                      >
                        {viewLoadingId === order.id ? (
                          <span className="animate-spin inline-block w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></span>
                        ) : (
                          <Search className="w-4 h-4" />
                        )}
                        {viewLoadingId === order.id
                          ? "Loading..."
                          : "View Details"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>

        <div>
          <h2 className="text-lg font-bold text-white mb-2">
            Generated Images ({images.length})
          </h2>
          {images.length === 0 ? (
            <p className="text-gray-400 text-sm">No images found.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {images.map((img: any) => (
                <div
                  key={img.id}
                  className="bg-white/5 rounded p-2 flex flex-col items-center"
                >
                  <ImageRender
                    containerClassName="w-full h-24"
                    alt={img.description || "Generated Image"}
                    width={100}
                    height={100}
                    className="rounded mb-2 object-cover w-full h-24"
                    url={img.imageUrl || "/default-image.png"}
                  />
                  {/* <Image
                    src={img.imageUrl || "/default-image.png"}
                    alt="generated"
                    width={100}
                    height={100}
                    className="rounded mb-2 object-cover w-full h-24"
                  /> */}
                  <p className="text-xs text-gray-300 truncate w-full text-center">
                    {img.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order Modal */}
        <OrderModal
          order={selectedOrder}
          user={user}
          isOpen={isModalOpen}
          onClose={closeModal}
        />
      </div>
    </Layout>
  );
}


export default withAuth(UserProfilePage);