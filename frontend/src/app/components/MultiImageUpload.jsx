"use client";

import { useState } from "react";
import { Upload, X, GripVertical, Crop } from "lucide-react";
import ImageCropModal from "./ImageCropModal";

/**
 * Multi-Image Upload Component with Cropping and Reordering
 * @param {Array} images - Array of image URLs
 * @param {Function} onChange - Callback when images change
 * @param {number} maxImages - Maximum number of images allowed (default: 5)
 */
export default function MultiImageUpload({
  images = [],
  onChange,
  maxImages = 5,
}) {
  const [showCropModal, setShowCropModal] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null);
  const [cropIndex, setCropIndex] = useState(null);
  const [draggedIndex, setDraggedIndex] = useState(null);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (images.length >= maxImages) {
      alert(`Maximum ${maxImages} images allowed`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setImageToCrop(event.target.result);
      setCropIndex(images.length); // Add as new image
      setShowCropModal(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = (croppedImage) => {
    if (cropIndex !== null) {
      const newImages = [...images];
      newImages[cropIndex] = croppedImage;
      onChange(newImages);
    }
    setShowCropModal(false);
    setImageToCrop(null);
    setCropIndex(null);
  };

  const handleRemove = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  };

  const handleRecrop = (index) => {
    setImageToCrop(images[index]);
    setCropIndex(index);
    setShowCropModal(true);
  };

  // Drag and drop handlers
  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (dropIndex) => {
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const newImages = [...images];
    const [draggedImage] = newImages.splice(draggedIndex, 1);
    newImages.splice(dropIndex, 0, draggedImage);

    onChange(newImages);
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-4">
      {/* Upload Button */}
      {images.length < maxImages && (
        <div>
          <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors">
            <Upload className="h-4 w-4" />
            Add Image ({images.length}/{maxImages})
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
          <p className="text-xs text-gray-500 mt-1">
            Images will be cropped to 1:1 ratio. Drag to reorder.
          </p>
        </div>
      )}

      {/* Images Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {images.map((image, index) => (
            <div
              key={index}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(index)}
              className={`relative group aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 transition-all cursor-move ${
                draggedIndex === index
                  ? "border-emerald-500 opacity-50"
                  : "border-gray-200 hover:border-emerald-300"
              }`}
            >
              {/* Image */}
              <img
                src={image}
                alt={`Upload ${index + 1}`}
                className="w-full h-full object-cover"
              />

              {/* Drag Handle */}
              <div className="absolute top-2 left-2 bg-white/90 rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical className="h-4 w-4 text-gray-600" />
              </div>

              {/* Actions Overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => handleRecrop(index)}
                  className="p-2 bg-white/90 hover:bg-white rounded-lg transition-colors"
                  title="Re-crop"
                >
                  <Crop className="h-4 w-4 text-gray-700" />
                </button>
                <button
                  onClick={() => handleRemove(index)}
                  className="p-2 bg-red-500/90 hover:bg-red-600 rounded-lg transition-colors"
                  title="Remove"
                >
                  <X className="h-4 w-4 text-white" />
                </button>
              </div>

              {/* Order Number */}
              <div className="absolute bottom-2 right-2 bg-emerald-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Crop Modal */}
      <ImageCropModal
        open={showCropModal}
        onClose={() => {
          setShowCropModal(false);
          setImageToCrop(null);
          setCropIndex(null);
        }}
        imageSrc={imageToCrop}
        onCropComplete={async (croppedBlob) => {
          // Convert blob to base64 for display
          const reader = new FileReader();
          reader.onloadend = () => {
            handleCropComplete(reader.result);
          };
          reader.readAsDataURL(croppedBlob);
        }}
        aspectRatio={1}
        recommendedSize="1:1 (Square)"
      />
    </div>
  );
}
