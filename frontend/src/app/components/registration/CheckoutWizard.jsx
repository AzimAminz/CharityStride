"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ArrowRight,
  ArrowLeft,
  Check,
  Users,
  AlertCircle,
  CreditCard,
  Banknote,
  Smartphone,
  Sparkles,
} from "lucide-react";

export default function CheckoutWizard({
  items,
  total,
  onClose,
  onComplete,
  paymentMethods = ["fpx", "card", "ewallet"],
}) {
  const [step, setStep] = useState(1); // 1: Details, 2: Payment, 3: Success
  const [formData, setFormData] = useState({
    // Auto-filled from user profile (in real app)
    fullName: "Azim Amin",
    email: "azim@example.com",
    phone: "+60123456789",
    icNumber: "",
    emergencyName: "",
    emergencyPhone: "",
    medicalConditions: "",
    dietaryRestrictions: "",
  });
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(
    paymentMethods[0]
  );

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleContinue = () => {
    if (step === 1) {
      // Validate details
      if (
        !formData.icNumber ||
        !formData.emergencyName ||
        !formData.emergencyPhone
      ) {
        alert("Please fill in all required fields");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      // Process payment
      setStep(3);
      // Call onComplete after showing success
      setTimeout(() => {
        onComplete({
          formData,
          paymentMethod: selectedPaymentMethod,
          amount: total,
        });
      }, 3000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-white z-[100] overflow-y-auto"
    >
      <div className="max-w-3xl mx-auto min-h-screen flex flex-col p-6 lg:p-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Progress Dots */}
          <div className="flex items-center gap-2">
            <StepDot active={step === 1} completed={step > 1} />
            <StepDot active={step === 2} completed={step > 2} />
            <StepDot active={step === 3} completed={false} />
          </div>

          {/* Total */}
          <div className="text-right">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Total
            </p>
            <p className="font-bold text-xl">RM {(total / 100).toFixed(2)}</p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <DetailsStep
                key="details"
                formData={formData}
                onChange={handleInputChange}
                onContinue={handleContinue}
              />
            )}
            {step === 2 && (
              <PaymentStep
                key="payment"
                paymentMethods={paymentMethods}
                selectedMethod={selectedPaymentMethod}
                onSelectMethod={setSelectedPaymentMethod}
                total={total}
                onBack={() => setStep(1)}
                onContinue={handleContinue}
              />
            )}
            {step === 3 && <SuccessStep key="success" onClose={onClose} />}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

// Step Dot Indicator
function StepDot({ active, completed }) {
  return (
    <div
      className={`h-2 w-2 rounded-full transition-all ${
        completed ? "bg-emerald-500" : active ? "bg-black w-8" : "bg-gray-200"
      }`}
    />
  );
}

// Step 1: Details
function DetailsStep({ formData, onChange, onContinue }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div>
        <h2 className="text-3xl font-light text-gray-900 mb-2">
          Participant Details
        </h2>
        <p className="text-gray-500">
          Please provide your information for the registration.
        </p>
      </div>

      <div className="space-y-6">
        {/* Primary Contact */}
        <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="h-5 w-5" />
            Primary Contact
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <InputField
              label="Full Name"
              value={formData.fullName}
              onChange={(e) => onChange("fullName", e.target.value)}
              disabled
            />
            <InputField
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => onChange("email", e.target.value)}
              disabled
            />
            <InputField
              label="Phone Number"
              value={formData.phone}
              onChange={(e) => onChange("phone", e.target.value)}
            />
            <InputField
              label="IC / Passport Number *"
              value={formData.icNumber}
              onChange={(e) => onChange("icNumber", e.target.value)}
              placeholder="e.g., 920101-10-1234"
              required
            />
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="p-6 bg-white rounded-3xl border border-gray-200">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            Emergency Contact
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <InputField
              label="Contact Name *"
              value={formData.emergencyName}
              onChange={(e) => onChange("emergencyName", e.target.value)}
              placeholder="e.g., Ahmad Rahman"
              required
            />
            <InputField
              label="Contact Phone *"
              value={formData.emergencyPhone}
              onChange={(e) => onChange("emergencyPhone", e.target.value)}
              placeholder="e.g., +60198765432"
              required
            />
            <div className="md:col-span-2">
              <InputField
                label="Medical Conditions (Optional)"
                value={formData.medicalConditions}
                onChange={(e) => onChange("medicalConditions", e.target.value)}
                placeholder="e.g., Asthma, Allergies"
              />
            </div>
            <div className="md:col-span-2">
              <InputField
                label="Dietary Restrictions (Optional)"
                value={formData.dietaryRestrictions}
                onChange={(e) =>
                  onChange("dietaryRestrictions", e.target.value)
                }
                placeholder="e.g., Vegetarian, No peanuts"
              />
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={onContinue}
        className="w-full py-5 bg-black text-white rounded-2xl font-bold text-lg hover:bg-gray-800 transition-all shadow-xl flex items-center justify-center gap-2"
      >
        Continue to Payment
        <ArrowRight className="h-5 w-5" />
      </button>
    </motion.div>
  );
}

// Step 2: Payment
function PaymentStep({
  paymentMethods,
  selectedMethod,
  onSelectMethod,
  total,
  onBack,
  onContinue,
}) {
  const methodConfig = {
    fpx: { icon: Banknote, label: "FPX Online Banking", color: "blue" },
    card: { icon: CreditCard, label: "Credit / Debit Card", color: "purple" },
    ewallet: { icon: Smartphone, label: "E-Wallet", color: "green" },
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div>
        <button
          onClick={onBack}
          className="text-sm font-bold text-gray-400 hover:text-black mb-4 flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <h2 className="text-3xl font-light text-gray-900 mb-2">
          Payment Method
        </h2>
        <p className="text-gray-500">Select how you'd like to pay.</p>
      </div>

      <div className="space-y-4">
        {paymentMethods.map((method) => {
          const config = methodConfig[method];
          const Icon = config.icon;

          return (
            <button
              key={method}
              onClick={() => onSelectMethod(method)}
              className={`w-full flex items-center gap-4 p-5 rounded-2xl border-2 transition-all ${
                selectedMethod === method
                  ? "border-black bg-gray-50 shadow-lg"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <div
                className={`p-3 bg-white rounded-xl shadow-sm transition-transform ${
                  selectedMethod === method ? "scale-110" : ""
                }`}
              >
                <Icon className="h-6 w-6 text-gray-900" />
              </div>
              <span className="font-bold text-lg flex-1 text-left">
                {config.label}
              </span>
              <div
                className={`h-5 w-5 rounded-full border-2 transition-all ${
                  selectedMethod === method
                    ? "border-black bg-black"
                    : "border-gray-300"
                }`}
              >
                {selectedMethod === method && (
                  <Check className="h-full w-full text-white p-0.5" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      <button
        onClick={onContinue}
        className="w-full py-5 bg-black text-white rounded-2xl font-bold text-lg hover:bg-gray-800 transition-all shadow-xl"
      >
        Pay RM {(total / 100).toFixed(2)}
      </button>
    </motion.div>
  );
}

// Step 3: Success
function SuccessStep({ onClose }) {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="text-center py-12 flex flex-col items-center"
    >
      <div className="h-32 w-32 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-8 animate-bounce">
        <Check className="h-16 w-16" />
      </div>

      <Sparkles className="h-8 w-8 text-amber-400 mb-4 mx-auto" />

      <h2 className="text-4xl font-light text-gray-900 mb-4">
        Registration Successful!
      </h2>

      <p className="text-gray-500 max-w-md mx-auto mb-4 text-lg">
        Thank you for joining! A confirmation email with your e-ticket has been
        sent.
      </p>

      <div className="mb-12 p-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100">
        <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">
          Your Bib Number
        </p>
        <p className="text-5xl font-bold text-emerald-600">A001</p>
      </div>

      <div className="flex gap-4">
        <button
          onClick={onClose}
          className="px-8 py-3 bg-gray-100 text-gray-900 rounded-xl font-bold hover:bg-gray-200 transition-colors"
        >
          Return to Event
        </button>
        <button className="px-8 py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-colors">
          Download Receipt
        </button>
      </div>
    </motion.div>
  );
}

// Input Field Component
function InputField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
  disabled,
}) {
  return (
    <div>
      <label className="block text-sm font-bold text-gray-700 mb-2">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`w-full p-4 rounded-xl border transition-all ${
          disabled
            ? "bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed"
            : "bg-white border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
        }`}
      />
    </div>
  );
}
