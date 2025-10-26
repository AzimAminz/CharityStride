"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";


export function useRegister() {
    const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    birthdate: null,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // ✅ Validation
  const validate = () => {
    const newErrors = {};

    if (!form.name.trim()) newErrors.name = "Name is required.";
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
      newErrors.email = "Please enter a valid email.";
    if (!form.password || form.password.length < 6)
      newErrors.password = "Password must be at least 6 characters.";
    if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match.";
    if (!form.phone.match(/^[0-9]{9,15}$/))
      newErrors.phone = "Enter a valid phone number (9–15 digits).";
    if (!form.birthdate) newErrors.birthdate = "Select your birthdate.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      setForm((prev) => ({
        ...prev,
        password: "",
        confirmPassword: "",
      }));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          birthdate: form.birthdate?.toISOString().split("T")[0],
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Registration successful!");
        setForm({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
          phone: "",
          birthdate: null,
        });
        setErrors({});
      } else {
        setForm((prev) => ({
          ...prev,
          password: "",
          confirmPassword: "",
        }));
        setErrors({ api: data.message || "Something went wrong." });
      }
    } catch (err) {
      setForm((prev) => ({
        ...prev,
        password: "",
        confirmPassword: "",
      }));
      setErrors({ api: "Network error. Please try again later." });
    } finally {
      setLoading(false);
    }
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
    form,
    setForm,
    errors,
    loading,
    handleSubmit,
    back
  };
}
