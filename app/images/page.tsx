'use client'
import Layout from '../../components/Layout'
import DataTable from '../../components/DataTable'
import { useEffect, useState } from 'react'
import { getImages, deleteDocument } from '../../services/crud'
import Image from 'next/image'
import { withAuth } from '../../components/withAuth'
import Loader from '../../components/Loader'

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
            <Image width={64} height={64} src={value} alt="" className="w-16 h-16 rounded-lg object-cover" />
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
      <Loader />
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
