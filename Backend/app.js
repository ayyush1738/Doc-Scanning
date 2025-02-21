const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const { registerUser, loginUser } = require("./auth");
const { PORT, SESSION_SECRET } = require("./config");

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "../Frontend")));

app.use(cors());
app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}));

// Home Route
app.get("/", (req, res) => {
    res.redirect("/login");
});

app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "../Frontend", "index.html"));
});

// Register
app.post("/auth/register", (req, res) => {
    const { username, password, role } = req.body;
    registerUser(username, password, role, (err) => {
        if (err) return res.status(400).send("Error: " + err.message);
        res.send("Registration successful.");
    });
});

// Login
app.post("/auth/login", (req, res) => {
    const { username, password } = req.body;
    loginUser(username, password, (err, user) => {
        if (err) return res.status(400).json({ message: err });

        req.session.user = { id: user.id, username: user.username, role: user.role };
        res.json({ message: "Login successful", user });
    });
});

// Dashboard (Admin-Only Route)
app.get("/dashboard", (req, res) => {
    if (!req.session.user || req.session.user.role !== "admin") {
        return res.status(403).send("Access Denied! Only admins can access this page.");
    }
    res.sendFile(path.join(__dirname, "../Frontend", "dashboard.html"));
});

// Logout
app.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/login");
    });
});

// Start Server
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
