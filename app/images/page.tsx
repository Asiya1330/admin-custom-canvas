'use client'
import Layout from '../../components/Layout'
import DataTable from '../../components/DataTable'
import { useEffect, useState } from 'react'
import { getImages, deleteDocument } from '../../services/crud'
import Image from 'next/image'
import { withAuth } from '../../components/withAuth'
import Loader from '../../components/Loader'
import ImageRender from '@/components/ImageRender'

interface Image {
    id: string
    userId: string
    imageUrl: string
    name: string
    description: string
    aspectRatio: string
    size: string
    createdAt: any
}

interface Column {
    key: string
    label: string
    render?: (value: any) => React.ReactNode | string
    width?: string
}

const columns: Column[] = [
    {
        key: 'imageUrl',
        label: 'Preview',
        width: 'fit-content',
        render: (value: string) => (
            <ImageRender
            containerClassName='w-20 h-16'
            url={value} />
        )
    },
    { key: 'name', label: 'Name', width: '200px' },
    { key: 'description', label: 'Description', width: '400px' },
    { key: 'aspectRatio', label: 'Aspect Ratio', width: '100px' },
    { key: 'size', label: 'Size', width: '100px' },
    {
        key: 'createdAt',
        label: 'Created',
        render: (value: any) => value?.toDate ? new Date(value.toDate()).toLocaleDateString() : 'Unknown'
    }
]

function Images() {
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const imagesData = await getImages() as Image[];
        setImages(imagesData);
      } catch (error) {
        console.error('Error fetching images:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  const handleEdit = async (image: Image) => {
    console.log(image, "edit not implimented");
  };

  const handleDelete = async (image: Image) => {
    console.log(image, "delete not implimented");
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
          data={images}
          columns={columns}
          title="Generated Images"
          editable={true}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </Layout>
  )
}

export default withAuth(Images)
