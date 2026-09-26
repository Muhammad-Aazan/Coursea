import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import CourseCard from "../../components/course/CourseCard";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  Code2,
  BrainCircuit,
  Palette,
  Briefcase,
  Layers,
  Award,
  Users,
  Video,
  CheckCircle2
} from "lucide-react";

export default function Home() {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        const [courseRes, catRes] = await Promise.all([
          api.get("/courses", { sort: "-createdAt" }),
          api.get("/categories")
        ]);
        setCourses((courseRes.data.courses || []).slice(0, 8));
        setCategories((catRes.data.categories || []).slice(0, 6));
      } catch (err) {
        console.error("Home data error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/courses?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const categoryIcons = [Code2, BrainCircuit, Palette, Briefcase, Layers, Sparkles];

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/60 via-white to-slate-50 pt-16 pb-24 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 text-blue-700 text-xs font-bold uppercase tracking-wider animate-fadeIn">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Next-Generation Online Education</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
              Master in-demand skills from{" "}
              <span className="text-blue-700">
                World-Class Instructors
              </span>
            </h1>

            <p className="text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Join thousands of students advancing their careers with hands-on, practical courses in web development, AI, software engineering, and business.
            </p>

            {/* Hero Search */}
            <form
              onSubmit={handleHeroSearch}
              className="max-w-xl mx-auto flex items-center p-2 bg-white rounded-2xl shadow-xl shadow-blue-500/5 border border-slate-200"
            >
              <input
                type="text"
                placeholder="What skill do you want to learn today?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-3 text-sm text-slate-800 bg-transparent outline-none"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-blue-500/20"
              >
                Search
              </button>
            </form>

            {/* Quick Metrics */}
            <div className="pt-8 grid grid-cols-3 gap-6 max-w-lg mx-auto border-t border-slate-200/60">
              <div>
                <p className="text-2xl font-black text-slate-900">500+</p>
                <p className="text-xs text-slate-500 font-medium">Expert Courses</p>
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900">10k+</p>
                <p className="text-xs text-slate-500 font-medium">Active Students</p>
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900">99%</p>
                <p className="text-xs text-slate-500 font-medium">Satisfaction Rate</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Top Categories */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Explore Top Categories
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Browse our wide selection of disciplines and start learning
              </p>
            </div>
            <Link
              to="/courses"
              className="hidden sm:flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700"
            >
              <span>View all</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat, idx) => {
              const IconComponent = categoryIcons[idx % categoryIcons.length];
              return (
                <Link
                  key={cat._id}
                  to={`/courses?category=${cat._id}`}
                  className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-lg transition-all group text-center flex flex-col items-center justify-center space-y-3"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-50 group-hover:bg-blue-600 text-blue-600 group-hover:text-white flex items-center justify-center transition-colors">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors truncate w-full">
                    {cat.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Featured Courses */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Featured Courses
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Hand-picked by our editors for career success
            </p>
          </div>
          <Link
            to="/courses"
            className="flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700"
          >
            <span>Browse All Courses</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading popular courses..." />
        ) : courses.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
            <GraduationCap className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-base font-bold text-slate-700">No courses published yet</p>
            <p className="text-xs text-slate-500 mt-1">Be the first to create one!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {courses.map((course) => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>
        )}
      </section>

      {/* Why Choose Coursea */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-3xl p-8 sm:p-14 text-white border border-slate-800 shadow-md">
          <div className="max-w-2xl mb-12">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-4 text-white">
              Everything you need to level up your career
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              We design our platform around real student outcomes: project portfolios, hands-on video tutorials, and interactive progress tracking.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-800/90 border border-slate-700 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <Video className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Bite-Sized Lessons</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Watch concise video lessons with free previews before enrolling. Learn at your own pace.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/90 border border-slate-700 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Interactive Progress</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Automatic progress tracking keeps you motivated as you mark lessons completed one by one.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/90 border border-slate-700 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Expert Instructors</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Learn directly from verified industry practitioners who build real-world software every day.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Instructor CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-blue-600 rounded-3xl p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl shadow-blue-500/10">
          <div className="space-y-3 max-w-xl text-center md:text-left">
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Share your knowledge. Become an Instructor.
            </h3>
            <p className="text-blue-100 text-sm leading-relaxed">
              Instructors from around the globe teach millions of learners on Coursea. We provide the tools to publish courses and monetize your expertise.
            </p>
          </div>
          <Link
            to="/register?role=instructor"
            className="px-8 py-3.5 bg-white hover:bg-slate-50 text-blue-600 font-extrabold rounded-2xl shadow-lg transition-all hover:scale-105"
          >
            Start Teaching Today
          </Link>
        </div>
      </section>
    </div>
  );
}
