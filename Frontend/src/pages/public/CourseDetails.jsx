import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { useWishlist } from "../../context/WishlistContext";
import StarRating from "../../components/common/StarRating";
import ReviewForm from "../../components/common/ReviewForm";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Modal from "../../components/common/Modal";
import VideoPlayer from "../../components/course/VideoPlayer";
import {
  CheckCircle,
  CheckCircle2,
  PlayCircle,
  Clock,
  BookOpen,
  Award,
  Globe,
  Heart,
  ChevronDown,
  ChevronUp,
  User,
  ShieldCheck,
  Zap,
  Sparkles,
  Lock,
  ArrowRight,
  MessageSquarePlus
} from "lucide-react";

export default function CourseDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const navigate = useNavigate();

  const [courseData, setCourseData] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [myReview, setMyReview] = useState(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  // Curriculum accordion open sections
  const [expandedSections, setExpandedSections] = useState({});

  // Preview Modal
  const [previewLesson, setPreviewLesson] = useState(null);

  useEffect(() => {
    async function loadCourse() {
      setLoading(true);
      try {
        const [courseRes, reviewRes] = await Promise.all([
          api.get(`/courses/${id}`),
          api.get(`/courses/${id}/reviews`).catch(() => ({ data: { reviews: [] } }))
        ]);

        setCourseData(courseRes.data);
        setReviews(reviewRes.data.reviews || []);

        // Expand all sections by default
        if (courseRes.data.sections?.length > 0) {
          const allOpen = {};
          courseRes.data.sections.forEach((s) => {
            allOpen[s._id] = true;
          });
          setExpandedSections(allOpen);
        }

        // Check enrollment and existing review if logged in
        if (user) {
          try {
            const enrollRes = await api.get(`/enrollments/${id}`);
            setIsEnrolled(enrollRes.data?.isEnrolled || false);
          } catch (e) {
            // Not enrolled or error
          }
        }

        // Detect if logged-in user already reviewed this course
        const allReviews = reviewRes.data.reviews || [];
        if (user) {
          const found = allReviews.find((r) => r.student?._id === user._id || r.student === user._id);
          setMyReview(found || null);
        }
      } catch (err) {
        console.error("Failed to load course details:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCourse();
  }, [id, user]);

  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const handleEnrollOrBuy = async () => {
    if (!user) {
      navigate(`/login?redirect=/courses/${id}`);
      return;
    }

    if (isEnrolled) {
      navigate(`/learn/${id}`);
      return;
    }

    setEnrolling(true);
    try {
      const { course } = courseData;

      if (course.price === 0) {
        // Free enrollment
        await api.post("/enrollments", { courseId: course._id });
        setIsEnrolled(true);
        navigate(`/learn/${id}`);
      } else {
        // Paid checkout via Stripe
        const res = await api.post("/payments/create-checkout", {
          courseId: course._id
        });
        if (res.data?.url) {
          window.location.href = res.data.url;
        } else {
          alert("Unable to initiate checkout session. Please try again.");
        }
      }
    } catch (err) {
      alert(err.message || "Failed to initiate enrollment");
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" message="Loading course curriculum..." />;
  }

  if (!courseData?.course) {
    return (
      <div className="max-w-xl mx-auto my-20 p-8 text-center bg-white rounded-3xl border border-slate-200 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800">Course Not Found</h2>
        <p className="text-sm text-slate-500 mt-2 mb-6">
          The course you are looking for may have been removed or unpublished.
        </p>
        <Link
          to="/courses"
          className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm"
        >
          Back to Catalog
        </Link>
      </div>
    );
  }

  const { course, sections = [], stats = {} } = courseData;
  const isWishlisted = isInWishlist(course._id);

  // Find first preview lesson if any exists
  const allLessons = sections.flatMap((s) => s.lessons || []);
  const firstPreviewLesson = allLessons.find((l) => l.isPreview) || allLessons[0];

  return (
    <div className="pb-24">
      {/* Dark Hero Header */}
      <section className="bg-slate-900 text-white py-12 lg:py-16 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-5">
              {/* Category Breadcrumb */}
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400">
                <Link to={`/courses?category=${course.category?._id}`} className="hover:underline">
                  {course.category?.name || "Education"}
                </Link>
                <span>•</span>
                <span className="capitalize">{course.level || "All Levels"}</span>
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                {course.title}
              </h1>

              {/* Description */}
              <p className="text-base text-slate-300 leading-relaxed max-w-2xl">
                {course.description}
              </p>

              {/* Instructor & Meta */}
              <div className="flex flex-wrap items-center gap-6 pt-2 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs overflow-hidden border border-slate-700">
                    {course.instructor?.profileImage ? (
                      <img
                        src={course.instructor.profileImage}
                        alt={course.instructor.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                  </div>
                  <Link
                    to={`/instructor/${course.instructor?._id}`}
                    className="text-slate-200 font-semibold hover:text-blue-400 transition-colors"
                  >
                    {course.instructor?.name || "Verified Instructor"}
                  </Link>
                </div>

                <div className="flex items-center gap-1.5 text-amber-400">
                  <StarRating rating={stats.averageRating || 4.9} size="sm" />
                  <span className="text-xs text-slate-400">
                    ({stats.totalReviews || reviews.length} reviews)
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Globe className="w-4 h-4" />
                  <span>{course.language || "English"}</span>
                </div>
              </div>

              {/* Hero Call to Action Buttons */}
              <div className="pt-4 flex flex-wrap items-center gap-4">
                {isEnrolled ? (
                  <Link
                    to={`/learn/${id}`}
                    className="inline-flex items-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-extrabold text-sm shadow-lg shadow-emerald-500/20 transition-all hover:scale-105"
                  >
                    <PlayCircle className="w-5 h-5 fill-white text-emerald-600" />
                    <span>Go to Classroom & Watch</span>
                  </Link>
                ) : course.price === 0 ? (
                  <button
                    onClick={handleEnrollOrBuy}
                    disabled={enrolling}
                    className="inline-flex items-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-extrabold text-sm shadow-lg shadow-blue-500/25 transition-all hover:scale-105"
                  >
                    <Zap className="w-5 h-5 fill-white" />
                    <span>{enrolling ? "Enrolling..." : "Enroll for Free & Start Learning"}</span>
                  </button>
                ) : (
                  <button
                    onClick={handleEnrollOrBuy}
                    disabled={enrolling}
                    className="inline-flex items-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-extrabold text-sm shadow-lg shadow-blue-500/25 transition-all hover:scale-105"
                  >
                    <Zap className="w-5 h-5 fill-white" />
                    <span>{enrolling ? "Processing..." : `Enroll Now for $${Number(course.price).toFixed(2)}`}</span>
                  </button>
                )}

                {firstPreviewLesson && !isEnrolled && (
                  <button
                    onClick={() => setPreviewLesson(firstPreviewLesson)}
                    className="inline-flex items-center gap-2 px-5 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl font-bold text-sm border border-slate-700 transition-colors"
                  >
                    <PlayCircle className="w-4 h-4 text-emerald-400" />
                    <span>Watch Sample Lesson</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Body with Sticky Sidebar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative">
          {/* Left Column: Details, Learnings, Curriculum, Reviews */}
          <div className="lg:col-span-2 space-y-12">
            {/* What you will learn */}
            {course.whatYouWillLearn?.length > 0 && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  <span>What you'll learn</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                  {course.whatYouWillLearn.map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-700 leading-snug">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Course Content / Curriculum */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Course Curriculum</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {sections.length} section{sections.length === 1 ? "" : "s"} •{" "}
                    {stats.totalLessons || allLessons.length} lessons total
                  </p>
                </div>
                <button
                  onClick={() => {
                    const allOpen = Object.keys(expandedSections).length === sections.length;
                    if (allOpen) {
                      setExpandedSections({});
                    } else {
                      const all = {};
                      sections.forEach((s) => (all[s._id] = true));
                      setExpandedSections(all);
                    }
                  }}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700"
                >
                  {Object.keys(expandedSections).length === sections.length
                    ? "Collapse All"
                    : "Expand All"}
                </button>
              </div>

              {/* Sections Accordion */}
              <div className="space-y-3">
                {sections.length === 0 ? (
                  <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-sm">
                    Curriculum is being prepared by the instructor.
                  </div>
                ) : (
                  sections.map((section, sIndex) => {
                    const isOpen = !!expandedSections[section._id];
                    return (
                      <div
                        key={section._id}
                        className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm"
                      >
                        <button
                          onClick={() => toggleSection(section._id)}
                          className="w-full flex items-center justify-between p-4 sm:p-5 text-left bg-slate-50/70 hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">
                              {sIndex + 1}
                            </span>
                            <span className="font-bold text-slate-800 text-sm sm:text-base">
                              {section.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-slate-500 hidden sm:inline">
                              {section.lessons?.length || 0} lessons
                            </span>
                            {isOpen ? (
                              <ChevronUp className="w-4 h-4 text-slate-500" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-slate-500" />
                            )}
                          </div>
                        </button>

                        {/* Lessons List */}
                        {isOpen && (
                          <div className="divide-y divide-slate-100 px-3 sm:px-4 py-2">
                            {section.lessons?.length === 0 ? (
                              <p className="text-xs text-slate-400 py-3 px-2">No lessons in this section yet.</p>
                            ) : (
                              section.lessons.map((lesson) => {
                                const canWatch = isEnrolled;
                                const isPreview = lesson.isPreview;

                                return (
                                  <div
                                    key={lesson._id}
                                    onClick={() => {
                                      if (canWatch) {
                                        navigate(`/learn/${id}?lesson=${lesson._id}`);
                                      } else if (isPreview) {
                                        setPreviewLesson(lesson);
                                      }
                                    }}
                                    className={`py-3 px-3 rounded-xl flex items-center justify-between gap-4 text-sm transition-all ${
                                      canWatch || isPreview
                                        ? "cursor-pointer hover:bg-blue-50/70 group"
                                        : "opacity-70 bg-slate-50/50"
                                    }`}
                                  >
                                    <div className="flex items-center gap-3 min-w-0">
                                      {canWatch ? (
                                        <PlayCircle className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform shrink-0" />
                                      ) : isPreview ? (
                                        <PlayCircle className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform shrink-0" />
                                      ) : (
                                        <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                                      )}
                                      <span
                                        className={`font-medium truncate ${
                                          canWatch
                                            ? "text-slate-900 group-hover:text-blue-600"
                                            : isPreview
                                            ? "text-slate-800 group-hover:text-emerald-700"
                                            : "text-slate-600"
                                        }`}
                                      >
                                        {lesson.title}
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-3 shrink-0">
                                      {lesson.duration > 0 && (
                                        <span className="text-xs text-slate-400 flex items-center gap-1">
                                          <Clock className="w-3 h-3" />
                                          {lesson.duration}m
                                        </span>
                                      )}

                                      {canWatch ? (
                                        <span className="px-2.5 py-1 text-xs font-bold text-blue-600 bg-blue-100 group-hover:bg-blue-600 group-hover:text-white rounded-lg transition-colors">
                                          Watch
                                        </span>
                                      ) : isPreview ? (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setPreviewLesson(lesson);
                                          }}
                                          className="px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-600 hover:text-white rounded-lg transition-colors"
                                        >
                                          Preview
                                        </button>
                                      ) : (
                                        <span className="text-[11px] font-semibold text-slate-400">
                                          Locked
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Requirements */}
            {course.requirements?.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-slate-900">Requirements</h3>
                <ul className="list-disc list-inside space-y-2 text-sm text-slate-600 pl-2">
                  {course.requirements.map((req, idx) => (
                    <li key={idx}>{req}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Reviews Section */}
            <div className="space-y-6 pt-6 border-t border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h3 className="text-xl font-bold text-slate-900">
                  Student Feedback ({reviews.length})
                </h3>

                {/* Write Review Button – only if enrolled */}
                {isEnrolled && (
                  <button
                    onClick={() => setReviewModalOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm shadow-blue-500/10 transition-colors"
                  >
                    <MessageSquarePlus className="w-4 h-4" />
                    <span>{myReview ? "Edit My Review" : "Write a Review"}</span>
                  </button>
                )}
              </div>

              {/* My existing review preview */}
              {myReview && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">Your Review</p>
                    <StarRating rating={myReview.rating} size="sm" />
                  </div>
                  <p className="text-sm text-slate-700">{myReview.comment}</p>
                  <button
                    onClick={() => setReviewModalOpen(true)}
                    className="text-xs text-blue-600 font-bold hover:underline"
                  >
                    Edit Review
                  </button>
                </div>
              )}

              {reviews.length === 0 ? (
                <div className="p-6 bg-slate-50 rounded-2xl text-center text-sm text-slate-500">
                  No student reviews yet. Be the first to enroll and leave your rating!
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((rev) => (
                    <div
                      key={rev._id}
                      className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs overflow-hidden">
                            {rev.student?.profileImage ? (
                              <img
                                src={rev.student.profileImage}
                                alt={rev.student.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              rev.student?.name?.charAt(0) || "S"
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">
                              {rev.student?.name || "Student"}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {new Date(rev.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <StarRating rating={rev.rating} size="sm" />
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {rev.comment}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Sticky Checkout Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-6 space-y-6">
              {/* Thumbnail Container with Play Preview Button Overlay */}
              <div
                onClick={() => {
                  if (isEnrolled) {
                    navigate(`/learn/${id}`);
                  } else if (firstPreviewLesson) {
                    setPreviewLesson(firstPreviewLesson);
                  }
                }}
                className={`relative aspect-video rounded-2xl overflow-hidden bg-slate-900 shadow-sm group ${
                  isEnrolled || firstPreviewLesson ? "cursor-pointer" : ""
                }`}
              >
                <img
                  src={
                    course.thumbnail ||
                    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800"
                  }
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-slate-900/40 group-hover:bg-slate-900/25 transition-colors flex flex-col items-center justify-center text-white">
                  <div className="w-14 h-14 rounded-full bg-white text-blue-600 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                    <PlayCircle className="w-8 h-8 fill-blue-600 text-white" />
                  </div>
                  <span className="text-[11px] font-extrabold mt-2 tracking-wide uppercase bg-slate-900/80 px-3 py-1 rounded-full backdrop-blur-md">
                    {isEnrolled ? "Go to Classroom" : firstPreviewLesson ? "Watch Free Preview" : "Course Preview"}
                  </span>
                </div>
              </div>

              {/* Price / Enrolled Banner */}
              <div className="flex items-center gap-3">
                {isEnrolled ? (
                  <div className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3 w-full">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                    <div>
                      <p className="text-base font-extrabold text-emerald-700 leading-tight">You're Enrolled!</p>
                      <p className="text-xs text-emerald-600 font-medium">Full lifetime access granted</p>
                    </div>
                  </div>
                ) : course.price === 0 ? (
                  <span className="text-3xl font-black text-emerald-600">Free</span>
                ) : (
                  <span className="text-3xl font-black text-slate-900">
                    ${Number(course.price).toFixed(2)}
                  </span>
                )}
              </div>

              {/* Main Action Button */}
              <div className="space-y-3">
                <button
                  onClick={handleEnrollOrBuy}
                  disabled={enrolling}
                  className={`w-full py-4 text-center font-extrabold rounded-2xl shadow-lg transition-all text-sm flex items-center justify-center gap-2 ${
                    isEnrolled
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20"
                      : course.price === 0
                      ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/25 hover:scale-[1.02]"
                      : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-500/25 hover:scale-[1.02]"
                  }`}
                >
                  <Zap className="w-4 h-4 fill-white" />
                  <span>
                    {enrolling
                      ? "Processing..."
                      : isEnrolled
                      ? "Go to Classroom"
                      : course.price === 0
                      ? "Enroll Now (Free)"
                      : "Buy Now with Stripe"}
                  </span>
                </button>

                {/* Wishlist Button */}
                <button
                  onClick={() =>
                    isWishlisted ? removeFromWishlist(course._id) : addToWishlist(course._id)
                  }
                  className="w-full py-3 bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-bold rounded-2xl transition-colors text-sm flex items-center justify-center gap-2"
                >
                  <Heart
                    className={`w-4 h-4 ${isWishlisted ? "text-rose-500 fill-rose-500" : ""}`}
                  />
                  <span>{isWishlisted ? "In Wishlist" : "Add to Wishlist"}</span>
                </button>
              </div>

              {/* Course Includes List */}
              <div className="pt-4 border-t border-slate-100 space-y-3 text-xs text-slate-600">
                <p className="font-bold text-slate-800 text-sm">This course includes:</p>
                <div className="flex items-center gap-2.5">
                  <PlayCircle className="w-4 h-4 text-blue-600" />
                  <span>{stats.totalLessons || allLessons.length} on-demand video lessons</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span>{sections.length} structured curriculum modules</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Globe className="w-4 h-4 text-blue-600" />
                  <span>Full lifetime access on mobile & desktop</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Award className="w-4 h-4 text-blue-600" />
                  <span>Certificate of completion</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Secure 256-bit Stripe encrypted checkout</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Free Preview Video Modal */}
      <Modal
        isOpen={!!previewLesson}
        onClose={() => setPreviewLesson(null)}
        title={`Preview: ${previewLesson?.title || "Lesson"}`}
        maxWidth="max-w-4xl"
      >
        <div className="space-y-4">
          <VideoPlayer
            url={previewLesson?.videoUrl}
            title={previewLesson?.title}
            isPreview={true}
          />
          <div className="flex items-center justify-between pt-2">
            <div>
              <h4 className="font-bold text-slate-800 text-sm">{previewLesson?.title}</h4>
              {previewLesson?.description && (
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {previewLesson.description}
                </p>
              )}
            </div>
            {!isEnrolled && (
              <button
                onClick={() => {
                  setPreviewLesson(null);
                  handleEnrollOrBuy();
                }}
                className="shrink-0 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md shadow-blue-500/20"
              >
                {course.price === 0 ? "Enroll Free" : "Unlock Full Course"}
              </button>
            )}
          </div>
        </div>
      </Modal>

      {/* Review Modal */}
      <Modal isOpen={reviewModalOpen} onClose={() => setReviewModalOpen(false)} title={myReview ? "Edit Your Review" : "Write a Review"}>
        <ReviewForm
          courseId={id}
          courseName={course?.title}
          existingReview={myReview}
          onSuccess={() => {
            setReviewModalOpen(false);
            // Reload reviews
            api.get(`/courses/${id}/reviews`).then((res) => {
              const fresh = res.data.reviews || [];
              setReviews(fresh);
              if (user) {
                const found = fresh.find((r) => r.student?._id === user._id || r.student === user._id);
                setMyReview(found || null);
              }
            });
          }}
        />
      </Modal>
    </div>
  );
}
