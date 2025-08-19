"use client";
import { X, Package, User, MapPin, Calendar, DollarSign } from "lucide-react";
import Image from "next/image";
import moment from "moment";

interface OrderModalProps {
  order: any;
  user: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function OrderModal({ order, user, isOpen, onClose }: OrderModalProps) {
  if (!isOpen || !order) return null;

  const formatDate = (date: any) => {
    if (date?.toDate) {
      return new Date(date.toDate()).toLocaleDateString();
    }
    return "Unknown";
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Order Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Order Header */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Created on {moment(order.createdAt.toDate()).format("MMMM D, YYYY")}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-white">
                ${order.totalAmount?.toFixed(2) ?? "0.00"}
              </p>
              <span className={`px-3 py-1 text-xs rounded-full ${
                order.status === 'completed' 
                  ? 'bg-green-500/20 text-green-400'
                  : order.status === 'processing'
                  ? 'bg-orange-500/20 text-orange-400'
                  : 'bg-gray-500/20 text-gray-400'
              }`}>
                {order.status}
              </span>
            </div>
          </div>

          {/* User Information */}
          <div className="bg-white/5 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <Image src={user?.photoURL || ""} alt="User" width={20} height={20} className="rounded-full" />
              <h4 className="text-white font-semibold">Customer Information</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-400 text-sm">Name</p>
                <p className="text-white">{user?.displayName || user?.email || "N/A"}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Email</p>
                <p className="text-white">{user?.email || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Shipping Information */}
          {order.shippingAddress && (
            <div className="bg-white/5 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <MapPin className="w-5 h-5 text-green-400" />
                <h4 className="text-white font-semibold">Shipping Address</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">Name</p>
                  <p className="text-white">{order.shippingAddress.name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">City</p>
                  <p className="text-white">{order.shippingAddress.city || "N/A"}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Country</p>
                  <p className="text-white">{order.shippingAddress.country || "N/A"}</p>
                </div>
              </div>
            </div>
          )}

          {/* Products */}
          <div className="bg-white/5 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-4">
              <Package className="w-5 h-5 text-purple-400" />
              <h4 className="text-white font-semibold">Products ({order.products?.length || 0})</h4>
            </div>
            
            {order.products && order.products.length > 0 ? (
              <div className="space-y-4">
                {order.products.map((product: any, index: number) => (
                  <div key={index} className="flex items-center gap-4 p-3 bg-white/5 rounded-lg">
                    {product.productDetails?.imageUrl ? (
                      <Image
                        src={product.productDetails.imageUrl}
                        alt={product.productDetails.name || "Product"}
                        width={60}
                        height={60}
                        className="rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-15 h-15 bg-gray-700 rounded-lg flex items-center justify-center">
                        <Package className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <h5 className="text-white font-medium">
                        {product.productDetails?.name || `Product ${index + 1}`}
                      </h5>
                      <p className="text-gray-400 text-sm">
                        Quantity: {product.quantity || 1}
                      </p>
                      {product.productDetails?.price && (
                        <p className="text-green-400 text-sm">
                          ${product.productDetails.price.toFixed(2)} each
                        </p>
                      )}
                    </div>
                    
                    <div className="text-right">
                      <p className="text-white font-semibold">
                        ${((product.productDetails?.price || 0) * (product.quantity || 1)).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">No products found in this order.</p>
            )}
          </div>

          {/* Order Summary */}
          <div className="bg-white/5 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <DollarSign className="w-5 h-5 text-yellow-400" />
              <h4 className="text-white font-semibold">Order Summary</h4>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Total Amount</span>
              <span className="text-xl font-bold text-white">
                ${order.totalAmount?.toFixed(2) ?? "0.00"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 