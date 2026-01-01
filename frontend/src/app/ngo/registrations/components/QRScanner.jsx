"use client";

import { useState, useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Camera, Upload, X, Loader2 } from "lucide-react";

export default function QRScanner({
  isOpen,
  onClose,
  onScanSuccess,
  onScanError,
}) {
  const [activeTab, setActiveTab] = useState("camera");
  const [scanning, setScanning] = useState(false);
  const [processing, setProcessing] = useState(false);
  const scannerRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    let timer;
    if (isOpen && activeTab === "camera") {
      // Reset processing state when opening
      setProcessing(false);

      // Increased delay to ensure DOM is ready when reopening modal
      timer = setTimeout(() => {
        startCameraScanner();
      }, 500);
    } else {
      // Reset processing when closing
      setProcessing(false);
    }

    return () => {
      if (timer) clearTimeout(timer);
      stopCameraScanner();
    };
  }, [isOpen, activeTab]);

  const startCameraScanner = async () => {
    if (scannerRef.current) return;

    // Check if DOM element exists
    const element = document.getElementById("qr-reader");
    if (!element) {
      console.error("QR reader element not found in DOM");
      return;
    }

    try {
      // Request camera permission first
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((track) => track.stop()); // Stop the test stream

      const scanner = new Html5QrcodeScanner(
        "qr-reader",
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          showTorchButtonIfSupported: true,
        },
        false
      );

      scanner.render(
        (decodedText) => {
          setProcessing(true);
          onScanSuccess(decodedText);
          stopCameraScanner();
        },
        (error) => {
          // Ignore continuous scan errors
        }
      );

      scannerRef.current = scanner;
      setScanning(true);
    } catch (error) {
      console.error("Camera access error:", error);
      onScanError(
        "Camera access denied. Please allow camera permissions in your browser settings."
      );
    }
  };

  const stopCameraScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
      scannerRef.current = null;
      setScanning(false);
      setProcessing(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProcessing(true);

    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const html5QrCode = new Html5Qrcode("qr-file-reader");

      const decodedText = await html5QrCode.scanFile(file, false);
      onScanSuccess(decodedText);
      onClose();
    } catch (error) {
      console.error("QR code scan error:", error);
      onScanError("Failed to read QR code from image. Please ensure the image contains a clear QR code.");
    } finally {
      setProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleClose = () => {
    stopCameraScanner();
    setProcessing(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Scan QR Code</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("camera")}
            className={`flex-1 px-6 py-3 font-medium transition-colors ${
              activeTab === "camera"
                ? "text-emerald-600 border-b-2 border-emerald-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Camera className="h-5 w-5 inline-block mr-2" />
            Camera
          </button>
          <button
            onClick={() => {
              stopCameraScanner();
              setActiveTab("upload");
            }}
            className={`flex-1 px-6 py-3 font-medium transition-colors ${
              activeTab === "upload"
                ? "text-emerald-600 border-b-2 border-emerald-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Upload className="h-5 w-5 inline-block mr-2" />
            Upload
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {processing && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 text-emerald-600 animate-spin mb-4" />
              <p className="text-gray-600">Processing QR code...</p>
            </div>
          )}

          {!processing && activeTab === "camera" && (
            <div>
              <div id="qr-reader" className="w-full"></div>
              <p className="text-sm text-gray-500 mt-4 text-center">
                Position the QR code within the frame to scan
              </p>
            </div>
          )}

          {activeTab === "upload" && (
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/50 transition-colors"
              >
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium mb-2">
                  Click to upload QR code image
                </p>
                <p className="text-sm text-gray-500">PNG, JPG up to 10MB</p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              <div id="qr-file-reader" className="hidden"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
