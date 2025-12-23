"use client";

import { DateInput, FeeInput, NumericInput } from "../inputs";
import SavedLocationPicker from "../SavedLocationPicker";
import { Check } from "lucide-react";

/**
 * Reusable form fields for participant category
 * Used for both adding new and editing existing categories
 */
export default function CategoryFormFields({
  categoryForm,
  setCategoryForm,
  categoryErrors,
  setCategoryErrors,
  language,
}) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Category Name */}
      <div className="col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {language === "ms" ? "Nama Kategori *" : "Category Name *"}
        </label>
        <input
          type="text"
          value={categoryForm.category_name}
          onChange={(e) => {
            setCategoryForm({
              ...categoryForm,
              category_name: e.target.value,
            });
            if (categoryErrors.category_name) {
              setCategoryErrors((prev) => ({
                ...prev,
                category_name: undefined,
              }));
            }
          }}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
            categoryErrors.category_name ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="e.g., 10km Fun Run, 21km Marathon, Elite Category"
        />
        {categoryErrors.category_name && (
          <p className="text-red-600 text-sm mt-1">
            {categoryErrors.category_name}
          </p>
        )}
      </div>

      {/* Custom Event Date/Time Checkbox */}
      <div className="col-span-2">
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <input
            type="checkbox"
            id="has_custom_datetime"
            checked={categoryForm.has_custom_datetime}
            onChange={(e) => {
              setCategoryForm({
                ...categoryForm,
                has_custom_datetime: e.target.checked,
              });
            }}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label
            htmlFor="has_custom_datetime"
            className="text-sm font-medium text-gray-700 cursor-pointer"
          >
            {language === "ms"
              ? "Tetapkan tarikh/masa berbeza untuk kategori ini"
              : "Set different date/time for this category"}
          </label>
        </div>
      </div>

      {/* Event Date & Time - Conditional */}
      {categoryForm.has_custom_datetime && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {language === "ms" ? "Tarikh Acara" : "Event Date"}
            </label>
            <DateInput
              value={categoryForm.event_date}
              onChange={(value) => {
                setCategoryForm({ ...categoryForm, event_date: value });
                if (categoryErrors.event_date) {
                  setCategoryErrors((prev) => ({
                    ...prev,
                    event_date: undefined,
                  }));
                }
              }}
              error={categoryErrors.event_date}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {language === "ms" ? "Masa Acara" : "Event Time"}
            </label>
            <input
              type="time"
              value={categoryForm.event_time}
              onChange={(e) => {
                setCategoryForm({
                  ...categoryForm,
                  event_time: e.target.value,
                });
                if (categoryErrors.event_time) {
                  setCategoryErrors((prev) => ({
                    ...prev,
                    event_time: undefined,
                  }));
                }
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                categoryErrors.event_time ? "border-red-500" : "border-gray-300"
              }`}
            />
            {categoryErrors.event_time && (
              <p className="text-red-600 text-sm mt-1">
                {categoryErrors.event_time}
              </p>
            )}
          </div>
        </>
      )}

      {/* Capacity Type - Radio Buttons */}
      <div className="col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {language === "ms" ? "Jenis Kapasiti *" : "Capacity Type *"}
        </label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="capacity_type"
              value="unlimited"
              checked={categoryForm.capacity_type === "unlimited"}
              onChange={(e) =>
                setCategoryForm({
                  ...categoryForm,
                  capacity_type: e.target.value,
                  capacity: "", // Reset capacity when changing type
                })
              }
              className="h-4 w-4 text-blue-600"
            />
            <span className="text-sm text-gray-700">
              {language === "ms" ? "Tanpa Had" : "Unlimited"}
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="capacity_type"
              value="limited"
              checked={categoryForm.capacity_type === "limited"}
              onChange={(e) =>
                setCategoryForm({
                  ...categoryForm,
                  capacity_type: e.target.value,
                })
              }
              className="h-4 w-4 text-blue-600"
            />
            <span className="text-sm text-gray-700">
              {language === "ms" ? "Terhad" : "Limited"}
            </span>
          </label>
        </div>
      </div>

      {/* Capacity - Conditional */}
      {categoryForm.capacity_type === "limited" && (
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === "ms"
              ? "Bilangan Peserta Maksimum *"
              : "Maximum Participants *"}
          </label>
          <NumericInput
            value={categoryForm.capacity}
            onChange={(value) => {
              setCategoryForm({ ...categoryForm, capacity: value });
              if (categoryErrors.capacity) {
                setCategoryErrors((prev) => ({
                  ...prev,
                  capacity: undefined,
                }));
              }
            }}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              categoryErrors.capacity ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="100"
          />
          {categoryErrors.capacity && (
            <p className="text-red-600 text-sm mt-1">
              {categoryErrors.capacity}
            </p>
          )}
        </div>
      )}

      {/* Category Location Checkbox */}
      <div className="col-span-2">
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <input
            type="checkbox"
            id="has_category_location"
            checked={categoryForm.has_category_location}
            onChange={(e) => {
              setCategoryForm({
                ...categoryForm,
                has_category_location: e.target.checked,
              });
            }}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label
            htmlFor="has_category_location"
            className="text-sm font-medium text-gray-700 cursor-pointer"
          >
            {language === "ms"
              ? "Tetapkan lokasi berbeza untuk kategori ini"
              : "Set different location for this category"}
          </label>
        </div>
      </div>

      {/* Location Fields - Conditional */}
      {categoryForm.has_category_location && (
        <>
          <div className="col-span-2">
            <SavedLocationPicker
              locationData={{
                location_type: categoryForm.location_type || "event_location",
                location_name: categoryForm.location_name || "",
                latitude: categoryForm.latitude,
                longitude: categoryForm.longitude,
                location_details: categoryForm.location_details || "",
              }}
              onLocationChange={(locationData) => {
                setCategoryForm({
                  ...categoryForm,
                  location_type: locationData.location_type,
                  location_name: locationData.location_name,
                  latitude: locationData.latitude,
                  longitude: locationData.longitude,
                  location_details: locationData.location_details,
                });
                // Clear any location-related errors
                if (categoryErrors.location_name) {
                  setCategoryErrors((prev) => ({
                    ...prev,
                    location_name: undefined,
                  }));
                }
              }}
              error={categoryErrors.location_name}
              language={language}
            />
          </div>
        </>
      )}

      {/* Fee Checkbox */}
      <div className="col-span-2">
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <input
            type="checkbox"
            id="has_fee"
            checked={categoryForm.has_fee}
            onChange={(e) => {
              setCategoryForm({
                ...categoryForm,
                has_fee: e.target.checked,
                fee_type: e.target.checked ? "fixed" : "",
                base_fee: "",
              });
            }}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label
            htmlFor="has_fee"
            className="text-sm font-medium text-gray-700 cursor-pointer"
          >
            {language === "ms"
              ? "Kategori ini memerlukan bayaran penyertaan"
              : "This category requires  participation fee"}
          </label>
        </div>
      </div>

      {/* Base Fee - Conditional */}
      {categoryForm.has_fee && (
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === "ms" ? "Yuran Asas *" : "Base Fee *"}
          </label>
          <FeeInput
            value={categoryForm.base_fee}
            onChange={(value) => {
              setCategoryForm({ ...categoryForm, base_fee: value });
              if (categoryErrors.base_fee) {
                setCategoryErrors((prev) => ({
                  ...prev,
                  base_fee: undefined,
                }));
              }
            }}
            placeholder="0.00"
            language={language}
            error={categoryErrors.base_fee}
            showHelper={true}
          />
        </div>
      )}

      {/* Description */}
      <div className="col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {language === "ms" ? "Keterangan" : "Description"}
          <span className="text-gray-400 text-xs ml-1">(Optional)</span>
        </label>
        <textarea
          value={categoryForm.description}
          onChange={(e) =>
            setCategoryForm({
              ...categoryForm,
              description: e.target.value,
            })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          rows={3}
          placeholder={
            language === "ms"
              ? "Huraikan kategori ini..."
              : "Describe this category..."
          }
        />
      </div>

      {/* T-Shirts - Checkboxes */}
      <div className="col-span-2">
        <div className="space-y-2">
          <label className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
            <input
              type="checkbox"
              checked={categoryForm.has_event_tshirt}
              onChange={(e) =>
                setCategoryForm({
                  ...categoryForm,
                  has_event_tshirt: e.target.checked,
                })
              }
              className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
            />
            <span className="text-sm text-gray-700">
              Provide Event T-shirt for this category
            </span>
          </label>
          <label className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
            <input
              type="checkbox"
              checked={categoryForm.has_finisher_tshirt}
              onChange={(e) =>
                setCategoryForm({
                  ...categoryForm,
                  has_finisher_tshirt: e.target.checked,
                })
              }
              className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
            />
            <span className="text-sm text-gray-700">
              Provide Finisher T-shirt for this category
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
