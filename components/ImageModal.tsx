import { XIcon } from 'lucide-react'
import Image from 'next/image'
import React, { useState } from 'react'
import Loader from './Loader';

const ImageModal = ({open, onClose, imageUrl}: {open: boolean, onClose: () => void, imageUrl: string}) => {

  const [imageLoading, setImageLoading] = useState(true);

  const handleImageLoad = () => {
    setImageLoading(false);
  }

  return (
    <div className={` fixed inset-0 bg-black bg-opacity-5 flex justify-center items-center z-50 ${open ? 'block' : 'hidden'}`}>
        <div className="bg-black rounded-lg p-4">
            <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 cursor-pointer">
                <XIcon className="w-6 h-6" />
            </button>
            {imageLoading && <Loader/>}
            <Image src={imageUrl} alt="Image"
            width={2000}
            height={2000}
            onLoad={handleImageLoad}
            className="w-auto h-auto object-contain max-w-full max-h-[90vh] " />
        </div>
    </div>
  )
}

export default ImageModal