import { ChevronRight } from "lucide-react";

const LoadMoreCard = ({ title, count, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="shrink-0 w-80 cursor-pointer group"
    >
      <div className="bg-linear-to-br from-emerald-500 to-blue-600 rounded-xl h-full flex items-center justify-center p-8 text-white transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl">
        <div className="text-center">
          <div className="text-4xl mb-3">🔍</div>
          <h3 className="font-bold text-xl mb-2">View All {count} {title}</h3>
          <p className="text-emerald-100 text-sm mb-4">
            Discover more amazing events
          </p>
          <div className="flex items-center justify-center text-emerald-100">
            <span className="mr-2">See More</span>
            <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadMoreCard;