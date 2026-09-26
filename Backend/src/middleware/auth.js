const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Middleware to verify JWT token and attach user to request
const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this route, token missing"
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "coursea_jwt_secret_key_default"
    );

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User belonging to this token no longer exists"
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, invalid or expired token"
    });
  }
};

// Middleware to restrict access to specific user roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user ? req.user.role : "none"}' is not authorized to access this route`
      });
    }
    next();
  };
};

// Optional auth middleware (attaches user if token provided, but doesn't reject if omitted)
const optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (token) {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "coursea_jwt_secret_key_default"
      );
      req.user = await User.findById(decoded.id).select("-password");
    }
  } catch (error) {
    // Continue unauthenticated if token invalid
  }
  next();
};

const adminMiddleware = authorize("admin");
const instructorMiddleware = authorize("instructor", "admin");
const studentMiddleware = authorize("student", "admin");

module.exports = {
  protect,
  authMiddleware: protect,
  optionalAuth,
  authorize,
  adminMiddleware,
  instructorMiddleware,
  studentMiddleware
};

