const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const path = require("path");
const healthcheckRoutes = require("./src/routes/healthcheck.routes.js")
const authRoutes = require("./src/routes/auth.routes.js");
const adminRoutes = require("./src/routes/admin.routes.js");
const userRoutes = require("./src/routes/user.routes.js");
const resetCredits = require("./src/models/user.model.js")

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "../Frontend")));
app.use((req, res, next) => {
    const allowedOrigins = ["http://127.0.0.1:5500", "http://localhost:5500", "http://localhost:3000"];
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.header("Access-Control-Allow-Origin", origin);
    }
    res.header("Access-Control-Allow-Credentials", "true"); 
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") {
        return res.sendStatus(204);
    }
    next();
});

setInterval(() => {
    const now = new Date();
    if(now.getHours() === 0 && now.getMinutes() === 0) resetCredits();
    
}, 60 * 1000)

// Routes
app.use("/healthcheck", healthcheckRoutes);
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes)
app.use("/user", userRoutes);

app.get("/", (req, res) => {
    res.redirect("/login");
});


module.exports = app;
