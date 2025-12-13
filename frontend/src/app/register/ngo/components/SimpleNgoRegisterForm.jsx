"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  FileText,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Upload,
  Building,
  CreditCard,
  Banknote,
  Shield,
  Clock,
  Headphones,
  CheckCircle,
  AlertCircle,
  Loader2,
  X,
  ArrowLeft,
} from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useAuth } from "../../../hooks/useAuth";
import { useNgoForm } from "../../../hooks/useNgoForm";
import LocationPicker from "../../../components/LocationPicker";
import { useRouter } from "next/navigation";

export default function SimpleNgoRegisterForm({
  states,
  categories,
  registrationTypes,
}) {
  const router = useRouter();
  const { user, loading: authLoading, error: authError } = useAuth("user");

  // Countdown state for auto-redirect (must be at top level)
  const [countdown, setCountdown] = useState(5);

  // All form logic extracted to custom hook
  const {
    form,
    errors,
    alert,
    loading,
    uploadingLogo,
    uploadingDoc,
    previewLogo,
    malaysianBanks,
    handleChange,
    handleDateChange,
    handleLocationSelect,
    handleLogoUpload,
    handleDocUpload,
    handleDeleteLogo,
    handleSubmit,
    setAlert,
  } = useNgoForm();

  // Auto-redirect countdown for users with errors
  useEffect(() => {
    if (authError && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (authError && countdown === 0) {
      // Redirect based on login status
      if (user) {
        router.push("/user/dashboard"); // Logged in, wrong role
      } else {
        router.push("/login"); // Not logged in
      }
    }
  }, [authError, user, countdown, router]);

  // Auth Loading State
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-700">
            Verifying your account...
          </p>
        </div>
      </div>
    );
  }

  // Auth Error State
  if (authError) {
    // Check if user is logged in (wrong role) or not logged in at all
    const isLoggedIn = !!user;

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {isLoggedIn ? "Access Denied" : "Authentication Required"}
          </h2>
          <p className="text-gray-600 mb-6">{authError}</p>

          {isLoggedIn ? (
            <div className="space-y-3">
              <button
                onClick={() => router.push("/user/dashboard")}
                className="w-full px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors"
              >
                Go to Dashboard
              </button>
              <div className="text-sm text-gray-500">
                Redirecting in {countdown} second{countdown !== 1 ? "s" : ""}...
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <button
                onClick={() => router.push("/login")}
                className="w-full px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors"
              >
                Go to Login
              </button>
              <div className="text-sm text-gray-500">
                Redirecting in {countdown} second{countdown !== 1 ? "s" : ""}...
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition-colors group"
        >
          <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back</span>
        </motion.button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Register Your NGO
          </h1>
          <p className="text-lg text-gray-600">
            Join our network of changemakers and make an impact
          </p>
        </motion.div>

        {/* Alert */}
        {alert && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`max-w-2xl mx-auto mb-6 p-4 rounded-lg flex items-start gap-3 ${
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
              className={`flex-1 ${
                alert.type === "error" ? "text-red-800" : "text-green-800"
              }`}
            >
              {alert.message}
            </p>
            <button
              onClick={() => setAlert(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT: Form - 2/3 width */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-2xl shadow-lg p-8 space-y-10"
            >
              {/* Organization Details */}
              <FormSection
                title="Organization Details"
                icon={Building}
                description="Basic information about your NGO"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Organization Name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    error={errors.name}
                    required
                    placeholder="e.g., Save The Children Malaysia"
                  />
                  <Input
                    label="Registration Number"
                    name="registration_no"
                    value={form.registration_no}
                    onChange={handleChange}
                    error={errors.registration_no}
                    required
                    placeholder="e.g., PPM-001-14-1234567"
                  />
                  <Select
                    label="Registration Type"
                    name="registration_type"
                    value={form.registration_type}
                    onChange={handleChange}
                    error={errors.registration_type}
                    required
                    options={registrationTypes}
                  />
                  <Select
                    label="Category"
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    error={errors.category}
                    required
                    options={categories}
                  />
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Established Date
                    </label>
                    <DatePicker
                      selected={form.established_date}
                      onChange={handleDateChange}
                      dateFormat="dd MMM yyyy"
                      showYearDropdown
                      scrollableYearDropdown
                      yearDropdownItemNumber={50}
                      maxDate={new Date()}
                      placeholderText="Select date"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>

                  {/* Logo Upload */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Organization Logo
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                      id="logo-upload"
                      disabled={uploadingLogo}
                    />
                    <label
                      htmlFor="logo-upload"
                      className={`flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                        uploadingLogo
                          ? "border-blue-300 bg-blue-50"
                          : previewLogo || form.logo_url
                          ? "border-emerald-300 bg-emerald-50"
                          : "border-gray-300 hover:border-emerald-400 bg-gray-50"
                      }`}
                    >
                      {uploadingLogo ? (
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                      ) : previewLogo || form.logo_url ? (
                        <div className="relative w-full h-full p-2">
                          <img
                            src={previewLogo || form.logo_url}
                            alt="Logo"
                            className="w-full h-full object-contain"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              handleDeleteLogo();
                            }}
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Upload className="mx-auto h-8 w-8 text-gray-400" />
                          <p className="mt-1 text-sm text-gray-600">
                            Click to upload logo
                          </p>
                          <p className="text-xs text-gray-500">
                            PNG, JPG, SVG • Max 2MB
                          </p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                <Textarea
                  label="Description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  error={errors.description}
                  required
                  rows={4}
                  placeholder="Describe your organization's mission, activities, and impact... (min 50 characters)"
                  helper={`${form.description.length}/50 characters`}
                />
              </FormSection>

              {/* Location & Map - TO BE CONTINUED */}
              {/* Will add Google Maps component in next message */}

              <FormSection
                title="Location"
                icon={MapPin}
                description="Where is your organization located?"
              >
                <Textarea
                  label="Full Address"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  error={errors.address}
                  required
                  rows={2}
                  placeholder="Enter complete street address"
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Input
                    label="City"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    error={errors.city}
                    required
                    placeholder="e.g., Kuala Lumpur"
                  />
                  <Select
                    label="State"
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    error={errors.state}
                    required
                    options={states.map((s) => s.label)}
                  />
                  <Input
                    label="Postcode"
                    name="postcode"
                    value={form.postcode}
                    onChange={handleChange}
                    error={errors.postcode}
                    required
                    placeholder="e.g., 50000"
                  />
                </div>

                {/* Google Maps */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Pin Your Location on Map
                  </label>
                  <LocationPicker
                    onLocationSelect={handleLocationSelect}
                    initialLocation={
                      form.latitude && form.longitude
                        ? { lat: form.latitude, lng: form.longitude }
                        : null
                    }
                    address={form.address}
                  />
                </div>
              </FormSection>

              {/* Contact Information */}
              <FormSection
                title="Contact Information"
                icon={Phone}
                description="How can we reach you?"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Contact Email"
                    name="contact_email"
                    type="email"
                    value={form.contact_email}
                    onChange={handleChange}
                    error={errors.contact_email}
                    required
                    placeholder="organization@example.com"
                  />
                  <Input
                    label="Contact Phone"
                    name="contact_phone"
                    type="tel"
                    value={form.contact_phone}
                    onChange={handleChange}
                    error={errors.contact_phone}
                    required
                    placeholder="+60123456789"
                  />
                </div>
              </FormSection>

              {/* Banking Details */}
              <FormSection
                title="Banking Details (Optional)"
                icon={Banknote}
                description="For donation distribution"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Select
                    label="Bank Name"
                    name="bank_name"
                    value={form.bank_name}
                    onChange={handleChange}
                    options={malaysianBanks}
                    placeholder="Select bank"
                  />
                  <Input
                    label="Account Number"
                    name="bank_account_no"
                    value={form.bank_account_no}
                    onChange={handleChange}
                    placeholder="1234567890"
                  />
                  <div className="md:col-span-2">
                    <Input
                      label="Account Holder Name"
                      name="bank_account_name"
                      value={form.bank_account_name}
                      onChange={handleChange}
                      placeholder="Organization's bank account name"
                    />
                  </div>
                </div>
              </FormSection>

              {/* Document Upload */}
              <FormSection
                title="Registration Document"
                icon={FileText}
                description="Upload your organization's registration certificate"
              >
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,image/*"
                  onChange={handleDocUpload}
                  className="hidden"
                  id="doc-upload"
                  disabled={uploadingDoc}
                />
                <label
                  htmlFor="doc-upload"
                  className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                    uploadingDoc
                      ? "border-blue-300 bg-blue-50"
                      : form.registration_doc_url
                      ? "border-emerald-300 bg-emerald-50"
                      : "border-gray-300 hover:border-orange-400 bg-gray-50"
                  }`}
                >
                  {uploadingDoc ? (
                    <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                  ) : form.registration_doc_url ? (
                    <div className="text-center p-4">
                      <CheckCircle className="mx-auto h-12 w-12 text-emerald-600 mb-2" />
                      <p className="font-medium text-emerald-800">
                        Document uploaded successfully!
                      </p>
                      <p className="text-sm text-emerald-600 mt-1">
                        Click to replace
                      </p>
                    </div>
                  ) : (
                    <div className="text-center p-4">
                      <FileText className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                      <p className="font-medium text-gray-700">
                        Click to upload document
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        PDF, DOC, DOCX, JPG, PNG • Max 5MB
                      </p>
                    </div>
                  )}
                </label>
              </FormSection>

              {/* Submit Button */}
              <div className="flex justify-end pt-6 border-t">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white font-semibold rounded-lg shadow-lg transition-colors flex items-center gap-3"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5" />
                      Submit Registration
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>

          {/* RIGHT: Info Sidebar - 1/3 width */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <InfoCard
              icon={Shield}
              title="Your Data is Secure"
              description="All information is encrypted and protected"
              color="blue"
            />
            <InfoCard
              icon={Clock}
              title="24-48 Hour Review"
              description="Application reviewed within 2 business days"
              color="emerald"
            />
            <InfoCard
              icon={Headphones}
              title="Need Help?"
              description="Contact support@charitystride.org"
              color="purple"
            />

            {/* Required Documents Checklist */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-orange-600" />
                Required Documents
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Organization registration certificate</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Organization logo (PNG, JPG, or SVG)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span>Bank account details (optional)</span>
                </li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// Helper Components
function FormSection({ title, icon: Icon, description, children }) {
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 pb-4 border-b border-gray-200">
        <div className="p-2 bg-emerald-100 rounded-lg">
          <Icon className="h-6 w-6 text-emerald-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
      <div className="space-y-6">{children}</div>
    </div>
  );
}

function Input({
  label,
  name,
  type = "text",
  value,
  onChange,
  error,
  required,
  placeholder,
  helper,
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${
          error ? "border-red-400" : "border-gray-300"
        }`}
      />
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="h-4 w-4" /> {error}
        </p>
      )}
      {helper && <p className="text-xs text-gray-500">{helper}</p>}
    </div>
  );
}

function Textarea({
  label,
  name,
  value,
  onChange,
  error,
  required,
  placeholder,
  rows = 3,
  helper,
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none ${
          error ? "border-red-400" : "border-gray-300"
        }`}
      />
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="h-4 w-4" /> {error}
        </p>
      )}
      {helper && <p className="text-xs text-gray-500">{helper}</p>}
    </div>
  );
}

function Select({
  label,
  name,
  value,
  onChange,
  error,
  required,
  options,
  placeholder = "Select an option",
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${
          error ? "border-red-400" : "border-gray-300"
        }`}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="h-4 w-4" /> {error}
        </p>
      )}
    </div>
  );
}

function InfoCard({ icon: Icon, title, description, color }) {
  const colors = {
    blue: "from-blue-100 to-cyan-100 text-blue-600",
    emerald: "from-emerald-100 to-teal-100 text-emerald-600",
    purple: "from-purple-100 to-pink-100 text-purple-600",
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-start gap-3">
        <div className={`p-2 bg-gradient-to-br ${colors[color]} rounded-lg`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </div>
  );
}
