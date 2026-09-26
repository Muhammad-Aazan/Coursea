import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api } from "../api/client";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("coursea_token") || null);
  const [loading, setLoading] = useState(true);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState(new Set());

  // Fetch enrolled courses to populate the IDs set
  const refreshEnrolledCourses = useCallback(async () => {
    try {
      const res = await api.get("/enrollments/my-courses");
      // Response: { data: { enrollments: [{ course: { _id, ... } }] } }
      const enrollments = res.data?.data?.enrollments || [];
      setEnrolledCourseIds(new Set(
        enrollments
          .map((e) => e.course?._id || e.course)
          .filter(Boolean)
          .map(String)
      ));
    } catch {
      // Silently ignore — user may not be logged in
      setEnrolledCourseIds(new Set());
    }
  }, []);

  // Load current user profile if token exists
  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setUser(null);
        setEnrolledCourseIds(new Set());
        setLoading(false);
        return;
      }
      try {
        const res = await api.get("/auth/me");
        setUser(res.data.user);
        // Fetch enrolled courses in background
        refreshEnrolledCourses();
      } catch (err) {
        console.warn("Failed to restore user session:", err.message);
        if (err.status === 401) {
          localStorage.removeItem("coursea_token");
          setToken(null);
          setUser(null);
          setEnrolledCourseIds(new Set());
        }
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    const { token: newToken, user: userData } = res.data;
    localStorage.setItem("coursea_token", newToken);
    setToken(newToken);
    setUser(userData);
    // Refresh enrolled courses after login
    setTimeout(() => refreshEnrolledCourses(), 300);
    return userData;
  };

  const register = async (name, email, password, role = "student") => {
    const res = await api.post("/auth/register", { name, email, password, role });
    const { token: newToken, user: userData } = res.data;
    localStorage.setItem("coursea_token", newToken);
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const logout = async () => {
    try {
      if (token) {
        await api.post("/auth/logout", {});
      }
    } catch (err) {
      // Ignore error on logout
    }
    localStorage.removeItem("coursea_token");
    setToken(null);
    setUser(null);
    setEnrolledCourseIds(new Set());
  };

  const updateProfile = async (formData) => {
    const res = await api.patch("/auth/profile", formData);
    setUser(res.data.user);
    return res.data.user;
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user,
    isStudent: user?.role === "student",
    isInstructor: user?.role === "instructor",
    isAdmin: user?.role === "admin",
    enrolledCourseIds,
    isEnrolled: (courseId) => enrolledCourseIds.has(String(courseId)),
    refreshEnrolledCourses
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
