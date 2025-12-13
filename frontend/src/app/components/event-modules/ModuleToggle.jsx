"use client";

/**
 * Reusable toggle component for enabling/disabling event modules
 */
export default function ModuleToggle({
  label,
  description,
  checked,
  onChange,
  icon: Icon,
  disabled = false,
}) {
  return (
    <div
      className={`border-2 rounded-lg p-4 transition-all ${
        checked
          ? "border-emerald-500 bg-emerald-50"
          : "border-gray-200 bg-white hover:border-gray-300"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      onClick={() => !disabled && onChange(!checked)}
    >
      <div className="flex items-start gap-4">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="h-5 w-5 mt-1 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded cursor-pointer"
          onClick={(e) => e.stopPropagation()}
        />

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {Icon && <Icon className="h-5 w-5 text-emerald-600" />}
            <h3 className="font-semibold text-gray-900">{label}</h3>
          </div>
          <p className="text-sm text-gray-600">{description}</p>
        </div>

        {checked && (
          <div className="px-3 py-1 bg-emerald-600 text-white text-xs font-medium rounded-full">
            Enabled
          </div>
        )}
      </div>
    </div>
  );
}
