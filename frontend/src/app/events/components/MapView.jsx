import { MapPin } from "lucide-react";

const MapView = ({ events }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-2xl font-bold mb-4">Events Map</h2>
      <div className="h-96 bg-gray-200 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <MapPin size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">Interactive map view coming soon</p>
          <p className="text-sm text-gray-500 mt-2">
            Showing {events.length} events within 50km radius
          </p>
        </div>
      </div>
    </div>
  );
};

export default MapView;