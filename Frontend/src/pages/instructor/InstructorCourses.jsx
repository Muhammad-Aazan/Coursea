import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import {
  PlusCircle,
  BookOpen,
  Layers,
  Users,
  Eye,
  Trash2,
  Globe,
  Lock,
  Edit2
} from "lucide-react";

export default function InstructorCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCourses = async () => {
    try {
      const res = await api.get("/courses/my-courses");
      setCourses(res.data.courses || []);
    } catch (err) {
      console.error("Failed to load courses:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleTogglePublish = async (courseId, currentStatus) => {
    try {
      await api.patch(`/courses/${courseId}/publish`, {
        published: !currentStatus
      });
      await fetchCourses();
    } catch (err) {
      alert(err.message || "Failed to update publish state");
    }
  };

  const handleDeleteCourse = async (courseId, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) {
      return;
    }
    try {
      await api.delete(`/courses/${courseId}`);
      setCourses((prev) => prev.filter((c) => c._id !== courseId));
    } catch (err) {
      alert(err.message || "Failed to delete course");
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" message="Loading your courses..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Manage Courses
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Publish, edit curriculum, and review your course catalog
          </p>
        </div>

        <Link
          to="/instructor/create-course"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Course</span>
        </Link>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8 max-w-lg mx-auto">
          <BookOpen className="w-14 h-14 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-800">No courses yet</h3>
          <p className="text-sm text-slate-500 mt-1 mb-6">
            Create your first course to begin teaching on Coursea.
          </p>
          <Link
            to="/instructor/create-course"
            className="px-6 py-3 bg-blue-600 text-white font-bold text-sm rounded-xl"
          >
            Create Course
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
          {courses.map((course) => (
            <div
              key={course._id}
              className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:bg-slate-50/50 transition-colors"
            >
              {/* Left Info */}
              <div className="flex items-center gap-4">
                <div className="w-24 h-16 rounded-2xl bg-slate-100 overflow-hidden shrink-0 shadow-sm">
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
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      {course.category?.name || "Category"}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {course.level}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-1">
                    {course.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Price: {course.price === 0 ? "Free" : `$${course.price}`} • Updated:{" "}
                    {new Date(course.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Right Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
                {/* Publish Toggle Button */}
                <button
                  onClick={() => handleTogglePublish(course._id, course.published)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                    course.published
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                      : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                  }`}
                >
                  {course.published ? (
                    <>
                      <Globe className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Published</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5 text-slate-500" />
                      <span>Draft</span>
                    </>
                  )}
                </button>

                {/* Manage Curriculum */}
                <Link
                  to={`/instructor/curriculum/${course._id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Curriculum</span>
                </Link>

                {/* Enrolled Students */}
                <Link
                  to={`/instructor/students/${course._id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Students</span>
                </Link>

                {/* Edit Course */}
                <Link
                  to={`/instructor/edit-course/${course._id}`}
                  className="p-2 text-amber-500 hover:text-amber-700 hover:bg-amber-50 rounded-xl transition-colors"
                  title="Edit Course Details"
                >
                  <Edit2 className="w-4 h-4" />
                </Link>

                {/* Public Preview */}
                <Link
                  to={`/courses/${course._id}`}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                  title="View Public Course Page"
                >
                  <Eye className="w-4 h-4" />
                </Link>

                {/* Delete */}
                <button
                  onClick={() => handleDeleteCourse(course._id, course.title)}
                  className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                  title="Delete Course"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
