const jwt = require("jsonwebtoken");
const { registerUser, loginUser } = require("../models/auth.model.js");
const { JWT_SECRET } = require("../config/config.js");

exports.register = (req, res) => {
    const { username, password, role } = req.body;
    registerUser(username, password, role, (err) => {
        if (err) return res.status(400).send("Error: " + err.message);
        res.send("Registration successful.");
    });
};

exports.login = (req, res) => {
    const { username, password } = req.body;
    loginUser(username, password, (err, user) => {
        if (err) return res.status(400).json({ message: err });

        // Generate JWT Token (Valid for 6 hours)
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: "6h" } // 🔴 Increase expiration to 6h
        );

        res.cookie("token", token, {
            httpOnly: false,   // 🔴 Allow JavaScript to access the cookie (Only if necessary)
            secure: false,     // 🔴 Change to `true` if using HTTPS
            sameSite: "None",  // 🔴 Fixes cross-site request issues
            maxAge: 6 * 60 * 60 * 1000, // 6 Hours
        });

        console.log("✅ Token set successfully:", token);
        res.json({ message: "Login successful", user });
    });
};


exports.logout = (req, res) => {
    res.clearCookie("token");
    res.json({ message: "Logout successful" });
};
