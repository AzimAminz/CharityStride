"use client";

import React, { useState, useEffect, useCallback } from "react";
import Layout from "@/app/components/Layout";
import {
  User,
  Mail,
  Phone,
  CreditCard,
  Lock,
  Eye,
  EyeOff,
  Save,
  Camera,
  AlertCircle,
  CheckCircle2,
  X,
  Shield,
  Send,
  Building2,
  MapPin,
  Search,
} from "lucide-react";
import Cropper from "react-easy-crop";
import {
  useLoadScript,
  Autocomplete,
  GoogleMap,
  Marker,
} from "@react-google-maps/api";
import { api, getStorageUrl } from "@/app/lib/api";

const libraries = ["places"];

const NGOSettingsPage = () => {
  const [activeSection, setActiveSection] = useState("ngo");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [errors, setErrors] = useState({});

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const autocompleteRef = React.useRef(null);

  // Account (User) Data
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    ic_number: "",
    photo: "",
  });

  // NGO Data
  const [ngoData, setNgoData] = useState({
    name: "",
    description: "",
    contact_email: "",
    contact_phone: "",
    address: "",
    city: "",
    state: "",
    postcode: "",
    logo_url: "",
    latitude: 3.139,
    longitude: 101.6869,
    bank_name: "",
    bank_account_name: "",
    bank_account_no: "",
  });

  const [passwordData, setPasswordData] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
    code: "",
  });

  const [authMethod, setAuthMethod] = useState("password");
  const [tacSent, setTacSent] = useState(false);
  const [tacCooldown, setTacCooldown] = useState(0);

  // Cropping State
  const [cropTarget, setCropTarget] = useState(null); // 'user' or 'ngo'
  const [image, setImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isCropping, setIsCropping] = useState(false);

  useEffect(() => {
    if (tacCooldown > 0) {
      const timer = setTimeout(() => setTacCooldown(tacCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [tacCooldown]);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        // Fetch current user (which includes NGO)
        const response = await api.get("/auth/profile");
        const user = response.data.user;
        const ngo = user.ngo || {};

        setUserData({
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
          ic_number: user.ic_number || "",
          photo: user.photo || "",
        });

        const safeLat = parseFloat(ngo.latitude);
        const safeLng = parseFloat(ngo.longitude);

        setNgoData({
          name: ngo.name || "",
          description: ngo.description || "",
          contact_email: ngo.contact_email || "",
          contact_phone: ngo.contact_phone || "",
          address: ngo.address || "",
          city: ngo.city || "",
          state: ngo.state || "",
          postcode: ngo.postcode || "",
          logo_url: ngo.logo_url || "",
          latitude: Number.isFinite(safeLat) ? safeLat : 3.139,
          longitude: Number.isFinite(safeLng) ? safeLng : 101.6869,
          bank_name: ngo.bank_name || "Maybank",
          bank_account_name: ngo.bank_account_name || "",
          bank_account_no: ngo.bank_account_no || "",
        });
      } catch (err) {
        console.error("Failed to fetch settings data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  const sections = [
    { id: "ngo", label: "NGO Profile", icon: Building2 },
    { id: "banking", label: "Bank Details", icon: CreditCard },
    { id: "account", label: "Account Information", icon: User },
    { id: "security", label: "Security", icon: Lock },
  ];

  // Validation
  const validateNgo = () => {
    const newErrors = {};
    if (!ngoData.name.trim()) newErrors.name = "Organization Name is required";
    if (!ngoData.description.trim())
      newErrors.description = "Description is required";
    if (
      !ngoData.contact_email.trim() ||
      !/\S+@\S+\.\S+/.test(ngoData.contact_email)
    )
      newErrors.contact_email = "Valid Contact Email is required";
    if (!ngoData.contact_phone.trim())
      newErrors.contact_phone = "Contact Phone is required";
    if (!ngoData.address.trim()) newErrors.address = "Address is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateBank = () => {
    const newErrors = {};
    if (!ngoData.bank_account_name.trim())
      newErrors.bank_account_name = "Account Holder Name is required";
    if (!ngoData.bank_account_no.trim())
      newErrors.bank_account_no = "Account Number is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateAccount = () => {
    const newErrors = {};
    if (!userData.name.trim()) newErrors.name = "Full Name is required";
    if (!userData.email.trim() || !/\S+@\S+\.\S+/.test(userData.email))
      newErrors.email = "Valid Email is required";
    if (
      userData.phone &&
      !/^(\+?6?01)[0-46-9]-*[0-9]{7,8}$/.test(userData.phone)
    )
      newErrors.phone = "Invalid Malaysian phone number format";
    if (userData.ic_number && !/^\d{6}-\d{2}-\d{4}$/.test(userData.ic_number))
      newErrors.ic_number = "IC format must be XXXXXX-XX-XXXX";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = () => {
    const newErrors = {};
    if (authMethod === "password" && !passwordData.current_password)
      newErrors.current_password = "Current password is required";
    if (
      authMethod === "email" &&
      (!passwordData.code || passwordData.code.length !== 6)
    )
      newErrors.code = "Verification code is required";
    if (passwordData.password.length < 8)
      newErrors.password = "Password must be at least 8 characters";
    if (passwordData.password !== passwordData.password_confirmation)
      newErrors.password_confirmation = "Passwords do not match";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Image Cropping Handlers
  const onCropComplete = useCallback((_croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleImageChange = (e, target) => {
    if (e.target.files && e.target.files.length > 0) {
      setCropTarget(target);
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setImage(reader.result);
        setIsCropping(true);
      });
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const createCroppedImage = async () => {
    try {
      const croppedImage = await getCroppedImg(image, croppedAreaPixels);
      if (cropTarget === "user") {
        setUserData((prev) => ({ ...prev, photo: croppedImage }));
      } else {
        setNgoData((prev) => ({ ...prev, logo_url: croppedImage }));
      }
      setIsCropping(false);
      setImage(null);
    } catch (e) {
      console.error(e);
    }
  };

  // Update Handlers
  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place && place.formatted_address) {
        const components = place.address_components || [];
        let city = "";
        let state = "";
        let postcode = "";

        components.forEach((component) => {
          const types = component.types;
          if (types.includes("locality")) city = component.long_name;
          else if (types.includes("sublocality") && !city)
            city = component.long_name;

          if (types.includes("administrative_area_level_1"))
            state = component.long_name;
          if (types.includes("postal_code")) postcode = component.long_name;
        });

        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();

        setNgoData((prev) => ({
          ...prev,
          address: place.formatted_address,
          city,
          state,
          postcode,
          latitude: Number.isFinite(lat) ? lat : prev.latitude,
          longitude: Number.isFinite(lng) ? lng : prev.longitude,
        }));
      }
    }
  };

  const handleMapClick = (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      updateLocationFromCoords(lat, lng);
    }
  };

  const updateLocationFromCoords = (lat, lng) => {
    const safeLat = Number(lat);
    const safeLng = Number(lng);

    if (!Number.isFinite(safeLat) || !Number.isFinite(safeLng)) return;

    setNgoData((prev) => ({ ...prev, latitude: safeLat, longitude: safeLng }));

    if (window.google) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === "OK" && results[0]) {
          const components = results[0].address_components || [];
          let city = "";
          let state = "";
          let postcode = "";

          components.forEach((component) => {
            const types = component.types;
            if (types.includes("locality")) city = component.long_name;
            else if (types.includes("sublocality") && !city)
              city = component.long_name;
            if (types.includes("administrative_area_level_1"))
              state = component.long_name;
            if (types.includes("postal_code")) postcode = component.long_name;
          });

          setNgoData((prev) => ({
            ...prev,
            address: results[0].formatted_address,
            city,
            state,
            postcode,
          }));
        }
      });
    }
  };

  const handleNgoUpdate = async () => {
    if (!validateNgo()) return;
    setLoading(true);
    setSuccess(null);
    try {
      const response = await api.put("/ngo/profile", {
        ...ngoData,
        photo: ngoData.logo_url, // Backend expects 'photo' for base64
      });
      setSuccess("NGO profile updated successfully!");
      setNgoData((prev) => ({
        ...prev,
        ...response.data.ngo,
      }));
    } catch (err) {
      setErrors(err.response?.data?.errors || { general: "Update failed" });
    } finally {
      setLoading(false);
    }
  };

  const handleBankUpdate = async () => {
    if (!validateBank()) return;
    setLoading(true);
    setSuccess(null);
    try {
      await api.put("/ngo/bank", ngoData);
      setSuccess("Bank details updated successfully!");
    } catch (err) {
      setErrors(err.response?.data?.errors || { general: "Update failed" });
    } finally {
      setLoading(false);
    }
  };

  const handleAccountUpdate = async () => {
    if (!validateAccount()) return;
    setLoading(true);
    setSuccess(null);
    try {
      const response = await api.put("/user/profile", userData);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      setSuccess("Account Information updated successfully!");
      setUserData(response.data.user);
    } catch (err) {
      setErrors(err.response?.data?.errors || { general: "Update failed" });
    } finally {
      setLoading(false);
    }
  };

  const handleRequestTac = async () => {
    setLoading(true);
    setSuccess(null);
    try {
      await api.post("/user/tac-request");
      setTacSent(true);
      setTacCooldown(60);
      setSuccess("Verification code sent to your email!");
    } catch (err) {
      setErrors({
        general: err.response?.data?.message || "Failed to send code",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (!validatePassword()) return;
    setLoading(true);
    setSuccess(null);
    try {
      const endpoint =
        authMethod === "password"
          ? "/user/password"
          : "/user/password-with-tac";
      await api.put(endpoint, passwordData);
      setSuccess("Password updated successfully!");
      setPasswordData({
        current_password: "",
        password: "",
        password_confirmation: "",
        code: "",
      });
      setTacSent(false);
    } catch (err) {
      setErrors(err.response?.data?.errors || { general: "Update failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8 text-gray-900">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">NGO Settings</h1>
          <p className="text-gray-500 mt-2">
            Configure your organization profile and account security
          </p>
        </div>

        {success && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-medium">{success}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => {
                    setActiveSection(section.id);
                    setSuccess(null);
                    setErrors({});
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left group ${
                    activeSection === section.id
                      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200"
                      : "text-gray-600 hover:bg-emerald-50 hover:text-emerald-600"
                  }`}
                >
                  <section.icon
                    className={`h-5 w-5 ${
                      activeSection === section.id
                        ? ""
                        : "group-hover:scale-110 transition-transform"
                    }`}
                  />
                  <span className="font-medium">{section.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              {/* NGO Profile Section */}
              {activeSection === "ngo" && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight">
                      Organization Profile
                    </h2>
                    <p className="text-gray-500 mt-1">
                      Manage your NGO's public identity and contact details
                    </p>
                  </div>

                  <div className="flex flex-col md:flex-row items-center gap-8 pb-8 border-b border-gray-100">
                    <div className="relative group">
                      <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-gray-100 shadow-inner bg-gray-50">
                        <img
                          src={getStorageUrl(ngoData.logo_url)}
                          alt={ngoData.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <label className="absolute bottom-0 right-0 p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-xl transition-all cursor-pointer hover:scale-110">
                        <Camera className="h-5 w-5" />
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => handleImageChange(e, "ngo")}
                        />
                      </label>
                    </div>
                    <div className="text-center md:text-left">
                      <h3 className="text-xl font-bold">
                        {ngoData.name || "Ngo Name"}
                      </h3>
                      <p className="text-gray-500">
                        {ngoData.contact_email || "contact@ngo.org"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-sm font-semibold text-gray-700 ml-1">
                        Organization Name
                      </label>
                      <input
                        type="text"
                        value={ngoData.name}
                        onChange={(e) =>
                          setNgoData({ ...ngoData, name: e.target.value })
                        }
                        className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl transition-all focus:bg-white outline-none ${
                          errors.name
                            ? "border-red-100 focus:border-red-500"
                            : "border-gray-50 focus:border-emerald-500"
                        }`}
                      />
                      {errors.name && (
                        <p className="text-xs text-red-500 ml-1 font-medium">
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <label className="text-sm font-semibold text-gray-700 ml-1">
                        Description
                      </label>
                      <textarea
                        rows={4}
                        value={ngoData.description}
                        onChange={(e) =>
                          setNgoData({
                            ...ngoData,
                            description: e.target.value,
                          })
                        }
                        className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl transition-all focus:bg-white outline-none ${
                          errors.description
                            ? "border-red-100 focus:border-red-500"
                            : "border-gray-50 focus:border-emerald-500"
                        }`}
                        placeholder="Tell us about your organization..."
                      />
                      {errors.description && (
                        <p className="text-xs text-red-500 ml-1 font-medium">
                          {errors.description}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 ml-1">
                        Contact Email
                      </label>
                      <input
                        type="email"
                        value={ngoData.contact_email}
                        onChange={(e) =>
                          setNgoData({
                            ...ngoData,
                            contact_email: e.target.value,
                          })
                        }
                        className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl transition-all focus:bg-white outline-none ${
                          errors.contact_email
                            ? "border-red-100 focus:border-red-500"
                            : "border-gray-50 focus:border-emerald-500"
                        }`}
                      />
                      {errors.contact_email && (
                        <p className="text-xs text-red-500 ml-1 font-medium">
                          {errors.contact_email}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 ml-1">
                        Contact Phone
                      </label>
                      <input
                        type="tel"
                        value={ngoData.contact_phone}
                        onChange={(e) =>
                          setNgoData({
                            ...ngoData,
                            contact_phone: e.target.value,
                          })
                        }
                        className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl transition-all focus:bg-white outline-none ${
                          errors.contact_phone
                            ? "border-red-100 focus:border-red-500"
                            : "border-gray-50 focus:border-emerald-500"
                        }`}
                      />
                      {errors.contact_phone && (
                        <p className="text-xs text-red-500 ml-1 font-medium">
                          {errors.contact_phone}
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <label className="text-sm font-semibold text-gray-700 ml-1">
                        Address
                      </label>
                      {isLoaded ? (
                        <Autocomplete
                          onLoad={(autocomplete) =>
                            (autocompleteRef.current = autocomplete)
                          }
                          onPlaceChanged={onPlaceChanged}
                          options={{
                            componentRestrictions: { country: "my" },
                            types: ["address"],
                          }}
                        >
                          <div className="relative group">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                            <input
                              type="text"
                              value={ngoData.address}
                              onChange={(e) =>
                                setNgoData({
                                  ...ngoData,
                                  address: e.target.value,
                                })
                              }
                              className={`w-full pl-11 pr-4 py-3 bg-gray-50 border-2 rounded-xl transition-all focus:bg-white outline-none ${
                                errors.address
                                  ? "border-red-100 focus:border-red-500"
                                  : "border-gray-50 focus:border-emerald-500"
                              }`}
                              placeholder="Search for organization address..."
                            />
                          </div>
                        </Autocomplete>
                      ) : (
                        <input
                          type="text"
                          value={ngoData.address}
                          onChange={(e) =>
                            setNgoData({ ...ngoData, address: e.target.value })
                          }
                          className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl transition-all focus:bg-white outline-none ${
                            errors.address
                              ? "border-red-100 focus:border-red-500"
                              : "border-gray-50 focus:border-emerald-500"
                          }`}
                        />
                      )}
                      {errors.address && (
                        <p className="text-xs text-red-500 ml-1 font-medium">
                          {errors.address}
                        </p>
                      )}
                    </div>
                    <div className="md:col-span-2 space-y-4">
                      <label className="text-sm font-semibold text-gray-700 ml-1">
                        Pinpoint Location
                      </label>
                      {isLoaded &&
                        Number.isFinite(ngoData.latitude) &&
                        Number.isFinite(ngoData.longitude) && (
                          <div className="relative rounded-2xl overflow-hidden border-2 border-gray-100 shadow-inner h-[300px]">
                            <GoogleMap
                              mapContainerStyle={{
                                width: "100%",
                                height: "100%",
                              }}
                              center={{
                                lat: Number(ngoData.latitude),
                                lng: Number(ngoData.longitude),
                              }}
                              zoom={15}
                              onClick={handleMapClick}
                              options={{
                                streetViewControl: false,
                                mapTypeControl: false,
                              }}
                            >
                              <Marker
                                position={{
                                  lat: Number(ngoData.latitude),
                                  lng: Number(ngoData.longitude),
                                }}
                                draggable={true}
                                onDragEnd={(e) => {
                                  const lat = e.latLng.lat();
                                  const lng = e.latLng.lng();
                                  if (
                                    Number.isFinite(lat) &&
                                    Number.isFinite(lng)
                                  ) {
                                    updateLocationFromCoords(lat, lng);
                                  }
                                }}
                              />
                            </GoogleMap>
                            <div className="absolute top-4 left-4 right-4 bg-white/90 backdrop-blur-md p-3 rounded-xl shadow-lg border border-white/20 text-xs">
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-emerald-600" />
                                <p className="font-medium">
                                  Click on map or drag the pin to set exact
                                  location
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                    </div>

                    <div className="grid grid-cols-3 gap-4 md:col-span-2">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 ml-1">
                          City
                        </label>
                        <input
                          type="text"
                          value={ngoData.city}
                          onChange={(e) =>
                            setNgoData({ ...ngoData, city: e.target.value })
                          }
                          className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-50 rounded-xl transition-all focus:bg-white focus:border-emerald-500 outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 ml-1">
                          State
                        </label>
                        <input
                          type="text"
                          value={ngoData.state}
                          onChange={(e) =>
                            setNgoData({ ...ngoData, state: e.target.value })
                          }
                          className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-50 rounded-xl transition-all focus:bg-white focus:border-emerald-500 outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 ml-1">
                          Postcode
                        </label>
                        <input
                          type="text"
                          value={ngoData.postcode}
                          onChange={(e) =>
                            setNgoData({ ...ngoData, postcode: e.target.value })
                          }
                          className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-50 rounded-xl transition-all focus:bg-white focus:border-emerald-500 outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-6">
                    <button
                      onClick={handleNgoUpdate}
                      disabled={loading}
                      className="group flex items-center gap-2 px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-lg active:scale-95 disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Save className="h-5 w-5" />
                      )}
                      Save NGO Profile
                    </button>
                  </div>
                </div>
              )}

              {/* Bank Details Section */}
              {activeSection === "banking" && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight">
                      Bank Details
                    </h2>
                    <p className="text-gray-500 mt-1">
                      Configure your settlement account for donations
                    </p>
                  </div>

                  <div className="space-y-5 max-w-xl">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 ml-1">
                        Bank Name
                      </label>
                      <select
                        value={ngoData.bank_name}
                        onChange={(e) =>
                          setNgoData({ ...ngoData, bank_name: e.target.value })
                        }
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-50 rounded-xl transition-all focus:bg-white focus:border-emerald-500 outline-none"
                      >
                        <option>Maybank</option>
                        <option>CIMB Bank</option>
                        <option>Public Bank</option>
                        <option>RHB Bank</option>
                        <option>Hong Leong Bank</option>
                        <option>Bank Islam</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 ml-1">
                        Account Holder Name
                      </label>
                      <input
                        type="text"
                        value={ngoData.bank_account_name}
                        onChange={(e) =>
                          setNgoData({
                            ...ngoData,
                            bank_account_name: e.target.value,
                          })
                        }
                        className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl transition-all focus:bg-white outline-none ${
                          errors.bank_account_name
                            ? "border-red-100 focus:border-red-500"
                            : "border-gray-50 focus:border-emerald-500"
                        }`}
                        placeholder="As per bank statement"
                      />
                      {errors.bank_account_name && (
                        <p className="text-xs text-red-500 ml-1 font-medium">
                          {errors.bank_account_name}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 ml-1">
                        Account Number
                      </label>
                      <input
                        type="text"
                        value={ngoData.bank_account_no}
                        onChange={(e) =>
                          setNgoData({
                            ...ngoData,
                            bank_account_no: e.target.value,
                          })
                        }
                        className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl transition-all focus:bg-white outline-none ${
                          errors.bank_account_no
                            ? "border-red-100 focus:border-red-500"
                            : "border-gray-50 focus:border-emerald-500"
                        }`}
                        placeholder="Enter account number"
                      />
                      {errors.bank_account_no && (
                        <p className="text-xs text-red-500 ml-1 font-medium">
                          {errors.bank_account_no}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end pt-6 border-t border-gray-100">
                    <button
                      onClick={handleBankUpdate}
                      disabled={loading}
                      className="group flex items-center gap-2 px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-lg active:scale-95 disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Save className="h-5 w-5" />
                      )}
                      Save Bank Details
                    </button>
                  </div>
                </div>
              )}

              {/* Account Section */}
              {activeSection === "account" && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight">
                      Account Information
                    </h2>
                    <p className="text-gray-500 mt-1">
                      Update your personal administrator details
                    </p>
                  </div>

                  <div className="flex flex-col md:flex-row items-center gap-8 pb-8 border-b border-gray-100">
                    <div className="relative group">
                      <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-100 shadow-inner bg-gray-50">
                        <img
                          src={getStorageUrl(userData.photo)}
                          alt={userData.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <label className="absolute bottom-0 right-0 p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-xl transition-all cursor-pointer hover:scale-110">
                        <Camera className="h-5 w-5" />
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => handleImageChange(e, "user")}
                        />
                      </label>
                    </div>
                    <div className="text-center md:text-left">
                      <h3 className="text-xl font-bold">
                        {userData.name || "Your Name"}
                      </h3>
                      <p className="text-gray-500">
                        {userData.email || "Email Address"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 ml-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={userData.name}
                        onChange={(e) =>
                          setUserData({ ...userData, name: e.target.value })
                        }
                        className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl transition-all focus:bg-white outline-none ${
                          errors.name
                            ? "border-red-100 focus:border-red-500"
                            : "border-gray-50 focus:border-emerald-500"
                        }`}
                      />
                      {errors.name && (
                        <p className="text-xs text-red-500 ml-1 font-medium">
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 ml-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={userData.email}
                        onChange={(e) =>
                          setUserData({ ...userData, email: e.target.value })
                        }
                        className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl transition-all focus:bg-white outline-none ${
                          errors.email
                            ? "border-red-100 focus:border-red-500"
                            : "border-gray-50 focus:border-emerald-500"
                        }`}
                      />
                      {errors.email && (
                        <p className="text-xs text-red-500 ml-1 font-medium">
                          {errors.email}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 ml-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={userData.phone}
                        onChange={(e) =>
                          setUserData({ ...userData, phone: e.target.value })
                        }
                        className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl transition-all focus:bg-white outline-none ${
                          errors.phone
                            ? "border-red-100 focus:border-red-500"
                            : "border-gray-50 focus:border-emerald-500"
                        }`}
                      />
                      {errors.phone && (
                        <p className="text-xs text-red-500 ml-1 font-medium">
                          {errors.phone}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 ml-1">
                        IC Number
                      </label>
                      <input
                        type="text"
                        value={userData.ic_number}
                        onChange={(e) =>
                          setUserData({
                            ...userData,
                            ic_number: e.target.value,
                          })
                        }
                        className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl transition-all focus:bg-white outline-none ${
                          errors.ic_number
                            ? "border-red-100 focus:border-red-500"
                            : "border-gray-50 focus:border-emerald-500"
                        }`}
                      />
                      {errors.ic_number && (
                        <p className="text-xs text-red-500 ml-1 font-medium">
                          {errors.ic_number}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end pt-6">
                    <button
                      onClick={handleAccountUpdate}
                      disabled={loading}
                      className="group flex items-center gap-2 px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-lg active:scale-95 disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Save className="h-5 w-5" />
                      )}
                      Save Account Details
                    </button>
                  </div>
                </div>
              )}

              {/* Security Section (Copy from Userportal) */}
              {activeSection === "security" && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold tracking-tight">
                        Security Settings
                      </h2>
                      <p className="text-gray-500 mt-1">
                        Update your password to keep your account secure
                      </p>
                    </div>

                    <div className="inline-flex p-1 bg-gray-100 rounded-xl">
                      <button
                        onClick={() => setAuthMethod("password")}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                          authMethod === "password"
                            ? "bg-white text-emerald-600 shadow-sm"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        Password
                      </button>
                      <button
                        onClick={() => setAuthMethod("email")}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                          authMethod === "email"
                            ? "bg-white text-emerald-600 shadow-sm"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        Email Verification
                      </button>
                    </div>
                  </div>

                  <div className="space-y-5 max-w-xl">
                    {authMethod === "password" ? (
                      <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                        <label className="text-sm font-semibold text-gray-700 ml-1">
                          Current Password
                        </label>
                        <div className="relative group">
                          <Lock
                            className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 ${
                              errors.current_password
                                ? "text-red-400"
                                : "text-gray-400 group-focus-within:text-emerald-500"
                            }`}
                          />
                          <input
                            type={showPassword ? "text" : "password"}
                            value={passwordData.current_password}
                            onChange={(e) =>
                              setPasswordData({
                                ...passwordData,
                                current_password: e.target.value,
                              })
                            }
                            className={`w-full pl-11 pr-12 py-3 bg-gray-50 border-2 rounded-xl transition-all focus:bg-white outline-none ${
                              errors.current_password
                                ? "border-red-100 focus:border-red-500"
                                : "border-gray-50 focus:border-emerald-500"
                            }`}
                            placeholder="••••••••"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                        {errors.current_password && (
                          <p className="text-xs text-red-500 ml-1 font-medium">
                            {errors.current_password}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                        <label className="text-sm font-semibold text-gray-700 ml-1">
                          Verification Code (Email)
                        </label>
                        <div className="flex gap-2">
                          <div className="relative group flex-1">
                            <Shield
                              className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 ${
                                errors.code
                                  ? "text-red-400"
                                  : "text-gray-400 group-focus-within:text-emerald-500"
                              }`}
                            />
                            <input
                              type="text"
                              maxLength={6}
                              value={passwordData.code}
                              onChange={(e) =>
                                setPasswordData({
                                  ...passwordData,
                                  code: e.target.value.replace(/\D/g, ""),
                                })
                              }
                              className={`w-full pl-11 pr-4 py-3 bg-gray-50 border-2 rounded-xl transition-all focus:bg-white outline-none text-center tracking-[0.5em] font-mono text-lg ${
                                errors.code
                                  ? "border-red-100 focus:border-red-500"
                                  : "border-gray-50 focus:border-emerald-500"
                              }`}
                              placeholder="000000"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={handleRequestTac}
                            disabled={loading || tacCooldown > 0}
                            className="px-6 py-3 bg-white border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 rounded-xl font-bold transition-all disabled:opacity-50 min-w-[120px]"
                          >
                            {tacCooldown > 0
                              ? `${tacCooldown}s`
                              : tacSent
                              ? "Resend"
                              : "Get Code"}
                          </button>
                        </div>
                        {errors.code && (
                          <p className="text-xs text-red-500 ml-1 font-medium">
                            {errors.code}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 ml-1">
                        New Password
                      </label>
                      <div className="relative group">
                        <Lock
                          className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 ${
                            errors.password
                              ? "text-red-400"
                              : "text-gray-400 group-focus-within:text-emerald-500"
                          }`}
                        />
                        <input
                          type={showPassword ? "text" : "password"}
                          value={passwordData.password}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              password: e.target.value,
                            })
                          }
                          className={`w-full pl-11 pr-12 py-3 bg-gray-50 border-2 rounded-xl transition-all focus:bg-white outline-none ${
                            errors.password
                              ? "border-red-100 focus:border-red-500"
                              : "border-gray-50 focus:border-emerald-500"
                          }`}
                          placeholder="Min 8 characters"
                        />
                      </div>
                      {errors.password && (
                        <p className="text-xs text-red-500 ml-1 font-medium">
                          {errors.password}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 ml-1">
                        Confirm New Password
                      </label>
                      <div className="relative group">
                        <Lock
                          className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 ${
                            errors.password_confirmation
                              ? "text-red-400"
                              : "text-gray-400 group-focus-within:text-emerald-500"
                          }`}
                        />
                        <input
                          type={showPassword ? "text" : "password"}
                          value={passwordData.password_confirmation}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              password_confirmation: e.target.value,
                            })
                          }
                          className={`w-full pl-11 pr-12 py-3 bg-gray-50 border-2 rounded-xl transition-all focus:bg-white outline-none ${
                            errors.password_confirmation
                              ? "border-red-100 focus:border-red-500"
                              : "border-gray-50 focus:border-emerald-500"
                          }`}
                          placeholder="Repeat new password"
                        />
                      </div>
                      {errors.password_confirmation && (
                        <p className="text-xs text-red-500 ml-1 font-medium">
                          {errors.password_confirmation}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end pt-6 border-t border-gray-100">
                    <button
                      onClick={handlePasswordUpdate}
                      disabled={loading}
                      className="group flex items-center gap-2 px-8 py-3.5 bg-gray-900 hover:bg-black text-white rounded-xl font-bold transition-all shadow-lg active:scale-95 disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Lock className="h-5 w-5" />
                      )}
                      Change Password
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cropper Modal */}
      {isCropping && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-white">
          <div className="relative w-full max-w-xl aspect-square bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
            <button
              onClick={() => setIsCropping(false)}
              className="absolute top-4 right-4 z-[110] p-2 bg-white/10 hover:bg-white/20 rounded-full"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="absolute inset-0">
              <Cropper
                image={image}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape={cropTarget === "user" ? "round" : "rect"}
                showGrid={false}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
          </div>

          <div className="w-full max-w-xl mt-8 space-y-6">
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex gap-4">
              <button
                onClick={() => setIsCropping(false)}
                className="flex-1 px-8 py-4 bg-white/10 hover:bg-white/20 font-bold rounded-2xl"
              >
                Cancel
              </button>
              <button
                onClick={createCroppedImage}
                className="flex-3 px-12 py-4 bg-emerald-600 hover:bg-emerald-500 font-bold rounded-2xl shadow-xl"
              >
                Apply Crop
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

// --- Helper Functions ---
const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });

async function getCroppedImg(imageSrc, pixelCrop) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return canvas.toDataURL("image/jpeg");
}

export default NGOSettingsPage;
