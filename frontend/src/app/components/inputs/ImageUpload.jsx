"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import ImageCropModal from "../ImageCropModal";
import { api } from "../../lib/api";

/**
 * Generic Image Upload Component
 * Handles image selection, crop, and upload
 *
 * @param {string} value - Current image URL
 * @param {function} onChange - Callback (url) => {}
 * @param {string} label - Input label
 * @param {string} error - Validation error message
 * @param {number} aspectRatio - Crop aspect ratio (default: 16/9)
 * @param {string} recommendedSize - Text for recommended size
 */
export default function ImageUpload({
  value,
  onChange,
  label = "Image",
  error,
  aspectRatio = 16 / 9,
  recommendedSize = "1200 x 675",
  uploadType = "logo",
}) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentImage, setCurrentImage] = useState(value || null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Sync value prop with local state
  useEffect(() => {
    setCurrentImage(value);
  }, [value]);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    // Read file and show crop modal
    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target.result);
      setShowCropModal(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = async (croppedBlob) => {
    setUploading(true);
    try {
      // Upload cropped image
      const formData = new FormData();
      formData.append("file", croppedBlob, "upload.jpg");
      formData.append("type", uploadType);

      const response = await api.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const imageUrl = response.data.url;
      setCurrentImage(imageUrl);
      onChange?.(imageUrl);
    } catch (error) {
      console.error("Upload error:", error);
      alert(
        error.response?.data?.error ||
          "Failed to upload image. Please try again."
      );
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!currentImage) return;

    try {
      // Extract path from URL (remove domain part)
      const url = new URL(currentImage, window.location.origin);
      const path = url.pathname.replace("/storage/", "");

      // Delete image from server
      await api.delete("/upload", {
        data: { path: path },
      });

      setCurrentImage(null);
      onChange?.(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete image");
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {recommendedSize && (
          <span className="text-gray-500 text-xs ml-2">
            ({recommendedSize})
          </span>
        )}
      </label>

      <div className="mt-1">
        {currentImage ? (
          // Show uploaded image with proper aspect ratio preview
          <div
            className="relative group mx-auto"
            style={{
              aspectRatio: aspectRatio,
              maxWidth: aspectRatio < 1 ? "300px" : "100%",
            }}
          >
            <img
              src={currentImage}
              alt="Uploaded"
              className="w-full h-full object-cover rounded-lg border-2 border-gray-200"
              onError={(e) => {
                console.error("Image failed to load:", currentImage);
              }}
            />
            <div className="absolute inset-0 bg-black/50 bg-opacity-0 group-hover:bg-opacity-40 transition-all rounded-lg flex items-center justify-center">
              <button
                type="button"
                onClick={handleRemove}
                className="opacity-0 group-hover:opacity-100 transition-opacity px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Remove
              </button>
            </div>
          </div>
        ) : (
          // Show upload area
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center transition-colors cursor-pointer mx-auto ${
              error
                ? "border-red-500 bg-red-50"
                : "border-gray-300 hover:border-emerald-400 bg-black/50"
            }`}
            style={{
              aspectRatio: aspectRatio,
              maxWidth: aspectRatio < 1 ? "300px" : "100%",
            }}
          >
            <ImageIcon
              className={`h-12 w-12 mx-auto mb-3 ${
                error ? "text-red-400" : "text-gray-200"
              }`}
            />
            <p
              className={`text-sm mb-1 ${
                error ? "text-red-600" : "text-gray-300"
              }`}
            >
              Click to upload {label.toLowerCase()}
            </p>
            <p
              className={`text-xs ${error ? "text-red-500" : "text-gray-400"}`}
            >
              PNG, JPG, WebP up to 5MB
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        )}
      </div>

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

      {uploading && (
        <div className="mt-2 flex items-center gap-2 text-sm text-emerald-600">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
          Uploading...
        </div>
      )}

      {/* Crop Modal */}
      <ImageCropModal
        open={showCropModal}
        onClose={() => {
          setShowCropModal(false);
          setSelectedImage(null);
        }}
        imageSrc={selectedImage}
        onCropComplete={handleCropComplete}
        aspectRatio={aspectRatio}
        recommendedSize={recommendedSize}
      />
    </div>
  );
}
