const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const cors = require("cors");
const { registerUser, loginUser } = require("./auth");
const { PORT, SESSION_SECRET } = require("./config");

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}));

// Home Route
app.get("/", (req, res) => {
    res.send("Welcome to Doc Scanner Authentication System.");
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
        if (err) return res.status(400).send(err);
        req.session.user = { id: user.id, username: user.username, role: user.role };
        res.send({ message: "Login successful", user });
    });
});

// Logout
app.get("/logout", (req, res) => {
    req.session.destroy(() => res.send("Logged out successfully."));
});

// Start Server
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
