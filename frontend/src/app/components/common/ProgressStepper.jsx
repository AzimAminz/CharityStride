"use client";

import { Check } from "lucide-react";

export default function ProgressStepper({ steps, currentStep }) {
  return (
    <div className="flex items-center justify-center">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;
        const Icon = step.icon;

        return (
          <div key={step.id} className="flex items-center">
            {/* Step Circle */}
            <div className="flex flex-col items-center">
              <div
                className={`relative flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all ${
                  isCompleted
                    ? "border-emerald-500 bg-emerald-500"
                    : isActive
                    ? "border-purple-600 bg-purple-600"
                    : "border-gray-300 bg-white"
                }`}
              >
                {isCompleted ? (
                  <Check className="h-6 w-6 text-white" />
                ) : (
                  <Icon
                    className={`h-6 w-6 ${
                      isActive ? "text-white" : "text-gray-400"
                    }`}
                  />
                )}
              </div>
              <span
                className={`mt-2 text-xs font-bold ${
                  isActive || isCompleted ? "text-gray-900" : "text-gray-400"
                }`}
              >
                {step.label}
              </span>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                className={`h-0.5 w-16 mx-4 transition-all ${
                  isCompleted ? "bg-emerald-500" : "bg-gray-300"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
