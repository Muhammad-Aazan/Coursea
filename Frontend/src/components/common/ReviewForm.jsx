import React, { useState } from "react";
import { api } from "../../api/client";
import StarRating from "./StarRating";
import { MessageSquarePlus, CheckCircle2, X } from "lucide-react";

/**
 * ReviewForm – callable from anywhere.
 * Props:
 *   courseId      (string)   required
 *   courseName    (string)   optional – shown in header
 *   existingReview (object)  optional – {_id, rating, comment} to pre-fill for editing
 *   onSuccess     (function) optional – called after successful submit
 *   compact       (bool)     optional – smaller inline layout
 */
export default function ReviewForm({ courseId, courseName, existingReview, onSuccess, compact = false }) {
  const [rating, setRating] = useState(existingReview?.rating || 5);
  const [comment, setComment] = useState(existingReview?.comment || "");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const isEditing = !!existingReview?._id;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError("Please write your feedback before submitting.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      if (isEditing) {
        await api.patch(`/reviews/${existingReview._id}`, { rating, comment: comment.trim() });
      } else {
        await api.post(`/courses/${courseId}/reviews`, { rating, comment: comment.trim() });
      }
      setSuccess(true);
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 1500);
    } catch (err) {
      setError(err.message || "Failed to submit review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-center gap-2">
        <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        <p className="font-bold text-slate-800 text-sm">
          {isEditing ? "Review updated!" : "Thank you for your feedback!"}
        </p>
        <p className="text-xs text-slate-500">Your review helps other students make better decisions.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!compact && courseName && (
        <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
          <MessageSquarePlus className="w-4 h-4 text-blue-600 shrink-0" />
          <p className="text-xs font-semibold text-slate-700 truncate">
            Reviewing: <span className="font-bold text-slate-900">{courseName}</span>
          </p>
        </div>
      )}

      {/* Star Rating Selector */}
      <div className="space-y-1.5 text-center">
        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
          Your Rating
        </label>
        <div className="flex justify-center">
          <StarRating
            rating={rating}
            interactive={true}
            onChange={setRating}
            size={compact ? "md" : "lg"}
          />
        </div>
        <p className="text-xs text-slate-400">
          {rating === 1 && "Poor"}
          {rating === 2 && "Fair"}
          {rating === 3 && "Good"}
          {rating === 4 && "Very Good"}
          {rating === 5 && "Excellent!"}
        </p>
      </div>

      {/* Comment */}
      <div>
        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
          {isEditing ? "Update your review" : "Your Feedback"}
        </label>
        <textarea
          required
          rows={compact ? 3 : 4}
          value={comment}
          onChange={(e) => { setComment(e.target.value); setError(""); }}
          placeholder="Share your thoughts: What did you like? What could be better? Was the instructor clear?"
          className="w-full p-3 text-sm border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-blue-500 resize-none bg-slate-50 focus:bg-white transition-colors"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold">
          <X className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl transition-colors shadow-sm shadow-blue-500/20"
      >
        {submitting
          ? "Submitting..."
          : isEditing
          ? "Update Review"
          : "Submit Review"}
      </button>
    </form>
  );
}
