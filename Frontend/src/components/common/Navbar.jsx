import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useWishlist } from "../../context/WishlistContext";
import NotificationBell from "./NotificationBell";
import {
  GraduationCap,
  Search,
  Heart,
  BookOpen,
  User,
  LogOut,
  Settings,
  CreditCard,
  Menu,
  X,
  Compass,
  LayoutDashboard,
  ShieldAlert
} from "lucide-react";

import { getSafeMediaUrl } from "../../utils/media";

export default function Navbar() {
  const { user, logout, isStudent, isInstructor, isAdmin } = useAuth();
  const { wishlistCount } = useWishlist();
  const [searchTerm, setSearchTerm] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/courses?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm("");
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Explore */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-3 group">
              <img
                src="/logo.jpg"
                alt="Coursea Logo"
                className="h-9 w-auto object-contain rounded-md"
              />
              <span className="text-2xl font-black tracking-tight text-blue-700">
                Coursea
              </span>
            </Link>

            <Link
              to="/courses"
              className="hidden md:flex items-center gap-1.5 text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors"
            >
              <Compass className="w-4 h-4 text-blue-600" />
              <span>Explore</span>
            </Link>
          </div>

          {/* Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden sm:flex flex-1 max-w-md relative items-center"
          >
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              placeholder="What do you want to learn today?"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-100 hover:bg-slate-100/80 focus:bg-white border border-transparent focus:border-blue-500 rounded-full outline-none transition-all"
            />
          </form>

          {/* Navigation Items */}
          <div className="hidden md:flex items-center gap-3">
            {/* Wishlist button */}
            <Link
              to="/wishlist"
              className="relative p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-full transition-colors"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white rounded-full text-xs font-bold flex items-center justify-center shadow-sm">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Notification Bell (only when logged in) */}
            {user && <NotificationBell />}

            {user ? (
              <div className="flex items-center gap-3">
                {/* Role Specific Shortcuts */}
                {isStudent && (
                  <Link
                    to="/my-courses"
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>My Learning</span>
                  </Link>
                )}

                {isInstructor && (
                  <Link
                    to="/instructor/dashboard"
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Instructor Studio</span>
                  </Link>
                )}

                {isAdmin && (
                  <Link
                    to="/admin/dashboard"
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span>Admin Portal</span>
                  </Link>
                )}

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-full hover:bg-slate-100 transition-colors focus:outline-none"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm overflow-hidden">
                      {user.profileImage && getSafeMediaUrl(user.profileImage) ? (
                        <img
                          src={getSafeMediaUrl(user.profileImage)}
                          alt={user.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        user.name?.charAt(0)?.toUpperCase() || "U"
                      )}
                    </div>
                  </button>

                  {userMenuOpen && (
                    <div
                      onMouseLeave={() => setUserMenuOpen(false)}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-scaleUp"
                    >
                      <div className="px-4 py-2.5 border-b border-slate-100">
                        <p className="text-sm font-bold text-slate-800 truncate">{user.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-blue-100 text-blue-700">
                          {user.role}
                        </span>
                      </div>

                      <div className="py-1">
                        <Link
                          to="/profile"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                        >
                          <Settings className="w-4 h-4" />
                          <span>Profile & Settings</span>
                        </Link>

                        <Link
                          to="/payment-history"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                        >
                          <CreditCard className="w-4 h-4" />
                          <span>Payment History</span>
                        </Link>
                      </div>

                      <div className="border-t border-slate-100 pt-1">
                        <button
                          onClick={() => {
                            setUserMenuOpen(false);
                            logout();
                            navigate("/");
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  to="/register?role=instructor"
                  className="hidden lg:block text-xs font-semibold text-slate-600 hover:text-blue-600 px-2 py-1"
                >
                  Teach on Coursea
                </Link>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm shadow-blue-500/20 transition-all hover:scale-[1.02]"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-4">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-100 rounded-xl outline-none"
            />
          </form>

          <div className="flex flex-col gap-2 pt-2">
            <Link
              to="/courses"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg"
            >
              Explore All Courses
            </Link>

            <Link
              to="/wishlist"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg flex items-center justify-between"
            >
              <span>Wishlist</span>
              {wishlistCount > 0 && (
                <span className="px-2 py-0.5 bg-rose-500 text-white rounded-full text-xs font-bold">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {user ? (
              <>
                {isStudent && (
                  <Link
                    to="/my-courses"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    My Learning
                  </Link>
                )}
                {isInstructor && (
                  <Link
                    to="/instructor/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 rounded-lg"
                  >
                    Instructor Studio
                  </Link>
                )}
                {isAdmin && (
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 rounded-lg"
                  >
                    Admin Portal
                  </Link>
                )}
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg"
                >
                  Profile & Settings
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                    navigate("/");
                  }}
                  className="text-left px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 rounded-lg"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="pt-3 flex flex-col gap-2 border-t border-slate-100">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-sm font-semibold text-slate-700 bg-slate-100 rounded-xl"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-sm font-semibold text-white bg-blue-600 rounded-xl"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
