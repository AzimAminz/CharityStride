"use client";

import { useState, useEffect } from "react";
import {
  getVolunteerRoles,
  createVolunteerRole,
  updateVolunteerRole,
  deleteVolunteerRole,
  createVolunteerShift,
  updateVolunteerShift,
  deleteVolunteerShift,
  getVolunteerShifts,
} from "../lib/api/volunteer";

/**
 * Hook for managing volunteer module state
 */
export function useVolunteerModule(eventId) {
  const [roles, setRoles] = useState([]);
  const [shifts, setShifts] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load roles on mount
  useEffect(() => {
    if (eventId) {
      loadRoles();
    }
  }, [eventId]);

  const loadRoles = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getVolunteerRoles(eventId);
      setRoles(data || []);

      // Shifts are eager loaded with roles
      const shiftsData = {};
      for (const role of data || []) {
        shiftsData[role.id] = role.shifts || [];
      }
      setShifts(shiftsData);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load volunteer roles");
    } finally {
      setLoading(false);
    }
  };

  const addRole = async (roleData) => {
    try {
      const result = await createVolunteerRole(eventId, roleData);
      setRoles((prev) => [...prev, result]);
      setShifts((prev) => ({ ...prev, [result.id]: [] }));
      return result;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create role");
      throw err;
    }
  };

  const updateRole = async (roleId, roleData) => {
    try {
      const result = await updateVolunteerRole(eventId, roleId, roleData);
      setRoles((prev) => prev.map((r) => (r.id === roleId ? result : r)));
      return result;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update role");
      throw err;
    }
  };

  const removeRole = async (roleId) => {
    try {
      await deleteVolunteerRole(eventId, roleId);
      setRoles((prev) => prev.filter((r) => r.id !== roleId));
      setShifts((prev) => {
        const newShifts = { ...prev };
        delete newShifts[roleId];
        return newShifts;
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete role");
      throw err;
    }
  };

  const addShift = async (roleId, shiftData) => {
    try {
      const result = await createVolunteerShift(eventId, roleId, shiftData);
      setShifts((prev) => ({
        ...prev,
        [roleId]: [...(prev[roleId] || []), result],
      }));
      return result;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create shift");
      throw err;
    }
  };

  const updateShift = async (shiftId, shiftData) => {
    try {
      const result = await updateVolunteerShift(eventId, shiftId, shiftData);
      // Find which role this shift belongs to and update
      setShifts((prev) => {
        const newShifts = { ...prev };
        for (const roleId in newShifts) {
          newShifts[roleId] = newShifts[roleId].map((s) =>
            s.id === shiftId ? result : s
          );
        }
        return newShifts;
      });
      return result;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update shift");
      throw err;
    }
  };

  const removeShift = async (roleId, shiftId) => {
    try {
      await deleteVolunteerShift(eventId, shiftId);
      setShifts((prev) => ({
        ...prev,
        [roleId]: (prev[roleId] || []).filter((s) => s.id !== shiftId),
      }));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete shift");
      throw err;
    }
  };

  return {
    roles,
    shifts,
    loading,
    error,
    addRole,
    updateRole,
    removeRole,
    addShift,
    updateShift,
    removeShift,
    reload: loadRoles,
  };
}
