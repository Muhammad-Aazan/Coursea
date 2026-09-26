const rateLimit = require("express-rate-limit");

// General API rate limiter: Max 120 requests per 1 minute per IP
// Prevents server overloading, DDoS, and excessive serverless invocation costs
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 120, // Limit each IP to 120 requests per minute
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  message: {
    success: false,
    message: "Too many requests from this IP. Please wait a minute before making more requests to prevent server overload."
  }
});

// Stricter rate limiter for sensitive authentication endpoints (login, register)
// Max 15 attempts per 1 minute to prevent brute-force attacks
const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 15, // Limit each IP to 15 auth requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts. Please wait 1 minute before trying again."
  }
});

// Payment checkout rate limiter: Max 10 attempts per minute
const paymentLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many checkout requests initiated. Please wait 1 minute before trying again."
  }
});

module.exports = {
  apiLimiter,
  authLimiter,
  paymentLimiter
};
