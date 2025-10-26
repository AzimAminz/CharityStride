
// 🔹 Input Component
export function InputField({ label, type, value, onChange, error, placeholder }) {
    return (
      <div>
        <label className="text-sm text-gray-600">{label}</label>
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full px-4 py-2 mt-1 border rounded-xl focus:ring-2 outline-none ${
            error
              ? "border-red-500 focus:ring-red-400"
              : "border-gray-300 focus:ring-emerald-400"
          }`}
        />
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>
    );
  }