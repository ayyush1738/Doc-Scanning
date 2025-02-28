const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const path = require("path");
const healthcheckRoutes = require("./src/routes/healthcheck.routes.js")
const authRoutes = require("./src/routes/auth.routes.js");
const adminRoutes = require("./src/routes/admin.routes.js");
const userRoutes = require("./src/routes/user.routes.js");
const resetCredits = require("./src/models/user.model.js");
const schedule = require('node-schedule');
const db = require("./src/db/database.js");

// Function to reset daily scans and credits
function resetDailyScansAndCredits() {
    console.log("Resetting daily scans and credits...");

    db.run("UPDATE users SET credits = 20", [], (err) => {
        if (err) console.error("Error resetting credits:", err);
    });

    db.run("DELETE FROM documents WHERE date(upload_date) = date('now', 'localtime')", [], (err) => {
        if (err) console.error("Error resetting scans:", err);
    });

    console.log("Daily scans and credits reset at midnight.");
}

// Schedule the reset function to run every midnight
schedule.scheduleJob('0 0 * * *', resetDailyScansAndCredits);

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "../Frontend")));
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", req.headers.origin || "*"); // Allow any origin dynamically
    res.header("Access-Control-Allow-Credentials", "true");  // ✅ Allow cookies to be sent
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
    
}, 60 * 1000 )

// 
app.use("/healthcheck", healthcheckRoutes);
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes)
app.use("/user", userRoutes);

app.get("/", (req, res) => {
    res.redirect("/login");
});


module.exports = app;
