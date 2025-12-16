"use client";

import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import ImageCropModal from "./ImageCropModal";
import { api } from "../lib/api";

/**
 * Event Thumbnail Upload Component
 * Handles image selection, crop, and upload
 */
export default function EventThumbnailUpload({
  currentThumbnail,
  onThumbnailChange,
  validationError,
}) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [croppedImage, setCroppedImage] = useState(currentThumbnail || null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

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
      formData.append("file", croppedBlob, "thumbnail.jpg");
      formData.append("type", "logo"); // Required by FileUploadController

      const response = await api.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const imageUrl = response.data.url;

      console.log("=== THUMBNAIL UPLOAD DEBUG ===");
      console.log("Backend returned URL:", imageUrl);
      console.log("Trying to load image directly from backend URL...");

      setCroppedImage(imageUrl);
      onThumbnailChange?.(imageUrl);
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
    if (!croppedImage) return;

    try {
      // Extract path from URL (remove domain part)
      const url = new URL(croppedImage, window.location.origin);
      const path = url.pathname.replace("/storage/", "");

      // Delete image from server
      await api.delete("/upload", {
        data: { path: path },
      });

      setCroppedImage(null);
      onThumbnailChange?.(null);
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
        Event Thumbnail *
        <span className="text-gray-500 text-xs ml-2">
          (Recommended: 1200 x 630 px)
        </span>
      </label>

      <div className="mt-1">
        {croppedImage ? (
          // Show uploaded thumbnail with proper aspect ratio preview
          <div className="relative group">
            <img
              src={croppedImage}
              alt="Event thumbnail"
              className="w-full h-64 object-cover rounded-lg border-2 border-gray-200"
              onError={(e) => {
                console.error("Image failed to load:", croppedImage);
              }}
            />
            <div className="absolute inset-0  bg-opacity-0 group-hover:bg-opacity-40 transition-all rounded-lg flex items-center justify-center">
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
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
              validationError
                ? "border-red-500 bg-red-50"
                : "border-gray-300 hover:border-emerald-400"
            }`}
          >
            <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-600 mb-1">
              Click to upload event thumbnail
            </p>
            <p className="text-xs text-gray-500">PNG, JPG, WebP up to 5MB</p>
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

      {validationError && (
        <p className="mt-1 text-sm text-red-600">{validationError}</p>
      )}

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
        aspectRatio={1200 / 630}
        recommendedSize="1200 x 630"
      />
    </div>
  );
}
