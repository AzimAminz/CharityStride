"use client";

import { useRouter , usePathname} from "next/navigation";
import { useState } from "react";
import { login } from "../../lib/auth";

export default function useLogin() {
  const router = useRouter();
  const pathname = usePathname();

  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    // Validation
    let hasError = false;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Please enter a valid email address.");
      hasError = true;
    } else {
      setEmailError("");
    }

    if (!password) {
      setPasswordError("Please enter your password.");
      hasError = true;
    } else {
      setPasswordError("");
    }

    if (hasError) return; // Stop if validation fail

    // Send login request
    setLoading(true);
    try {
      const res = await login({ email, password });
      console.log("Login response:", res);

      if (res?.user) {
        if (res.user.role === "admin") router.push("/admin");
        else if (res.user.role === "ngo") router.push("/ngo");
        else router.push("/events");
      } else {
        setPassword("");
        setPasswordError(res?.message || "Login failed. Please try again.");
      }
    } catch (err) {
      setPassword("");
      setPasswordError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const back = () => {
 
  
    if (window.history.length <= 1 || pathname === "/login" || pathname === '/register') {
      router.push("/events");
    } else {
      router.back();
    }
  };

  return {
    email,
    setEmail,
    emailError,
    password,
    setPassword,
    passwordError,
    showPassword,
    setShowPassword,
    loading,
    handleLogin,
    back,
  };
}
