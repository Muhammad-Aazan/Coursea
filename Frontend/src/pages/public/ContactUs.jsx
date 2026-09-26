import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  MessageSquare
} from "lucide-react";

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) {
      errs.name = "Full name is required";
    } else if (formData.name.trim().length < 2) {
      errs.name = "Name must be at least 2 characters long";
    }

    if (!formData.email.trim()) {
      errs.email = "Email address is required";
    } else if (!emailRegex.test(formData.email.trim())) {
      errs.email = "Please enter a valid email address (e.g. name@example.com)";
    }

    if (!formData.subject.trim()) {
      errs.subject = "Please select or enter a topic";
    }

    if (!formData.message.trim()) {
      errs.message = "Message cannot be empty";
    } else if (formData.message.trim().length < 10) {
      errs.message = "Message must be at least 10 characters long";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    // Simulate support ticket dispatch
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Get in Touch</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            We'd Love to Hear From You
          </h1>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            Have questions about a course, technical issues, instructor inquiries, or business partnerships? Send us a note.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Details Card */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900">Contact Information</h3>

              <div className="space-y-5 text-sm text-slate-600">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-xs uppercase tracking-wider">Email Us</p>
                    <p className="text-slate-600 mt-0.5">support@coursea.com</p>
                    <p className="text-slate-400 text-xs">Typical response within 2 hours</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-xs uppercase tracking-wider">Support Line</p>
                    <p className="text-slate-600 mt-0.5">+1 (800) 555-COURSEA</p>
                    <p className="text-slate-400 text-xs">Mon - Fri, 9am - 6pm EST</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-xs uppercase tracking-wider">Headquarters</p>
                    <p className="text-slate-600 mt-0.5">500 Technology Square, Suite 400</p>
                    <p className="text-slate-400 text-xs">Cambridge, MA 02139</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-xs uppercase tracking-wider">Help Center</p>
                    <p className="text-slate-600 mt-0.5">24/7 Knowledge Base</p>
                    <Link to="/faq" className="text-blue-600 text-xs font-bold hover:underline">
                      Browse FAQs & Guides →
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Banner */}
            <div className="bg-slate-900 text-white rounded-3xl p-6 space-y-2 border border-slate-800">
              <p className="font-bold text-sm">Instructor Partnerships</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                Are you an institution or academy looking to host batch classes? Contact <span className="text-blue-400 font-semibold">partners@coursea.com</span> for custom LMS licensing.
              </p>
            </div>
          </div>

          {/* Message Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-6">
              {submitted ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md shadow-emerald-500/20">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900">Message Received!</h3>
                  <p className="text-sm text-slate-600 max-w-md mx-auto">
                    Thank you for reaching out. A Coursea support representative has been notified and will reply to your email shortly.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="px-6 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => {
                          setFormData({ ...formData, name: e.target.value });
                          if (errors.name) setErrors({ ...errors, name: null });
                        }}
                        className={`w-full px-4 py-2.5 text-sm bg-slate-50 border rounded-xl outline-none transition-colors ${
                          errors.name
                            ? "border-rose-400 bg-rose-50/50"
                            : "border-slate-200 focus:bg-white focus:border-blue-500"
                        }`}
                      />
                      {errors.name && (
                        <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>{errors.name}</span>
                        </p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) => {
                          setFormData({ ...formData, email: e.target.value });
                          if (errors.email) setErrors({ ...errors, email: null });
                        }}
                        className={`w-full px-4 py-2.5 text-sm bg-slate-50 border rounded-xl outline-none transition-colors ${
                          errors.email
                            ? "border-rose-400 bg-rose-50/50"
                            : "border-slate-200 focus:bg-white focus:border-blue-500"
                        }`}
                      />
                      {errors.email && (
                        <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>{errors.email}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Subject / Inquiring Topic *
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) => {
                        setFormData({ ...formData, subject: e.target.value });
                        if (errors.subject) setErrors({ ...errors, subject: null });
                      }}
                      className={`w-full px-4 py-2.5 text-sm bg-slate-50 border rounded-xl outline-none transition-colors ${
                        errors.subject
                          ? "border-rose-400 bg-rose-50/50"
                          : "border-slate-200 focus:bg-white focus:border-blue-500"
                      }`}
                    >
                      <option value="">Select a topic...</option>
                      <option value="Course Question">Course & Curriculum Question</option>
                      <option value="Payment Inquiry">Payment & Stripe Billing</option>
                      <option value="Certificate Support">Certificate Verification</option>
                      <option value="Instructor Application">Teaching on Coursea</option>
                      <option value="Technical Issue">Bug or Platform Issue</option>
                      <option value="Other">Other General Inquiry</option>
                    </select>
                    {errors.subject && (
                      <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>{errors.subject}</span>
                      </p>
                    )}
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Your Message *
                    </label>
                    <textarea
                      rows={5}
                      placeholder="Please write the details of your inquiry here..."
                      value={formData.message}
                      onChange={(e) => {
                        setFormData({ ...formData, message: e.target.value });
                        if (errors.message) setErrors({ ...errors, message: null });
                      }}
                      className={`w-full px-4 py-3 text-sm bg-slate-50 border rounded-xl outline-none transition-colors resize-none ${
                        errors.message
                          ? "border-rose-400 bg-rose-50/50"
                          : "border-slate-200 focus:bg-white focus:border-blue-500"
                      }`}
                    />
                    {errors.message && (
                      <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>{errors.message}</span>
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm rounded-xl shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
                  >
                    <Send className="w-4 h-4" />
                    <span>{loading ? "Sending..." : "Submit Inquiry"}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
