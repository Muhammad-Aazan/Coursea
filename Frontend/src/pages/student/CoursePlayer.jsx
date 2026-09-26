import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, Link, useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import VideoPlayer from "../../components/course/VideoPlayer";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Modal from "../../components/common/Modal";
import StarRating from "../../components/common/StarRating";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  PlayCircle,
  Clock,
  Award,
  ChevronDown,
  ChevronUp,
  MessageSquarePlus,
  ArrowRight,
  ArrowLeft as ArrowLeftIcon,
  BookOpen,
  Sparkles
} from "lucide-react";

export default function CoursePlayer() {
  const { courseId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [sections, setSections] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [completedLessonIds, setCompletedLessonIds] = useState([]);
  const [percentage, setPercentage] = useState(0);
  const [loading, setLoading] = useState(true);

  // Accordion state
  const [expandedSections, setExpandedSections] = useState({});

  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Course Completion Modal
  const [completionModalOpen, setCompletionModalOpen] = useState(false);
  const [completionShown, setCompletionShown] = useState(false);

  const requestedLessonId = searchParams.get("lesson");

  useEffect(() => {
    async function loadClassroom() {
      setLoading(true);
      try {
        const [courseRes, progRes, compRes] = await Promise.all([
          api.get(`/courses/${courseId}`),
          api.get(`/progress/${courseId}`).catch(() => ({ data: { progress: { percentage: 0 } } })),
          api.get(`/progress/${courseId}/completed-lessons`).catch(() => ({ data: { completedLessons: [] } }))
        ]);

        const cData = courseRes.data?.course;
        const sData = courseRes.data?.sections || [];
        setCourse(cData);
        setSections(sData);

        // Auto-enroll in background if free and not enrolled
        if (cData && cData.price === 0) {
          api.post("/enrollments", { courseId }).catch(() => {});
        }

        // Progress
        setPercentage(progRes.data?.progress?.percentage || 0);
        const compIds = (compRes.data?.completedLessons || []).map((l) => l._id || l);
        setCompletedLessonIds(compIds);

        // Expand all sections
        const expandedMap = {};
        for (const sec of sData) {
          expandedMap[sec._id] = true;
        }
        setExpandedSections(expandedMap);

        // Select lesson: either from URL query param or first available lesson
        const allLessons = sData.flatMap((s) => s.lessons || []);
        let targetLesson = null;
        if (requestedLessonId) {
          targetLesson = allLessons.find((l) => l._id === requestedLessonId);
        }
        if (!targetLesson && allLessons.length > 0) {
          targetLesson = allLessons[0];
        }

        if (targetLesson) {
          setCurrentLesson(targetLesson);
        }
      } catch (err) {
        console.error("Failed to load classroom:", err);
      } finally {
        setLoading(false);
      }
    }
    loadClassroom();
  }, [courseId, requestedLessonId]);

  const toggleSection = (sId) => {
    setExpandedSections((prev) => ({ ...prev, [sId]: !prev[sId] }));
  };

  const isCompleted = (lessonId) => {
    return completedLessonIds.includes(lessonId);
  };

  const handleSelectLesson = (lesson) => {
    setCurrentLesson(lesson);
    setSearchParams({ lesson: lesson._id });
  };

  const handleToggleComplete = async () => {
    if (!currentLesson) return;
    const lessonId = currentLesson._id;

    try {
      if (isCompleted(lessonId)) {
        // Mark incomplete
        const res = await api.delete(`/progress/${lessonId}`);
        setCompletedLessonIds((prev) => prev.filter((id) => id !== lessonId));
        setPercentage(res.data?.percentage || 0);
      } else {
        // Mark complete
        const res = await api.post(`/progress/${lessonId}`, {});
        setCompletedLessonIds((prev) => [...prev, lessonId]);
        const newPct = res.data?.percentage || 0;
        setPercentage(newPct);

        // Show course completion modal when 100% reached for the first time
        if (newPct >= 100 && !completionShown) {
          setCompletionShown(true);
          setTimeout(() => setCompletionModalOpen(true), 500);
        } else if (nextLesson) {
          // Auto advance to next lesson if available
          setTimeout(() => {
            handleSelectLesson(nextLesson);
          }, 800);
        }
      }
    } catch (err) {
      alert(err.message || "Failed to update progress");
    }
  };

  // Find prev / next lesson
  const allLessons = sections.flatMap((s) => s.lessons || []);
  const currentIndex = allLessons.findIndex((l) => l._id === currentLesson?._id);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex >= 0 && currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setReviewSubmitting(true);
    try {
      await api.post(`/courses/${courseId}/reviews`, {
        rating: reviewRating,
        comment: reviewComment
      });
      setReviewSuccess(true);
      setTimeout(() => {
        setReviewModalOpen(false);
        setReviewSuccess(false);
        setReviewComment("");
      }, 1500);
    } catch (err) {
      alert(err.message || "Failed to submit review");
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" message="Loading your classroom video stream..." />;
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-white text-center">
        <div className="max-w-md space-y-4">
          <BookOpen className="w-16 h-16 text-slate-500 mx-auto" />
          <h2 className="text-xl font-bold">Course Could Not Be Loaded</h2>
          <p className="text-sm text-slate-400">
            Please make sure you have an active enrollment or browse our catalog.
          </p>
          <Link
            to="/courses"
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-sm"
          >
            Explore Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Classroom Top Bar */}
      <header className="h-16 px-4 sm:px-6 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 flex items-center justify-between gap-4 sticky top-0 z-30">
        <div className="flex items-center gap-4 min-w-0">
          <Link
            to={`/courses/${courseId}`}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
            title="Back to Course Details"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="border-l border-slate-800 pl-4 min-w-0">
            <h1 className="text-sm sm:text-base font-bold text-white truncate max-w-md">
              {course.title}
            </h1>
            <p className="text-[11px] text-blue-400 truncate">
              {currentLesson ? currentLesson.title : "Select a lesson to begin"}
            </p>
          </div>
        </div>

        {/* Progress & Action */}
        <div className="flex items-center gap-3 shrink-0">
          {percentage >= 100 ? (
            /* 100% — show Finish Course button */
            <button
              onClick={() => setCompletionModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs rounded-xl transition-colors shadow-md shadow-emerald-500/30"
            >
              <Award className="w-4 h-4" />
              <span className="hidden sm:inline">Finish Course</span>
            </button>
          ) : (
            /* Progress bar */
            <div className="hidden sm:flex items-center gap-3">
              <div className="w-28 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-xs font-bold text-emerald-400">{percentage}%</span>
            </div>
          )}

          <button
            onClick={() => setReviewModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
          >
            <MessageSquarePlus className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Review Course</span>
          </button>
        </div>
      </header>

      {/* Main Classroom Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Side: Video Player & Controls */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto space-y-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Player */}
            <VideoPlayer
              url={currentLesson?.videoUrl}
              title={currentLesson?.title}
              isPreview={currentLesson?.isPreview}
            />

            {/* Video Controls Bar */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                    Lesson {currentIndex >= 0 ? currentIndex + 1 : 1} of {allLessons.length}
                  </span>
                  {currentLesson?.duration > 0 && (
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{currentLesson.duration}m</span>
                    </span>
                  )}
                </div>
                <h2 className="text-lg font-bold text-white mt-1.5">
                  {currentLesson?.title || "Select a lesson to begin watching"}
                </h2>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                {/* Previous Lesson Button */}
                {prevLesson && (
                  <button
                    onClick={() => handleSelectLesson(prevLesson)}
                    className="flex items-center gap-1 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs rounded-xl transition-colors"
                    title={`Previous: ${prevLesson.title}`}
                  >
                    <ArrowLeftIcon className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">Prev</span>
                  </button>
                )}

                {/* Mark Complete Button */}
                <button
                  onClick={handleToggleComplete}
                  className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
                    isCompleted(currentLesson?._id)
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30"
                      : "bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20 hover:scale-[1.02]"
                  }`}
                >
                  {isCompleted(currentLesson?._id) ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Completed</span>
                    </>
                  ) : (
                    <>
                      <Circle className="w-4 h-4" />
                      <span>Mark Complete</span>
                    </>
                  )}
                </button>

                {/* Next Lesson Button */}
                {nextLesson && (
                  <button
                    onClick={() => handleSelectLesson(nextLesson)}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02]"
                    title={`Next: ${nextLesson.title}`}
                  >
                    <span>Next</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Description & Overview */}
            {currentLesson?.description && (
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
                <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>About this lesson</span>
                </h4>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {currentLesson.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Curriculum Sidebar */}
        <aside className="w-full lg:w-96 bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col h-auto lg:h-[calc(100vh-4rem)]">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-500" />
              <span>Curriculum ({allLessons.length} lessons)</span>
            </h3>
            <span className="text-xs font-bold text-emerald-400">
              {completedLessonIds.length}/{allLessons.length} Done
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-800">
            {sections.map((section, sIndex) => {
              const isOpen = !!expandedSections[section._id];
              return (
                <div key={section._id}>
                  <button
                    onClick={() => toggleSection(section._id)}
                    className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="pr-2 min-w-0">
                      <p className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">
                        Section {sIndex + 1}
                      </p>
                      <h4 className="text-xs font-bold text-slate-200 mt-0.5 truncate">
                        {section.title}
                      </h4>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="bg-slate-950/60 divide-y divide-slate-800/40">
                      {section.lessons?.map((lesson) => {
                        const active = currentLesson?._id === lesson._id;
                        const done = isCompleted(lesson._id);

                        return (
                          <button
                            key={lesson._id}
                            onClick={() => handleSelectLesson(lesson)}
                            className={`w-full p-3.5 pl-5 flex items-start gap-3 text-left transition-colors ${
                              active
                                ? "bg-blue-600/25 border-l-4 border-blue-500"
                                : "hover:bg-slate-800/40"
                            }`}
                          >
                            {done ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            ) : (
                              <PlayCircle
                                className={`w-4 h-4 shrink-0 mt-0.5 ${
                                  active ? "text-blue-400" : "text-slate-500"
                                }`}
                              />
                            )}

                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-xs font-medium truncate ${
                                  active ? "text-blue-300 font-bold" : "text-slate-300"
                                }`}
                              >
                                {lesson.title}
                              </p>
                              {lesson.duration > 0 && (
                                <p className="text-[10px] text-slate-500 mt-0.5">
                                  {lesson.duration}m
                                </p>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>
      </div>

      {/* Review Modal */}
      <Modal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title="Leave a Review for this Course"
        maxWidth="max-w-md"
      >
        {reviewSuccess ? (
          <div className="py-8 text-center space-y-2 text-emerald-600 font-bold">
            <CheckCircle2 className="w-12 h-12 mx-auto" />
            <p>Thank you! Your feedback has been published.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div className="space-y-1.5 text-center">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Your Rating
              </label>
              <div className="flex justify-center py-2">
                <StarRating
                  rating={reviewRating}
                  interactive={true}
                  onChange={(val) => setReviewRating(val)}
                  size="lg"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Feedback & Thoughts
              </label>
              <textarea
                required
                rows={4}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="What did you think of the lessons, pacing, and instructor?"
                className="w-full p-3 text-sm border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-blue-500 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={reviewSubmitting}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-blue-500/20"
            >
              {reviewSubmitting ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        )}
      </Modal>

      {/* ========= COURSE COMPLETION MODAL ========= */}
      {completionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 space-y-6 text-center animate-in fade-in zoom-in duration-300">
            {/* Trophy */}
            <div className="flex justify-center">
              <div className="w-24 h-24 rounded-full bg-emerald-50 border-4 border-emerald-200 flex items-center justify-center">
                <Award className="w-12 h-12 text-emerald-500" />
              </div>
            </div>

            {/* Heading */}
            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-slate-900">Course Complete! 🎉</h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                Congratulations! You've finished{" "}
                <span className="font-bold text-slate-700">{course?.title}</span>.
                You can now rate this course and share your experience.
              </p>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-center gap-6 py-2">
              <div className="text-center">
                <p className="text-2xl font-black text-emerald-500">100%</p>
                <p className="text-xs text-slate-500 font-semibold">Progress</p>
              </div>
              <div className="w-px h-10 bg-slate-200" />
              <div className="text-center">
                <p className="text-2xl font-black text-blue-600">{allLessons.length}</p>
                <p className="text-xs text-slate-500 font-semibold">Lessons Done</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {/* Rate the course */}
              <button
                onClick={() => {
                  setCompletionModalOpen(false);
                  setReviewModalOpen(true);
                }}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-2xl transition-colors shadow-md shadow-blue-500/20"
              >
                ⭐ Rate this Course
              </button>

              {/* Go to My Courses */}
              <Link
                to="/my-courses"
                className="w-full py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-sm rounded-2xl transition-colors flex items-center justify-center gap-2 border border-emerald-200"
              >
                <CheckCircle2 className="w-4 h-4" />
                Go to My Courses
              </Link>

              {/* Explore more */}
              <Link
                to="/courses"
                className="w-full py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold text-sm rounded-2xl transition-colors border border-slate-200"
              >
                Explore More Courses
              </Link>

              {/* Stay in classroom */}
              <button
                onClick={() => setCompletionModalOpen(false)}
                className="text-xs text-slate-400 hover:text-slate-600 font-medium transition-colors"
              >
                Continue reviewing lessons
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
