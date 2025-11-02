import { useState } from "react";
import { ChevronDown } from "lucide-react";

const SortFilter = ({ sortBy, setSortBy }) => {
  const [isOpen, setIsOpen] = useState(false);

  const sortOptions = [
    { value: 'default', label: 'Default' },
    { value: 'date', label: 'Date: Earliest' },
    { value: 'date-desc', label: 'Date: Latest' },
    { value: 'distance', label: 'Distance: Nearest' },
    { value: 'points', label: 'Points: Highest' },
    { value: 'name', label: 'Name: A-Z' },
  ];

  const currentSortLabel = sortOptions.find(opt => opt.value === sortBy)?.label;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
      >
        <span>Sort: {currentSortLabel}</span>
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            {sortOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setSortBy(option.value);
                  setIsOpen(false);
                }}
                className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                  sortBy === option.value ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default SortFilter;