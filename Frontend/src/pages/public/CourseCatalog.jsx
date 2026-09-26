import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../../api/client";
import CourseCard from "../../components/course/CourseCard";
import CourseFilters from "../../components/course/CourseFilters";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { Search, SlidersHorizontal, BookOpen } from "lucide-react";

export default function CourseCatalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Extract filter values from searchParams
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const level = searchParams.get("level") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const sort = searchParams.get("sort") || "-createdAt";

  // Load categories once
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await api.get("/categories");
        setCategories(res.data.categories || []);
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    }
    loadCategories();
  }, []);

  // Fetch courses whenever filters change
  useEffect(() => {
    async function fetchCourses() {
      setLoading(true);
      try {
        const params = {
          search,
          category,
          level,
          minPrice,
          maxPrice,
          sort
        };
        const res = await api.get("/courses", params);
        setCourses(res.data.courses || []);
      } catch (err) {
        console.error("Failed to fetch courses:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCourses();
  }, [search, category, level, minPrice, maxPrice, sort]);

  const updateFilters = (newFilters) => {
    const updated = new URLSearchParams(searchParams);
    Object.entries(newFilters).forEach(([key, val]) => {
      if (val === undefined || val === null || val === "") {
        updated.delete(key);
      } else {
        updated.set(key, val);
      }
    });
    setSearchParams(updated);
  };

  const handleResetFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Banner & Header */}
      <div className="mb-8 space-y-4">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Explore All Courses
        </h1>
        <p className="text-sm text-slate-500">
          Discover hundreds of hands-on courses taught by verified industry leaders
        </p>

        {/* Search Bar & Sort Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
          {/* Quick Search */}
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by title or topic..."
              value={search}
              onChange={(e) => updateFilters({ search: e.target.value })}
              className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-slate-200 focus:border-blue-500 rounded-xl outline-none"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="lg:hidden flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl shadow-sm"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
                Sort by:
              </span>
              <select
                value={sort}
                onChange={(e) => updateFilters({ sort: e.target.value })}
                className="px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl outline-none font-medium text-slate-700 cursor-pointer"
              >
                <option value="-createdAt">Newest First</option>
                <option value="price">Price: Low to High</option>
                <option value="-price">Price: High to Low</option>
                <option value="title">Alphabetical (A-Z)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters Desktop */}
        <div className="hidden lg:block lg:col-span-1">
          <CourseFilters
            filters={{ category, level, minPrice, maxPrice }}
            onChange={updateFilters}
            onReset={handleResetFilters}
            categories={categories}
          />
        </div>

        {/* Sidebar Filters Mobile Drawer */}
        {mobileFilterOpen && (
          <div className="lg:hidden col-span-1 mb-4">
            <CourseFilters
              filters={{ category, level, minPrice, maxPrice }}
              onChange={updateFilters}
              onReset={handleResetFilters}
              categories={categories}
            />
          </div>
        )}

        {/* Course Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <LoadingSpinner message="Searching courses..." />
          ) : courses.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8">
              <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-800">No courses found</h3>
              <p className="text-sm text-slate-500 mt-1 mb-6 max-w-sm mx-auto">
                We couldn't find any courses matching your current filter criteria.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-blue-500/20"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-4">
                Showing <span className="text-slate-900 font-bold">{courses.length}</span> course{courses.length === 1 ? "" : "s"}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <CourseCard key={course._id} course={course} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
