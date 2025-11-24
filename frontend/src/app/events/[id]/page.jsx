"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Star, 
  Share2, 
  Heart,
  ArrowLeft,
  Trophy,
  Utensils,
  HeartHandshake
} from "lucide-react";
import Link from "next/link";

export default function EventDetailPage() {
  const params = useParams();
  const eventId = params.id;
  
  const [event, setEvent] = useState(null);
  const [selectedShift, setSelectedShift] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("details");
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    fetchEventDetail();
  }, [eventId]);

  const fetchEventDetail = async () => {
    try {
      setLoading(true);
      // Mock data - dalam real implementation, gantikan dengan API call
      const mockEvent = {
        id: eventId,
        title: "Beach Cleanup Volunteer Day 2024",
        description: "Join us for a meaningful beach cleanup event to preserve our marine ecosystems and keep our beaches beautiful for everyone to enjoy. This event is perfect for individuals, families, and corporate groups who want to make a positive impact on the environment.",
        type: "volunteer",
        location: "Pantai Batu Ferringhi, Penang",
        latitude: 5.4706,
        longitude: 100.2453,
        start_date: "2024-03-15",
        end_date: "2024-03-15",
        capacity: 100,
        points_per_participation: 100,
        fee: 0,
        early_bird_discount: 0,
        early_bird_deadline: null,
        regular_fee: 0,
        status: "open",
        ngo: {
          name: "Green Earth Society",
          logo_url: "/images/ngos/green-earth.jpg",
          established_date: "2015-01-15",
          description: "Dedicated to environmental conservation and sustainability initiatives across Malaysia."
        },
        shifts: [
          {
            id: "shift-1",
            shift_date: "2024-03-15",
            start_time: "08:00",
            end_time: "11:00",
            capacity: 50,
            registered: 35
          },
          {
            id: "shift-2", 
            shift_date: "2024-03-15",
            start_time: "14:00",
            end_time: "17:00",
            capacity: 50,
            registered: 20
          }
        ],
        sections: [
          {
            id: "section-1",
            title: "About This Event",
            content: "This beach cleanup initiative aims to remove plastic waste and debris from one of Penang's most popular beaches. Participants will be provided with gloves, trash bags, and safety equipment. We'll also have educational sessions about marine conservation.",
            images: [
              "/images/events/beach-cleanup-1.jpg",
              "/images/events/beach-cleanup-2.jpg"
            ]
          },
          {
            id: "section-2",
            title: "What to Bring",
            content: "Please wear comfortable clothes and shoes that you don't mind getting dirty. Bring sunscreen, a hat, and a reusable water bottle. We'll provide all the necessary equipment for the cleanup.",
            images: []
          }
        ],
        reviews: [
          {
            id: "review-1",
            user: {
              name: "Ahmad Rahman",
              photo: "/images/users/user1.jpg"
            },
            rating: 5,
            comment: "Very well organized event! The team was professional and the impact was visible immediately.",
            created_at: "2024-02-15"
          },
          {
            id: "review-2",
            user: {
              name: "Sarah Lim",
              photo: "/images/users/user2.jpg"
            },
            rating: 4,
            comment: "Great initiative! Would love to join again. The location was beautiful and the activity was meaningful.",
            created_at: "2024-02-10"
          }
        ],
        registered: 55,
        average_rating: 4.5
      };
      
      setEvent(mockEvent);
      setSelectedShift(mockEvent.shifts[0]);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching event:", error);
      setLoading(false);
    }
  };

  const getEventTypeIcon = (type) => {
    switch (type) {
      case 'volunteer':
        return <HeartHandshake className="w-5 h-5" />;
      case 'food_rescue':
        return <Utensils className="w-5 h-5" />;
      case 'charity_run':
        return <Trophy className="w-5 h-5" />;
      default:
        return <HeartHandshake className="w-5 h-5" />;
    }
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

  const handleRegister = () => {
    if (!selectedShift) {
      alert("Please select a shift first");
      return;
    }
    
    // Navigate to registration page
    window.location.href = `/events/${eventId}/register?shift=${selectedShift.id}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Event Not Found</h2>
          <p className="text-gray-600 mb-4">The event you're looking for doesn't exist.</p>
          <Link href="/events" className="text-emerald-600 hover:text-emerald-700 font-medium">
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <Link 
              href="/events" 
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Events
            </Link>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsBookmarked(!isBookmarked)}
                className={`p-2 rounded-full ${
                  isBookmarked 
                    ? 'text-red-500 bg-red-50' 
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Heart className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
              </button>
              
              <button className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Event Header */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-3 mb-3">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getEventTypeColor(event.type)}`}>
                      {getEventTypeIcon(event.type)}
                      <span className="ml-1.5">{getEventTypeLabel(event.type)}</span>
                    </span>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      event.status === 'open' 
                        ? 'bg-green-100 text-green-800'
                        : event.status === 'closed'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                    </span>
                  </div>
                  
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    {event.title}
                  </h1>
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-bold text-emerald-600 mb-1">
                    {event.fee > 0 ? `RM ${event.fee}` : 'FREE'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {event.points_per_participation} points
                  </div>
                </div>
              </div>

              {/* Event Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-y border-gray-200">
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-5 h-5 mr-3 text-gray-400" />
                  <div>
                    <div className="font-medium text-sm">Date</div>
                    <div className="text-gray-900">
                      {new Date(event.start_date).toLocaleDateString('en-MY', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-5 h-5 mr-3 text-gray-400" />
                  <div>
                    <div className="font-medium text-sm">Location</div>
                    <div className="text-gray-900">{event.location}</div>
                  </div>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <Users className="w-5 h-5 mr-3 text-gray-400" />
                  <div>
                    <div className="font-medium text-sm">Participants</div>
                    <div className="text-gray-900">
                      {event.registered} / {event.capacity}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <Star className="w-5 h-5 mr-3 text-gray-400" />
                  <div>
                    <div className="font-medium text-sm">Rating</div>
                    <div className="text-gray-900">
                      {event.average_rating} ★ ({event.reviews.length} reviews)
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs Navigation */}
            <div className="bg-white rounded-lg shadow-sm mb-6">
              <div className="border-b border-gray-200">
                <nav className="flex -mb-px">
                  {['details', 'shifts', 'reviews', 'ngo'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`py-4 px-6 text-sm font-medium border-b-2 ${
                        activeTab === tab
                          ? 'border-emerald-500 text-emerald-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'details' && (
                  <div className="space-y-6">
                    {event.sections.map((section) => (
                      <div key={section.id}>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">
                          {section.title}
                        </h3>
                        <p className="text-gray-700 leading-relaxed mb-4">
                          {section.content}
                        </p>
                        {section.images.length > 0 && (
                          <div className="grid grid-cols-2 gap-4">
                            {section.images.map((image, index) => (
                              <img
                                key={index}
                                src={image}
                                alt={`${event.title} - ${section.title}`}
                                className="rounded-lg w-full h-48 object-cover"
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'shifts' && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      Available Shifts
                    </h3>
                    {event.shifts.map((shift) => (
                      <div
                        key={shift.id}
                        onClick={() => setSelectedShift(shift)}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                          selectedShift?.id === shift.id
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="text-center">
                              <div className="text-sm text-gray-500">Date</div>
                              <div className="font-semibold text-gray-900">
                                {new Date(shift.shift_date).toLocaleDateString('en-MY')}
                              </div>
                            </div>
                            
                            <div className="text-center">
                              <div className="text-sm text-gray-500">Time</div>
                              <div className="font-semibold text-gray-900">
                                {shift.start_time} - {shift.end_time}
                              </div>
                            </div>
                            
                            <div className="text-center">
                              <div className="text-sm text-gray-500">Duration</div>
                              <div className="font-semibold text-gray-900">
                                {(() => {
                                  const start = new Date(`2000-01-01T${shift.start_time}`);
                                  const end = new Date(`2000-01-01T${shift.end_time}`);
                                  const diff = (end - start) / (1000 * 60 * 60);
                                  return `${diff} hours`;
                                })()}
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-sm text-gray-500">
                              Available: {shift.capacity - shift.registered} / {shift.capacity}
                            </div>
                            <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                              <div 
                                className="bg-emerald-500 h-2 rounded-full" 
                                style={{ 
                                  width: `${(shift.registered / shift.capacity) * 100}%` 
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          Reviews & Ratings
                        </h3>
                        <div className="flex items-center mt-1">
                          <div className="text-2xl font-bold text-gray-900 mr-2">
                            {event.average_rating}
                          </div>
                          <div className="text-yellow-400 text-lg">
                            {'★'.repeat(5)}
                          </div>
                          <div className="text-gray-500 ml-2">
                            ({event.reviews.length} reviews)
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {event.reviews.map((review) => (
                        <div key={review.id} className="border-b border-gray-200 pb-4 last:border-0">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-3">
                              <img
                                src={review.user.photo}
                                alt={review.user.name}
                                className="w-10 h-10 rounded-full"
                              />
                              <div>
                                <div className="font-semibold text-gray-900">
                                  {review.user.name}
                                </div>
                                <div className="text-yellow-400">
                                  {'★'.repeat(review.rating)}
                                  {'☆'.repeat(5 - review.rating)}
                                </div>
                              </div>
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(review.created_at).toLocaleDateString('en-MY')}
                            </div>
                          </div>
                          <p className="text-gray-700">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'ngo' && event.ngo && (
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <img
                        src={event.ngo.logo_url}
                        alt={event.ngo.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          {event.ngo.name}
                        </h3>
                        <p className="text-gray-600">
                          Established {new Date(event.ngo.established_date).getFullYear()}
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">About the NGO</h4>
                      <p className="text-gray-700 leading-relaxed">
                        {event.ngo.description}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h5 className="font-semibold text-gray-900 mb-2">Contact Information</h5>
                        <p className="text-gray-600">Email: contact@greenearth.org</p>
                        <p className="text-gray-600">Phone: +603-1234 5678</p>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h5 className="font-semibold text-gray-900 mb-2">Registration Details</h5>
                        <p className="text-gray-600">Registered with ROS since 2015</p>
                        <p className="text-gray-600">Category: Environmental Conservation</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Registration Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Join This Event
              </h3>
              
              {event.shifts.length > 0 && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Shift
                  </label>
                  <select
                    value={selectedShift?.id || ''}
                    onChange={(e) => {
                      const shift = event.shifts.find(s => s.id === e.target.value);
                      setSelectedShift(shift);
                    }}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    {event.shifts.map((shift) => (
                      <option key={shift.id} value={shift.id}>
                        {new Date(shift.shift_date).toLocaleDateString('en-MY')} - {shift.start_time} to {shift.end_time} 
                        ({shift.capacity - shift.registered} slots left)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Event Fee</span>
                  <span className="font-medium">
                    {event.fee > 0 ? `RM ${event.fee}` : 'FREE'}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Points Earnable</span>
                  <span className="font-medium text-emerald-600">
                    {event.points_per_participation} points
                  </span>
                </div>
                
                {selectedShift && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Selected Shift</span>
                    <span className="font-medium text-right">
                      {new Date(selectedShift.shift_date).toLocaleDateString('en-MY')}<br />
                      {selectedShift.start_time} - {selectedShift.end_time}
                    </span>
                  </div>
                )}
              </div>

              <button
                onClick={handleRegister}
                disabled={event.status !== 'open' || !selectedShift || (selectedShift.capacity - selectedShift.registered) <= 0}
                className="w-full bg-emerald-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {event.status !== 'open' 
                  ? 'Registration Closed'
                  : (selectedShift?.capacity - selectedShift?.registered) <= 0
                  ? 'Fully Booked'
                  : event.fee > 0 
                    ? `Register Now - RM ${event.fee}`
                    : 'Register Now - FREE'
                }
              </button>

              <div className="mt-4 text-center text-sm text-gray-500">
                {selectedShift && (
                  <p>
                    {selectedShift.capacity - selectedShift.registered} slots remaining
                  </p>
                )}
                <p className="mt-1">Certificate provided upon completion</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}