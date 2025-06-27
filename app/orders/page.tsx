'use client'
import Layout from '../../components/Layout'
import DataTable from '../../components/DataTable'
import { useEffect, useState } from 'react'
import { getOrders, deleteDocument } from '../../services/crud'

interface Order {
    orderId: string;
    userId: string;
    totalAmount: number;
    paymentStatus: string;
    status: string;
    createdAt: any;
    shippingAddress: {
        name: string;
        city: string;
        country: string;
    };
}

interface Column {
    key: string;
    label: string;
    render?: (value: any) => React.ReactNode | string;
}

const columns: Column[] = [
    { key: 'orderId', label: 'Order ID' },
    {
        key: 'totalAmount',
        label: 'Total',
        render: (value: number) => `$${value.toFixed(2)}`
    },
    {
        key: 'paymentStatus',
        label: 'Payment',
        render: (value: string) => (
            <span className={`px-2 py-1 text-xs rounded-full ${
                value === 'completed' 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-yellow-500/20 text-yellow-400'
            }`}>
                {value}
            </span>
        )
    },
    {
        key: 'status',
        label: 'Status',
        render: (value: string) => (
            <span className={`px-2 py-1 text-xs rounded-full ${
                value === 'shipped' 
                    ? 'bg-blue-500/20 text-blue-400' 
                    : value === 'processing'
                    ? 'bg-orange-500/20 text-orange-400'
                    : 'bg-gray-500/20 text-gray-400'
            }`}>
                {value}
            </span>
        )
    },
    {
        key: 'shippingAddress',
        label: 'Customer',
        render: (value: { name: string }) => value.name
    },
    {
        key: 'createdAt',
        label: 'Date',
        render: (value: any) => value?.toDate ? new Date(value.toDate()).toLocaleDateString() : 'Unknown'
    }
];

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const ordersData = await getOrders() as Order[];
        setOrders(ordersData);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleEdit = async (order: Order) => {
    try {
      console.log('Edit order:', order);
    } catch (error) {
      console.error('Error editing order:', error);
    }
  };

  const handleDelete = async (order: Order) => {
    try {
      await deleteDocument('orders', order.orderId);
      setOrders(orders.filter(o => o.orderId !== order.orderId));
    } catch (error) {
      console.error('Error deleting order:', error);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-4 md:p-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-white">Loading orders...</div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-4 md:p-8">
        <DataTable
          data={orders.map(order => ({ ...order, id: order.orderId }))}
          columns={columns}
          title="Order Management"
          editable={true}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </Layout>
  )
}
