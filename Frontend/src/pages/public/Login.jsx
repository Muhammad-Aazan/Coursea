import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { GraduationCap, Mail, Lock, AlertCircle, ArrowRight } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [fieldErrors, setFieldErrors] = useState({});

  const queryRedirect = new URLSearchParams(location.search).get("redirect");
  const from = queryRedirect || location.state?.from?.pathname || "/";

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const validate = () => {
    const errs = {};
    if (!email.trim()) {
      errs.email = "Email address is required";
    } else if (!emailRegex.test(email.trim())) {
      errs.email = "Please enter a valid email format (e.g. name@example.com)";
    }

    if (!password) {
      errs.password = "Password is required";
    } else if (password.length < 6) {
      errs.password = "Password must be at least 6 characters";
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
      await login(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.message || "";
      if (msg.toLowerCase().includes("not found") || msg.toLowerCase().includes("user")) {
        setError("No account found with this email. Please check your spelling or sign up.");
      } else if (msg.toLowerCase().includes("password") || msg.toLowerCase().includes("invalid")) {
        setError("Incorrect email or password. Please verify your credentials and try again.");
      } else {
        setError(msg || "Failed to sign in. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-xl p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-md shadow-blue-500/30">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Welcome back
          </h2>
          <p className="text-xs text-slate-500">
            Sign in to continue your learning journey
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                placeholder="name@example.com"
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
              Password
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
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm rounded-xl shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
          >
            <span>{submitting ? "Signing in..." : "Sign In"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer Link */}
        <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
          Don't have an account yet?{" "}
          <Link to="/register" className="font-bold text-blue-600 hover:text-blue-700">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
