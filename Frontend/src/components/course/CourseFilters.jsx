import React from "react";
import { Filter, RotateCcw } from "lucide-react";

export default function CourseFilters({
  filters,
  onChange,
  onReset,
  categories = []
}) {
  const levels = [
    { id: "all", label: "All Levels" },
    { id: "beginner", label: "Beginner" },
    { id: "intermediate", label: "Intermediate" },
    { id: "advanced", label: "Advanced" }
  ];

  const priceOptions = [
    { id: "all", label: "All Prices" },
    { id: "free", label: "Free Only", minPrice: 0, maxPrice: 0 },
    { id: "under25", label: "Under $25", minPrice: 0.01, maxPrice: 25 },
    { id: "under50", label: "Under $50", minPrice: 0.01, maxPrice: 50 },
    { id: "paid", label: "Paid Only", minPrice: 0.01, maxPrice: "" }
  ];

  return (
    <aside className="w-full bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
          <Filter className="w-4 h-4 text-blue-600" />
          <span>Filters</span>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Categories */}
      <div>
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
          Category
        </h4>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          <label className="flex items-center gap-2.5 text-sm text-slate-700 cursor-pointer hover:text-blue-600">
            <input
              type="radio"
              name="category"
              value=""
              checked={!filters.category}
              onChange={() => onChange({ category: "" })}
              className="text-blue-600 focus:ring-blue-500"
            />
            <span>All Categories</span>
          </label>
          {categories.map((cat) => (
            <label
              key={cat._id}
              className="flex items-center gap-2.5 text-sm text-slate-700 cursor-pointer hover:text-blue-600"
            >
              <input
                type="radio"
                name="category"
                value={cat._id}
                checked={filters.category === cat._id}
                onChange={() => onChange({ category: cat._id })}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="truncate">{cat.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Difficulty Level */}
      <div className="pt-4 border-t border-slate-100">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
          Difficulty Level
        </h4>
        <div className="space-y-2">
          {levels.map((lvl) => (
            <label
              key={lvl.id}
              className="flex items-center gap-2.5 text-sm text-slate-700 cursor-pointer hover:text-blue-600"
            >
              <input
                type="radio"
                name="level"
                value={lvl.id}
                checked={filters.level === lvl.id || (!filters.level && lvl.id === "all")}
                onChange={() => onChange({ level: lvl.id === "all" ? "" : lvl.id })}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span>{lvl.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Filter */}
      <div className="pt-4 border-t border-slate-100">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
          Price Range
        </h4>
        <div className="space-y-2">
          {priceOptions.map((opt) => {
            const isChecked =
              opt.id === "all"
                ? filters.minPrice === undefined && filters.maxPrice === undefined
                : opt.id === "free"
                ? filters.minPrice === 0 && filters.maxPrice === 0
                : filters.minPrice === opt.minPrice && filters.maxPrice === opt.maxPrice;

            return (
              <label
                key={opt.id}
                className="flex items-center gap-2.5 text-sm text-slate-700 cursor-pointer hover:text-blue-600"
              >
                <input
                  type="radio"
                  name="priceRange"
                  checked={isChecked}
                  onChange={() => {
                    if (opt.id === "all") {
                      onChange({ minPrice: "", maxPrice: "" });
                    } else {
                      onChange({ minPrice: opt.minPrice, maxPrice: opt.maxPrice });
                    }
                  }}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span>{opt.label}</span>
              </label>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
