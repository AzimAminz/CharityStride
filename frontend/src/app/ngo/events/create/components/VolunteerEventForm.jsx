// components/VolunteerEventForm.jsx
import { Plus, Trash2, Clock, Calendar, Users } from "lucide-react";

const VolunteerEventForm = ({ 
  volunteerData, 
  handleShiftChange, 
  addNewShift, 
  removeShift,
  totalCapacity 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Volunteer Shifts</h2>
          <p className="text-sm text-gray-600 mt-1">
            Total Capacity: <span className="font-semibold">{totalCapacity}</span> participants
          </p>
        </div>
        <button
          type="button"
          onClick={addNewShift}
          className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Shift
        </button>
      </div>

      <div className="space-y-4">
        {volunteerData.shifts.map((shift, index) => (
          <div key={shift.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-md font-semibold text-gray-900">
                Shift {index + 1}
              </h3>
              {volunteerData.shifts.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeShift(shift.id)}
                  className="inline-flex items-center p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Date *
                </label>
                <input
                  type="date"
                  value={shift.shift_date}
                  onChange={(e) => handleShiftChange(shift.id, 'shift_date', e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Start Time *
                </label>
                <input
                  type="time"
                  value={shift.start_time}
                  onChange={(e) => handleShiftChange(shift.id, 'start_time', e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  End Time *
                </label>
                <input
                  type="time"
                  value={shift.end_time}
                  onChange={(e) => handleShiftChange(shift.id, 'end_time', e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="w-4 h-4 inline mr-1" />
                  Capacity *
                </label>
                <input
                  type="number"
                  value={shift.capacity}
                  onChange={(e) => handleShiftChange(shift.id, 'capacity', e.target.value)}
                  required
                  min="1"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VolunteerEventForm;