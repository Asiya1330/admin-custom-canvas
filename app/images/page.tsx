'use client'
import Layout from '../../components/Layout'
import DataTable from '../../components/DataTable'
import { useEffect, useState } from 'react'
import { getImages, deleteDocument } from '../../services/crud'
import Image from 'next/image'
import { withAuth } from '../../components/withAuth'

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
}

const columns: Column[] = [
    {
        key: 'imageUrl',
        label: 'Preview',
        render: (value: string) => (
            <Image width={64} height={64} src={value} alt="" className="w-16 h-16 rounded-lg object-cover" />
        )
    },
    { key: 'name', label: 'Name' },
    { key: 'description', label: 'Description' },
    { key: 'aspectRatio', label: 'Aspect Ratio' },
    { key: 'size', label: 'Size' },
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
    try {
      console.log('Edit image:', image);
    } catch (error) {
      console.error('Error editing image:', error);
    }
  };

  const handleDelete = async (image: Image) => {
    try {
      await deleteDocument('images', image.id);
      setImages(images.filter(img => img.id !== image.id));
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className=" ">
          <div className="flex items-center justify-center h-64">
            <div className="text-white">Loading images...</div>
          </div>
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
