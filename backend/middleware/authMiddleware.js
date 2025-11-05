// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  try {
    let token;

    // 1️⃣ Try cookie first (for secure automatic login)
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    // 2️⃣ Fallback: try Authorization header (for manual Bearer tokens)
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // 3️⃣ Legacy support: x-auth-token header (for your existing setup)
    if (!token && req.header('x-auth-token')) {
      token = req.header('x-auth-token');
    }

    // 4️⃣ If no token found → unauthorized
    if (!token) {
      return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // 5️⃣ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Handle both old payload format ({ user: { id } }) and new ({ id })
    req.user = decoded.user ? decoded.user : decoded;

    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ msg: 'Token is not valid' });
  }
};
