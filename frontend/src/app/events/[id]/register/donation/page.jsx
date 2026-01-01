"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useEventDetail } from "../../../../hooks/useEventDetail";
import { registerDonation } from "../../../../lib/events";
import {
  ArrowLeft,
  DollarSign,
  Package,
  AlertCircle,
  CheckCircle,
  X,
} from "lucide-react";

export default function DonationRegistrationPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const { event, loading, error } = useEventDetail(id, true); // true = use public API endpoint

  const [donationType, setDonationType] = useState("money"); // 'money' or 'item'
  const [showCustomInput, setShowCustomInput] = useState(false); // For 'Others' button
  const [formData, setFormData] = useState({
    // Money donation
    money_amount: "",
    custom_amount: "",
    // Item donation
    item_donation_option_id: "",
    quantity: "1",
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [initialized, setInitialized] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30 flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Event not found</p>
      </div>
    );
  }

  // Redirect if event is not published
  if (!event.is_published) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-xl font-semibold text-gray-900 mb-2">
            Event Not Available
          </p>
          <p className="text-gray-600 mb-4">
            This event is not currently open for donations.
          </p>
          <button
            onClick={() => router.push("/events")}
            className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            Browse Events
          </button>
        </div>
      </div>
    );
  }

  const donationConfig = event.donation_config || {};
  const acceptsMoney = donationConfig.accepts_money !== false; // Default to true if not set
  const acceptsItems = donationConfig.accepts_items !== false; // Default to true if not set

  // Set initial donation type based on config
  // We use a separate effect to avoid infinite loops if we just set it in render
  // But strictly, we can initialize state based on this if we move state init after this check
  // or use an effect. Using an effect is safer with data loading.

  if (!initialized && event) {
    if (acceptsMoney) {
      setDonationType("money");
    } else if (acceptsItems) {
      setDonationType("item");
    }
    setInitialized(true);
  }

  const moneyOptions = event.money_donation_options || [];
  const itemOptions = event.item_donation_options || [];

  // Separate fixed amounts from free amount
  const fixedAmounts = moneyOptions.filter(
    (opt) => opt.suggested_amount !== null
  );
  const hasFreeAmount = moneyOptions.some(
    (opt) => opt.suggested_amount === null
  );

  // Debug: Check donation options data
  console.log("=== DONATION OPTIONS DEBUG ===");
  console.log("Event:", event.title);
  console.log("Config:", donationConfig);
  console.log("Accepts Money:", acceptsMoney);
  console.log("Accepts Items:", acceptsItems);
  console.log("Money options count:", moneyOptions.length);
  console.log("Fixed amounts:", fixedAmounts);
  console.log("Has free amount option:", hasFreeAmount);
  console.log("Item options count:", itemOptions.length);
  console.log("==============================");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleClearForm = () => {
    setFormData({
      money_amount: "",
      custom_amount: "",
      item_donation_option_id: "",
      quantity: "1",
    });
    setShowCustomInput(false);
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};

    if (donationType === "money") {
      if (!formData.money_amount && !formData.custom_amount) {
        newErrors.money_amount = "Please select or enter an amount";
      }
      if (formData.custom_amount && parseFloat(formData.custom_amount) <= 0) {
        newErrors.custom_amount = "Amount must be greater than 0";
      }
    } else {
      if (!formData.item_donation_option_id) {
        newErrors.item_donation_option_id = "Please select an item to donate";
      }
      if (!formData.quantity || parseInt(formData.quantity) <= 0) {
        newErrors.quantity = "Quantity must be at least 1";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    // Prepare payload according to donation_registrations table structure
    let payload = {
      event_id: parseInt(id),
      donation_type: donationType,
    };

    if (donationType === "money") {
      // Convert to cents for amount_paid
      let amountInCents;

      if (formData.money_amount) {
        // Using suggested amount (already in cents)
        const selectedOption = moneyOptions.find(
          (opt) => opt.suggested_amount?.toString() === formData.money_amount
        );

        if (!selectedOption) {
          // Fallback if option not found (shouldn't happen)
          setErrors((prev) => ({
            ...prev,
            money_amount: "Invalid option selected",
          }));
          return;
        }

        amountInCents = selectedOption.suggested_amount;
      } else {
        // Custom amount - convert RM to cents
        amountInCents = Math.round(parseFloat(formData.custom_amount) * 100);
      }

      payload.amount_paid = amountInCents;
      payload.item_name = null;
      payload.quantity = null;
    } else {
      // Item donation - extract item_name from selected option
      const selectedOption = itemOptions.find(
        (opt) => opt.id.toString() === formData.item_donation_option_id
      );

      payload.amount_paid = null;
      payload.item_name = selectedOption.item_name;
      payload.quantity = parseInt(formData.quantity);
    }

    console.log("Donation payload:", payload);

    try {
      const response = await registerDonation(id, payload);
      console.log("Donation response:", response); // Debug response

      setSubmitting(false);

      if (response.requires_payment && response.payment_id) {
        console.log("Redirecting to payment:", response.payment_id);
        // Money donation - redirect to payment page
        router.push(`/payment/mock/${response.payment_id}`);
      } else {
        // Item donation - show success and redirect to registrations
        alert(
          "Thank you for your donation! A receipt has been sent to your email."
        );
        router.push("/user/registrations");
      }
    } catch (error) {
      setSubmitting(false);
      console.error("Donation registration error:", error);
      alert(
        error.response?.data?.message ||
          "Failed to submit donation. Please try again."
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-sm font-medium">Back</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Event Info */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Make a Donation
          </h1>
          <p className="text-lg text-gray-600">{event.title}</p>
        </div>

        {/* Donation Type Tabs - Only show if both are enabled */}
        {acceptsMoney && acceptsItems && (
          <div className="flex gap-2 mb-8">
            <button
              onClick={() => {
                setDonationType("money");
                // Clear item donation data when switching to money
                setFormData((prev) => ({
                  ...prev,
                  item_donation_option_id: "",
                  quantity: "1",
                }));
                setErrors({});
              }}
              className={`flex-1 px-6 py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
                donationType === "money"
                  ? "bg-amber-600 text-white shadow-md"
                  : "bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-300"
              }`}
            >
              <DollarSign className="h-5 w-5" />
              Money Donation
            </button>
            <button
              onClick={() => {
                setDonationType("item");
                // Clear money donation data when switching to item
                setFormData((prev) => ({
                  ...prev,
                  money_amount: "",
                  custom_amount: "",
                }));
                setShowCustomInput(false);
                setErrors({});
              }}
              className={`flex-1 px-6 py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
                donationType === "item"
                  ? "bg-amber-600 text-white shadow-md"
                  : "bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-300"
              }`}
            >
              <Package className="h-5 w-5" />
              Item Donation
            </button>
          </div>
        )}

        {/* Clear Button */}
        {(formData.money_amount ||
          formData.custom_amount ||
          formData.item_donation_option_id) && (
          <div className="flex justify-end mb-4">
            <button
              type="button"
              onClick={handleClearForm}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 hover:border-red-300 transition-all"
            >
              <X className="h-4 w-4" />
              Clear Selection
            </button>
          </div>
        )}

        {/* Donation Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Money Donation */}
          {donationType === "money" && (
            <>
              {/* Fixed Amount Options */}
              {fixedAmounts.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Select Amount
                  </h2>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                    {fixedAmounts.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => {
                          setShowCustomInput(false); // Hide custom input when fixed amount selected
                          setFormData((prev) => ({
                            ...prev,
                            money_amount: option.suggested_amount?.toString(),
                            custom_amount: "",
                          }));
                          setErrors((prev) => ({
                            ...prev,
                            money_amount: "",
                            custom_amount: "",
                          }));
                        }}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          formData.money_amount ===
                          option.suggested_amount?.toString()
                            ? "border-amber-500 bg-amber-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="text-2xl font-bold text-amber-600 mb-1">
                          RM{" "}
                          {option.suggested_amount
                            ? (option.suggested_amount / 100).toFixed(2)
                            : "0.00"}
                        </div>
                        {option.description && (
                          <div className="text-xs text-gray-600">
                            {option.description}
                          </div>
                        )}
                      </button>
                    ))}

                    {/* Others button for free amount */}
                    {hasFreeAmount && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowCustomInput(true);
                          setFormData((prev) => ({
                            ...prev,
                            money_amount: "",
                          }));
                        }}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          showCustomInput
                            ? "border-amber-500 bg-amber-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="text-2xl font-bold text-amber-600 mb-1">
                          Others
                        </div>
                        <div className="text-xs text-gray-600">
                          Enter custom amount
                        </div>
                      </button>
                    )}
                  </div>

                  {errors.money_amount && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.money_amount}
                    </p>
                  )}
                </div>
              )}

              {/* Custom Amount Input - Shows when 'Others' button is clicked */}
              {showCustomInput && (
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Enter Custom Amount
                  </h2>

                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                      RM
                    </span>
                    <input
                      type="number"
                      name="custom_amount"
                      value={formData.custom_amount}
                      onChange={(e) => {
                        handleInputChange(e);
                        setFormData((prev) => ({ ...prev, money_amount: "" }));
                      }}
                      step="0.01"
                      min="0"
                      className={`w-full pl-14 pr-4 py-3 rounded-lg border-2 text-lg font-semibold ${
                        errors.custom_amount
                          ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                          : "border-gray-300 focus:border-amber-500 focus:ring-amber-200"
                      } focus:ring-2 focus:outline-none transition-colors`}
                      placeholder="0.00"
                    />
                  </div>

                  {errors.custom_amount && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.custom_amount}
                    </p>
                  )}
                </div>
              )}
            </>
          )}

          {/* Item Donation */}
          {donationType === "item" && (
            <>
              {/* Item Selection */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Package className="h-5 w-5 text-amber-600" />
                  Select Item to Donate
                </h2>

                <div className="space-y-3">
                  {itemOptions.map((option) => (
                    <label
                      key={option.id}
                      className={`block p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        formData.item_donation_option_id ===
                        option.id.toString()
                          ? "border-amber-500 bg-amber-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="item_donation_option_id"
                          value={option.id}
                          checked={
                            formData.item_donation_option_id ===
                            option.id.toString()
                          }
                          onChange={handleInputChange}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-gray-900">
                              {option.item_name}
                            </span>
                            {option.category && (
                              <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700">
                                {option.category}
                              </span>
                            )}
                          </div>
                          {option.description && (
                            <p className="text-sm text-gray-600 mb-2">
                              {option.description}
                            </p>
                          )}
                          {option.target_quantity && (
                            <p className="text-xs text-gray-500">
                              Target: {option.current_quantity || 0} /{" "}
                              {option.target_quantity} collected
                            </p>
                          )}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>

                {errors.item_donation_option_id && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.item_donation_option_id}
                  </p>
                )}
              </div>

              {/* Quantity */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Quantity
                </h2>

                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  min="1"
                  className={`w-full px-4 py-3 rounded-lg border-2 text-lg font-semibold ${
                    errors.quantity
                      ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                      : "border-gray-300 focus:border-amber-500 focus:ring-amber-200"
                  } focus:ring-2 focus:outline-none transition-colors`}
                  placeholder="Enter quantity"
                />

                {errors.quantity && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.quantity}
                  </p>
                )}
              </div>
            </>
          )}

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-3 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5" />
                  Complete Donation
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
