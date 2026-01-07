"use client";

import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { X, Loader2, RotateCcw } from "lucide-react";

/**
 * Image Cropper Modal
 * @param {string} image - Blob URL of the image to crop
 * @param {Function} onCropComplete - Callback when cropping is done, receives the cropped blob
 * @param {Function} onClose - Callback to close the modal
 * @param {number} aspect - Aspect ratio (default 1 for 1:1)
 * @param {boolean} circular - Whether to show circular crop area
 */
export default function ImageCropperModal({
  image,
  onCropComplete,
  onClose,
  aspect = 1,
  circular = true,
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropChange = (crop) => {
    setCrop(crop);
  };

  const onZoomChange = (zoom) => {
    setZoom(zoom);
  };

  const onCropAreaComplete = useCallback((_croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createImage = (url) =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener("load", () => resolve(image));
      image.addEventListener("error", (error) => {
        console.error("❌ Failed to load image for cropping:", error);
        reject(new Error("Failed to load image for cropping"));
      });
      // Removing anonymous crossOrigin for local data URLs to avoid potential issues
      image.src = url;
    });

  const getCroppedImg = async (imageSrc, pixelCrop) => {
    try {
      const image = await createImage(imageSrc);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("Could not get canvas context");
      }

      // Set canvas size to the cropped area size
      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;

      // Draw the section of the image we want onto the canvas
      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
      );

      return new Promise((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Canvas is empty - could not create blob"));
              return;
            }
            resolve(blob);
          },
          "image/jpeg",
          0.9
        ); // High quality JPEG
      });
    } catch (error) {
      console.error("❌ Error in getCroppedImg:", error);
      throw error;
    }
  };

  const handleSave = async () => {
    if (!croppedAreaPixels) {
      console.warn("⚠️ No cropped area defined");
      return;
    }

    setIsProcessing(true);
    try {
      const croppedBlob = await getCroppedImg(image, croppedAreaPixels);
      console.log(
        "✅ Successfully cropped image, size:",
        (croppedBlob.size / 1024).toFixed(2) + "KB"
      );
      onCropComplete(croppedBlob);
    } catch (e) {
      console.error("❌ handleSave failed:", e);
      // alert user? for now just log
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Crop Logo</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Cropper area */}
        <div className="relative flex-1 bg-gray-100 min-h-[400px]">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            cropShape={circular ? "round" : "rect"}
            showGrid={false}
            onCropChange={onCropChange}
            onCropComplete={onCropAreaComplete}
            onZoomChange={onZoomChange}
          />
        </div>

        {/* Controls */}
        <div className="px-6 py-6 space-y-6 bg-white">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-600 min-w-12">
                Zoom
              </span>
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                aria-labelledby="Zoom"
                onChange={(e) => setZoom(Number(e.target.value))}
                className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => {
                setZoom(1);
                setCrop({ x: 0, y: 0 });
              }}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isProcessing}
                className="flex items-center gap-2 px-8 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-all disabled:opacity-50 shadow-lg shadow-emerald-200"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Crop & Save"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
