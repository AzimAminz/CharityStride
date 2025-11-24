// components/EventPreview.jsx
import { MapPin, Calendar, Users, Star, Clock, Package, Phone, User, Shield } from "lucide-react";

const EventPreview = ({ showPreview, handleClosePreview, formData, sections, shifts, totalCapacity }) => {
  if (!showPreview) return null;

  const getEventTypeColor = (type) => {
    switch (type) {
      case 'volunteer': return 'bg-green-100 text-green-800';
      case 'food_rescue': return 'bg-orange-100 text-orange-800';
      case 'charity_run': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEventTypeLabel = (type) => {
    switch (type) {
      case 'volunteer': return '🤝 Volunteer';
      case 'food_rescue': return '🍴 Food Rescue';
      case 'charity_run': return '🏃 Charity Run';
      default: return 'Event';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString('en-MY', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "00:00";
    return timeString;
  };

  // Handle click on overlay to close modal
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClosePreview();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/30 backdrop-blur-sm  z-50 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      <div 
        className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-white sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Event Preview</h2>
            <button
              onClick={handleClosePreview}
              className="text-gray-400 hover:text-gray-600 text-2xl transition-colors p-1"
            >
              ✕
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-6 bg-white">
          
          {/* Event Header */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getEventTypeColor(formData.type)}`}>
                    {getEventTypeLabel(formData.type)}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    Open for Registration
                  </span>
                  {formData.type === 'food_rescue' && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                      🛡️ Confidential Location
                    </span>
                  )}
                </div>
                
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {formData.title || "Event Title Preview"}
                </h1>

                <p className="text-gray-600 text-lg leading-relaxed">
                  {formData.description || "No description provided"}
                </p>
              </div>
              
              <div className="text-right ml-6">
                <div className="text-3xl font-bold text-emerald-600 mb-2">
                  {formData.fee > 0 ? `RM ${formData.fee}` : 'FREE'}
                </div>
                <div className="text-sm text-gray-500 bg-emerald-50 px-3 py-1 rounded-full">
                  {formData.points_per_participation} points reward
                </div>
              </div>
            </div>

            {/* Event Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 py-6 border-y border-gray-200">
              {formData.type === 'food_rescue' ? (
                <>
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-50 rounded-xl">
                      <Calendar className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">Collection Date</div>
                      <div className="text-gray-600">
                        {formatDate(formData.start_date)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-purple-50 rounded-xl">
                      <Package className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">Food Type</div>
                      <div className="text-gray-600">{formData.food_type || "Not specified"}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-green-50 rounded-xl">
                      <Users className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">Quantity</div>
                      <div className="text-gray-600">
                        {formData.quantity} {formData.unit}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-amber-50 rounded-xl">
                      <Shield className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">Location</div>
                      <div className="text-gray-600">Confidential</div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-50 rounded-xl">
                      <Calendar className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">Date</div>
                      <div className="text-gray-600">
                        {formatDate(formData.start_date)}
                        {formData.end_date && formData.end_date !== formData.start_date && (
                          <> to {formatDate(formData.end_date)}</>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-red-50 rounded-xl">
                      <MapPin className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">Location</div>
                      <div className="text-gray-600">{formData.location || "Not set"}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-green-50 rounded-xl">
                      <Users className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">Participants</div>
                      <div className="text-gray-600">
                        0 / {totalCapacity > 0 ? totalCapacity : formData.capacity}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-amber-50 rounded-xl">
                      <Star className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">Rating</div>
                      <div className="text-gray-600">New Event</div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Contact Info untuk Food Rescue */}
            {formData.type === 'food_rescue' && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <User className="w-5 h-5 mr-2 text-gray-600" />
                  Collection Contact
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-500">Contact Person</div>
                      <div className="font-medium text-gray-900">
                        {formData.contact_person || "Not specified"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-500">Contact Phone</div>
                      <div className="font-medium text-gray-900">
                        {formData.contact_phone || "Not specified"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Thumbnail */}
          {formData.thumbnail && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Event Thumbnail</h3>
              <img
                src={formData.thumbnail.previewUrl}
                alt="Event thumbnail"
                className="w-full h-80 object-cover rounded-lg"
              />
            </div>
          )}

          {/* Map Preview */}
          {(formData.latitude && formData.longitude && formData.type !== 'food_rescue' && formData.show_location) && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Event Location</h3>
              <div className="w-full h-64 rounded-lg border border-gray-200 overflow-hidden">
                <iframe
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_MAP_API}&q=${formData.latitude},${formData.longitude}&zoom=15`}
                  allowFullScreen
                />
              </div>
              <p className="text-sm text-gray-600 mt-3 flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                {formData.location}
              </p>
            </div>
          )}

          {/* Collection Instructions untuk Food Rescue */}
          {formData.type === 'food_rescue' && formData.collection_instructions && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Package className="w-6 h-6 mr-3 text-orange-600" />
                Collection Instructions
              </h3>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-gray-700 leading-relaxed">
                  {formData.collection_instructions}
                </p>
              </div>
            </div>
          )}

          {/* Sections */}
          {sections.map((section, index) => (
            <div key={section.id} className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4 border-b pb-2">
                {section.title || `Section ${index + 1}`}
              </h3>
              <p className="text-gray-700 leading-relaxed text-lg mb-6">
                {section.content || "No content provided"}
              </p>
              {section.images.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {section.images.map((image, imgIndex) => (
                    <img
                      key={imgIndex}
                      src={image.previewUrl}
                      alt={`Section ${index + 1} image ${imgIndex + 1}`}
                      className="rounded-lg w-full h-64 object-cover"
                    />
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Shifts */}
          {formData.type === 'volunteer' && shifts.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Available Shifts</h3>
              <div className="grid gap-4">
                {shifts.map((shift, index) => (
                  <div key={shift.id} className="p-6 border-2 border-emerald-100 rounded-xl bg-white hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <div className="text-sm text-gray-500 font-medium mb-1">Date</div>
                          <div className="font-bold text-gray-900 text-lg">
                            {shift.shift_date ? new Date(shift.shift_date).toLocaleDateString('en-MY', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            }) : "Not set"}
                          </div>
                        </div>
                        
                        <div className="w-px h-12 bg-gray-200"></div>
                        
                        <div className="text-center">
                          <div className="text-sm text-gray-500 font-medium mb-1">Time</div>
                          <div className="font-bold text-gray-900 text-lg flex items-center space-x-2">
                            <Clock className="w-4 h-4" />
                            <span>{formatTime(shift.start_time)} - {formatTime(shift.end_time)}</span>
                          </div>
                        </div>
                        
                        <div className="w-px h-12 bg-gray-200"></div>
                        
                        <div className="text-center">
                          <div className="text-sm text-gray-500 font-medium mb-1">Capacity</div>
                          <div className="font-bold text-gray-900 text-lg">
                            {shift.capacity || 0} participants
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800">
                          Available
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <div className="flex justify-end">
            <button
              onClick={handleClosePreview}
              className="px-8 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Close Preview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventPreview;