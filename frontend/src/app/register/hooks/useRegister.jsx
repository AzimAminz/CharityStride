"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { register as registerAPI } from "../../lib/auth"; 

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
  const [alert, setAlert] = useState({
    type: "", 
    message: "",
    open: false,
  });

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
      // Ubah birthdate ke format YYYY-MM-DD
      const payload = {
        ...form,
        birthdate: form.birthdate?.toISOString().split("T")[0],
      };

       await registerAPI(payload); // guna API helper

      setForm({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
        birthdate: null,
      });
      setErrors({});
      setAlert({
        type: "success",
        message: "Registration successful!",
        open: true,
      });
    

      // Redirect jika perlu
      router.push("/user/dashboard");
    } catch (err) {
      setForm((prev) => ({
        ...prev,
        password: "",
        confirmPassword: "",
      }));

      setErrors({
        api:
          err.response?.data?.errors.email ||
          err.message ||
          "Something went wrong.",
      });
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
    back,
  };
}
