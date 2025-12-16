export const translations = {
  en: {
    // Common
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    add: "Add",
    remove: "Remove",

    // Validation messages
    required: "This field is required",
    invalidDate: "Invalid date",
    dateMustBeFuture: "Date must be in the future",
    startDateBeforeEnd: "Start date must be before end date",
    invalidNumber: "Please enter a valid number",
    mustBePositive: "Must be a positive number",

    // Fee input
    enterAmount: "Enter amount in cents",
    exampleAmount: "e.g., 3000 = RM 30.00",

    // Date input
    selectDate: "Select date",
    pastDatesNotAllowed: "Past dates are not allowed",
  },
  ms: {
    // Common
    save: "Simpan",
    cancel: "Batal",
    delete: "Padam",
    edit: "Ubah",
    add: "Tambah",
    remove: "Buang",

    // Validation messages
    required: "Medan ini diperlukan",
    invalidDate: "Tarikh tidak sah",
    dateMustBeFuture: "Tarikh mesti pada masa hadapan",
    startDateBeforeEnd: "Tarikh mula mesti sebelum tarikh tamat",
    invalidNumber: "Sila masukkan nombor yang sah",
    mustBePositive: "Mesti nombor positif",

    // Fee input
    enterAmount: "Masukkan jumlah dalam sen",
    exampleAmount: "cth: 3000 = RM 30.00",

    // Date input
    selectDate: "Pilih tarikh",
    pastDatesNotAllowed: "Tarikh lepas tidak dibenarkan",
  },
};

export function useTranslation() {
  // This will be enhanced with useLanguage hook
  return (key, lang = "en") => translations[lang][key] || key;
}
