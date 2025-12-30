"use client";
import { useRouter } from "next/navigation";
import { useGoogleLogin } from "@react-oauth/google";
import { googleLogin } from "../lib/auth";

export function useGoogle(redirectUrl = null, onClose = null) {
  const router = useRouter();

  const handleGoogle = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        const { access_token } = response;

        const res = await googleLogin(access_token);

        // Close modal before redirect
        if (onClose) onClose();

        // Small delay to allow modal close animation
        setTimeout(() => {
          // If redirectUrl is provided, use it; otherwise use role-based redirect
          if (redirectUrl) {
            // Add success query parameter to URL
            const urlWithSuccess = redirectUrl.includes("?")
              ? `${redirectUrl}&login=success`
              : `${redirectUrl}?login=success`;
            router.push(urlWithSuccess);
          } else if (res.user.role === "admin") {
            router.push("/admin/dashboard?login=success");
          } else if (res.user.role === "ngo") {
            router.push("/ngo/dashboard?login=success");
          } else {
            if (res.profile_complete) {
              router.push("/events?login=success");
            } else {
              router.push("/complete-profile");
            }
          }
        }, 100);
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
