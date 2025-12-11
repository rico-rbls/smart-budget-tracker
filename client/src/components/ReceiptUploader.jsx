import { useState, useRef } from "react";
import PropTypes from "prop-types";

const ReceiptUploader = ({ onUploadSuccess, onUploadError }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "application/pdf",
  ];

  const validateFile = (file) => {
    if (!file) {
      return { valid: false, error: "No file selected" };
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: "Invalid file type. Please upload JPG, PNG, or PDF files.",
      };
    }

    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: "File size exceeds 5MB limit.",
      };
    }

    return { valid: true };
  };

  const handleFileSelect = (file) => {
    const validation = validateFile(file);

    if (!validation.valid) {
      onUploadError?.(validation.error);
      return;
    }

    setSelectedFile(file);

    // Create preview for images
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      onUploadError?.("Please select a file first");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("receipt", selectedFile);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch(
        "http://localhost:3002/api/receipts/upload",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: formData,
        }
      );

      clearInterval(progressInterval);
      setUploadProgress(100);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Upload failed");
      }

      onUploadSuccess?.(data.data);

      // Reset after successful upload
      setTimeout(() => {
        setSelectedFile(null);
        setPreview(null);
        setUploadProgress(0);
        setUploading(false);
      }, 1000);
    } catch (error) {
      setUploading(false);
      setUploadProgress(0);
      onUploadError?.(error.message || "Failed to upload receipt");
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPreview(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
          isDragging
            ? "border-indigo-500 bg-indigo-50"
            : "border-gray-300 hover:border-indigo-400 hover:bg-gray-50"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.pdf"
          onChange={handleFileInputChange}
          className="hidden"
        />

        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          stroke="currentColor"
          fill="none"
          viewBox="0 0 48 48"
        >
          <path
            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <div className="mt-4">
          <p className="text-lg font-medium text-gray-900">
            {selectedFile
              ? selectedFile.name
              : "Drop receipt here or click to browse"}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            JPG, PNG, or PDF up to 5MB
          </p>
        </div>
      </div>

      {/* Preview */}
      {preview && (
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-900">Preview</h3>
            <button
              onClick={handleClear}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Clear
            </button>
          </div>
          <img
            src={preview}
            alt="Receipt preview"
            className="max-h-64 mx-auto rounded border border-gray-200"
          />
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-900">
              Uploading...
            </span>
            <span className="text-sm text-gray-600">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Upload Button */}
      {selectedFile && !uploading && (
        <button
          onClick={handleUpload}
          className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
        >
          Upload & Process Receipt
        </button>
      )}
    </div>
  );
};

ReceiptUploader.propTypes = {
  onUploadSuccess: PropTypes.func,
  onUploadError: PropTypes.func,
};

export default ReceiptUploader;
