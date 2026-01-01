"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DollarSign, Save } from "lucide-react";
import { FeeInput, ImageUpload } from "../inputs";

export default function DonationConfigManager({
  config = {},
  onUpdateConfig,
  onConfigChange,
}) {
  const [isSaving, setIsSaving] = useState(false);
  const [localConfig, setLocalConfig] = useState({
    has_target: false,
    target_amount: null,
    poster_url: "",
  });

  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (config) {
      setLocalConfig({
        has_target: !!config.has_target,
        // Backend stores target_amount as cents (integer), so we pass it directly to FeeInput which expects cents.
        target_amount: config.target_amount,
        poster_url: config.poster_url || "",
      });
    }
  }, [config]);

  const handleFieldChange = async (field, value) => {
    const updated = { ...localConfig, [field]: value };
    setLocalConfig(updated);

    if (onConfigChange) {
      onConfigChange(updated);
    }

    // Auto-save
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await onUpdateConfig({
        has_target: updated.has_target,
        target_amount: updated.has_target ? updated.target_amount : null,
        poster_url: updated.poster_url,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Auto-save donation config failed:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await onUpdateConfig({
        has_target: localConfig.has_target,
        // Send target_amount only if has_target is true, otherwise null
        target_amount: localConfig.has_target
          ? localConfig.target_amount
          : null,
        poster_url: localConfig.poster_url,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Donation Configuration
        </h3>
        <div className="flex items-center gap-3">
          {isSaving && (
            <span className="text-gray-500 text-sm flex items-center gap-2">
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
              Saving...
            </span>
          )}
          {saveSuccess && !isSaving && (
            <span className="text-emerald-600 text-sm font-medium animate-pulse">
              Saved successfully!
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Draft"}
            {!isSaving && <Save className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <DollarSign className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h4 className="font-semibold text-emerald-900">
              Money Donation Only
            </h4>
            <p className="text-sm text-emerald-700 mt-1">
              This event is configured to accept monetary donations. All
              donations will be processed securely via the payment gateway.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Toggle Target */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div>
            <h4 className="font-medium text-gray-900">Fundraising Target</h4>
            <p className="text-sm text-gray-500">
              Set a target amount to display a progress bar on the donation
              page.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={localConfig.has_target}
              onChange={(e) =>
                handleFieldChange("has_target", e.target.checked)
              }
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>

        {/* Target Amount Input */}
        {localConfig.has_target && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 border border-gray-200 rounded-lg"
          >
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Target Amount (RM)
            </label>
            <FeeInput
              value={localConfig.target_amount}
              onChange={(val) => handleFieldChange("target_amount", val)}
              placeholder="10000 (RM 100.00)"
              className="w-full max-w-xs"
            />
            <p className="text-xs text-gray-500 mt-1">
              The goal amount you wish to raise for this event.
            </p>
          </motion.div>
        )}

        {/* Poster Upload */}
        <div className="p-4 border border-gray-200 rounded-lg">
          <ImageUpload
            label="Donation Poster (Optional)"
            value={localConfig.poster_url}
            onChange={(url) => handleFieldChange("poster_url", url)}
            aspectRatio={210 / 297}
            recommendedSize="A4 (2480 x 3508 px)"
            uploadType="poster"
          />
          <p className="text-xs text-gray-500 mt-2">
            Upload a high-quality poster for your donation campaign. A4 size is
            recommended.
          </p>
        </div>
      </div>
    </div>
  );
}
