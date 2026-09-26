import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Shield, Lock, FileText, CheckCircle2, ChevronRight } from "lucide-react";

export default function PrivacyPolicy() {
  const [activeTab, setActiveTab] = useState("privacy");

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
            <Shield className="w-3.5 h-3.5" />
            <span>Trust & Legal</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Privacy Policy & Terms of Service
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Last updated: September 26, 2026 • Effective immediately
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex justify-center">
          <div className="inline-flex p-1 bg-slate-200/70 rounded-2xl">
            <button
              onClick={() => setActiveTab("privacy")}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === "privacy"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Privacy Policy
            </button>
            <button
              onClick={() => setActiveTab("terms")}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === "terms"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Terms of Service
            </button>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm space-y-8 text-sm text-slate-700 leading-relaxed">
          {activeTab === "privacy" ? (
            <div className="space-y-6">
              <section className="space-y-3">
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-blue-600" />
                  <span>1. Information We Collect</span>
                </h2>
                <p>
                  At Coursea, we believe in radical transparency. When you create an account, purchase a course, or interact with our learning platform, we collect:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                  <li><strong>Account Data:</strong> Your name, email address, password hash (encrypted using bcrypt), and role (Student, Instructor, or Admin).</li>
                  <li><strong>Course Progression:</strong> Video lessons watched, completed sections, quiz answers, and review ratings.</li>
                  <li><strong>Payment Transactions:</strong> Stripe transaction identifiers, payment date, and items purchased. (We do <em>not</em> store full credit card numbers or security CVVs on our servers).</li>
                </ul>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-black text-slate-900">2. How We Use Your Information</h2>
                <p>
                  The data collected is strictly utilized to deliver and personalize your learning experience:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Providing uninterrupted access to enrolled course video lectures</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Issuing verified certificates of completion in your name</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Processing secure instructor payouts and student receipts</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Preventing abusive bot traffic via automated rate limiters</span>
                  </div>
                </div>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-black text-slate-900">3. Stripe & Payment Processing</h2>
                <p>
                  All payments are securely handled by <strong>Stripe, Inc.</strong>, a certified PCI-DSS Level 1 Service Provider. Your sensitive card details are transmitted directly to Stripe over TLS 1.3 encryption and are never routed through or stored on Coursea databases.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-black text-slate-900">4. Your Data Rights (GDPR & CCPA)</h2>
                <p>
                  You have the permanent right to access, rectify, export, or delete your personal account data at any time from your Profile Settings page or by contacting our Data Protection Officer at <span className="text-blue-600 font-semibold">privacy@coursea.com</span>.
                </p>
              </section>
            </div>
          ) : (
            <div className="space-y-6">
              <section className="space-y-3">
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span>1. Lifetime License & Access</span>
                </h2>
                <p>
                  When you enroll in a course on Coursea (whether free or paid), Coursea grants you a limited, non-exclusive, non-transferable license to view and access the course content for personal, non-commercial educational purposes.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-black text-slate-900">2. Instructor Content & Royalties</h2>
                <p>
                  Instructors retain full copyright ownership of the courses and curriculum they create. By publishing on Coursea, instructors grant Coursea the right to host and market the content. Instructors receive 85% of net revenues after platform fee deductions.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-black text-slate-900">3. Acceptable Use Policy</h2>
                <p>
                  You agree not to scrape, redistribute, re-sell, or reverse engineer any part of the Coursea platform or video assets. Any automated scraping, DDoS attacks, or abusive reviews will result in immediate termination of the offending account.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-black text-slate-900">4. Disclaimers & Limitation of Liability</h2>
                <p>
                  Courses are provided "as-is" by respective instructors. While we rigorously review courses before approval, Coursea does not warrant that course content is free from errors or suitable for specific commercial licensing exams.
                </p>
              </section>
            </div>
          )}

          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>Questions about our policies?</p>
            <Link to="/contact" className="text-blue-600 font-bold hover:underline flex items-center gap-1">
              <span>Contact Coursea Legal Team</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
