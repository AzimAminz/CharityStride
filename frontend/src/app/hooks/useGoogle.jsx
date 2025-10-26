"use client";
import { useRouter } from "next/navigation";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";

export function useGoogle() {
  const router = useRouter();

  const handleGoogle = useGoogleLogin({
    onSuccess: async (response) => {
      try {

        const { access_token } = response;  
        console.log("Google Access Token:", access_token);

        const res = await axios.post(process.env.NEXT_PUBLIC_API_URL + '/auth/google', { token: access_token }); 
        const { data } = res;
        console.log("Backend Response:", data);

        localStorage.setItem("token", res.token);

        if (!data.profile_complete) {
          router.push("/complete-profile");
        } else {
          router.push("/dashboard");
        }
      } catch (err) {
        console.error("Google login error:", err);
      }
    },
    onError: (err) => console.error("Google login failed:", err),
  });

  return { handleGoogle };
}
