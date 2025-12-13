"use client";
import { useRouter } from "next/navigation";
import { useGoogleLogin } from "@react-oauth/google";
import { googleLogin } from "../lib/auth";

export function useGoogle() {
  const router = useRouter();

  const handleGoogle = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        const { access_token } = response;

        const res = await googleLogin(access_token);
        console.log("Google login response:", res);

        if (res.user.role === "admin") router.push("/admin/dashboard");
        else if (res.user.role === "ngo") router.push("/ngo/dashboard");
        else {
          if (res.profile_complete) {
            router.push("/events");
          } else {
            router.push("/complete-profile");
          }
        }
      } catch (err) {
        console.error("Google login error:", err);

        // Check if account is blocked (403 status)
        if (err.response?.status === 403) {
          const message =
            err.response?.data?.error || "Your account has been blocked.";
          router.push(
            `/account-blocked?message=${encodeURIComponent(message)}`
          );
          return;
        }

        // Show other errors
        alert(
          err.response?.data?.error || "Google login failed. Please try again."
        );
      }
    },
    onError: (err) => console.error("Google login failed:", err),
  });

  return { handleGoogle };
}
