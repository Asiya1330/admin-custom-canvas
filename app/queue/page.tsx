'use client'
import Layout from "../../components/Layout";
import { Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { getQueueItems } from "../../services/crud";

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
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
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

export default function Queue() {
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQueueItems = async () => {
      try {
        const items = await getQueueItems();
        setQueueItems(items);
      } catch (error) {
        console.error('Error fetching queue items:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQueueItems();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="p-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-white">Loading queue...</div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-8">
        <div className="mb-8 animate-fadeInUp">
          <h1 className="text-3xl font-bold text-white mb-2">Processing Queue</h1>
          <p className="text-gray-400">Monitor and manage order processing status.</p>
        </div>

        <div className="space-y-4">
          {queueItems.length > 0 ? (
            queueItems.map((item) => (
              <div
                key={item.id}
                className="glass-effect rounded-2xl p-6 hover:scale-[1.02] transition-transform duration-300"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-violet-400 to-pink-400 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">#{item.orderId.slice(-8)}</span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-white truncate">
                        Order: {item.orderId}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(item.priority)}`}>
                          {item.priority}
                        </span>
                        {getStatusIcon(item.status)}
                      </div>
                    </div>
                    
                    <p className="text-gray-400 text-sm mb-3">
                      Created: {item.createdAt?.toDate ? new Date(item.createdAt.toDate()).toLocaleString() : 'Unknown'}
                      {item.processedAt && (
                        <span className="ml-4">
                          Processed: {item.processedAt?.toDate ? new Date(item.processedAt.toDate()).toLocaleString() : 'Unknown'}
                        </span>
                      )}
                    </p>
                    
                    <div className={`px-3 py-2 rounded-lg ${getStatusColor(item.status)} text-sm mb-3`}>
                      Status: {item.status.toUpperCase()}
                    </div>

                    {item.processingData && (
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-white/5 rounded-lg">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-sm font-medium text-white">Lumaprint</span>
                              {getStatusIcon(item.processingData.lumaprintStatus)}
                            </div>
                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(item.processingData.lumaprintStatus)}`}>
                              {item.processingData.lumaprintStatus}
                            </span>
                            {item.processingData.lumaprintError && (
                              <p className="text-red-400 text-xs mt-1">{item.processingData.lumaprintError}</p>
                            )}
                          </div>
                          
                          <div className="p-3 bg-white/5 rounded-lg">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-sm font-medium text-white">Topaz</span>
                              {getStatusIcon(item.processingData.topazStatus)}
                            </div>
                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(item.processingData.topazStatus)}`}>
                              {item.processingData.topazStatus}
                            </span>
                            {item.processingData.topazError && (
                              <p className="text-red-400 text-xs mt-1">{item.processingData.topazError}</p>
                            )}
                          </div>
                        </div>
                        
                        {item.processingData.queuedAt && (
                          <p className="text-gray-400 text-xs">
                            Queued: {item.processingData.queuedAt?.toDate ? new Date(item.processingData.queuedAt.toDate()).toLocaleString() : 'Unknown'}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400">No queue items found</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
