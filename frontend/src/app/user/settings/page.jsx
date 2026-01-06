"use client";

import React, { useState, useEffect, useCallback } from "react";
import Layout from "@/app/components/Layout";
import {
  User,
  Mail,
  Phone,
  CreditCard,
  Lock,
  Eye,
  EyeOff,
  Save,
  Camera,
  AlertCircle,
  CheckCircle2,
  X,
  Shield,
  Send,
} from "lucide-react";
import Cropper from "react-easy-crop";
import { api, getStorageUrl } from "@/app/lib/api";

const SettingsPage = () => {
  const [activeSection, setActiveSection] = useState("profile");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [errors, setErrors] = useState({});

  // Auth User Data
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    ic_number: "",
    photo: "",
  });

  const [passwordData, setPasswordData] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
    code: "",
  });

  const [authMethod, setAuthMethod] = useState("password"); // 'password' or 'email'
  const [tacSent, setTacSent] = useState(false);
  const [tacCooldown, setTacCooldown] = useState(0);

  // Cropping State
  const [image, setImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isCropping, setIsCropping] = useState(false);

  // TAC Cooldown Timer
  useEffect(() => {
    if (tacCooldown > 0) {
      const timer = setTimeout(() => setTacCooldown(tacCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [tacCooldown]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setUserData({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      ic_number: user.ic_number || "",
      photo: user.photo || "",
    });
  }, []);

  const sections = [
    { id: "profile", label: "Profile Information", icon: User },
    { id: "security", label: "Security", icon: Lock },
  ];

  // Validation Logic
  const validateProfile = () => {
    const newErrors = {};
    if (!userData.name.trim()) newErrors.name = "Full Name is required";
    if (!userData.email.trim() || !/\S+@\S+\.\S+/.test(userData.email))
      newErrors.email = "Valid Email is required";
    if (
      userData.phone &&
      !/^(\+?6?01)[0-46-9]-*[0-9]{7,8}$/.test(userData.phone)
    )
      newErrors.phone = "Invalid Malaysian phone number format";
    if (userData.ic_number && !/^\d{6}-\d{2}-\d{4}$/.test(userData.ic_number))
      newErrors.ic_number = "IC format must be XXXXXX-XX-XXXX";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = () => {
    const newErrors = {};
    if (authMethod === "password" && !passwordData.current_password)
      newErrors.current_password = "Current password is required";

    if (
      authMethod === "email" &&
      (!passwordData.code || passwordData.code.length !== 6)
    )
      newErrors.code = "Verification code is required";

    if (passwordData.password.length < 8)
      newErrors.password = "Password must be at least 8 characters";
    if (passwordData.password !== passwordData.password_confirmation)
      newErrors.password_confirmation = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Image Cropping Handlers
  const onCropComplete = useCallback((_croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setImage(reader.result);
        setIsCropping(true);
      });
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const createCroppedImage = async () => {
    try {
      const croppedImage = await getCroppedImg(image, croppedAreaPixels);
      setUserData((prev) => ({ ...prev, photo: croppedImage }));
      setIsCropping(false);
      setImage(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleProfileUpdate = async () => {
    if (!validateProfile()) return;
    setLoading(true);
    setSuccess(null);
    setErrors({});

    try {
      const response = await api.put("/user/profile", userData);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      setSuccess("Profile updated successfully!");
      // Update local state in case backend returned something formatted
      setUserData({
        name: response.data.user.name,
        email: response.data.user.email,
        phone: response.data.user.phone,
        ic_number: response.data.user.ic_number,
        photo: response.data.user.photo,
      });
    } catch (err) {
      setErrors(err.response?.data?.errors || { general: "Update failed" });
    } finally {
      setLoading(false);
    }
  };

  const handleRequestTac = async () => {
    setLoading(true);
    setSuccess(null);
    setErrors({});

    try {
      await api.post("/user/tac-request");
      setTacSent(true);
      setTacCooldown(60);
      setSuccess("Verification code sent to your email!");
    } catch (err) {
      setErrors({
        general: err.response?.data?.message || "Failed to send code",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (!validatePassword()) return;
    setLoading(true);
    setSuccess(null);
    setErrors({});

    try {
      const endpoint =
        authMethod === "password"
          ? "/user/password"
          : "/user/password-with-tac";
      await api.put(endpoint, passwordData);
      setSuccess("Password updated successfully!");
      setPasswordData({
        current_password: "",
        password: "",
        password_confirmation: "",
        code: "",
      });
      setTacSent(false);
    } catch (err) {
      setErrors(
        err.response?.data?.errors || {
          general: err.response?.data?.message || "Update failed",
        }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">
            Manage your account settings and preferences
          </p>
        </div>

        {success && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-medium">{success}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => {
                    setActiveSection(section.id);
                    setSuccess(null);
                    setErrors({});
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left group ${
                    activeSection === section.id
                      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200"
                      : "text-gray-600 hover:bg-emerald-50 hover:text-emerald-600"
                  }`}
                >
                  <section.icon
                    className={`h-5 w-5 ${
                      activeSection === section.id
                        ? ""
                        : "group-hover:scale-110 transition-transform"
                    }`}
                  />
                  <span className="font-medium">{section.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              {/* Profile Section */}
              {activeSection === "profile" && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                      Profile Information
                    </h2>
                    <p className="text-gray-500 mt-1">
                      Update your personal details and how others see you
                    </p>
                  </div>

                  {/* Profile Picture */}
                  <div className="flex flex-col md:flex-row items-center gap-8 pb-8 border-b border-gray-100">
                    <div className="relative group">
                      <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-100 shadow-inner bg-gray-50">
                        <img
                          src={getStorageUrl(userData.photo)}
                          alt={userData.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <label className="absolute bottom-0 right-0 p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-xl transition-all cursor-pointer hover:scale-110">
                        <Camera className="h-5 w-5" />
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </label>
                    </div>
                    <div className="text-center md:text-left">
                      <h3 className="text-xl font-bold text-gray-900">
                        {userData.name || "Your Name"}
                      </h3>
                      <p className="text-gray-500">
                        {userData.email || "Email Address"}
                      </p>
                      <p className="mt-2 text-sm text-gray-400 max-w-xs">
                        Suggested format: JPEG or PNG, at least 400x400px.
                      </p>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 ml-1">
                        Full Name
                      </label>
                      <div className="relative group">
                        <User
                          className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors ${
                            errors.name
                              ? "text-red-400"
                              : "text-gray-400 group-focus-within:text-emerald-500"
                          }`}
                        />
                        <input
                          type="text"
                          value={userData.name}
                          onChange={(e) =>
                            setUserData({ ...userData, name: e.target.value })
                          }
                          className={`w-full pl-11 pr-4 py-3 bg-gray-50 border-2 rounded-xl transition-all focus:bg-white outline-none ${
                            errors.name
                              ? "border-red-100 focus:border-red-500"
                              : "border-gray-50 focus:border-emerald-500"
                          }`}
                          placeholder="Ex: John Doe"
                        />
                      </div>
                      {errors.name && (
                        <p className="text-xs text-red-500 ml-1 font-medium">
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 ml-1">
                        Email Address
                      </label>
                      <div className="relative group">
                        <Mail
                          className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors ${
                            errors.email
                              ? "text-red-400"
                              : "text-gray-400 group-focus-within:text-emerald-500"
                          }`}
                        />
                        <input
                          type="email"
                          value={userData.email}
                          onChange={(e) =>
                            setUserData({ ...userData, email: e.target.value })
                          }
                          className={`w-full pl-11 pr-4 py-3 bg-gray-50 border-2 rounded-xl transition-all focus:bg-white outline-none ${
                            errors.email
                              ? "border-red-100 focus:border-red-500"
                              : "border-gray-50 focus:border-emerald-500"
                          }`}
                          placeholder="johndoe@example.com"
                        />
                      </div>
                      {errors.email && (
                        <p className="text-xs text-red-500 ml-1 font-medium">
                          {errors.email}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 ml-1">
                        Phone Number
                      </label>
                      <div className="relative group">
                        <Phone
                          className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors ${
                            errors.phone
                              ? "text-red-400"
                              : "text-gray-400 group-focus-within:text-emerald-500"
                          }`}
                        />
                        <input
                          type="tel"
                          value={userData.phone}
                          onChange={(e) =>
                            setUserData({ ...userData, phone: e.target.value })
                          }
                          className={`w-full pl-11 pr-4 py-3 bg-gray-50 border-2 rounded-xl transition-all focus:bg-white outline-none ${
                            errors.phone
                              ? "border-red-100 focus:border-red-500"
                              : "border-gray-50 focus:border-emerald-500"
                          }`}
                          placeholder="Ex: 012-3456789"
                        />
                      </div>
                      {errors.phone && (
                        <p className="text-xs text-red-500 ml-1 font-medium">
                          {errors.phone}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 ml-1">
                        IC Number
                      </label>
                      <div className="relative group">
                        <CreditCard
                          className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors ${
                            errors.ic_number
                              ? "text-red-400"
                              : "text-gray-400 group-focus-within:text-emerald-500"
                          }`}
                        />
                        <input
                          type="text"
                          value={userData.ic_number}
                          onChange={(e) =>
                            setUserData({
                              ...userData,
                              ic_number: e.target.value,
                            })
                          }
                          className={`w-full pl-11 pr-4 py-3 bg-gray-50 border-2 rounded-xl transition-all focus:bg-white outline-none ${
                            errors.ic_number
                              ? "border-red-100 focus:border-red-500"
                              : "border-gray-50 focus:border-emerald-500"
                          }`}
                          placeholder="Ex: 990101-01-1234"
                        />
                      </div>
                      {errors.ic_number && (
                        <p className="text-xs text-red-500 ml-1 font-medium">
                          {errors.ic_number}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end pt-6">
                    <button
                      onClick={handleProfileUpdate}
                      disabled={loading}
                      className="group flex items-center gap-2 px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-200 hover:shadow-emerald-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Save className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                      )}
                      Save Profile
                    </button>
                  </div>
                </div>
              )}

              {/* Security Section */}
              {activeSection === "security" && (
                <div className="space-y-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                        Security Settings
                      </h2>
                      <p className="text-gray-500 mt-1">
                        Update your password to keep your account secure
                      </p>
                    </div>

                    <div className="inline-flex p-1 bg-gray-100 rounded-xl">
                      <button
                        onClick={() => setAuthMethod("password")}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                          authMethod === "password"
                            ? "bg-white text-emerald-600 shadow-sm"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        Password
                      </button>
                      <button
                        onClick={() => setAuthMethod("email")}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                          authMethod === "email"
                            ? "bg-white text-emerald-600 shadow-sm"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        Email Verification
                      </button>
                    </div>
                  </div>

                  <div className="space-y-5 max-w-xl">
                    {authMethod === "password" ? (
                      <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                        <label className="text-sm font-semibold text-gray-700 ml-1">
                          Current Password
                        </label>
                        <div className="relative group">
                          <Lock
                            className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors ${
                              errors.current_password
                                ? "text-red-400"
                                : "text-gray-400 group-focus-within:text-emerald-500"
                            }`}
                          />
                          <input
                            type={showPassword ? "text" : "password"}
                            value={passwordData.current_password}
                            onChange={(e) =>
                              setPasswordData({
                                ...passwordData,
                                current_password: e.target.value,
                              })
                            }
                            className={`w-full pl-11 pr-12 py-3 bg-gray-50 border-2 rounded-xl transition-all focus:bg-white outline-none ${
                              errors.current_password
                                ? "border-red-100 focus:border-red-500"
                                : "border-gray-50 focus:border-emerald-500"
                            }`}
                            placeholder="••••••••"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                        {errors.current_password && (
                          <p className="text-xs text-red-500 ml-1 font-medium">
                            {errors.current_password}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                        <label className="text-sm font-semibold text-gray-700 ml-1">
                          Verification Code (Email)
                        </label>
                        <div className="flex gap-2">
                          <div className="relative group flex-1">
                            <Shield
                              className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors ${
                                errors.code
                                  ? "text-red-400"
                                  : "text-gray-400 group-focus-within:text-emerald-500"
                              }`}
                            />
                            <input
                              type="text"
                              maxLength={6}
                              value={passwordData.code}
                              onChange={(e) =>
                                setPasswordData({
                                  ...passwordData,
                                  code: e.target.value.replace(/\D/g, ""),
                                })
                              }
                              className={`w-full pl-11 pr-4 py-3 bg-gray-50 border-2 rounded-xl transition-all focus:bg-white outline-none text-center tracking-[0.5em] font-mono text-lg ${
                                errors.code
                                  ? "border-red-100 focus:border-red-500"
                                  : "border-gray-50 focus:border-emerald-500"
                              }`}
                              placeholder="000000"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={handleRequestTac}
                            disabled={loading || tacCooldown > 0}
                            className="px-6 py-3 bg-white border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 rounded-xl font-bold transition-all disabled:opacity-50 disabled:border-gray-200 disabled:text-gray-400 flex items-center gap-2 whitespace-nowrap min-w-[140px] justify-center"
                          >
                            {tacCooldown > 0 ? (
                              `${tacCooldown}s`
                            ) : (
                              <>
                                <Send className="h-4 w-4" />
                                {tacSent ? "Resend Code" : "Get Code"}
                              </>
                            )}
                          </button>
                        </div>
                        {errors.code && (
                          <p className="text-xs text-red-500 ml-1 font-medium">
                            {errors.code}
                          </p>
                        )}
                        <p className="text-[11px] text-gray-400 ml-1">
                          Wait a moment while the verification code is sent to
                          your registered email.
                        </p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 ml-1">
                        New Password
                      </label>
                      <div className="relative group">
                        <Lock
                          className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors ${
                            errors.password
                              ? "text-red-400"
                              : "text-gray-400 group-focus-within:text-emerald-500"
                          }`}
                        />
                        <input
                          type={showPassword ? "text" : "password"}
                          value={passwordData.password}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              password: e.target.value,
                            })
                          }
                          className={`w-full pl-11 pr-4 py-3 bg-gray-50 border-2 rounded-xl transition-all focus:bg-white outline-none ${
                            errors.password
                              ? "border-red-100 focus:border-red-500"
                              : "border-gray-50 focus:border-emerald-500"
                          }`}
                          placeholder="Min 8 characters"
                        />
                      </div>
                      {errors.password && (
                        <p className="text-xs text-red-500 ml-1 font-medium">
                          {errors.password}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 ml-1">
                        Confirm New Password
                      </label>
                      <div className="relative group">
                        <Lock
                          className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors ${
                            errors.password_confirmation
                              ? "text-red-400"
                              : "text-gray-400 group-focus-within:text-emerald-500"
                          }`}
                        />
                        <input
                          type={showPassword ? "text" : "password"}
                          value={passwordData.password_confirmation}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              password_confirmation: e.target.value,
                            })
                          }
                          className={`w-full pl-11 pr-4 py-3 bg-gray-50 border-2 rounded-xl transition-all focus:bg-white outline-none ${
                            errors.password_confirmation
                              ? "border-red-100 focus:border-red-500"
                              : "border-gray-50 focus:border-emerald-500"
                          }`}
                          placeholder="Repeat new password"
                        />
                      </div>
                      {errors.password_confirmation && (
                        <p className="text-xs text-red-500 ml-1 font-medium">
                          {errors.password_confirmation}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end pt-6 border-t border-gray-100">
                    <button
                      onClick={handlePasswordUpdate}
                      disabled={loading}
                      className="group flex items-center gap-2 px-8 py-3.5 bg-gray-900 hover:bg-black text-white rounded-xl font-bold transition-all shadow-lg shadow-gray-200 active:scale-95 disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Lock className="h-5 w-5 group-hover:-translate-y-0.5 transition-transform" />
                      )}
                      Change Password
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cropper Modal */}
      {isCropping && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-4">
          <div className="relative w-full max-w-xl aspect-square bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
            <button
              onClick={() => setIsCropping(false)}
              className="absolute top-4 right-4 z-[110] p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="absolute inset-0">
              <Cropper
                image={image}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
          </div>

          <div className="w-full max-w-xl mt-8 space-y-6">
            <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-md">
              <label className="block text-white text-sm font-medium mb-4 text-center">
                Zoom Level
              </label>
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                aria-labelledby="Zoom"
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setIsCropping(false)}
                className="flex-1 px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={createCroppedImage}
                className="flex-3 px-12 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
              >
                Apply Crop
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

// --- Helper Functions ---

async function getCroppedImg(imageSrc, pixelCrop) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return canvas.toDataURL("image/jpeg");
}

function createImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });
}

export default SettingsPage;
