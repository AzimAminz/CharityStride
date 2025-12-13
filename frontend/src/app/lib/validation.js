/**
 * Form Validation Functions
 */

/**
 * Validate NGO registration form data
 * @param {Object} form - Form data to validate
 * @returns {Object} Validation errors object
 */
export function validateNgoRegistration(form) {
  const errors = {};

  // Organization Details
  if (!form.name?.trim()) {
    errors.name = "Organization name is required";
  } else if (form.name.length < 3) {
    errors.name = "Name must be at least 3 characters";
  }

  if (!form.registration_no?.trim()) {
    errors.registration_no = "Registration number is required";
  }

  if (!form.registration_type) {
    errors.registration_type = "Registration type is required";
  }

  if (!form.category) {
    errors.category = "Category is required";
  }

  if (!form.description?.trim()) {
    errors.description = "Description is required";
  } else if (form.description.length < 50) {
    errors.description = "Description must be at least 50 characters";
  }

  if (form.established_date && form.established_date > new Date()) {
    errors.established_date = "Established date cannot be in the future";
  }

  // Location
  if (!form.address?.trim()) {
    errors.address = "Address is required";
  }

  if (!form.city?.trim()) {
    errors.city = "City is required";
  }

  if (!form.state) {
    errors.state = "State is required";
  }

  if (!form.postcode?.trim()) {
    errors.postcode = "Postcode is required";
  } else if (!/^\d{5}$/.test(form.postcode)) {
    errors.postcode = "Invalid postcode format (5 digits required)";
  }

  // Contact
  if (!form.contact_email?.trim()) {
    errors.contact_email = "Contact email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contact_email)) {
    errors.contact_email = "Invalid email format";
  }

  if (!form.contact_phone?.trim()) {
    errors.contact_phone = "Contact phone is required";
  } else if (
    !/^[0-9+\-\s()]{10,15}$/.test(form.contact_phone.replace(/\s/g, ""))
  ) {
    errors.contact_phone = "Invalid phone number format";
  }

  return errors;
}

/**
 * Validate email format
 * @param {string} email
 * @returns {boolean}
 */
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validate Malaysian postcode
 * @param {string} postcode
 * @returns {boolean}
 */
export function isValidPostcode(postcode) {
  return /^\d{5}$/.test(postcode);
}

/**
 * Validate phone number (Malaysian format)
 * @param {string} phone
 * @returns {boolean}
 */
export function isValidPhone(phone) {
  const cleaned = phone.replace(/\s/g, "");
  return /^[0-9+\-()]{10,15}$/.test(cleaned);
}

/**
 * Scroll to first error field
 * @param {Object} errors - Validation errors object
 */
export function scrollToFirstError(errors) {
  if (Object.keys(errors).length === 0) return;

  const firstErrorField = Object.keys(errors)[0];
  const element = document.querySelector(`[name="${firstErrorField}"]`);

  if (element) {
    element.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
    element.focus();
  }
}
