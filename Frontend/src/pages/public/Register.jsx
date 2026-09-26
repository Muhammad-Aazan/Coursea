import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  GraduationCap,
  User,
  Mail,
  Lock,
  AlertCircle,
  ArrowRight,
  BookOpen,
  Briefcase
} from "lucide-react";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(searchParams.get("role") === "instructor" ? "instructor" : "student");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (searchParams.get("role") === "instructor") {
      setRole("instructor");
    }
  }, [searchParams]);

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const nameRegex = /^[a-zA-Z\s'.]+$/;

  const validate = () => {
    const errs = {};
    if (!name.trim()) {
      errs.name = "Full name is required";
    } else if (name.trim().length < 2) {
      errs.name = "Name must be at least 2 characters long";
    } else if (!nameRegex.test(name.trim())) {
      errs.name = "Name can only contain letters and spaces";
    }

    if (!email.trim()) {
      errs.email = "Email address is required";
    } else if (!emailRegex.test(email.trim())) {
      errs.email = "Please enter a valid email address (e.g. name@example.com)";
    }

    if (!password) {
      errs.password = "Password is required";
    } else if (password.length < 6) {
      errs.password = "Password must be at least 6 characters long";
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!validate()) return;

    setSubmitting(true);
    try {
      const user = await register(name.trim(), email.trim(), password, role);
      const redirect = searchParams.get("redirect");
      if (redirect) {
        navigate(redirect, { replace: true });
      } else if (user.role === "instructor") {
        navigate("/instructor/dashboard");
      } else {
        navigate("/courses");
      }
    } catch (err) {
      const msg = err.message || "";
      if (msg.toLowerCase().includes("already registered") || msg.toLowerCase().includes("duplicate")) {
        setError("This email address is already registered. Please sign in instead.");
      } else {
        setError(msg || "Failed to create account. Please check your information and try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-xl p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-md shadow-blue-500/30">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Create an Account
          </h2>
          <p className="text-xs text-slate-500">
            Start learning or teaching on Coursea today
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
          <button
            type="button"
            onClick={() => setRole("student")}
            className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              role === "student"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Student</span>
          </button>

          <button
            type="button"
            onClick={() => setRole("instructor")}
            className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              role === "instructor"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Instructor</span>
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Muhammad Ali"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: null });
                }}
                className={`w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border rounded-xl outline-none transition-colors ${
                  fieldErrors.name
                    ? "border-rose-400 bg-rose-50/40"
                    : "border-slate-200 focus:bg-white focus:border-blue-500"
                }`}
              />
            </div>
            {fieldErrors.name && (
              <p className="text-xs text-rose-600 mt-1 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{fieldErrors.name}</span>
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                placeholder="ali@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: null });
                }}
                className={`w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border rounded-xl outline-none transition-colors ${
                  fieldErrors.email
                    ? "border-rose-400 bg-rose-50/40"
                    : "border-slate-200 focus:bg-white focus:border-blue-500"
                }`}
              />
            </div>
            {fieldErrors.email && (
              <p className="text-xs text-rose-600 mt-1 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{fieldErrors.email}</span>
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Password (min. 6 characters)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: null });
                }}
                className={`w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border rounded-xl outline-none transition-colors ${
                  fieldErrors.password
                    ? "border-rose-400 bg-rose-50/40"
                    : "border-slate-200 focus:bg-white focus:border-blue-500"
                }`}
              />
            </div>
            {fieldErrors.password && (
              <p className="text-xs text-rose-600 mt-1 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{fieldErrors.password}</span>
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-sm rounded-xl shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
          >
            <span>{submitting ? "Creating account..." : `Sign Up as ${role === "instructor" ? "Instructor" : "Student"}`}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer Link */}
        <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
          Already have an account?{" "}
          <Link to="/login" className="font-bold text-blue-600 hover:text-blue-700">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
