"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";

function normalizeImageSrc(src: string): string {
  if (!src) return "/placeholder.jpg";
  if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("/")) {
    return src;
  }
  return `/${src}`;
}

const ImagePreviews = ({ images }: ImagePreviewsProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handlePrev = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };
  const handleNext = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  if (!images || images.length === 0) {
    return (
      <div className="h-[450px] w-full bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-sm">
        No images available
      </div>
    );
  }

  return (
    <div className="relative h-[450px] w-full rounded-xl overflow-hidden group">
      {images.map((image, index) => (
        <div
          key={image}
          className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
            index === currentImageIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={normalizeImageSrc(image)}
            alt={`Property Image ${index + 1}`}
            fill
            priority={index === 0}
            className="object-cover cursor-pointer"
            sizes="(max-width: 768px) 100vw, 1200px"
          />
        </div>
      ))}

      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

      {images.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 backdrop-blur-sm p-2 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-white/70"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 backdrop-blur-sm p-2 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-white/70"
            aria-label="Next image"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>

          <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full">
            {currentImageIndex + 1} / {images.length}
          </div>

          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                aria-label={`Go to image ${index + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === currentImageIndex
                    ? "w-5 bg-white"
                    : "w-1.5 bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ImagePreviews;