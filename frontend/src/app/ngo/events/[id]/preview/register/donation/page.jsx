"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useEventDetail } from "../../../../../../hooks/useEventDetail";
import { ArrowLeft, DollarSign, Package } from "lucide-react";

export default function NGODonationPreviewPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const { event, loading, error } = useEventDetail(id);

  const [donationType, setDonationType] = useState("money");
  const [formData, setFormData] = useState({
    money_amount: "",
    item_donation_option_id: "",
  });

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

  const moneyOptions = event.donation_config?.money_donation_options || [];
  const itemOptions = event.donation_config?.item_donation_options || [];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30">
      {/* Preview Banner */}
      <div className="bg-blue-600 text-white py-2 px-4 text-center text-sm font-semibold">
        📋 NGO PREVIEW MODE - This is how the form will appear to donors
      </div>

      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-sm font-medium">Back to Preview</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Make a Donation
          </h1>
          <p className="text-lg text-gray-600">{event.title}</p>
        </div>

        {/* Donation Type Tabs */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setDonationType("money")}
            className={`flex-1 px-6 py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
              donationType === "money"
                ? "bg-amber-600 text-white shadow-md"
                : "bg-white text-gray-700 border-2 border-gray-200"
            }`}
          >
            <DollarSign className="h-5 w-5" />
            Money Donation
          </button>
          <button
            onClick={() => setDonationType("item")}
            className={`flex-1 px-6 py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
              donationType === "item"
                ? "bg-amber-600 text-white shadow-md"
                : "bg-white text-gray-700 border-2 border-gray-200"
            }`}
          >
            <Package className="h-5 w-5" />
            Item Donation
          </button>
        </div>

        {/* Form Preview */}
        <div className="space-y-8">
          {/* Money Donation */}
          {donationType === "money" && (
            <>
              {moneyOptions.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Select Amount
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {moneyOptions.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            money_amount: option.suggested_amount.toString(),
                          }))
                        }
                        className={`p-4 rounded-lg border-2 transition-all ${
                          formData.money_amount ===
                          option.suggested_amount.toString()
                            ? "border-amber-500 bg-amber-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="text-2xl font-bold text-amber-600 mb-1">
                          RM {(option.suggested_amount / 100).toFixed(2)}
                        </div>
                        {option.description && (
                          <div className="text-xs text-gray-600">
                            {option.description}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Or Enter Custom Amount
                </h2>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                    RM
                  </span>
                  <input
                    type="number"
                    disabled
                    className="w-full pl-14 pr-4 py-3 rounded-lg border-2 border-gray-300 bg-gray-50 text-lg font-semibold"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </>
          )}

          {/* Item Donation */}
          {donationType === "item" && (
            <>
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
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Quantity
                </h2>
                <input
                  type="number"
                  disabled
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 bg-gray-50 text-lg font-semibold"
                  placeholder="Enter quantity"
                />
              </div>
            </>
          )}

          {/* Preview Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition-colors"
            >
              Back to Preview
            </button>
            <button
              type="button"
              disabled
              className="flex-1 px-6 py-3 rounded-lg bg-gray-400 text-white font-bold cursor-not-allowed"
            >
              Complete Donation (Preview Only)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
