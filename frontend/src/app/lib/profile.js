/**
 * Profile Helper Functions
 */

/**
 * Check if user profile is complete
 * @param {Object} user - User object
 * @returns {boolean} True if profile has phone and birthdate
 */
export const isProfileComplete = (user) => {
  if (!user) return false;
  return !!(user.phone && user.birthdate);
};

/**
 * Get user from localStorage
 * @returns {Object|null} Parsed user object or null
 */
export const getStoredUser = () => {
  if (typeof window === "undefined") return null;

  const userData = localStorage.getItem("user");
  if (!userData) return null;

  try {
    return JSON.parse(userData);
  } catch (error) {
    console.error("Failed to parse user data:", error);
    return null;
  }
};
