import {
  Search,
  MapPin,
  Navigation,
  Users,
  Heart,
  Utensils,
  Trophy,
} from "lucide-react";

const SearchFilters = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  showNearestOnly,
  setShowNearestOnly,
  mapView,
  setMapView,
  onSearch,
  showDropdown,
  setShowDropdown
}) => {
  const categories = [
    { id: "all", name: "All Events", icon: Users },
    { id: "volunteer", name: "Volunteer", icon: Heart },
    { id: "food_rescue", name: "Food Rescue", icon: Utensils },
    { id: "charity_run", name: "Charity Run", icon: Trophy },
  ];

  

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch();
  };

  return (
    <div className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Find Events</h1>
        <p className="text-lg text-gray-600 mb-8">
          Join meaningful events and make a difference in your community
        </p>

        {/* Search and Filter Bar */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col lg:flex-row gap-4 mb-6"
        >
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search events, NGOs, or locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowNearestOnly(!showNearestOnly)}
              className={`flex items-center px-4 py-3 rounded-lg border transition-colors ${
                showNearestOnly
                  ? "bg-emerald-500 text-white border-emerald-500"
                  : "bg-white text-gray-700 border-gray-300 hover:border-emerald-300"
              }`}
            >
              <Navigation size={18} className="mr-2" />
              Nearest to Me
            </button>

            <button
              type="button"
              onClick={() => setMapView(!mapView)}
              className={`flex items-center px-4 py-3 rounded-lg border transition-colors ${
                mapView
                  ? "bg-blue-500 text-white border-blue-500"
                  : "bg-white text-gray-700 border-gray-300 hover:border-blue-300"
              }`}
            >
              <MapPin size={18} className="mr-2" />
              Map View
            </button>

            {/* Search Button */}
            <button
              type="submit"
              className="flex items-center px-6 py-3 bg-emerald-500 text-white rounded-lg border border-emerald-500 hover:bg-emerald-600 transition-colors"
            >
              <Search size={18} className="mr-2" />
              Search
            </button>
          </div>
        </form>

        {/* Category Filters */}
        <div className="block lg:hidden mb-4">
          <div className="relative">
            <button
              onClick={() => setShowDropdown((prev) => !prev)}
              className="w-full flex justify-between items-center px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-700"
            >
              {categories.find((c) => c.id === selectedCategory)?.name ||
                "Select Category"}
              <svg
                className={`w-5 h-5 transform transition-transform ${
                  showDropdown ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {showDropdown && (
              <div className="absolute z-20 mt-2 w-full bg-white border border-gray-200 shadow-lg rounded-lg py-1 animate-fadeIn">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => {
                        setSelectedCategory(category.id);
                        setShowDropdown(false);
                      }}
                      className={`flex items-center w-full px-4 py-2 hover:bg-gray-100 transition ${
                        selectedCategory === category.id
                          ? "bg-emerald-50 text-emerald-600"
                          : "text-gray-700"
                      }`}
                    >
                      <Icon size={16} className="mr-2" />
                      {category.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Desktop Categories */}
        <div className="hidden lg:flex space-x-2 pb-2">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                  selectedCategory === category.id
                    ? "bg-emerald-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Icon size={16} className="mr-2" />
                {category.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SearchFilters;
