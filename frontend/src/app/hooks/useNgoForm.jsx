import { useState } from "react";
import { useRouter } from "next/navigation";
import { uploadFile, deleteFile, submitNgoRegistration } from "../lib/ngo";
import { validateNgoRegistration, scrollToFirstError } from "../lib/validation";

/**
 * Custom hook for NGO Registration Form
 * Handles all form state, validation, and submission logic
 */
export function useNgoForm() {
  const router = useRouter();

  // Form state
  const [form, setForm] = useState({
    name: "",
    registration_no: "",
    registration_type: "",
    category: "",
    established_date: null,
    description: "",
    logo_url: "",
    address: "",
    city: "",
    state: "",
    postcode: "",
    latitude: null,
    longitude: null,
    contact_email: "",
    contact_phone: "",
    bank_name: "",
    bank_account_no: "",
    bank_account_name: "",
    registration_doc_url: "",
  });

  // UI states
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [previewLogo, setPreviewLogo] = useState(null);

  // Constants
  const malaysianBanks = [
    "Maybank",
    "CIMB Bank",
    "Public Bank",
    "RHB Bank",
    "Hong Leong Bank",
    "AmBank",
    "Bank Islam Malaysia",
    "HSBC Bank Malaysia",
    "Standard Chartered Bank",
    "OCBC Bank",
    "United Overseas Bank (UOB)",
    "Affin Bank",
    "Alliance Bank",
    "Bank Muamalat Malaysia",
    "Bank Rakyat",
    "BSN (Bank Simpanan Nasional)",
    "MBSB Bank",
    "Agrobank",
    "Bank Kerjasama Rakyat",
    "Other",
  ];

  // Form handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleDateChange = (date) => {
    setForm((prev) => ({ ...prev, established_date: date }));
    if (errors.established_date)
      setErrors((prev) => ({ ...prev, established_date: undefined }));
  };

  const handleLocationSelect = (location) => {
    setForm((prev) => ({
      ...prev,
      latitude: location.lat,
      longitude: location.lng,
      address: location.address || prev.address,
      city: location.city || prev.city,
      state: location.state || prev.state,
      postcode: location.postcode || prev.postcode,
    }));

    // Clear errors for auto-filled fields
    setErrors((prev) => ({
      ...prev,
      address: undefined,
      city: undefined,
      state: undefined,
      postcode: undefined,
    }));
  };

  // File upload handlers
  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const url = await uploadFile(file, "logo", form.logo_url);
      setForm((prev) => ({ ...prev, logo_url: url }));
      setPreviewLogo(URL.createObjectURL(file));
    } catch (error) {
      setAlert({ type: "error", message: error.message });
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleDocUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingDoc(true);
    try {
      const url = await uploadFile(file, "doc", form.registration_doc_url);
      setForm((prev) => ({ ...prev, registration_doc_url: url }));
      setAlert({ type: "success", message: "Document uploaded successfully!" });
    } catch (error) {
      setAlert({ type: "error", message: error.message });
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleDeleteLogo = async () => {
    if (!form.logo_url) return;

    try {
      await deleteFile(form.logo_url);
      setForm((prev) => ({ ...prev, logo_url: "" }));
      setPreviewLogo(null);
    } catch (error) {
      console.error("Error deleting logo:", error);
    }
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate using lib function
    const validationErrors = validateNgoRegistration(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setAlert({
        type: "error",
        message: "Please fix the errors before submitting",
      });
      scrollToFirstError(validationErrors);
      return;
    }

    setLoading(true);
    setAlert(null);

    try {
      // Format data for submission
      const submissionData = {
        ...form,
        // Convert Date object to YYYY-MM-DD string in Malaysia timezone
        established_date: form.established_date
          ? new Date(
              form.established_date.getTime() -
                form.established_date.getTimezoneOffset() * 60000
            )
              .toISOString()
              .split("T")[0]
          : null,
      };

      await submitNgoRegistration(submissionData);
      setAlert({
        type: "success",
        message: "Registration submitted successfully!",
      });
      setTimeout(() => {
        router.push("/ngo/register/success");
      }, 1500);
    } catch (error) {
      setAlert({ type: "error", message: error.message });
    } finally {
      setLoading(false);
    }
  };

  return {
    // Form state
    form,
    errors,
    alert,
    loading,
    uploadingLogo,
    uploadingDoc,
    previewLogo,
    malaysianBanks,

    // Form handlers
    handleChange,
    handleDateChange,
    handleLocationSelect,
    handleLogoUpload,
    handleDocUpload,
    handleDeleteLogo,
    handleSubmit,
    setAlert,
  };
}
