const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/config.js");

module.exports = (req, res, next) => {
    console.log("🔍 Incoming Auth Request Headers:", req.headers);

    const token = req.cookies?.token;  // Use optional chaining to avoid undefined errors

    if (!token) {
        console.log("No token found in cookies");
        return res.status(401).json({ message: "Unauthorized: No token provided" }); // Return correct 401 response
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.log("Invalid token:", err.message);
            return res.status(403).json({ message: "Invalid token" }); // Return correct 403 response
        }

        req.user = user;
        console.log("✅ User Authenticated:", user);
        next();
    });
};
