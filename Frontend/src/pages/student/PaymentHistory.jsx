import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { CreditCard, CheckCircle2, Clock, AlertCircle } from "lucide-react";

export default function PaymentHistory() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPayments() {
      try {
        const res = await api.get("/payments/my-payments");
        setPayments(res.data.payments || []);
      } catch (err) {
        console.error("Failed to load payment history:", err);
      } finally {
        setLoading(false);
      }
    }
    loadPayments();
  }, []);

  if (loading) {
    return <LoadingSpinner size="lg" message="Loading your transaction history..." />;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Payment History
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Review all your course purchases and transaction receipts
        </p>
      </div>

      {payments.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8 max-w-lg mx-auto">
          <CreditCard className="w-14 h-14 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-800">No payment records</h3>
          <p className="text-sm text-slate-500 mt-1 mb-6">
            You haven't made any purchases yet.
          </p>
          <Link
            to="/courses"
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl"
          >
            Explore Courses
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Course</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((p) => {
                  const statusBadges = {
                    completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
                    pending: "bg-amber-50 text-amber-700 border-amber-200",
                    failed: "bg-rose-50 text-rose-700 border-rose-200"
                  };

                  return (
                    <tr key={p._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">
                        {p.course?.title || "Course"}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">
                        ${Number(p.amount).toFixed(2)}{" "}
                        <span className="text-[10px] text-slate-400 font-normal uppercase">
                          {p.currency || "USD"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border capitalize ${
                            statusBadges[p.status] || statusBadges.pending
                          }`}
                        >
                          {p.status === "completed" ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : p.status === "pending" ? (
                            <Clock className="w-3.5 h-3.5" />
                          ) : (
                            <AlertCircle className="w-3.5 h-3.5" />
                          )}
                          <span>{p.status}</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
