import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "../lib/auth";

export function useAuth(roleRequired = null) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function checkAuth() {
      try {
        setLoading(true);
        setError(null);

        // Check if in browser environment
        if (typeof window === "undefined") {
          throw new Error("Browser environment required");
        }

        // No token check needed - session is handled by cookies
        const userData = await getCurrentUser();

        // Check role requirement
        if (roleRequired && userData.role !== roleRequired) {
          // User is logged in but has wrong role - don't logout, just show error
          setError(
            `Access denied. `
          );
          setUser(userData); // Still set user so they're not logged out
          setLoading(false);
          return;
        }

        setUser(userData);

        // Check if profile is complete (phone and birthdate required)
        const isProfileComplete = !!(userData.phone && userData.birthdate);

        // If profile incomplete and not already on complete-profile page, LOGOUT and redirect
        if (
          !isProfileComplete &&
          typeof window !== "undefined" &&
          !window.location.pathname.includes("/complete-profile")
        ) {
          // Clear authentication data
          localStorage.removeItem("token");
          localStorage.removeItem("user");

          // Redirect to login with message
          router.push("/login?error=Please complete your profile to continue");
          return;
        }
      } catch (err) {
        setError(err.message);
        console.error("Auth check failed:", err);

        // Clear user data from localStorage
        localStorage.removeItem("user");

        // Optional: Add delay before redirect for better UX
        setTimeout(() => {
          router.push(
            `/login?redirect=${encodeURIComponent(
              window.location.pathname
            )}&error=${encodeURIComponent(err.message)}`
          );
        }, 1500);
      } finally {
        setLoading(false);
      }
    }

    checkAuth();

    return () => {};
  }, [roleRequired, router]);

  return { user, loading, error };
}
