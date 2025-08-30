"use client";
import Layout from "../../components/Layout";
import DataTable from "../../components/DataTable";
import { useEffect, useState } from "react";
import { getProducts, deleteDocument } from "../../services/crud";
import { withAuth } from "../../components/withAuth";
import Loader from "../../components/Loader";
import ImageRender from "@/components/ImageRender";

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  size: string;
  quantity: number;
  imageUrl: string;
  createdAt: any;
}

interface Column<T> {
  key: keyof T;
  label: string;
  render?: (value: T[keyof T]) => React.ReactNode | string;
  width?: string;
}

const columns: Column<Product>[] = [
  {
    key: "imageUrl",
    label: "Preview",
    render: (value) => <ImageRender url={value}
    containerClassName='w-16'
    width={64}
    height={64}
    className='w-16 h-16 rounded-lg object-cover'
    />,
  },
  { key: "name", label: "Product Name" },
  {
    key: "price",
    label: "Price",
    render: (value) => `$${(value as number).toFixed(2)}`,
  },
  { key: "size", label: "Size" },
  { key: "quantity", label: "Quantity" },
  {
    key: "createdAt",
    label: "Created",
    render: (value) =>
      (value as any)?.toDate
        ? new Date((value as any).toDate()).toLocaleDateString()
        : "Unknown",
  },
];

function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsData = (await getProducts()) as Product[];
        setProducts(productsData);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleEdit = async (product: Product) => {
    console.log(product, "edit not implimented");
  };

  const handleDelete = async (product: Product) => {
    console.log(product, "delete not implimented");
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
          data={products}
          columns={columns}
          title="Product Management"
          editable={true}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </Layout>
  );
}

export default withAuth(Products);
