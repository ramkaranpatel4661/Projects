import React, { useState } from 'react';
import { Package, ChevronLeft, ChevronRight } from 'lucide-react';

const ImageDisplay = ({ 
  imageUrls = [], 
  title = 'Item', 
  className = '',
  showThumbnails = true,
  aspectRatio = 'aspect-w-16 aspect-h-12'
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState({});

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';
    
    // If imagePath already includes the base URL, return as is
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // If imagePath doesn't start with /, add it
    const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    
    return `${baseUrl}${path}`;
  };

  if (!imageUrls || imageUrls.length === 0) {
    return (
      <div className={`${aspectRatio} bg-gray-200 rounded-lg overflow-hidden ${className}`}>
        <div className="w-full h-full flex items-center justify-center">
          <Package className="w-12 h-12 text-gray-400" />
        </div>
      </div>
    );
  }

  const handleImageError = (index) => {
    setImageError(prev => ({ ...prev, [index]: true }));
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % imageUrls.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + imageUrls.length) % imageUrls.length);
  };

  const currentImageUrl = getImageUrl(imageUrls[currentImageIndex]);

  return (
    <div className={className}>
      {/* Main Image */}
      <div className={`${aspectRatio} bg-gray-200 rounded-lg overflow-hidden relative group`}>
        {imageError[currentImageIndex] ? (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-12 h-12 text-gray-400" />
          </div>
        ) : (
          <img
            src={currentImageUrl}
            alt={`${title} - Image ${currentImageIndex + 1}`}
            className="w-full h-full object-cover"
            onError={() => handleImageError(currentImageIndex)}
            loading="lazy"
          />
        )}

        {/* Navigation arrows for multiple images */}
        {imageUrls.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Image counter */}
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
              {currentImageIndex + 1} / {imageUrls.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {showThumbnails && imageUrls.length > 1 && (
        <div className="mt-4 flex space-x-2 overflow-x-auto">
          {imageUrls.map((url, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                index === currentImageIndex ? 'border-primary-500' : 'border-gray-200'
              }`}
            >
              {imageError[index] ? (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <Package className="w-4 h-4 text-gray-400" />
                </div>
              ) : (
                <img
                  src={getImageUrl(url)}
                  alt={`${title} thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={() => handleImageError(index)}
                  loading="lazy"
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageDisplay;