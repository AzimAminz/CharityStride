"use client";

import { Check, Circle } from "lucide-react";

/**
 * ProgressIndicator - Shows progress through the 3-step form
 */
export default function ProgressIndicator({ currentStep, language = "en" }) {
  const steps =
    language === "ms"
      ? ["Maklumat Asas", "Modul", "Kandungan"]
      : ["Basic Info", "Modules", "Content"];

  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isActive = currentStep === stepNumber;
        const isCompleted = currentStep > stepNumber;

        return (
          <div key={index} className="flex items-center">
            {/* Step indicator */}
            <div className="flex items-center gap-2">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all ${
                  isCompleted
                    ? "bg-emerald-600 border-emerald-600 text-white"
                    : isActive
                    ? "border-emerald-600 text-emerald-600 bg-emerald-50"
                    : "border-gray-300 text-gray-400"
                }`}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <span className="text-sm font-semibold">{stepNumber}</span>
                )}
              </div>
              <span
                className={`text-sm font-medium ${
                  isActive
                    ? "text-emerald-600"
                    : isCompleted
                    ? "text-gray-700"
                    : "text-gray-400"
                }`}
              >
                {step}
              </span>
            </div>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <div
                className={`w-12 h-0.5 mx-2 ${
                  isCompleted ? "bg-emerald-600" : "bg-gray-300"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
