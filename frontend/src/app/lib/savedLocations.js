import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// Get auth token
const getAuthToken = () => {
  return localStorage.getItem("token");
};

// Get all saved locations for the authenticated NGO
export const getSavedLocations = async () => {
  try {
    const token = getAuthToken();
    if (!token) {
      console.warn("No auth token found");
      return [];
    }

    const response = await axios.get(`${API_URL}/ngo/saved-locations`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching saved locations:", error.message);
    // Return empty array on error so component can still work
    return [];
  }
};

// Save a new location
export const saveSavedLocation = async (locationData) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error("No auth token found");
    }

    const response = await axios.post(
      `${API_URL}/ngo/saved-locations`,
      locationData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error saving location:", error.message);
    throw error;
  }
};

// Delete a saved location
export const deleteSavedLocation = async (id) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error("No auth token found");
    }

    const response = await axios.delete(
      `${API_URL}/ngo/saved-locations/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting location:", error.message);
    throw error;
  }
};
