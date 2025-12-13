// Event API functions
import { api } from "./api";

/**
 * Event Management API
 * Updated to support modular event system with module enablers
 */

// List events with filters
export const getEvents = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const res = await api.get(`/ngo/events?${params}`);
  return res.data;
};

// Get single event
export const getEvent = async (id) => {
  const res = await api.get(`/ngo/events/${id}`);
  return res.data;
};

// Create event (draft)
export const createEvent = async (data) => {
  const res = await api.post("/ngo/events", data);
  return res.data;
};

// Update event
export const updateEvent = async (id, data) => {
  const res = await api.put(`/ngo/events/${id}`, data);
  return res.data;
};

// Delete event (draft only)
export const deleteEvent = async (id) => {
  const res = await api.delete(`/ngo/events/${id}`);
  return res.data;
};

// Publish event
export const publishEvent = async (id) => {
  const res = await api.post(`/ngo/events/${id}/publish`);
  return res.data;
};

// Unpublish event
export const unpublishEvent = async (id) => {
  const res = await api.post(`/ngo/events/${id}/unpublish`);
  return res.data;
};

// Duplicate event
export const duplicateEvent = async (id) => {
  const res = await api.post(`/ngo/events/${id}/duplicate`);
  return res.data;
};

/**
 * Event Sections API
 */

// Add section
export const addEventSection = async (eventId, data) => {
  const res = await api.post(`/ngo/events/${eventId}/sections`, data);
  return res.data;
};

// Update section
export const updateEventSection = async (eventId, sectionId, data) => {
  const res = await api.put(
    `/ngo/events/${eventId}/sections/${sectionId}`,
    data
  );
  return res.data;
};

// Delete section
export const deleteEventSection = async (eventId, sectionId) => {
  const res = await api.delete(`/ngo/events/${eventId}/sections/${sectionId}`);
  return res.data;
};

/**
 * Event Status Options
 */

export const EVENT_STATUS = [
  { value: "open", label: "Open" },
  { value: "closed", label: "Closed" },
  { value: "completed", label: "Completed" },
];
