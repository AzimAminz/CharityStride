"use client";

import { Users, Trophy, Shirt, Award, Calendar, MapPin } from "lucide-react";
import { format, parseISO, isAfter } from "date-fns";

export default function CategoryCard({ category, onSelect }) {
  const hasEarlyBird =
    category.has_early_bird &&
    category.early_bird_deadline &&
    isAfter(parseISO(category.early_bird_deadline), new Date());

  const minFee = category.has_fee
    ? category.fee_tiers?.length > 0
      ? Math.min(...category.fee_tiers.map((t) => t.fee_amount))
      : category.base_fee
    : 0;

  const discountedFee = hasEarlyBird
    ? minFee - (category.early_bird_discount || 0)
    : minFee;

  const availableSlots = category.capacity
    ? category.capacity - (category.registered_count || 0)
    : null;

  const isAlmostFull = availableSlots && availableSlots < 10;
  const isFull = availableSlots !== null && availableSlots <= 0;

  return (
    <div className="group relative bg-white border border-gray-100 rounded-3xl p-6 hover:shadow-xl hover:border-purple-200 transition-all duration-300">
      {/* Decorative Element */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-50 via-transparent to-transparent rounded-tr-3xl opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xl font-bold text-gray-900">
                {category.category_name}
              </h3>
              {category.category_type && (
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold uppercase rounded-full">
                  {category.category_type.type_name}
                </span>
              )}
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {hasEarlyBird && (
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full uppercase tracking-wide animate-pulse">
                  🎁 Early Bird
                </span>
              )}
              {isAlmostFull && !isFull && (
                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full uppercase">
                  ⚠️ Almost Full
                </span>
              )}
              {isFull && (
                <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded-full uppercase">
                  ❌ Sold Out
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 leading-relaxed line-clamp-2">
          {category.description}
        </p>

        {/* Features */}
        <div className="flex flex-wrap gap-2 mb-4">
          {category.has_event_tshirt && (
            <FeatureBadge icon={Shirt} label="Event Tee" color="blue" />
          )}
          {category.has_finisher_tshirt && (
            <FeatureBadge icon={Award} label="Finisher Tee" color="orange" />
          )}
          {category.event_date && (
            <FeatureBadge
              icon={Calendar}
              label={format(parseISO(category.event_date), "dd MMM")}
              color="gray"
            />
          )}
          {category.location_name && (
            <FeatureBadge
              icon={MapPin}
              label={category.location_name}
              color="gray"
            />
          )}
        </div>

        {/* Capacity Info */}
        {availableSlots !== null && (
          <div className="flex items-center gap-2 text-xs mb-4">
            <Users className="h-3 w-3 text-gray-400" />
            <span className="font-bold text-gray-500 uppercase tracking-wider">
              {availableSlots} Slots Available
            </span>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-end justify-between pt-4 border-t border-gray-50">
          <div>
            {category.has_fee ? (
              <div className="space-y-1">
                {hasEarlyBird && minFee !== discountedFee && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400 line-through">
                      RM {(minFee / 100).toFixed(2)}
                    </span>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded">
                      Save RM {((minFee - discountedFee) / 100).toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex items-baseline gap-1">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    From
                  </span>
                  <span className="text-2xl font-bold text-gray-900">
                    RM {(discountedFee / 100).toFixed(0)}
                  </span>
                </div>
              </div>
            ) : (
              <span className="text-2xl font-bold text-emerald-600">FREE</span>
            )}
          </div>

          <button
            onClick={() => onSelect(category)}
            disabled={isFull}
            className={`px-6 py-3 rounded-xl font-bold text-sm shadow-lg transition-all ${
              isFull
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-gray-900 text-white hover:bg-purple-600 hover:scale-105 active:scale-95"
            }`}
          >
            {isFull ? "Sold Out" : "Select"}
          </button>
        </div>
      </div>
    </div>
  );
}

function FeatureBadge({ icon: Icon, label, color }) {
  const colors = {
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    orange: "bg-orange-50 text-orange-700 border-orange-100",
    gray: "bg-gray-50 text-gray-600 border-gray-100",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide border ${colors[color]}`}
    >
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}
