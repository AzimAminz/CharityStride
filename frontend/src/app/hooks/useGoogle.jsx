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

        if (res.user.role === "admin") router.push("/admin");
        else if (res.user.role === "ngo") router.push("/ngo");
        else {
          if (res.profile_complete) {
            
            router.push("/dashboard");
          } else {
            router.push("/complete-profile");
          }
        };
       
      } catch (err) {
        console.error("Google login error:", err);
      }
    },
    onError: (err) => console.error("Google login failed:", err),
  });

  return { handleGoogle };
}
