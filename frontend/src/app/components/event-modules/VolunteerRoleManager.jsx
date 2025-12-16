"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Calendar,
  Clock,
  MapPin,
  Users,
  Edit2,
  Save,
  X,
} from "lucide-react";
import SavedLocationPicker from "../SavedLocationPicker";
import {
  fetchVolunteerRoleTypes,
  fetchRequiredSkills,
  fetchShiftTypes,
} from "../../lib/lookupHelpers";
import { NumericInput, DateInput } from "../inputs";
import { useLanguage } from "../../contexts/LanguageContext";

/**
 * Component for managing volunteer roles and shifts
 */
export default function VolunteerRoleManager({
  roles = [],
  shifts = {},
  onAddRole,
  onUpdateRole,
  onRemoveRole,
  onAddShift,
  onUpdateShift,
  onRemoveShift,
}) {
  const { language } = useLanguage();
  // Lookup data from API
  const [roleTypes, setRoleTypes] = useState([]);
  const [requiredSkills, setRequiredSkills] = useState([]);
  const [shiftTypes, setShiftTypes] = useState([]);
  const [loadingLookups, setLoadingLookups] = useState(true);

  const [showRoleForm, setShowRoleForm] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [roleForm, setRoleForm] = useState({
    role_type_id: "",
    custom_role_name: "",
    required_skill_id: "",
    total_capacity: "",
    role_description: "",
    location: "",
    latitude: null,
    longitude: null,
    location_details: "",
    has_tshirt: false,
    tshirt_description: "",
  });

  const [showShiftForm, setShowShiftForm] = useState(null); // roleId when showing
  const [editingShift, setEditingShift] = useState(null); // shift object when editing
  const [shiftForm, setShiftForm] = useState({
    shift_date: "",
    shift_type_id: "",
    start_time: "",
    end_time: "",
    capacity: "",
  });

  // Load lookup data on mount
  useEffect(() => {
    async function loadLookups() {
      try {
        const [types, skills, shifts] = await Promise.all([
          fetchVolunteerRoleTypes(),
          fetchRequiredSkills(),
          fetchShiftTypes(),
        ]);
        setRoleTypes(types);
        setRequiredSkills(skills);
        setShiftTypes(shifts);
      } catch (error) {
        console.error("Failed to load lookup data:", error);
      } finally {
        setLoadingLookups(false);
      }
    }
    loadLookups();
  }, []);

  const resetRoleForm = () => {
    setRoleForm({
      role_type_id: "",
      custom_role_name: "",
      required_skill_id: "",
      total_capacity: "",
      role_description: "",
      location: "",
      latitude: null,
      longitude: null,
      location_details: "",
      has_tshirt: false,
      tshirt_description: "",
    });
    setEditingRole(null);
    setShowRoleForm(false);
  };

  const resetShiftForm = () => {
    setShiftForm({
      shift_date: "",
      shift_type_id: "",
      start_time: "",
      end_time: "",
      capacity: "",
    });
    setShowShiftForm(null);
    setEditingShift(null);
  };

  const handleSaveRole = async () => {
    try {
      // Convert IDs to integers
      const roleData = {
        ...roleForm,
        role_type_id: parseInt(roleForm.role_type_id),
        required_skill_id: parseInt(roleForm.required_skill_id),
      };

      if (editingRole) {
        await onUpdateRole(editingRole.id, roleData);
      } else {
        await onAddRole(roleData);
      }
      resetRoleForm();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSaveShift = async (roleId) => {
    try {
      // Convert shift_type_id to integer
      const shiftData = {
        ...shiftForm,
        shift_type_id: parseInt(shiftForm.shift_type_id),
      };

      if (editingShift) {
        await onUpdateShift(editingShift.id, shiftData);
      } else {
        await onAddShift(roleId, shiftData);
      }
      resetShiftForm();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Volunteer Roles & Shifts
        </h3>
        <button
          type="button"
          onClick={() => setShowRoleForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Role
        </button>
      </div>

      {/* Role Form */}
      {showRoleForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-4">
            {editingRole ? "Edit Role" : "New Volunteer Role"}
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role Type *
              </label>
              <select
                value={roleForm.role_type_id}
                onChange={(e) =>
                  setRoleForm({ ...roleForm, role_type_id: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                required
                disabled={loadingLookups}
              >
                <option value="">
                  {loadingLookups ? "Loading..." : "Select role..."}
                </option>
                {roleTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name_en} / {type.name_ms}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Role Name - Only show when "Others" is selected */}
            {roleTypes.find((t) => t.id === parseInt(roleForm.role_type_id))
              ?.code === "others" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Custom Role Name *
                </label>
                <input
                  type="text"
                  value={roleForm.custom_role_name}
                  onChange={(e) =>
                    setRoleForm({
                      ...roleForm,
                      custom_role_name: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g., Sound Engineer, MC"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Required Skill *
              </label>
              <select
                value={roleForm.required_skill_id}
                onChange={(e) =>
                  setRoleForm({
                    ...roleForm,
                    required_skill_id: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                required
                disabled={loadingLookups}
              >
                <option value="">
                  {loadingLookups ? "Loading..." : "Select skill..."}
                </option>
                {requiredSkills.map((skill) => (
                  <option key={skill.id} value={skill.id}>
                    {skill.name_en} / {skill.name_ms}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Capacity *
              </label>
              <NumericInput
                value={roleForm.total_capacity}
                onChange={(value) =>
                  setRoleForm({ ...roleForm, total_capacity: value })
                }
                placeholder="10"
                language={language}
                required
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={roleForm.role_description}
                onChange={(e) =>
                  setRoleForm({ ...roleForm, role_description: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                rows={2}
                placeholder="Additional details about this role..."
              />
            </div>

            {/* Location Picker with Saved Locations */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Volunteer Location
              </label>
              <SavedLocationPicker
                value={{
                  address: roleForm.location || "",
                  latitude: roleForm.latitude,
                  longitude: roleForm.longitude,
                }}
                onChange={(location) => {
                  setRoleForm({
                    ...roleForm,
                    location: location.address,
                    latitude: location.latitude,
                    longitude: location.longitude,
                  });
                }}
                placeholder="Select volunteer location..."
              />
            </div>

            {/* Location Details */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location Details (Optional)
              </label>
              <textarea
                value={roleForm.location_details}
                onChange={(e) =>
                  setRoleForm({ ...roleForm, location_details: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                rows={2}
                placeholder="Specific instructions or details about the location (e.g., 'Meet at the registration booth')"
              />
            </div>

            {/* T-Shirt Option */}
            <div className="col-span-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={roleForm.has_tshirt}
                  onChange={(e) =>
                    setRoleForm({ ...roleForm, has_tshirt: e.target.checked })
                  }
                  className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Provide T-Shirt for this role
                </span>
              </label>
            </div>

            {/* T-Shirt Description (shown when has_tshirt is true) */}
            {roleForm.has_tshirt && (
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  T-Shirt Description
                </label>
                <input
                  type="text"
                  value={roleForm.tshirt_description}
                  onChange={(e) =>
                    setRoleForm({
                      ...roleForm,
                      tshirt_description: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g., Red polo shirt with event logo"
                />
              </div>
            )}
          </div>

          <div className="flex gap-2 mt-4">
            <button
              type="button"
              onClick={handleSaveRole}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
            >
              <Save className="h-4 w-4" />
              Save Role
            </button>
            <button
              type="button"
              onClick={resetRoleForm}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Roles List */}
      {roles.length === 0 && !showRoleForm && (
        <div className="text-center py-8 text-gray-500">
          No volunteer roles added yet. Click "Add Role" to get started.
        </div>
      )}

      {roles.map((role) => (
        <div key={role.id} className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h4 className="font-semibold text-gray-900">
                {role.custom_role_name ||
                  roleTypes.find((t) => t.id === role.role_type_id)?.name_en ||
                  "Role"}
              </h4>
              <p className="text-sm text-gray-600">
                Skill:{" "}
                {requiredSkills.find((s) => s.id === role.required_skill_id)
                  ?.name_en || "N/A"}{" "}
                • Capacity: {role.total_capacity}
              </p>

              {/* Location Display */}
              {role.location && (
                <div className="mt-2 flex items-start gap-1 text-sm text-emerald-700">
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">{role.location}</p>
                    {role.location_details && (
                      <p className="text-xs text-gray-600 mt-0.5">
                        {role.location_details}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {role.role_description && (
                <p className="text-sm text-gray-600 mt-1">
                  {role.role_description}
                </p>
              )}

              {/* T-Shirt Badge */}
              {role.has_tshirt && (
                <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 bg-emerald-50 border border-emerald-200 rounded-md">
                  <svg
                    className="h-4 w-4 text-emerald-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                  <span className="text-xs font-medium text-emerald-700">
                    T-Shirt: {role.tshirt_description || "Provided"}
                  </span>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditingRole(role);
                  setRoleForm({
                    role_type_id: role.role_type_id,
                    custom_role_name: role.custom_role_name || "",
                    required_skill_id: role.required_skill_id,
                    total_capacity: role.total_capacity,
                    role_description: role.role_description || "",
                    location: role.location || "",
                    latitude: role.latitude || null,
                    longitude: role.longitude || null,
                    location_details: role.location_details || "",
                    has_tshirt: role.has_tshirt || false,
                    tshirt_description: role.tshirt_description || "",
                  });
                  setShowRoleForm(true);
                }}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirm("Delete this role and all its shifts?")) {
                    onRemoveRole(role.id);
                  }
                }}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Shifts for this role */}
          <div className="ml-4 space-y-2">
            <div className="flex items-center justify-between">
              <h5 className="text-sm font-medium text-gray-700">Shifts</h5>
              <button
                type="button"
                onClick={() => setShowShiftForm(role.id)}
                className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                <Plus className="h-3 w-3" />
                Add Shift
              </button>
            </div>

            {/* Shift Form */}
            {showShiftForm === role.id && (
              <div className="bg-gray-50 border border-gray-200 rounded p-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Date *
                    </label>
                    <DateInput
                      value={shiftForm.shift_date}
                      onChange={(value) =>
                        setShiftForm({
                          ...shiftForm,
                          shift_date: value,
                        })
                      }
                      disablePast={true}
                      language={language}
                      className="w-full px-2 py-1 text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Shift Type *
                    </label>
                    <select
                      value={shiftForm.shift_type_id}
                      onChange={(e) =>
                        setShiftForm({
                          ...shiftForm,
                          shift_type_id: e.target.value,
                        })
                      }
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
                      required
                      disabled={loadingLookups}
                    >
                      <option value="">
                        {loadingLookups ? "Loading..." : "Select..."}
                      </option>
                      {shiftTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name_en} / {type.name_ms} (
                          {type.duration_hours
                            ? `${type.duration_hours}h`
                            : "custom"}
                          )
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Start Time *
                    </label>
                    <input
                      type="time"
                      value={shiftForm.start_time}
                      onChange={(e) =>
                        setShiftForm({
                          ...shiftForm,
                          start_time: e.target.value,
                        })
                      }
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      End Time *
                    </label>
                    <input
                      type="time"
                      value={shiftForm.end_time}
                      onChange={(e) =>
                        setShiftForm({ ...shiftForm, end_time: e.target.value })
                      }
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Capacity *
                    </label>
                    <NumericInput
                      value={shiftForm.capacity}
                      onChange={(value) =>
                        setShiftForm({ ...shiftForm, capacity: value })
                      }
                      placeholder="5"
                      language={language}
                      className="w-full px-2 py-1 text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-2 mt-3">
                  <button
                    type="button"
                    onClick={() => handleSaveShift(role.id)}
                    className="px-3 py-1 text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded"
                  >
                    Save Shift
                  </button>
                  <button
                    type="button"
                    onClick={resetShiftForm}
                    className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Shifts List */}
            {(shifts[role.id] || []).length === 0 &&
              showShiftForm !== role.id && (
                <div className="text-xs text-gray-500 italic">
                  No shifts added
                </div>
              )}

            {(shifts[role.id] || []).map((shift) => (
              <div key={shift.id}>
                {editingShift?.id === shift.id ? (
                  /* Inline Edit Form */
                  <div className="bg-blue-50 border border-blue-200 rounded p-3">
                    <h6 className="text-xs font-semibold text-blue-900 mb-2">
                      Edit Shift
                    </h6>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Date *
                        </label>
                        <input
                          type="date"
                          value={shiftForm.shift_date}
                          onChange={(e) =>
                            setShiftForm({
                              ...shiftForm,
                              shift_date: e.target.value,
                            })
                          }
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Shift Type *
                        </label>
                        <select
                          value={shiftForm.shift_type_id}
                          onChange={(e) =>
                            setShiftForm({
                              ...shiftForm,
                              shift_type_id: e.target.value,
                            })
                          }
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
                          required
                        >
                          <option value="">Select...</option>
                          {shiftTypes.map((type) => (
                            <option key={type.id} value={type.id}>
                              {type.name_en} / {type.name_ms} (
                              {type.duration_hours
                                ? `${type.duration_hours}h`
                                : "custom"}
                              )
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Start Time *
                        </label>
                        <input
                          type="time"
                          value={shiftForm.start_time}
                          onChange={(e) =>
                            setShiftForm({
                              ...shiftForm,
                              start_time: e.target.value,
                            })
                          }
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          End Time *
                        </label>
                        <input
                          type="time"
                          value={shiftForm.end_time}
                          onChange={(e) =>
                            setShiftForm({
                              ...shiftForm,
                              end_time: e.target.value,
                            })
                          }
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Capacity *
                        </label>
                        <input
                          type="number"
                          value={shiftForm.capacity}
                          onChange={(e) =>
                            setShiftForm({
                              ...shiftForm,
                              capacity: e.target.value,
                            })
                          }
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
                          placeholder="5"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 mt-3">
                      <button
                        type="button"
                        onClick={() => handleSaveShift(role.id)}
                        className="flex items-center gap-1 px-3 py-1 text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded"
                      >
                        <Save className="h-3 w-3" />
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={resetShiftForm}
                        className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 rounded"
                      >
                        <X className="h-3 w-3" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Display Mode */
                  <div className="bg-gray-50 rounded p-2 text-sm flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 text-gray-900">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {shift.shift_date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {shift.start_time} - {shift.end_time}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {shift.capacity}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {shiftTypes.find((t) => t.id === shift.shift_type_id)
                          ?.name_en || "Shift"}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingShift(shift);
                          setShiftForm({
                            shift_date: shift.shift_date,
                            shift_type_id: shift.shift_type_id,
                            start_time: shift.start_time,
                            end_time: shift.end_time,
                            capacity: shift.capacity,
                          });
                        }}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="Edit shift"
                      >
                        <Edit2 className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm("Delete this shift?")) {
                            onRemoveShift(role.id, shift.id);
                          }
                        }}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="Delete shift"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
