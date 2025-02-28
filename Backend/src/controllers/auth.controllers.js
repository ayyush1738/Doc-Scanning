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

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: "6h" }
        );

        res.setHeader("Access-Control-Expose-Headers", "Set-Cookie"); 
        res.cookie("token", token, {
            httpOnly: false,    
            secure: false,      
            sameSite: "Lax",    
            path: "/",          
            maxAge: 6 * 60 * 60 * 1000, 
        });

        console.log("Token Set Successfully:", token);
        res.json({ message: "Login successful", user });
    });
};




exports.logout = (req, res) => {
    res.clearCookie("token");
    res.json({ message: "Logout successful" });
};

exports.checkRole = (req, res) => {
    const token = req.cookies.token; 

    if (!token) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: "Invalid token" });
        }

        res.json({ role: decoded.role });
    });
};
