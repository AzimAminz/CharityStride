// Volunteer Module API
import { api } from "../api";

/**
 * Volunteer Roles API
 */

// Create volunteer role
export const createVolunteerRole = async (eventId, data) => {
  const res = await api.post(`/ngo/events/${eventId}/volunteer/roles`, data);
  return res.data;
};

// Update volunteer role
export const updateVolunteerRole = async (eventId, roleId, data) => {
  const res = await api.put(
    `/ngo/events/${eventId}/volunteer/roles/${roleId}`,
    data
  );
  return res.data;
};

// Delete volunteer role
export const deleteVolunteerRole = async (eventId, roleId) => {
  const res = await api.delete(
    `/ngo/events/${eventId}/volunteer/roles/${roleId}`
  );
  return res.data;
};

// Get volunteer roles for event
export const getVolunteerRoles = async (eventId) => {
  const res = await api.get(`/ngo/events/${eventId}/volunteer/roles`);
  return res.data;
};

/**
 * Volunteer Shifts API
 */

// Create volunteer shift
export const createVolunteerShift = async (eventId, roleId, data) => {
  const res = await api.post(
    `/ngo/events/${eventId}/volunteer/roles/${roleId}/shifts`,
    data
  );
  return res.data;
};

// Update volunteer shift
export const updateVolunteerShift = async (eventId, shiftId, data) => {
  const res = await api.put(
    `/ngo/events/${eventId}/volunteer/shifts/${shiftId}`,
    data
  );
  return res.data;
};

// Delete volunteer shift
export const deleteVolunteerShift = async (eventId, shiftId) => {
  const res = await api.delete(
    `/ngo/events/${eventId}/volunteer/shifts/${shiftId}`
  );
  return res.data;
};

// Get shifts for a role
export const getVolunteerShifts = async (eventId, roleId) => {
  const res = await api.get(
    `/ngo/events/${eventId}/volunteer/roles/${roleId}/shifts`
  );
  return res.data;
};
