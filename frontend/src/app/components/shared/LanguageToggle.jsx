"use client";

import { useLanguage } from "../../contexts/LanguageContext";

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <button
      onClick={() => setLanguage(language === "en" ? "ms" : "en")}
      className="px-3 py-1.5 text-sm font-medium rounded-lg border-2 transition-colors"
      style={{
        borderColor: language === "ms" ? "#10b981" : "#e5e7eb",
        backgroundColor: language === "ms" ? "#ecfdf5" : "white",
        color: language === "ms" ? "#059669" : "#6b7280",
      }}
    >
      {language === "en" ? "🇲🇾 BM" : "🇬🇧 EN"}
    </button>
  );
}
