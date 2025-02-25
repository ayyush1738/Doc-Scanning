// Backend - admin.controllers.js
const path = require("path");
const db = require("../db/database.js");

exports.getDashboard = (req, res) => {
    if (req.user.role !== "admin") {
        return res.status(403).send("Access Denied! Only admins can access this page.");
    }
    res.sendFile(path.join(__dirname, "../../Frontend", "dashboard.html"));
};


exports.getAdminAnalytics = (req, res) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Access Denied!" });
    }

    db.get("SELECT COUNT(*) as total_scans_today FROM documents WHERE date(upload_date) = date('now')", [], (err, result) => {
        if (err) return res.status(500).json({ message: "Database error" });
        const totalScans = result ? result.total_scans_today : 0;

        db.all("SELECT filename FROM documents GROUP BY filename ORDER BY COUNT(*) DESC", [], (err, topics) => {
            if (err) return res.status(500).json({ message: "Database error" });
            const topTopics = topics.map(t => t.filename);

            db.all("SELECT users.username, COUNT(documents.id) as total_scans FROM users LEFT JOIN documents ON users.id = documents.user_id GROUP BY users.id ORDER BY total_scans DESC LIMIT 5", [], (err, topUsers) => {
                if (err) return res.status(500).json({ message: "Database error" });

                db.all("SELECT users.username, COUNT(documents.id) as total_scans FROM users LEFT JOIN documents ON users.id = documents.user_id GROUP BY users.id ORDER BY total_scans DESC", [], (err, allUsers) => {
                    if (err) return res.status(500).json({ message: "Database error" });


                    db.all("SELECT users.username, IFNULL(daily.scans_today, 0) as scans_today, COUNT(documents.id) as total_scans, users.credits FROM users LEFT JOIN (SELECT user_id, COUNT(id) as scans_today FROM documents WHERE date(upload_date) = date('now') GROUP BY user_id) daily ON users.id = daily.user_id LEFT JOIN documents ON users.id = documents.user_id GROUP BY users.id", [], (err, userScans) => {
                        if (err) return res.status(500).json({ message: "Database error" });

                        db.all("SELECT username, (20 - credits) AS credits_used FROM users LIMIT 5", [], (err, creditsUsed) => {
                            if(err) return res.status(500).json({message: "Database error"});

                            res.json({ total_scans_today: totalScans, top_topics: topTopics, top_users: topUsers, user_scans: userScans, credits_used: creditsUsed, all_users: allUsers });
                        })
                    });
                });
            });
        });
    });
};


exports.getCreditRequests = (req, res) => {
    db.all("SELECT id, username, requested_credits FROM credit_requests WHERE status = 'pending'", [], (err, requests) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json({ requests });
    });
};

exports.approveCreditRequest = (req, res) => {
    const { requestId } = req.body;
    db.get("SELECT user_id, requested_credits FROM credit_requests WHERE id = ?", [requestId], (err, request) => {
        if (err || !request) return res.status(400).json({ message: "Invalid request" });
        db.run("UPDATE users SET credits = credits + ? WHERE id = ?", [request.requested_credits, request.user_id], err => {
            if (err) return res.status(500).json({ message: "Error updating credits" });
            db.run("UPDATE credit_requests SET status = 'approved' WHERE id = ?", [requestId]);
            res.json({ message: "Credit approved" });
        });
    });
};

exports.denyCreditRequest = (req, res) => {
    const { requestId } = req.body;
    db.run("UPDATE credit_requests SET status = 'denied' WHERE id = ?", [requestId], err => {
        if (err) return res.status(500).json({ message: "Error denying request" });
        res.json({ message: "Credit request denied" });
    });
};


