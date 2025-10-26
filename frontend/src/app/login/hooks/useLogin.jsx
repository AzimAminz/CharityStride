"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function useLogin() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // 🟢 Handle Login
  const handleLogin = (e) => {
    e.preventDefault();

    // Email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Please enter a valid email address.");
    } else {
      setEmailError("");
    }

    // Password validation
    if (!password) {
      setPasswordError("Please enter your password.");
      return;
    } else {
      setPasswordError("");
    }

    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  // 🟢 Handle Back Navigation
  const back = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
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
