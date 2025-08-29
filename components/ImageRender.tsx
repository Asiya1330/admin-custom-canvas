import { Eye } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import ImagePreview from "./ImageModal";

const ImageRender = ({
  url,
  containerClassName,
  className,
  alt,
  width,
  height,
}: {
  url: string;
  containerClassName?: string;
  className?: string;
  alt?: string;
  width?: number;
  height?: number;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={`relative ${containerClassName}`}>
      <div
        className="absolute top-0 right-0 bg-black/50 rounded-lg p-1 cursor-pointer"
        onClick={() => setOpen(true)}
      >
        <Eye className="w-4 h-4 text-white" />
      </div>
      <Image
        width={width || 80}
        height={height || 64}
        src={url}
        alt={alt || ""}
        className={className ? className : `w-20 h-16 rounded-lg object-cover`}
      />
      <ImagePreview open={open} onClose={() => setOpen(false)} imageUrl={url} />
    </div>
  );
};

export default ImageRender;
