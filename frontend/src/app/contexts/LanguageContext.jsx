"use client";

import { createContext, useContext, useState, useEffect } from "react";

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState("en");

  // Load language preference from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("charitystride_language");
    if (saved && (saved === "en" || saved === "ms")) {
      setLanguage(saved);
    }
  }, []);

  // Save language preference to localStorage when it changes
  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem("charitystride_language", lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
