/**
 * Utility to parse backend error responses into user-friendly messages
 * Handles Laravel validation errors, generic messages, and fallbacks
 */

export function parseErrorMessage(error, language = "en") {
  // Check for Laravel validation errors
  if (error.response?.data?.errors) {
    const errors = error.response.data.errors;
    const errorList = Object.keys(errors).map((key) => {
      const messages = errors[key];
      return `• ${Array.isArray(messages) ? messages[0] : messages}`;
    });
    return errorList.join("\n");
  }

  // Check for general error message from backend
  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  // Check for error property
  if (error.response?.data?.error) {
    return error.response.data.error;
  }

  // Fallback to generic message based on status code
  if (error.response?.status) {
    const status = error.response.status;
    switch (status) {
      case 400:
        return language === "ms"
          ? "Permintaan tidak sah. Sila semak data anda."
          : "Bad request. Please check your data.";
      case 401:
        return language === "ms"
          ? "Tidak dibenarkan. Sila log masuk semula."
          : "Unauthorized. Please login again.";
      case 403:
        return language === "ms" ? "Akses ditolak." : "Access denied.";
      case 404:
        return language === "ms"
          ? "Sumber tidak dijumpai."
          : "Resource not found.";
      case 422:
        return language === "ms"
          ? "Data tidak sah. Sila periksa input anda."
          : "Invalid data. Please check your input.";
      case 500:
        return language === "ms"
          ? "Ralat pelayan. Sila cuba lagi."
          : "Server error. Please try again.";
      default:
        return language === "ms"
          ? "Ralat tidak dijangka. Sila cuba lagi."
          : "An unexpected error occurred. Please try again.";
    }
  }

  // Final fallback
  return (
    error.message ||
    (language === "ms" ? "Ralat tidak diketahui" : "Unknown error")
  );
}
