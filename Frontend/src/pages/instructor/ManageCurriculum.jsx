import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../../api/client";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Modal from "../../components/common/Modal";
import VideoPlayer from "../../components/course/VideoPlayer";
import {
  Layers,
  Plus,
  PlayCircle,
  Clock,
  Trash2,
  Edit2,
  CheckCircle2,
  Upload,
  Globe,
  Lock,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Link as LinkIcon,
  FileVideo,
  AlertCircle
} from "lucide-react";

export default function ManageCurriculum() {
  const { courseId } = useParams();

  const [course, setCourse] = useState(null);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  // Section Modal State
  const [sectionModalOpen, setSectionModalOpen] = useState(false);
  const [sectionTitle, setSectionTitle] = useState("");
  const [editingSection, setEditingSection] = useState(null);

  // Lesson Modal State
  const [lessonModalOpen, setLessonModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [targetSectionId, setTargetSectionId] = useState("");
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonDesc, setLessonDesc] = useState("");
  const [lessonVideoUrl, setLessonVideoUrl] = useState("");
  const [lessonDuration, setLessonDuration] = useState(10);
  const [lessonIsPreview, setLessonIsPreview] = useState(false);

  // Video Tab State: 'url' (YouTube / online) vs 'upload' (local file)
  const [videoTab, setVideoTab] = useState("url");
  const [localFile, setLocalFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const fetchCurriculum = async () => {
    try {
      const res = await api.get(`/courses/${courseId}`);
      setCourse(res.data.course);
      setSections(res.data.sections || []);
    } catch (err) {
      console.error("Failed to load curriculum:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurriculum();
  }, [courseId]);

  // Section handlers
  const handleOpenAddSection = () => {
    setEditingSection(null);
    setSectionTitle("");
    setSectionModalOpen(true);
  };

  const handleOpenEditSection = (section) => {
    setEditingSection(section);
    setSectionTitle(section.title);
    setSectionModalOpen(true);
  };

  const handleSaveSection = async (e) => {
    e.preventDefault();
    if (!sectionTitle.trim()) return;

    try {
      if (editingSection) {
        await api.patch(`/sections/${editingSection._id}`, { title: sectionTitle.trim() });
      } else {
        await api.post(`/courses/${courseId}/sections`, {
          title: sectionTitle.trim(),
          order: sections.length + 1
        });
      }
      setSectionModalOpen(false);
      setSectionTitle("");
      setEditingSection(null);
      await fetchCurriculum();
    } catch (err) {
      alert(err.message || "Failed to save section");
    }
  };

  const handleDeleteSection = async (sectionId, title) => {
    if (!window.confirm(`Delete section "${title}" and all its lessons?`)) return;
    try {
      await api.delete(`/sections/${sectionId}`);
      await fetchCurriculum();
    } catch (err) {
      alert(err.message || "Failed to delete section");
    }
  };

  // Lesson handlers
  const handleOpenAddLesson = (sectionId) => {
    setEditingLesson(null);
    setTargetSectionId(sectionId);
    setLessonTitle("");
    setLessonDesc("");
    setLessonVideoUrl("");
    setLessonDuration(10);
    setLessonIsPreview(false);
    setVideoTab("url");
    setLocalFile(null);
    setUploadError("");
    setUploadSuccess(false);
    setLessonModalOpen(true);
  };

  const handleOpenEditLesson = (sectionId, lesson) => {
    setEditingLesson(lesson);
    setTargetSectionId(sectionId);
    setLessonTitle(lesson.title);
    setLessonDesc(lesson.description || "");
    setLessonVideoUrl(lesson.videoUrl || "");
    setLessonDuration(lesson.duration || 10);
    setLessonIsPreview(lesson.isPreview || false);
    setVideoTab(lesson.videoUrl?.startsWith("/uploads") ? "upload" : "url");
    setLocalFile(null);
    setUploadError("");
    setUploadSuccess(false);
    setLessonModalOpen(true);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 200MB)
    if (file.size > 200 * 1024 * 1024) {
      setUploadError("Video file size cannot exceed 200MB");
      return;
    }

    setLocalFile(file);
    setUploadError("");
    setUploadSuccess(false);
  };

  const handleUploadLocalVideo = async () => {
    if (!localFile) return;

    setUploading(true);
    setUploadError("");
    setUploadProgress(20);

    try {
      // Simulate progress tick
      const interval = setInterval(() => {
        setUploadProgress((p) => (p < 85 ? p + 15 : p));
      }, 300);

      const res = await api.upload(localFile);
      clearInterval(interval);
      setUploadProgress(100);

      const uploadedUrl = res.data?.url || "";
      setLessonVideoUrl(uploadedUrl);
      setUploadSuccess(true);
    } catch (err) {
      setUploadError(err.message || "Failed to upload video file");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveLesson = async (e) => {
    e.preventDefault();
    if (!lessonTitle.trim()) {
      alert("Lesson title is required");
      return;
    }

    try {
      if (editingLesson) {
        await api.patch(`/lessons/${editingLesson._id}`, {
          title: lessonTitle.trim(),
          description: lessonDesc.trim(),
          videoUrl: lessonVideoUrl.trim(),
          duration: Number(lessonDuration) || 0,
          isPreview: lessonIsPreview
        });
      } else {
        await api.post(`/sections/${targetSectionId}/lessons`, {
          title: lessonTitle.trim(),
          description: lessonDesc.trim(),
          videoUrl: lessonVideoUrl.trim(),
          duration: Number(lessonDuration) || 0,
          isPreview: lessonIsPreview
        });
      }

      setLessonModalOpen(false);
      await fetchCurriculum();
    } catch (err) {
      alert(err.message || "Failed to save lesson");
    }
  };

  const handleDeleteLesson = async (lessonId, title) => {
    if (!window.confirm(`Delete lesson "${title}"?`)) return;
    try {
      await api.delete(`/lessons/${lessonId}`);
      await fetchCurriculum();
    } catch (err) {
      alert(err.message || "Failed to delete lesson");
    }
  };

  const handleTogglePublish = async () => {
    try {
      await api.patch(`/courses/${courseId}/publish`, {
        published: !course.published
      });
      await fetchCurriculum();
    } catch (err) {
      alert(err.message || "Failed to toggle publish status");
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" message="Loading curriculum builder..." />;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="space-y-1">
          <Link
            to="/instructor/courses"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to My Courses</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Curriculum Builder: {course?.title}
          </h1>
          <p className="text-xs text-slate-500">
            Structure your course sections and upload or link videos for each lesson.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleTogglePublish}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              course?.published
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                : "bg-blue-600 text-white shadow-md shadow-blue-500/20 hover:bg-blue-700"
            }`}
          >
            {course?.published ? (
              <>
                <Globe className="w-4 h-4 text-emerald-600" />
                <span>Live in Marketplace (Published)</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Publish Course</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Curriculum Sections List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">
            Curriculum Sections ({sections.length})
          </h3>
          <button
            onClick={handleOpenAddSection}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/10 flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Section</span>
          </button>
        </div>

        {sections.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-4">
            <Layers className="w-12 h-12 text-slate-400 mx-auto" />
            <h4 className="text-base font-bold text-slate-800">Your curriculum is empty</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Get started by adding your first module or section (e.g., "Module 1: Getting Started").
            </p>
            <button
              onClick={handleOpenAddSection}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
            >
              Create First Section
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {sections.map((section, index) => (
              <div
                key={section._id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm"
              >
                {/* Section Header */}
                <div className="p-4 sm:p-5 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                        {section.title}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {section.lessons?.length || 0} lessons
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => handleOpenAddLesson(section._id)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Lesson</span>
                    </button>

                    <button
                      onClick={() => handleOpenEditSection(section)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 rounded-lg transition-colors"
                      title="Edit Section Title"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteSection(section._id, section.title)}
                      className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete Section"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Lessons in Section */}
                <div className="divide-y divide-slate-100 p-2 sm:p-4">
                  {section.lessons?.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400">
                      No lessons in this section yet. Click "+ Add Lesson" to upload a video or paste a link.
                    </div>
                  ) : (
                    section.lessons?.map((lesson, lIdx) => (
                      <div
                        key={lesson._id}
                        className="py-3 px-3 flex items-center justify-between gap-4 hover:bg-slate-50 rounded-xl transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <PlayCircle className="w-4 h-4 text-blue-600 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-900 truncate">
                              {lIdx + 1}. {lesson.title}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                              {lesson.duration > 0 && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-slate-400" />
                                  <span>{lesson.duration}m</span>
                                </span>
                              )}
                              {lesson.videoUrl && (
                                <span className="text-slate-400">
                                  • {lesson.videoUrl.includes("youtube.com") || lesson.videoUrl.includes("youtu.be")
                                    ? "YouTube Video"
                                    : lesson.videoUrl.startsWith("/uploads")
                                    ? "Uploaded File"
                                    : "Web Video"}
                                </span>
                              )}
                              {lesson.isPreview && (
                                <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 text-[10px]">
                                  Free Preview
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => handleOpenEditLesson(section._id, lesson)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Lesson & Video"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteLesson(lesson._id, lesson.title)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Lesson"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section Create / Edit Modal */}
      <Modal
        isOpen={sectionModalOpen}
        onClose={() => setSectionModalOpen(false)}
        title={editingSection ? "Edit Section Title" : "Create New Section"}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSaveSection} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Section Title *
            </label>
            <input
              type="text"
              required
              value={sectionTitle}
              onChange={(e) => setSectionTitle(e.target.value)}
              placeholder="e.g. Module 1: Foundations & Setup"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-colors shadow-sm"
          >
            {editingSection ? "Update Section" : "Create Section"}
          </button>
        </form>
      </Modal>

      {/* Lesson Create / Edit Modal */}
      <Modal
        isOpen={lessonModalOpen}
        onClose={() => setLessonModalOpen(false)}
        title={editingLesson ? `Edit Lesson: ${editingLesson.title}` : "Add Lesson to Section"}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSaveLesson} className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Lesson Title *
            </label>
            <input
              type="text"
              required
              value={lessonTitle}
              onChange={(e) => setLessonTitle(e.target.value)}
              placeholder="e.g. Introduction to React Components"
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Lesson Description (Optional)
            </label>
            <textarea
              rows={2}
              value={lessonDesc}
              onChange={(e) => setLessonDesc(e.target.value)}
              placeholder="Brief overview of what students will learn in this lesson..."
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-blue-500 resize-none"
            />
          </div>

          {/* Video Source Selector with 2 Tabs */}
          <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Video Source
              </label>

              {/* Tab Switcher */}
              <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setVideoTab("url")}
                  className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1.5 ${
                    videoTab === "url"
                      ? "bg-white text-blue-700 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>YouTube / URL</span>
                </button>
                <button
                  type="button"
                  onClick={() => setVideoTab("upload")}
                  className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1.5 ${
                    videoTab === "upload"
                      ? "bg-white text-blue-700 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <FileVideo className="w-3.5 h-3.5" />
                  <span>Upload Video File</span>
                </button>
              </div>
            </div>

            {/* Tab 1: YouTube / Web Video Link */}
            {videoTab === "url" && (
              <div className="space-y-2">
                <p className="text-xs text-slate-500">
                  Paste any YouTube link (e.g. <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">https://www.youtube.com/watch?v=...</code>) or direct video URL:
                </p>
                <input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={lessonVideoUrl}
                  onChange={(e) => setLessonVideoUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            )}

            {/* Tab 2: Upload Video File from Computer */}
            {videoTab === "upload" && (
              <div className="space-y-3">
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center bg-white hover:bg-slate-50 transition-colors">
                  <FileVideo className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700">
                    {localFile ? localFile.name : "Select video from your computer"}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {localFile
                      ? `Size: ${(localFile.size / (1024 * 1024)).toFixed(1)} MB`
                      : "MP4, WebM, MOV up to 200MB"}
                  </p>

                  <div className="mt-3 flex items-center justify-center gap-2">
                    <label className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold cursor-pointer transition-colors">
                      <span>{localFile ? "Choose Different File" : "Browse Files"}</span>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </label>

                    {localFile && !uploadSuccess && (
                      <button
                        type="button"
                        onClick={handleUploadLocalVideo}
                        disabled={uploading}
                        className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{uploading ? `Uploading ${uploadProgress}%` : "Upload to Server"}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Upload Status */}
                {uploadSuccess && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Video file uploaded successfully and linked to this lesson!</span>
                  </div>
                )}

                {uploadError && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}
              </div>
            )}

            {/* Live Video Preview Box */}
            {lessonVideoUrl && (
              <div className="pt-2 border-t border-slate-200">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Live Video Preview:
                </p>
                <div className="max-w-xs mx-auto rounded-xl overflow-hidden shadow-md">
                  <VideoPlayer url={lessonVideoUrl} title={lessonTitle} isPreview={true} />
                </div>
              </div>
            )}
          </div>

          {/* Duration & Free Preview Checkbox */}
          <div className="grid grid-cols-2 gap-4 items-center">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Duration (minutes)
              </label>
              <input
                type="number"
                min="1"
                value={lessonDuration}
                onChange={(e) => setLessonDuration(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-blue-500"
              />
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2.5 text-xs font-bold text-slate-800 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={lessonIsPreview}
                  onChange={(e) => setLessonIsPreview(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span>Free Preview (Sample Lesson)</span>
              </label>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setLessonModalOpen(false)}
              className="flex-1 py-2.5 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl font-bold text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-colors"
            >
              {editingLesson ? "Save Changes" : "Add Lesson"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
