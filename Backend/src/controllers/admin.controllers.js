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

    db.get("SELECT COUNT(*) as total_scans_today FROM documents WHERE DATE(upload_date, 'localtime') = DATE('now', 'localtime')", [], (err, result) => {
        if (err) return res.status(500).json({ message: "Database error" });
        const totalScans = result ? result.total_scans_today : 0;

        db.all("SELECT filename FROM documents GROUP BY filename ORDER BY COUNT(*) DESC", [], (err, topics) => {
            if (err) return res.status(500).json({ message: "Database error" });
            const topTopics = topics.map(t => t.filename);

            db.all("SELECT users.username, COUNT(documents.id) as total_scans FROM users LEFT JOIN documents ON users.id = documents.user_id GROUP BY users.id ORDER BY total_scans DESC LIMIT 5", [], (err, topUsers) => {
                if (err) return res.status(500).json({ message: "Database error" });

                db.all("SELECT users.id, users.username, IFNULL(daily.scans_today, 0) AS scans_today, COUNT(documents.id) AS total_scans, users.credits, IFNULL(pending_requests.total_requested_credits, 0) AS pending_requests FROM users LEFT JOIN (SELECT user_id, COUNT(id) AS scans_today FROM documents WHERE date(upload_date, 'localtime') = date('now', 'localtime') GROUP BY user_id) daily ON users.id = daily.user_id LEFT JOIN documents ON users.id = documents.user_id LEFT JOIN (SELECT user_id, SUM(requested_credits) AS total_requested_credits FROM credit_requests WHERE status = 'pending' GROUP BY user_id) pending_requests ON users.id = pending_requests.user_id GROUP BY users.id;", [], (err, userScans) => {
                    if (err) return res.status(500).json({ message: "Database error" });

                    db.all("SELECT users.id, users.username, IFNULL(daily.scans_today, 0) AS credits_used FROM users LEFT JOIN (SELECT user_id, COUNT(id) AS scans_today FROM documents WHERE date(upload_date, 'localtime') = date('now', 'localtime') GROUP BY user_id) daily ON users.id = daily.user_id;", [], (err, creditsUsed) => {
                        if (err) return res.status(500).json({ message: "Database error" });

                        db.all("SELECT users.id, users.username, IFNULL(daily.scans_today, 0) AS top_credits FROM users LEFT JOIN (SELECT user_id, COUNT(id) AS scans_today FROM documents WHERE date(upload_date, 'localtime') = date('now', 'localtime') GROUP BY user_id) daily ON users.id = daily.user_id ORDER BY top_credits DESC LIMIT 5", [], (err, topCredits) => {
                            if (err) return res.status(500).json({ message: "Database error" });

                            res.json({
                                total_scans_today: totalScans,
                                top_topics: topTopics,
                                top_users: topUsers,
                                user_scans: userScans,
                                credits_used: creditsUsed,
                                top_credits: topCredits
                            });
                        });
                    });
                });
            });
        });
    });
};




// Fetch all pending credit requests for admin panel
exports.getCreditRequests = (req, res) => {
    db.all(`
        SELECT cr.id, u.username, cr.requested_credits 
        FROM credit_requests cr
        JOIN users u ON cr.user_id = u.id
        WHERE cr.status = 'pending'`, 
        [], 
        (err, requests) => {
            if (err) {
                console.error("Database error:", err.message);
                return res.status(500).json({ message: "Database error" });
            }
            res.json({ requests });
        }
    );
};


// Approve Credit Request (Add credits to user and remove from pending)
exports.approveCreditRequest = (req, res) => {
    const { requestId } = req.body;

    db.get("SELECT user_id, requested_credits FROM credit_requests WHERE id = ?", [requestId], (err, request) => {
        if (err) {
            console.error("Database error:", err.message);
            return res.status(500).json({ message: "Database error" });
        }

        if (!request) {
            return res.status(400).json({ message: "Invalid or already processed request" });
        }

        const { user_id, requested_credits } = request;

        db.serialize(() => {
            db.run("BEGIN TRANSACTION");

            // Update user's credits
            db.run("UPDATE users SET credits = credits + ? WHERE id = ?", [requested_credits, user_id], (err) => {
                if (err) {
                    console.error("Error updating user credits:", err.message);
                    db.run("ROLLBACK");
                    return res.status(500).json({ message: "Error updating user credits" });
                }

                // Remove the request from pending
                db.run("DELETE FROM credit_requests WHERE id = ?", [requestId], (err) => {
                    if (err) {
                        console.error("Error deleting credit request:", err.message);
                        db.run("ROLLBACK");
                        return res.status(500).json({ message: "Error deleting credit request" });
                    }

                    db.run("COMMIT");
                    res.json({ message: `Approved! ${requested_credits} credits added to user.` });
                });
            });
        });
    });
};

// Deny Credit Request (Simply remove from pending requests)
exports.denyCreditRequest = (req, res) => {
    const { requestId } = req.body;

    db.run("DELETE FROM credit_requests WHERE id = ?", [requestId], (err) => {
        if (err) {
            console.error("Database error:", err.message);
            return res.status(500).json({ message: "Database error" });
        }
        res.json({ message: "Credit request denied successfully." });
    });
};
