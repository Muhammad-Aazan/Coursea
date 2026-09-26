import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../api/client";
import { useAuth } from "./AuthContext";

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchWishlist = async () => {
    if (!user) {
      setWishlist([]);
      return;
    }
    try {
      setLoading(true);
      const res = await api.get("/wishlist");
      setWishlist(res.data.wishlist || []);
    } catch (err) {
      console.warn("Could not load wishlist:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [user]);

  const isInWishlist = (courseId) => {
    return wishlist.some(
      (item) => item.course?._id === courseId || item.course === courseId
    );
  };

  const addToWishlist = async (courseId) => {
    try {
      await api.post(`/wishlist/${courseId}`, {});
      await fetchWishlist();
      return true;
    } catch (err) {
      throw err;
    }
  };

  const removeFromWishlist = async (courseId) => {
    try {
      await api.delete(`/wishlist/${courseId}`);
      setWishlist((prev) =>
        prev.filter((item) => (item.course?._id || item.course) !== courseId)
      );
      return true;
    } catch (err) {
      throw err;
    }
  };

  const value = {
    wishlist,
    wishlistCount: wishlist.length,
    loading,
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    refreshWishlist: fetchWishlist
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};
