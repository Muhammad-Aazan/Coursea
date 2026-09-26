import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import {
  BookOpen,
  Users,
  DollarSign,
  PlusCircle,
  TrendingUp,
  Settings,
  Layers,
  ArrowRight
} from "lucide-react";

export default function InstructorDashboard() {
  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInstructorData() {
      try {
        const res = await api.get("/courses/instructor-stats");
        if (res.data?.data) {
          setStats(res.data.data);
          setCourses(res.data.data.courses || []);
        } else {
          // Fallback if older response structure
          const fallbackRes = await api.get("/courses/my-courses");
          setCourses(fallbackRes.data.courses || []);
        }
      } catch (err) {
        console.error("Failed to load instructor stats:", err);
      } finally {
        setLoading(false);
      }
    }
    loadInstructorData();
  }, []);

  if (loading) {
    return <LoadingSpinner size="lg" message="Loading instructor analytics..." />;
  }

  const publishedCount = stats?.publishedCount ?? courses.filter((c) => c.published).length;
  const draftCount = stats?.draftCount ?? (courses.length - publishedCount);
  const netEarnings = stats?.netEarnings ?? 0;
  const grossSales = stats?.grossSales ?? 0;
  const platformFees = stats?.platformFees ?? 0;
  const totalStudents = stats?.totalStudents ?? 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Instructor Studio
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your courses, view student enrollment, and track your net earnings
          </p>
        </div>

        <Link
          to="/instructor/create-course"
          className="inline-flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm rounded-2xl shadow-md shadow-blue-500/20 transition-all hover:scale-105"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Create New Course</span>
        </Link>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Net Earnings */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Net Earnings
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-emerald-600">${Number(netEarnings).toFixed(2)}</p>
          <p className="text-xs text-slate-500">
            Your 85% payout share
          </p>
        </div>

        {/* Gross Sales */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Gross Sales
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900">${Number(grossSales).toFixed(2)}</p>
          <p className="text-xs text-slate-500">
            Platform fee: -${Number(platformFees).toFixed(2)} (15%)
          </p>
        </div>

        {/* Total Students */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Students
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900">{totalStudents}</p>
          <p className="text-xs text-slate-500">Across all your courses</p>
        </div>

        {/* Active Courses */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Active Courses
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900">{courses.length}</p>
          <p className="text-xs text-slate-500">
            {publishedCount} live • {draftCount} draft
          </p>
        </div>
      </div>

      {/* Courses Table / List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">Your Courses</h3>
          <Link
            to="/instructor/courses"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {courses.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 rounded-2xl p-6">
            <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-800">No courses created yet</h4>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Get started by creating your first course and uploading curriculum
            </p>
            <Link
              to="/instructor/create-course"
              className="px-5 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl inline-block"
            >
              Create Course Now
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {courses.slice(0, 5).map((course) => (
              <div
                key={course._id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 rounded-xl px-2 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                    <img
                      src={
                        course.thumbnail ||
                        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800"
                      }
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{course.title}</h4>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                      <span>{course.price === 0 ? "Free" : `$${course.price}`}</span>
                      <span>•</span>
                      <span>{course.category?.name || "Category"}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <span
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg ${
                      course.published
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {course.published ? "Published" : "Draft"}
                  </span>

                  <Link
                    to={`/instructor/curriculum/${course._id}`}
                    className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold rounded-lg transition-colors"
                  >
                    Curriculum
                  </Link>

                  <Link
                    to={`/instructor/students/${course._id}`}
                    className="px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold rounded-lg transition-colors"
                  >
                    Students
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
