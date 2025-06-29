"use client";
import {
  getSingleUser,
  getImagesByUserId,
  getOrdersByUserId,
} from "../../../services/crud";
import { notFound } from "next/navigation";
import Image from "next/image";
import { use, useEffect, useState } from "react";
import { User } from "../../../contexts/AuthContext";
import Layout from "@/components/Layout";
import { Crown } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export default function UserProfilePage({ params }: Props) {
  const { id } = use(params);
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [images, setImages] = useState<any[]>([]);
  const [isVIP, setIsVIP] = useState(false);
  // Fetch user

  useEffect(() => {
    console.log(id, "id");
    const func = async () => {
      const user = await getSingleUser(id);
      console.log(user, "user");
      setUser(user as User);
      if (!user) return notFound();

      // Fetch orders for this user
      const orders = await getOrdersByUserId(id);
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

  console.log(orders, images);

  return (
    <Layout>
      <div className="max-w-3xl mx-auto p-4">
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

        <div className="mb-8">
          <h2 className="text-lg font-bold text-white mb-2">
            Order History ({orders.length})
          </h2>
          {orders.length === 0 ? (
            <p className="text-gray-400 text-sm">No orders found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="py-2 pr-4">Order ID</th>
                    <th className="py-2 pr-4">Total</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order: any) => (
                    <tr key={order.id} className="border-b border-white/5">
                      <td className="py-2 pr-4">{order.orderId}</td>
                      <td className="py-2 pr-4">
                        ${order.totalAmount?.toFixed(2) ?? "0.00"}
                      </td>
                      <td className="py-2 pr-4">{order.status}</td>
                      <td className="py-2 pr-4">
                        {order.createdAt?.toDate
                          ? new Date(
                              order.createdAt.toDate()
                            ).toLocaleDateString()
                          : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
                  <Image
                    src={img.imageUrl || "/default-image.png"}
                    alt="generated"
                    width={100}
                    height={100}
                    className="rounded mb-2 object-cover w-full h-24"
                  />
                  <p className="text-xs text-gray-300 truncate w-full text-center">
                    {img.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
