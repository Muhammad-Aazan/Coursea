import React from "react";
import { Link } from "react-router-dom";
import { Heart, User, Clock, BookOpen, CheckCircle2 } from "lucide-react";
import StarRating from "../common/StarRating";
import { useWishlist } from "../../context/WishlistContext";
import { useAuth } from "../../context/AuthContext";

export default function CourseCard({ course }) {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { user, isEnrolled } = useAuth();

  const isFavorited = isInWishlist(course._id);

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      alert("Please login to save courses to your wishlist!");
      return;
    }
    if (isFavorited) {
      await removeFromWishlist(course._id);
    } else {
      await addToWishlist(course._id);
    }
  };

  const levelBadges = {
    beginner: "bg-emerald-50 text-emerald-700 border-emerald-200",
    intermediate: "bg-blue-50 text-blue-700 border-blue-200",
    advanced: "bg-purple-50 text-purple-700 border-purple-200",
    all: "bg-slate-50 text-slate-700 border-slate-200"
  };

  return (
    <div className="group bg-white rounded-2xl border border-slate-200 hover:border-blue-300 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full">
      {/* Thumbnail Container */}
      <div className="relative aspect-video w-full bg-slate-100 overflow-hidden">
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.target.src = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-slate-800 to-slate-900 text-white p-6 text-center">
            <BookOpen className="w-12 h-12 text-slate-500 mb-2" />
          </div>
        )}

        {/* Level Tag */}
        <span
          className={`absolute top-3 left-3 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-lg border backdrop-blur-md ${
            levelBadges[course.level] || levelBadges.all
          }`}
        >
          {course.level || "All Levels"}
        </span>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md transition-all ${
            isFavorited
              ? "bg-rose-500 text-white shadow-md shadow-rose-500/30"
              : "bg-white/80 hover:bg-white text-slate-600 hover:text-rose-500 shadow-sm"
          }`}
          title={isFavorited ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={`w-4 h-4 ${isFavorited ? "fill-white" : ""}`} />
        </button>
      </div>

      {/* Body Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category */}
          {course.category && (
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              {typeof course.category === "object" ? course.category.name : "Course"}
            </span>
          )}

          {/* Title */}
          <Link to={`/courses/${course._id}`}>
            <h3 className="text-base font-bold text-slate-900 line-clamp-2 mt-1 mb-2 group-hover:text-blue-600 transition-colors">
              {course.title}
            </h3>
          </Link>

          {/* Description */}
          <p className="text-xs text-slate-500 line-clamp-2 mb-3">
            {course.description}
          </p>

          {/* Instructor */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px] font-bold overflow-hidden">
              {course.instructor?.profileImage ? (
                <img
                  src={course.instructor.profileImage}
                  alt={course.instructor.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-3.5 h-3.5" />
              )}
            </div>
            {course.instructor?._id ? (
              <Link to={`/instructor/${course.instructor._id}`} onClick={e => e.stopPropagation()}
                className="text-xs text-blue-600 hover:underline font-medium truncate">
                {course.instructor.name}
              </Link>
            ) : (
              <span className="text-xs text-slate-600 font-medium truncate">
                {course.instructor?.name || "Verified Instructor"}
              </span>
            )}
          </div>
        </div>

        {/* Footer: Price & Rating */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-auto">
          {course.totalRatings > 0 ? (
            <StarRating rating={course.rating} reviewsCount={course.totalRatings} size="sm" />
          ) : (
            <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
              New Course
            </span>
          )}

          <div className="text-right">
            {user && isEnrolled(course._id) ? (
              <span className="inline-flex items-center gap-1 text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Enrolled
              </span>
            ) : course.price === 0 ? (
              <span className="text-sm font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                Free
              </span>
            ) : (
              <span className="text-base font-extrabold text-slate-900">
                ${Number(course.price).toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
