import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../../api/client";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { CheckCircle2, PlayCircle, BookOpen } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { refreshEnrolledCourses } = useAuth();

  const [loading, setLoading] = useState(true);
  const [confirmedData, setConfirmedData] = useState(null);

  useEffect(() => {
    async function verifyAndActivate() {
      if (!sessionId) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.post("/payments/confirm-session", { sessionId });
        setConfirmedData(res.data?.data);
        // Refresh enrolled courses so badges update across the app
        refreshEnrolledCourses();
      } catch (err) {
        console.warn("Session confirmation notice:", err.message);
      } finally {
        setLoading(false);
      }
    }

    verifyAndActivate();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
        <LoadingSpinner size="lg" message="Verifying payment and activating your course enrollment..." />
      </div>
    );
  }

  const courseId = confirmedData?.courseId;

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-8 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md shadow-emerald-500/20">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Enrollment Confirmed! 🎉
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            {confirmedData?.courseTitle
              ? `You now have full lifetime access to "${confirmedData.courseTitle}".`
              : "Your payment was verified and your course access has been activated."}
          </p>
        </div>

        {sessionId && (
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-500 truncate font-mono">
            Transaction Ref: {sessionId}
          </div>
        )}

        <div className="space-y-3 pt-2">
          {courseId ? (
            <Link
              to={`/learn/${courseId}`}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Start Learning Course Now</span>
            </Link>
          ) : (
            <Link
              to="/my-courses"
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
            >
              <BookOpen className="w-4 h-4" />
              <span>Go to My Courses</span>
            </Link>
          )}

          <Link
            to="/my-courses"
            className="block w-full py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors"
          >
            View in My Courses
          </Link>
        </div>
      </div>
    </div>
  );
}
