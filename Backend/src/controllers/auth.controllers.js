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

        // Generate JWT Token
        const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: "1h" });

        res.cookie("token", token, { httpOnly: true, secure: false, sameSite: "Lax" });
        res.json({ message: "Login successful", user });
    });
};

exports.logout = (req, res) => {
    res.clearCookie("token");
    res.json({ message: "Logout successful" });
};
