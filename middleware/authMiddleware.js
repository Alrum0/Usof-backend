require('dotenv').config();
const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  if (req.method === 'OPTIONS') {
    return next();
  }
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const decode = jwt.verify(token, process.env.ACCESS_SECRET_KEY);
    req.user = decode;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Unauthorized' });
  }
};
