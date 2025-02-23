const path = require("path");
const db = require("../db/database.js")

exports.getUserPage = (req, res) => {
    console.log("Incoming Request:", req.headers); // Debug headers
    console.log("User in Middleware:", req.user); // Check if user is set

    if (!req.user) {
        return res.status(403).json({ message: "Unauthorized: No user found in request." });
    }

    if (req.user.role !== "user") {
        return res.status(403).json({ message: "Access Denied! Only regular users can access this page." });
    }

    const username = req.query.username;
    console.log("Requested Username:", username);

    db.get(`SELECT id, username, role, credits FROM users WHERE username = ?`, [username], (err, user) => {
        if (err || !user) {
            console.log("User not found in DB:", username);
            return res.status(404).json({ message: "User not found in database." });
        }

        db.all(`SELECT filename, upload_date FROM documents WHERE user_id = ?`, [user.id], (err, docs) => {
            if (err) {
                console.log("Database Error Fetching Documents:", err);
                return res.status(500).json({ message: "Database error fetching documents." });
            }
            console.log("User Found. Sending Response...");
            res.json({ ...user, pastScans: docs });
        });
    });
};
