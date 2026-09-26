import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { api } from "../../api/client";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { ShieldCheck, CreditCard, CheckCircle2, AlertCircle, ArrowLeft, Lock } from "lucide-react";

export default function MockCheckout() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [sessionData, setSessionData] = useState(null);

  useEffect(() => {
    async function fetchSession() {
      if (!sessionId) {
        setError("Invalid checkout session. Please try again from the course page.");
        setLoading(false);
        return;
      }

      try {
        const res = await api.get(`/payments/session/${sessionId}`);
        setSessionData(res.data?.data);
      } catch (err) {
        setError(err.message || "Failed to load checkout details.");
      } finally {
        setLoading(false);
      }
    }
    fetchSession();
  }, [sessionId]);

  const handleCompletePayment = async () => {
    setSubmitting(true);
    setError("");
    try {
      await api.post("/payments/complete-mock", { sessionId });
      navigate(`/payment/success?session_id=${encodeURIComponent(sessionId)}`);
    } catch (err) {
      setError(err.message || "Payment completion failed. Please try again.");
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" message="Preparing secure checkout..." />;
  }

  if (error && !sessionData) {
    return (
      <div className="max-w-lg mx-auto my-20 p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">Checkout Error</h2>
        <p className="text-sm text-slate-500">{error}</p>
        <Link
          to="/courses"
          className="inline-block px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm"
        >
          Return to Catalog
        </Link>
      </div>
    );
  }

  const { payment, course, instructor } = sessionData || {};
  const price = payment?.amount ?? course?.price ?? 0;
  const platformFee = payment?.platformFee ?? Number((price * 0.15).toFixed(2));
  const instructorEarnings = payment?.instructorEarnings ?? Number((price - platformFee).toFixed(2));

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Navigation link */}
        <Link
          to={course ? `/courses/${course._id}` : "/courses"}
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Cancel & Return to Course</span>
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Checkout & Enrollment
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Review your purchase details and confirm your enrollment
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-xl text-xs font-bold text-amber-800 self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>Sandbox Mode (Test Simulator)</span>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold rounded-2xl">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-900">Course Summary</h3>

              <div className="flex gap-4 items-start">
                <div className="w-24 h-16 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                  <img
                    src={
                      course?.thumbnail ||
                      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800"
                    }
                    alt={course?.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-900 leading-snug">
                    {course?.title || "Online Course"}
                  </h4>
                  <p className="text-xs text-slate-500">
                    Instructor: <span className="font-semibold text-slate-700">{instructor?.name || "Verified Educator"}</span>
                  </p>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 pt-4 border-t border-slate-100 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Course List Price</span>
                  <span className="font-bold text-slate-800">${Number(price).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Platform Service & Hosting Fee (15%)</span>
                  <span>${Number(platformFee).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Instructor Net Royalty (85%)</span>
                  <span>${Number(instructorEarnings).toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-slate-200 text-sm font-extrabold text-slate-900">
                  <span>Total Amount Due</span>
                  <span className="text-lg text-blue-700">${Number(price).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Platform Guarantee */}
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-xs text-blue-900 space-y-0.5">
                <p className="font-bold">Coursea 30-Day Learning Guarantee</p>
                <p className="text-blue-700 leading-relaxed">
                  Full lifetime access, certificate of completion upon finishing all lessons, and dedicated student support.
                </p>
              </div>
            </div>
          </div>

          {/* Payment Card Simulator */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  <span>Payment Method</span>
                </h3>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Test Card</span>
              </div>

              {/* Simulated Card Preview */}
              <div className="p-5 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-800 text-white space-y-4 shadow-lg shadow-slate-900/10">
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span>TEST VISA CARD</span>
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <p className="font-mono text-base tracking-widest text-slate-200">
                  •••• •••• •••• 4242
                </p>
                <div className="flex justify-between text-[11px] font-mono text-slate-400">
                  <span>TEST STUDENT</span>
                  <span>12 / 28</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 leading-relaxed">
                ℹ️ <span className="font-bold text-slate-800">Sandbox Environment:</span> When live Stripe keys are configured in <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">.env</code>, students are redirected straight to Stripe's secure hosted payment portal.
              </div>

              <button
                type="button"
                onClick={handleCompletePayment}
                disabled={submitting}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-extrabold text-sm rounded-2xl shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <span>Processing Test Payment...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Complete Test Payment (${Number(price).toFixed(2)})</span>
                  </>
                )}
              </button>

              <p className="text-[11px] text-center text-slate-400 flex items-center justify-center gap-1">
                <Lock className="w-3 h-3 text-slate-400" />
                <span>256-bit encrypted simulated SSL connection</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
