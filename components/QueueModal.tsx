'use client'

import { X, Clock, CheckCircle, XCircle, AlertCircle, Package, Calendar, DollarSign, User } from "lucide-react";
import Image from "next/image";

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
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'unknown';
  priority: 'low' | 'medium' | 'high';
  createdAt: any;
  processedAt?: any;
  processed: boolean;
  processingData: ProcessingData | null;
  order?: any; // Full order details
}

interface QueueModalProps {
  item: QueueItem | null;
  isOpen: boolean;
  onClose: () => void;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircle size={16} className="text-green-400" />;
    case 'success':
      return <CheckCircle size={16} className="text-green-400" />;
    case 'processing':
      return <Clock size={16} className="text-yellow-400" />;
    case 'failed':
      return <XCircle size={16} className="text-red-400" />;
    case 'queued':
      return <Clock size={16} className="text-blue-400" />;
    default:
      return <AlertCircle size={16} className="text-gray-400" />;
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'bg-red-500/20 text-red-400';
    case 'medium':
      return 'bg-yellow-500/20 text-yellow-400';
    default:
      return 'bg-green-500/20 text-green-400';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-500/20 text-green-400';
    case 'success':
      return 'bg-green-500/20 text-green-400';
    case 'processing':
      return 'bg-yellow-500/20 text-yellow-400';
    case 'failed':
      return 'bg-red-500/20 text-red-400';
    case 'queued':
      return 'bg-blue-500/20 text-blue-400';
    default:
      return 'bg-gray-500/20 text-gray-400';
  }
};

export default function QueueModal({ item, isOpen, onClose }: QueueModalProps) {
  if (!isOpen || !item) return null;

  const formatDate = (date: any) => {
    if (date?.toDate) {
      return new Date(date.toDate()).toLocaleString();
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
              <h3 className="text-lg font-semibold text-white">Order</h3>
              <p className="text-gray-400 text-sm">Created on {formatDate(item.createdAt)}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2 mb-2">
                <span className={`px-3 py-1 text-xs rounded-full ${getPriorityColor(item.priority)}`}>
                  {item.priority} Priority
                </span>
                {getStatusIcon(item.status)}
              </div>
              <span className={`px-3 py-1 text-xs rounded-full ${getStatusColor(item.status)}`}>
                {item.status.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Processing Status */}
          <div className="bg-white/5 rounded-xl p-4">
            <h4 className="text-white font-semibold mb-4">Processing Status</h4>
            {item.processingData ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm font-medium text-white">Lumaprint</span>
                      {getStatusIcon(item.processingData.lumaprintStatus)}
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(item.processingData.lumaprintStatus)}`}>
                      {item.processingData.lumaprintStatus}
                    </span>
                    {item.processingData.lumaprintError && (
                      <p className="text-red-400 text-xs mt-2">{item.processingData.lumaprintError}</p>
                    )}
                  </div>
                  
                  <div className="p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm font-medium text-white">Topaz</span>
                      {getStatusIcon(item.processingData.topazStatus)}
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(item.processingData.topazStatus)}`}>
                      {item.processingData.topazStatus}
                    </span>
                    {item.processingData.topazError && (
                      <p className="text-green-400 text-xs mt-2">{item.processingData.topazError}</p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-400">Queued:</span>
                    <span className="text-white">{formatDate(item.processingData.queuedAt)}</span>
                  </div>
                  {item.processingData.completedAt && (
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-gray-400">Completed:</span>
                      <span className="text-white">{formatDate(item.processingData.completedAt)}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-gray-400 text-sm">No processing data available</p>
            )}
          </div>

          {/* Order Information */}
          {item.order && (
            <>
              {/* Customer Information */}
              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <User className="w-5 h-5 text-blue-400" />
                  <h4 className="text-white font-semibold">Customer Information</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Name</p>
                    <p className="text-white">{item.order.shippingAddress?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Email</p>
                    <p className="text-white">{item.order.userEmail || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Products */}
              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-4">
                  <Package className="w-5 h-5 text-purple-400" />
                  <h4 className="text-white font-semibold">Products ({item.order.products?.length || 0})</h4>
                </div>
                
                {item.order.products && item.order.products.length > 0 ? (
                  <div className="space-y-3">
                    {item.order.products.map((product: any, index: number) => (
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
                    ${item.order.totalAmount?.toFixed(2) ?? "0.00"}
                  </span>
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
} 