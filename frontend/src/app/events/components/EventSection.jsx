import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import EventCard from "./EventCard";
import LoadMoreCard from "./LoadMoreCard";

const EventSection = ({ title, events, category, onViewAll }) => {
  const sectionRef = useRef(null);
  const displayCount = 10; 

  const scrollSection = (direction) => {
    if (sectionRef.current) {
      const scrollAmount = 320;
      sectionRef.current.scrollLeft += direction === 'right' ? scrollAmount : -scrollAmount;
    }
  };

  const displayedEvents = events.slice(0, displayCount);
  const hasMore = events.length > displayCount;

  return (
    <section className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {title} 
          <span className="text-gray-500 text-lg font-normal ml-2">({events.length})</span>
        </h2>
        
        {events.length > 0 && (
          <div className="flex space-x-2">
            <button 
              onClick={() => scrollSection('left')}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={() => scrollSection('right')}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>

      {events.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No events found in this category
        </div>
      ) : (
        <div 
          ref={sectionRef}
          className="flex space-x-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {displayedEvents.map((event) => (
            <div key={event.id} className="shrink-0 w-80">
              <EventCard event={event} />
            </div>
          ))}
          
          {/* Load More Card */}
          {hasMore && (
            <LoadMoreCard 
              title={title}
              count={events.length - displayCount}
              onClick={() => onViewAll(category)}
            />
          )}
        </div>
      )}
    </section>
  );
};

export default EventSection;