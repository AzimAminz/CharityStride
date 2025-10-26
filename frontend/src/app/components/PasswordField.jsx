import { Eye, EyeOff } from "lucide-react";
// 🔹 Password Component
export function PasswordField({ label, value, onChange, show, setShow, error }) {
    const Icon = show ? EyeOff : Eye;
    return (
      <div>
        <label className="text-sm text-gray-600">{label}</label>
        <div className="relative">
          <input
            type={show ? "text" : "password"}
            value={value}
            onChange={onChange}
            className={`w-full px-4 py-2 mt-1 pr-10 border rounded-xl focus:ring-2 outline-none ${
              error
                ? "border-red-500 focus:ring-red-400"
                : "border-gray-300 focus:ring-emerald-400"
            }`}
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
          >
            <Icon size={20} />
          </button>
        </div>
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>
    );
  }