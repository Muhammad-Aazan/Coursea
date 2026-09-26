import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../api/client";
import {
  User, Lock, Upload, CheckCircle2, AlertCircle,
  Globe, Briefcase, FileText, BookOpen, CreditCard, Shield
} from "lucide-react";

function Alert({ type, message }) {
  if (!message) return null
  const styles = type === 'success'
    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
    : 'bg-rose-50 border-rose-200 text-rose-700'
  const Icon = type === 'success' ? CheckCircle2 : AlertCircle
  return (
    <div className={`p-3 rounded-xl border flex items-center gap-2 text-xs ${styles}`}>
      <Icon className="w-4 h-4 shrink-0" />
      <span>{message}</span>
    </div>
  )
}

export default function ProfileSettings() {
  const { user, updateProfile } = useAuth();

  // Profile fields
  const [name, setName] = useState(user?.name || "");
  const [headline, setHeadline] = useState(user?.headline || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [website, setWebsite] = useState(user?.website || "");
  const [profileImage, setProfileImage] = useState(user?.profileImage || "");
  const [uploading, setUploading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setProfileError("");
    try {
      const res = await api.upload(file);
      const url = res.data?.url;
      setProfileImage(url);
      await updateProfile({ profileImage: url });
      setProfileSuccess("Avatar updated!");
      setTimeout(() => setProfileSuccess(""), 3000);
    } catch (err) {
      setProfileError(err.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileSuccess("");
    setProfileError("");
    setProfileSaving(true);
    try {
      await updateProfile({
        name: name.trim(),
        headline: headline.trim(),
        bio: bio.trim(),
        website: website.trim(),
        profileImage
      });
      setProfileSuccess("Profile updated successfully!");
      setTimeout(() => setProfileSuccess(""), 3000);
    } catch (err) {
      setProfileError(err.message || "Failed to update profile");
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordSuccess("");
    setPasswordError("");

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    setPasswordLoading(true);
    try {
      await api.patch("/auth/change-password", { currentPassword, newPassword });
      setPasswordSuccess("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(""), 3000);
    } catch (err) {
      setPasswordError(err.message || "Failed to change password");
    } finally {
      setPasswordLoading(false);
    }
  };

  const roleColors = {
    student: 'bg-blue-100 text-blue-700',
    instructor: 'bg-purple-100 text-purple-700',
    admin: 'bg-red-100 text-red-700'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Profile & Settings</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your account details, public profile, and security</p>
        </div>

        {/* Account Badge */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-2xl overflow-hidden border-2 border-blue-200 shrink-0">
            {profileImage ? (
              <img src={profileImage} alt={name} className="w-full h-full object-cover" />
            ) : (
              name.charAt(0).toUpperCase() || 'U'
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-slate-900">{user?.name}</p>
            <p className="text-sm text-slate-500">{user?.email}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${roleColors[user?.role] || 'bg-gray-100 text-gray-600'}`}>
            {user?.role}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* ── Profile Card ── */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5 lg:col-span-2">
            <div className="flex items-center gap-2 font-bold text-slate-800 text-lg border-b border-slate-100 pb-3">
              <User className="w-5 h-5 text-blue-600" />
              <h3>Public Profile</h3>
            </div>

            <Alert type="success" message={profileSuccess} />
            <Alert type="error" message={profileError} />

            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-2xl overflow-hidden border-2 border-slate-200 shrink-0">
                {profileImage ? (
                  <img src={profileImage} alt={name} className="w-full h-full object-cover" />
                ) : (
                  name.charAt(0).toUpperCase() || 'U'
                )}
              </div>
              <div>
                <label className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer transition-colors">
                  <Upload className="w-4 h-4" />
                  <span>{uploading ? "Uploading..." : "Change Photo"}</span>
                  <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                </label>
                <p className="text-[11px] text-slate-400 mt-1.5">PNG, JPG or WebP • Max 10MB</p>
                {profileImage && (
                  <button onClick={() => { setProfileImage(''); updateProfile({ profileImage: '' }); }}
                    className="text-xs text-red-500 hover:underline mt-1 block">
                    Remove photo
                  </button>
                )}
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Full Name *</label>
                  <input type="text" required value={name} onChange={e => setName(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Email Address</label>
                  <input type="email" disabled value={user?.email || ""}
                    className="w-full px-3 py-2 text-sm bg-slate-100 border border-slate-200 rounded-xl text-slate-400 cursor-not-allowed" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  <Briefcase className="inline w-3.5 h-3.5 mr-1" />
                  Professional Headline
                </label>
                <input type="text" value={headline} onChange={e => setHeadline(e.target.value)}
                  placeholder="e.g., Full Stack Developer | 10+ years experience"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-blue-500" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  <FileText className="inline w-3.5 h-3.5 mr-1" />
                  Bio
                </label>
                <textarea value={bio} onChange={e => setBio(e.target.value)} rows={4}
                  placeholder="Tell students a bit about yourself..."
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-blue-500 resize-none" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  <Globe className="inline w-3.5 h-3.5 mr-1" />
                  Website / Portfolio
                </label>
                <input type="url" value={website} onChange={e => setWebsite(e.target.value)}
                  placeholder="https://yoursite.com"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-blue-500" />
              </div>

              <button type="submit" disabled={profileSaving}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/20 disabled:opacity-50 transition-colors">
                {profileSaving ? "Saving..." : "Save Profile"}
              </button>
            </form>
          </div>

          {/* ── Change Password ── */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center gap-2 font-bold text-slate-800 text-lg border-b border-slate-100 pb-3">
              <Lock className="w-5 h-5 text-indigo-600" />
              <h3>Change Password</h3>
            </div>

            <Alert type="success" message={passwordSuccess} />
            <Alert type="error" message={passwordError} />

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Current Password</label>
                <input type="password" required value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">New Password (min. 6)</label>
                <input type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Confirm New Password</label>
                <input type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full px-3 py-2 text-sm bg-slate-50 border rounded-xl outline-none focus:bg-white focus:border-indigo-500 ${
                    confirmPassword && confirmPassword !== newPassword ? 'border-red-300' : 'border-slate-200'
                  }`} />
                {confirmPassword && confirmPassword !== newPassword && (
                  <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                )}
              </div>
              <button type="submit" disabled={passwordLoading}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md shadow-indigo-500/20 disabled:opacity-50 transition-colors">
                {passwordLoading ? "Updating..." : "Change Password"}
              </button>
            </form>
          </div>

          {/* ── Account Info ── */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 font-bold text-slate-800 text-lg border-b border-slate-100 pb-3">
              <Shield className="w-5 h-5 text-green-600" />
              <h3>Account Info</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-slate-500">Account type</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold capitalize ${roleColors[user?.role] || ''}`}>{user?.role}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-slate-500">Member since</span>
                <span className="font-medium text-slate-800">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : '—'}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500">Email verified</span>
                <span className="flex items-center gap-1 text-emerald-600 font-semibold text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
