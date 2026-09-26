import React from "react";
import { Link } from "react-router-dom";
import { useWishlist } from "../../context/WishlistContext";
import CourseCard from "../../components/course/CourseCard";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { Heart, ArrowRight } from "lucide-react";

export default function WishlistPage() {
  const { wishlist, loading } = useWishlist();

  if (loading) {
    return <LoadingSpinner size="lg" message="Loading your wishlist..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          My Wishlist
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Courses you've bookmarked for later
        </p>
      </div>

      {wishlist.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8 max-w-lg mx-auto">
          <Heart className="w-14 h-14 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-800">
            Your wishlist is empty
          </h3>
          <p className="text-sm text-slate-500 mt-1 mb-6">
            Explore courses and click the heart icon to save them here.
          </p>
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/20"
          >
            <span>Explore Courses</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlist.map((item) => {
            const course = item.course;
            if (!course) return null;
            return <CourseCard key={course._id || item._id} course={course} />;
          })}
        </div>
      )}
    </div>
  );
}
