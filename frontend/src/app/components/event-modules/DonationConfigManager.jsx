"use client";

import { useEffect } from "react";
import { FeeInput } from "../inputs";
import ImageUpload from "../inputs/ImageUpload";
import { useLanguage } from "../../contexts/LanguageContext";

/**
 * Component for configuring donation module
 * Simplified to only handle Money Donation (Poster + Target Amount)
 * Item Donation feature has been removed as per requirement.
 */
export default function DonationConfigManager({ config, onUpdateConfig }) {
  const { language } = useLanguage();

  // Ensure accepts_money is true by default when this component is active
  useEffect(() => {
    // If we are in this config manager, we strictly want money donations enabled.
    // If it's not enabled, enable it.
    if (config && !config.accepts_money) {
      onUpdateConfig({ ...config, accepts_money: true });
    }
  }, [config?.accepts_money, onUpdateConfig]);

  if (!config) return null;

  return (
    <div className="space-y-4">
      {/* Section Title */}
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-gray-900">
          {language === "ms" ? "Konfigurasi Derma" : "Donation Configuration"}
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          {language === "ms"
            ? "Tetapkan iklan promosi dan sasaran kutipan untuk kempen derma ini"
            : "Set promotion poster and target amount for this donation campaign"}
        </p>
      </div>

      {/* General Settings: Poster & Target */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6">
        <h4 className="text-md font-semibold text-gray-800 mb-4 pb-2 border-b">
          {language === "ms" ? "Tetapan Umum" : "General Settings"}
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Poster Upload */}
          <div>
            <ImageUpload
              label={
                language === "ms"
                  ? "Poster Derma (Pilihan)"
                  : "Donation Poster (Optional)"
              }
              value={config.poster_url}
              onChange={(url) => onUpdateConfig({ ...config, poster_url: url })}
              aspectRatio={210 / 297} // A4 Portrait
              recommendedSize="A4"
            />
            <p className="text-xs text-gray-500 mt-2">
              {language === "ms"
                ? "Muat naik poster promosi untuk kempen derma ini"
                : "Upload a promotional poster for this donation campaign"}
            </p>
          </div>

          {/* Target Amount */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === "ms"
                  ? "Sasaran Kutipan (RM)"
                  : "Target Donation Amount (RM)"}
                <span className="text-gray-400 font-normal ml-1">
                  (Optional)
                </span>
              </label>
              <FeeInput
                value={config.target_amount}
                onChange={(value) =>
                  onUpdateConfig({ ...config, target_amount: value })
                }
                placeholder="0.00"
                language={language}
              />
              <p className="text-xs text-gray-500 mt-2">
                {language === "ms"
                  ? "Tetapkan sasaran kutipan untuk dipaparkan kepada umum"
                  : "Set a fundraising goal to display to the public"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
