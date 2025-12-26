"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Heart, DollarSign, Users } from "lucide-react";

const CategoryFilter = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const categories = [
    { id: "volunteer", label: "Volunteer", icon: Heart, color: "blue" },
    { id: "donation", label: "Donation", icon: DollarSign, color: "green" },
    { id: "participant", label: "Participant", icon: Users, color: "purple" },
  ];

  const selectedCategories =
    searchParams.get("category")?.split(",").filter(Boolean) || [];

  const toggleCategory = (categoryId) => {
    const params = new URLSearchParams(searchParams.toString());
    let newCategories = [...selectedCategories];

    if (newCategories.includes(categoryId)) {
      newCategories = newCategories.filter((c) => c !== categoryId);
    } else {
      newCategories.push(categoryId);
    }

    if (newCategories.length > 0) {
      params.set("category", newCategories.join(","));
    } else {
      params.delete("category");
    }

    // Keep other params like search query
    const newUrl = params.toString()
      ? `/events/search?${params.toString()}`
      : "/events";
    router.push(newUrl);
  };

  const getColorClasses = (color, isSelected) => {
    const colors = {
      blue: isSelected
        ? "bg-blue-500 text-white border-blue-500"
        : "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100",
      green: isSelected
        ? "bg-green-500 text-white border-green-500"
        : "bg-green-50 text-green-700 border-green-200 hover:bg-green-100",
      purple: isSelected
        ? "bg-purple-500 text-white border-purple-500"
        : "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100",
    };
    return colors[color];
  };

  return (
    <div className="flex flex-wrap gap-3">
      {categories.map((category) => {
        const Icon = category.icon;
        const isSelected = selectedCategories.includes(category.id);

        return (
          <button
            key={category.id}
            onClick={() => toggleCategory(category.id)}
            className={`
                            flex items-center gap-2 px-4 py-2 rounded-full border-2 
                            font-medium text-sm transition-all duration-200 
                            transform hover:scale-105 active:scale-95
                            ${getColorClasses(category.color, isSelected)}
                        `}
          >
            <Icon className="w-4 h-4" />
            <span>{category.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default CategoryFilter;
