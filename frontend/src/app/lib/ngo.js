import axios from "axios";
import { api } from "./api";

/**
 * Upload file (logo or document)
 * @param {File} file - File to upload
 * @param {string} type - Type of file ('logo' or 'doc')
 * @param {string} oldPath - Optional old file path to replace
 * @returns {Promise<string>} URL of uploaded file
 */
export async function uploadFile(file, type, oldPath = null) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("type", type);

  if (oldPath) {
    const path = oldPath.replace(/^.*\/storage\//, "");
    formData.append("old_path", path);
  }

  const token = localStorage.getItem("token");

  console.log(`📤 Uploading ${type}...`, {
    fileName: file.name,
    fileSize: (file.size / 1024 / 1024).toFixed(2) + "MB",
    fileType: file.type,
  });

  // Use fresh axios call to avoid any default header interference from the 'api' instance
  const response = await axios.post(
    `${process.env.NEXT_PUBLIC_API_URL}/api/upload`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        // DO NOT set Content-Type here, let the browser handle it with the boundary
      },
    }
  );

  return response.data.url;
}

/**
 * Delete file from storage
 * @param {string} fileUrl - Full URL of file to delete
 * @returns {Promise<void>}
 */
export async function deleteFile(fileUrl) {
  if (!fileUrl) return;

  const path = fileUrl.replace(/^.*\/storage\//, "");

  await api.delete("/upload", {
    data: { path },
  });
}

/**
 * Submit NGO registration
 * @param {Object} formData - NGO registration form data
 * @returns {Promise<Object>} Response data
 */
export async function submitNgoRegistration(formData) {
  try {
    const response = await api.post("/ngo/register", formData);
    return response.data;
  } catch (error) {
    // Log detailed validation errors for debugging
    if (error.response?.status === 422) {
      console.error("❌ Validation Errors:", error.response.data.errors);
      console.error("📝 Form Data Sent:", formData);
    }
    throw error;
  }
}
