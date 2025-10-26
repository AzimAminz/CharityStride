"use client";

import { motion } from "framer-motion";
import { Calendar, Heart, ArrowLeft } from "lucide-react";
import { useState } from "react";
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";
import { useRegister } from "../hooks/useRegister"; 
import { GoogleOAuthProvider } from '@react-oauth/google';

import { PasswordField } from "../../components/PasswordField";
import { InputField } from "../../components/InputField";
import GoogleField from "@/app/components/GoogleField.";

export default function RegisterPage() {

  const {
    form,
    setForm,
    errors,
    loading,
    handleSubmit,
    back
  } = useRegister();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white shadow-lg rounded-3xl p-8 w-full max-w-md"
      >
        {/* Logo + Title */}
        <div className="text-center mb-6">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="flex justify-center"
          >
            <Heart className="text-emerald-500 w-10 h-10" />
          </motion.div>
          <h1 className="text-2xl font-bold text-gray-800 mt-2">
            Create Your Account
          </h1>
          <p className="text-sm text-gray-500">
            Join our community of kindness 💚
          </p>
        </div>

        {/* Error Message */}
        {errors.api && (
          <div className="bg-red-100 text-red-600 p-3 rounded-md mb-4 text-sm">
            {errors.api}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <InputField
            label="Full Name"
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            error={errors.name}
            placeholder="Your name"
          />

          <InputField
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            error={errors.email}
            placeholder="you@example.com"
          />

          <PasswordField
            label="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            show={showPassword}
            setShow={setShowPassword}
            error={errors.password}
          />

          <PasswordField
            label="Confirm Password"
            value={form.confirmPassword}
            onChange={(e) =>
              setForm({ ...form, confirmPassword: e.target.value })
            }
            show={showConfirm}
            setShow={setShowConfirm}
            error={errors.confirmPassword}
          />

          <InputField
            label="Phone Number"
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            error={errors.phone}
            placeholder="e.g. 0123456789"
          />

          {/* Birthdate */}
          <div className="relative">
            <div className="w-full">
              <DatePicker
                selected={form.birthdate}
                onChange={(date) => setForm({ ...form, birthdate: date })}
                dateFormat="dd MMM yyyy"
                showPopperArrow={false}
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                placeholderText="Select your birthdate"
                className={`w-full px-4 py-2.5 mt-1 border rounded-xl text-gray-700 focus:ring-2 focus:outline-none bg-white transition-all ${
                  errors.birthdate
                    ? "border-red-500 focus:ring-red-400"
                    : "border-gray-300 focus:ring-emerald-400"
                }`}
                wrapperClassName="w-full"
                calendarClassName="rounded-xl shadow-lg border border-gray-200"
                popperClassName="z-50"
              />
            </div>
            <Calendar
              className="absolute right-3 top-3 text-emerald-500 hover:text-emerald-700 transition-colors cursor-pointer"
              size={18}
            />
            {errors.birthdate && (
              <p className="text-red-500 text-sm mt-1">{errors.birthdate}</p>
            )}
          </div>

          {/* Register Button */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            disabled={loading}
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-semibold transition-colors"
          >
            {loading ? "Registering..." : "Register"}
          </motion.button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-gray-200"></div>
          <span className="text-gray-400 text-sm">OR</span>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>

        {/* Google Register */}
        
        <GoogleField />

        {/* 🔙 Back Button */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={back}
          className="w-full flex items-center justify-center gap-2 mt-4 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl font-medium transition-all"
        >
          <ArrowLeft size={18} />
          Back to Login
        </motion.button>
      </motion.div>
    </div>
    </GoogleOAuthProvider>
  );
}




