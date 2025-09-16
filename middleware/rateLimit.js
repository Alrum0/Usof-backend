const rateLimit = require('express-rate-limit');

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
});

const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message:
    'Too many login attempts from this IP, please try again after a minute.',
});

module.exports = { globalLimiter, loginLimiter };
