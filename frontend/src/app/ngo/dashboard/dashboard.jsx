"use client";

import { useState, useEffect } from "react";
import { 
  Plus, 
  Users, 
  Calendar, 
  MapPin, 
  Edit2, 
  Eye,
  TrendingUp,
  DollarSign,
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NGODashboard() {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [displayedEvents, setDisplayedEvents] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  
  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  
  const router = useRouter();

  useEffect(() => {
    fetchNGOEvents();
  }, []);

  // Apply filters and search whenever criteria change
  useEffect(() => {
    applyFiltersAndSearch();
  }, [events, searchQuery, statusFilter, typeFilter, sortBy]);

  // Update displayed events when pagination or filtered events change
  useEffect(() => {
    updateDisplayedEvents();
  }, [filteredEvents, currentPage]);

  const fetchNGOEvents = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockEvents = [
        {
          id: "event-1",
          title: "Beach Cleanup Volunteer Day",
          type: "volunteer",
          location: "Pantai Batu Ferringhi, Penang",
          start_date: "2024-03-15",
          end_date: "2024-03-15",
          capacity: 100,
          registered: 45,
          status: "published",
          fee: 0,
          total_revenue: 0,
          image_url: "/images/events/beach-cleanup.jpg",
          created_at: "2024-01-15T10:00:00Z"
        },
        {
          id: "event-2",
          title: "Food Distribution Program",
          type: "food_rescue", 
          location: "Kompleks Masyarakat, KL",
          start_date: "2024-03-20",
          end_date: "2024-03-20",
          capacity: 80,
          registered: 62,
          status: "published",
          fee: 0,
          total_revenue: 0,
          image_url: "/images/events/food-distribution.jpg",
          created_at: "2024-01-20T14:30:00Z"
        },
        {
          id: "event-3",
          title: "Charity Run for Children Education",
          type: "charity_run",
          location: "Taman Tasik Titiwangsa, KL", 
          start_date: "2024-04-10",
          end_date: "2024-04-10",
          capacity: 200,
          registered: 89,
          status: "published",
          fee: 35,
          total_revenue: 3115,
          image_url: "/images/events/charity-run.jpg",
          created_at: "2024-02-01T09:15:00Z"
        },
        {
          id: "event-4",
          title: "Community Garden Planting Workshop",
          type: "volunteer",
          location: "Taman Botani, Putrajaya",
          start_date: "2024-04-05",
          end_date: "2024-04-05", 
          capacity: 40,
          registered: 0,
          status: "draft",
          fee: 0,
          total_revenue: 0,
          image_url: "/images/events/garden-planting.jpg",
          created_at: "2024-02-10T16:45:00Z"
        },
        {
          id: "event-5",
          title: "Homeless Shelter Food Preparation",
          type: "food_rescue",
          location: "Pusat Jagaan Kuala Lumpur",
          start_date: "2024-03-25",
          end_date: "2024-03-25",
          capacity: 30,
          registered: 28,
          status: "published",
          fee: 0,
          total_revenue: 0,
          image_url: "/images/events/shelter-food.jpg",
          created_at: "2024-02-05T11:20:00Z"
        },
        {
          id: "event-6",
          title: "Sunrise Charity Marathon 2024",
          type: "charity_run",
          location: "Putrajaya Challenge Park",
          start_date: "2024-05-01",
          end_date: "2024-05-01",
          capacity: 500,
          registered: 234,
          status: "published",
          fee: 50,
          total_revenue: 11700,
          image_url: "/images/events/marathon.jpg",
          created_at: "2024-01-25T08:45:00Z"
        },
        {
          id: "event-7",
          title: "River Cleanup Campaign",
          type: "volunteer",
          location: "Sungai Klang, KL",
          start_date: "2024-04-15",
          end_date: "2024-04-15",
          capacity: 60,
          registered: 0,
          status: "draft",
          fee: 0,
          total_revenue: 0,
          image_url: "/images/events/river-cleanup.jpg",
          created_at: "2024-02-12T14:15:00Z"
        },
        {
          id: "event-8",
          title: "Weekly Food Bank Sorting",
          type: "food_rescue",
          location: "Puchong, Selangor",
          start_date: "2024-03-18",
          end_date: "2024-03-18",
          capacity: 25,
          registered: 18,
          status: "published",
          fee: 0,
          total_revenue: 0,
          image_url: "/images/events/food-bank.jpg",
          created_at: "2024-01-30T13:40:00Z"
        }
      ];

      setEvents(mockEvents);
      calculateStats(mockEvents);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching NGO events:", error);
      setLoading(false);
    }
  };

  const calculateStats = (eventsList) => {
    const totalEvents = eventsList.length;
    const totalParticipants = eventsList.reduce((sum, event) => sum + event.registered, 0);
    const totalRevenue = eventsList.reduce((sum, event) => sum + event.total_revenue, 0);
    const publishedEvents = eventsList.filter(event => event.status === 'published').length;
    
    setStats({
      totalEvents,
      totalParticipants, 
      totalRevenue,
      publishedEvents
    });
  };

  const applyFiltersAndSearch = () => {
    let filtered = [...events];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(event => event.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter(event => event.type === typeFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.created_at) - new Date(a.created_at);
        case "oldest":
          return new Date(a.created_at) - new Date(b.created_at);
        case "title":
          return a.title.localeCompare(b.title);
        case "participants_high":
          return b.registered - a.registered;
        case "participants_low":
          return a.registered - b.registered;
        case "revenue_high":
          return b.total_revenue - a.total_revenue;
        case "revenue_low":
          return a.total_revenue - b.total_revenue;
        default:
          return new Date(b.created_at) - new Date(a.created_at);
      }
    });

    setFilteredEvents(filtered);
    // Reset to first page when filters change
    setCurrentPage(1);
  };

  const updateDisplayedEvents = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedEvents = filteredEvents.slice(startIndex, endIndex);
    setDisplayedEvents(paginatedEvents);
  };

  const getEventTypeColor = (type) => {
    switch (type) {
      case 'volunteer':
        return 'bg-green-100 text-green-800';
      case 'food_rescue':
        return 'bg-orange-100 text-orange-800';
      case 'charity_run':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEventTypeLabel = (type) => {
    switch (type) {
      case 'volunteer':
        return 'Volunteer';
      case 'food_rescue':
        return 'Food Rescue';
      case 'charity_run':
        return 'Charity Run';
      default:
        return 'Event';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleEditEvent = (eventId) => {
    router.push(`/ngo/events/edit/${eventId}`);
  };

  const handleViewEvent = (eventId) => {
    router.push(`/events/${eventId}`);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setTypeFilter("all");
    setSortBy("newest");
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, filteredEvents.length);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">NGO Dashboard</h1>
              <p className="text-gray-600 mt-2">
                Manage your events and track participant engagement
              </p>
            </div>
            
            <Link
              href="/ngo/events/create"
              className="mt-4 lg:mt-0 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-emerald-500 hover:bg-emerald-600 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create New Event
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Events</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalEvents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Participants</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalParticipants}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Published Events</p>
                <p className="text-2xl font-bold text-gray-900">{stats.publishedEvents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  RM {stats.totalRevenue.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filter Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search events by title, location, or type..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="cancelled">Cancelled</option>
              </select>

              {/* Type Filter */}
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="volunteer">Volunteer</option>
                <option value="food_rescue">Food Rescue</option>
                <option value="charity_run">Charity Run</option>
              </select>

              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="title">Title A-Z</option>
                <option value="participants_high">Most Participants</option>
                <option value="participants_low">Fewest Participants</option>
                <option value="revenue_high">Highest Revenue</option>
                <option value="revenue_low">Lowest Revenue</option>
              </select>

              {/* Clear Filters */}
              {(searchQuery || statusFilter !== "all" || typeFilter !== "all" || sortBy !== "newest") && (
                <button
                  onClick={clearFilters}
                  className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {startItem}-{endItem} of {filteredEvents.length} events
              {(searchQuery || statusFilter !== "all" || typeFilter !== "all") && " (filtered)"}
            </p>
            
            {filteredEvents.length > 0 && (
              <div className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </div>
            )}
          </div>
        </div>

        {/* Events Section */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Your Events</h2>
              <div className="text-sm text-gray-500">
                {filteredEvents.length} events found
              </div>
            </div>
          </div>

          <div className="p-6">
            {filteredEvents.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No events found
                </h3>
                <p className="text-gray-600 mb-6">
                  {events.length === 0 
                    ? "Start by creating your first event to engage with volunteers."
                    : "Try adjusting your search criteria or clear filters."
                  }
                </p>
                {events.length === 0 && (
                  <Link
                    href="/ngo/events/create"
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-emerald-500 hover:bg-emerald-600 transition-colors"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Create Your First Event
                  </Link>
                )}
                {(events.length > 0 && filteredEvents.length === 0) && (
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                  {displayedEvents.map((event) => (
                    <div
                      key={event.id}
                      className="border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                    >
                      {/* Event Image */}
                      <div className="relative">
                        <img
                          src={event.image_url}
                          alt={event.title}
                          className="w-full h-48 object-cover rounded-t-lg"
                        />
                        <div className="absolute top-3 left-3 flex space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEventTypeColor(event.type)}`}>
                            {getEventTypeLabel(event.type)}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                            {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                          </span>
                        </div>
                      </div>

                      {/* Event Content */}
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                          {event.title}
                        </h3>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="w-4 h-4 mr-2" />
                            {new Date(event.start_date).toLocaleDateString('en-MY', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="w-4 h-4 mr-2" />
                            <span className="line-clamp-1">{event.location}</span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-4">
                          <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>Participants</span>
                            <span>{event.registered} / {event.capacity}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-emerald-500 h-2 rounded-full transition-all"
                              style={{
                                width: `${Math.min((event.registered / event.capacity) * 100, 100)}%`
                              }}
                            ></div>
                          </div>
                        </div>

                        {/* Revenue (if any) */}
                        {event.fee > 0 && (
                          <div className="flex justify-between items-center mb-4 p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm font-medium text-gray-700">Revenue</span>
                            <span className="text-sm font-bold text-emerald-600">
                              RM {event.total_revenue.toLocaleString()}
                            </span>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex justify-between items-center">
                          <button
                            onClick={() => handleViewEvent(event.id)}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </button>
                          
                          {event.status === 'draft' ? (
                            <button
                              onClick={() => handleEditEvent(event.id)}
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-emerald-500 hover:bg-emerald-600 transition-colors"
                            >
                              <Edit2 className="w-4 h-4 mr-2" />
                              Edit Draft
                            </button>
                          ) : (
                            <div className="text-sm text-gray-500">
                              Published
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between border-t border-gray-200 pt-6">
                    <div className="text-sm text-gray-700">
                      Showing {startItem}-{endItem} of {filteredEvents.length} events
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      
                      {/* Page Numbers */}
                      <div className="flex space-x-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                          .filter(page => {
                            // Show first 3 pages, last 3 pages, and pages around current page
                            return page === 1 || 
                                   page === totalPages || 
                                   (page >= currentPage - 1 && page <= currentPage + 1);
                          })
                          .map((page, index, array) => {
                            // Add ellipsis for gaps
                            const showEllipsis = index > 0 && page - array[index - 1] > 1;
                            return (
                              <div key={page} className="flex items-center">
                                {showEllipsis && (
                                  <span className="px-2 text-gray-500">...</span>
                                )}
                                <button
                                  onClick={() => goToPage(page)}
                                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    currentPage === page
                                      ? 'bg-emerald-500 text-white'
                                      : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                                  }`}
                                >
                                  {page}
                                </button>
                              </div>
                            );
                          })}
                      </div>
                      
                      <button
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}