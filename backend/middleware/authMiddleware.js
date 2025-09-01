const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    // 1. Get the token from the request header
    const token = req.header('x-auth-token');

    // 2. If there is no token, deny access
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // 3. If there is a token, verify it
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Add the user's payload (which contains the user ID) to the request object
        req.user = decoded.user;
        next(); // Proceed to the next function (the controller)
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};