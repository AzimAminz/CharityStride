import { MapPin, Users, Navigation, Clock, Heart, Utensils, Trophy } from "lucide-react";

const EventCard = ({ event }) => {
  const getEventIcon = (type) => {
    switch (type) {
      case 'volunteer': return <Heart size={14} className="mr-1" />;
      case 'food_rescue': return <Utensils size={14} className="mr-1" />;
      case 'charity_run': return <Trophy size={14} className="mr-1" />;
      default: return <Heart size={14} className="mr-1" />;
    }
  };

  const getEventColor = (type) => {
    switch (type) {
      case 'volunteer': return 'bg-green-100 text-green-800';
      case 'food_rescue': return 'bg-orange-100 text-orange-800';
      case 'charity_run': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEventEmoji = (type) => {
    switch (type) {
      case 'volunteer': return '🤝';
      case 'food_rescue': return '🍴';
      case 'charity_run': return '🏃';
      default: return '🎯';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      <div className="relative h-48 bg-gray-200">
        <div className="w-full h-full bg-linear-to-br from-emerald-400 to-blue-500 flex items-center justify-center">
          <div className="text-white text-center">
            <span className="text-4xl mb-2">{getEventEmoji(event.type)}</span>
            <p className="text-sm opacity-90">{event.ngo_name}</p>
          </div>
        </div>
        <div className="absolute top-3 left-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEventColor(event.type)}`}>
            {event.type.replace('_', ' ').toUpperCase()}
          </span>
        </div>
        {event.fee > 0 && (
          <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
            RM {event.fee}
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{event.title}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{event.description}</p>
        
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <MapPin size={14} className="mr-1" />
          <span className="line-clamp-1">{event.location}</span>
        </div>
        
        {event.distance && (
          <div className="flex items-center text-sm text-gray-500 mb-2">
            <Navigation size={14} className="mr-1" />
            <span>{event.distance.toFixed(1)} km away</span>
          </div>
        )}
        
        <div className="flex items-center text-sm text-gray-500 mb-3">
          <Clock size={14} className="mr-1" />
          <span>{new Date(event.start_date).toLocaleDateString('en-MY', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          })}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center text-sm text-gray-600">
            <Users size={14} className="mr-1" />
            <span>{event.capacity} spots</span>
          </div>
          <div className="text-sm font-medium text-emerald-600">
            +{event.points_per_participation} pts
          </div>
        </div>
        
        <button className="w-full mt-3 bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-lg transition-colors font-medium">
          Join Event
        </button>
      </div>
    </div>
  );
};

export default EventCard;