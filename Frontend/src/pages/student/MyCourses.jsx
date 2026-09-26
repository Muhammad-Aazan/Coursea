import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { BookOpen, PlayCircle, ArrowRight, Award, MessageSquarePlus } from "lucide-react";

export default function MyCourses() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMyEnrollments() {
      try {
        const res = await api.get("/enrollments/my-courses");
        setEnrollments(res.data.enrollments || []);
      } catch (err) {
        console.error("Failed to load my courses:", err);
      } finally {
        setLoading(false);
      }
    }
    loadMyEnrollments();
  }, []);

  if (loading) {
    return <LoadingSpinner size="lg" message="Loading your enrolled courses..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          My Learning
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Continue where you left off and track your course completion
        </p>
      </div>

      {enrollments.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8 max-w-lg mx-auto">
          <BookOpen className="w-14 h-14 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-800">
            You haven't enrolled in any courses yet
          </h3>
          <p className="text-sm text-slate-500 mt-1 mb-6">
            Explore hundreds of expert-led courses and start learning today.
          </p>
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/20"
          >
            <span>Browse Courses</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrollments.map((item) => {
            const course = item.course;
            if (!course) return null;
            const progressPct = item.progress || 0;

            return (
              <div
                key={item._id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video w-full bg-slate-100 overflow-hidden">
                  <img
                    src={
                      course.thumbnail ||
                      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800"
                    }
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                  {progressPct === 100 && (
                    <div className="absolute top-3 right-3 bg-emerald-500 text-white p-1.5 rounded-xl shadow-md">
                      <Award className="w-4 h-4" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      {course.category?.name || "Course"}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-2 line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Instructor: {course.instructor?.name || "Verified Expert"}
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-600">Progress</span>
                      <span className="text-blue-600">{progressPct}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all duration-500"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Continue Button */}
                  <Link
                    to={`/learn/${course._id}`}
                    className="w-full py-2.5 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
                  >
                    <PlayCircle className="w-4 h-4" />
                    <span>{progressPct > 0 ? "Continue Learning" : "Start Course"}</span>
                  </Link>

                  {/* Rate Course */}
                  <Link
                    to={`/courses/${course._id}#reviews`}
                    className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 border border-slate-200"
                  >
                    <MessageSquarePlus className="w-3.5 h-3.5" />
                    <span>Rate this Course</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
