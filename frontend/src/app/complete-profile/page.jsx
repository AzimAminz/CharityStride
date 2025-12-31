"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Phone,
  Calendar,
  User,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { completeProfile } from "../lib/auth";
import { getStoredUser } from "../lib/profile";
import Loading from "../loading";

export default function CompleteProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isChecking, setIsChecking] = useState(true);

  const [formData, setFormData] = useState({
    phone: "",
    ic_number: "",
    birthdate: null,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  // Check user and profile completion in useEffect to avoid hydration issues
  useEffect(() => {
    const storedUser = getStoredUser();

    if (!storedUser) {
      router.push("/login");
      return;
    }

    if (storedUser.phone && storedUser.birthdate) {
      router.push("/user/dashboard");
      return;
    }

    setUser(storedUser);
    setIsChecking(false);
  }, [router]);

  // Show loading while checking auth status
  if (isChecking || !user) {
    return <Loading />;
  }

  const validatePhone = (phone) => {
    const phoneRegex = /^(\+?6?01)[0-46-9]-*[0-9]{7,8}$/;
    if (!phone) return "Phone number is required";
    if (!phoneRegex.test(phone))
      return "Please enter a valid Malaysian phone number";
    return null;
  };

  const validateBirthdate = (date) => {
    if (!date) return "Birthdate is required";
    const age = Math.floor(
      (new Date() - new Date(date)) / (365.25 * 24 * 60 * 60 * 1000)
    );
    if (age < 13) return "You must be at least 13 years old";
    return null;
  };

  const validateIC = (ic) => {
    if (!ic) return "IC number is required";
    const icRegex = /^[0-9]{6}-[0-9]{2}-[0-9]{4}$/;
    if (!icRegex.test(ic))
      return "IC format must be YYMMDD-XX-XXXX (e.g. 990101-01-1234)";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate
    const phoneError = validatePhone(formData.phone);
    const icError = validateIC(formData.ic_number);
    const birthdateError = validateBirthdate(formData.birthdate);

    if (phoneError || icError || birthdateError) {
      setErrors({
        phone: phoneError,
        ic_number: icError,
        birthdate: birthdateError,
      });
      return;
    }

    setLoading(true);
    setErrors({});
    setAlert(null);

    try {
      // Format birthdate as YYYY-MM-DD
      const formattedDate = formData.birthdate.toISOString().split("T")[0];

      await completeProfile({
        phone: formData.phone,
        ic_number: formData.ic_number,
        birthdate: formattedDate,
      });

      setAlert({
        type: "success",
        message: "Profile completed successfully! Redirecting...",
      });

      // Redirect to dashboard after short delay
      setTimeout(() => {
        router.push("/user/dashboard");
      }, 1500);
    } catch (error) {
      setAlert({
        type: "error",
        message:
          error.response?.data?.message ||
          "Failed to update profile. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-cyan-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
            <User className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Complete Your Profile
          </h1>
          <p className="text-gray-600">
            We need a few more details to get you started
          </p>
        </div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          {/* Welcome Message */}
          <div className="mb-6 p-4 bg-emerald-50 rounded-lg border border-emerald-100">
            <p className="text-sm text-emerald-800">
              👋 Welcome, <span className="font-semibold">{user?.name}</span>!
            </p>
          </div>

          {/* Alert */}
          {alert && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
                alert.type === "error"
                  ? "bg-red-50 border border-red-200"
                  : "bg-green-50 border border-green-200"
              }`}
            >
              {alert.type === "error" ? (
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              ) : (
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              )}
              <p
                className={`flex-1 text-sm ${
                  alert.type === "error" ? "text-red-800" : "text-green-800"
                }`}
              >
                {alert.message}
              </p>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Phone Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="tel"
                  placeholder="+60123456789 or 0123456789"
                  value={formData.phone}
                  onChange={(e) => {
                    setFormData({ ...formData, phone: e.target.value });
                    setErrors({ ...errors, phone: null });
                  }}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${
                    errors.phone ? "border-red-400" : "border-gray-300"
                  }`}
                />
              </div>
              {errors.phone && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" /> {errors.phone}
                </p>
              )}
            </div>

            {/* IC Number Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                IC Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="e.g. 990101-01-1234"
                  value={formData.ic_number}
                  onChange={(e) => {
                    setFormData({ ...formData, ic_number: e.target.value });
                    setErrors({ ...errors, ic_number: null });
                  }}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${
                    errors.ic_number ? "border-red-400" : "border-gray-300"
                  }`}
                />
              </div>
              {errors.ic_number && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" /> {errors.ic_number}
                </p>
              )}
            </div>

            {/* Birthdate Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Birthdate <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none z-10" />
                <DatePicker
                  selected={formData.birthdate}
                  onChange={(date) => {
                    setFormData({ ...formData, birthdate: date });
                    setErrors({ ...errors, birthdate: null });
                  }}
                  dateFormat="dd MMM yyyy"
                  showYearDropdown
                  scrollableYearDropdown
                  yearDropdownItemNumber={100}
                  maxDate={new Date()}
                  placeholderText="Select your birthdate"
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${
                    errors.birthdate ? "border-red-400" : "border-gray-300"
                  }`}
                />
              </div>
              {errors.birthdate && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" /> {errors.birthdate}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white font-semibold rounded-lg shadow-lg transition-colors flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Updating Profile...
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5" />
                  Complete Profile
                </>
              )}
            </button>
          </form>

          {/* Info */}
          <p className="mt-6 text-xs text-gray-500 text-center">
            This information helps us provide better service and personalize
            your experience.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
