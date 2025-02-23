const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/config.js");

module.exports = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.status(403).json({ error: "Unauthorized" });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: "Invalid token" });
        req.user = user;
        next();
    });
};
