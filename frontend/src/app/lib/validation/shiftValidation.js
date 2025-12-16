/**
 * Shift Validation Utilities
 */

export function checkTimeOverlap(shifts, newShift, excludeIndex = -1) {
  const newStart = new Date(`2000-01-01T${newShift.start_time}`);
  const newEnd = new Date(`2000-01-01T${newShift.end_time}`);

  return shifts.some((shift, index) => {
    if (index === excludeIndex) return false;
    if (shift.date !== newShift.date) return false;

    const existingStart = new Date(`2000-01-01T${shift.start_time}`);
    const existingEnd = new Date(`2000-01-01T${shift.end_time}`);

    return newStart < existingEnd && newEnd > existingStart;
  });
}

export function validateShiftTime(startTime, endTime, language = "en") {
  if (!startTime || !endTime) return null;

  const start = new Date(`2000-01-01T${startTime}`);
  const end = new Date(`2000-01-01T${endTime}`);

  if (start >= end) {
    return language === "ms"
      ? "Masa mula mesti sebelum masa tamat"
      : "Start time must be before end time";
  }

  return null;
}
