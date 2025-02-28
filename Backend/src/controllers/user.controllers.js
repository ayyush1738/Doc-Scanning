const path = require("path");
const db = require("../db/database.js");
const bodyParser = require("body-parser");
const fs = require("fs");
const natural = require("natural");

function cosineSimilarity(tfidf, indexA, indexB) {
    const termsA = tfidf.listTerms(indexA);
    const termsB = tfidf.listTerms(indexB);

    let dot = 0;
    let magA = 0;
    let magB = 0;
    const termsBMap = {};

    termsB.forEach((t) => {
        termsBMap[t.term] = t.tfidf;
    });

    termsA.forEach((tA) => {
        const weightB = termsBMap[tA.term] || 0;
        dot += tA.tfidf * weightB;
        magA += tA.tfidf * tA.tfidf;
    });

    termsB.forEach((tB) => {
        magB += tB.tfidf * tB.tfidf;
    });

    const denominator = Math.sqrt(magA) * Math.sqrt(magB);
    return denominator ? dot / denominator : 0;
}

exports.matchDocument = async (req, res) => {
    const docId = req.params.docId;
    console.log("🔍 Matching document:", docId);

    db.get("SELECT id, filename, content FROM documents WHERE id = ?", [docId], async (err, sourceDoc) => {
        if (err || !sourceDoc) {
            console.error("Error fetching document:", err);
            return res.status(500).json({ message: "Error fetching document", matches: [] });
        }

        if (!sourceDoc.content || sourceDoc.content.trim() === "") {
            return res.status(400).json({ message: "Source document has no content to compare", matches: [] });
        }

        db.all("SELECT id, filename, content FROM documents WHERE id != ? AND content IS NOT NULL", [docId], async (err, docs) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ message: "Database error", matches: [] });
            }

            const tfidf = new natural.TfIdf();
            tfidf.addDocument(sourceDoc.content);

            docs.forEach((doc) => {
                tfidf.addDocument(doc.content);
            });

            let matches = [];
            docs.forEach((doc, index) => {
                const similarityScore = cosineSimilarity(tfidf, 0, index + 1);

                if (similarityScore > 0.7) {
                    matches.push({
                        id: doc.id,
                        filename: doc.filename,
                        similarity: similarityScore.toFixed(2),
                    });
                }
            });

            matches.sort((a, b) => b.similarity - a.similarity);

            res.json({
                sourceDocument: {
                    id: sourceDoc.id,
                    filename: sourceDoc.filename,
                },
                matches,
            });
        });
    });
};


exports.getUserPage = (req, res) => {
    if (!req.user) {
        return res.status(403).json({ message: "Unauthorized: No user found in request." });
    }
    if (req.user.role !== "user") {
        return res.status(403).json({ message: "Access Denied! Only regular users can access this page." });
    }
    const username = req.query.username;
    db.get("SELECT id, username, role, credits FROM users WHERE username = ?", [username], (err, user) => {
        if (err || !user) {
            return res.status(404).json({ message: "User not found in database." });
        }
        db.all("SELECT id, filename, upload_date FROM documents WHERE user_id = ?", [user.id], (err, docs) => {
            if (err) {
                return res.status(500).json({ message: "Database error fetching documents." });
            }
            res.json({ success: true, user, pastScans: docs });
        });
    });
};


exports.uploadDocument = (req, res) => {
    db.get("SELECT credits FROM users WHERE id = ?", [req.user.id], (err, user) => {
        if (err || !user) return res.status(500).json({ message: "Error fetching user data" });

        if (user.credits <= 0) {
            return res.status(403).json({ message: "Not enough credits! Request more credits." });
        }

        const filename = req.file ? req.file.filename : null;
        if (!filename) {
            return res.status(400).json({ message: "No file uploaded!" });
        }

        const filePath = req.file.path;
        fs.readFile(filePath, 'utf8', (err, content) => {
            if (err) {
                return res.status(500).json({ message: "Error reading file content" });
            }

            const upload_date = new Date().toISOString().slice(0, 19).replace('T', ' ');

            db.run(
                "INSERT INTO documents (user_id, filename, content, upload_date) VALUES (?, ?, ?, ?)",
                [req.user.id, filename, content, upload_date],
                function (err) {
                    if (err) return res.status(500).json({ message: "Error saving file" });

                    db.run("UPDATE users SET credits = credits - 1 WHERE id = ?", [req.user.id], (err) => {
                        if (err) return res.status(500).json({ message: "Error updating credits" });

                        db.run(
                            "INSERT INTO activity_logs (username, action, details) VALUES (?, ?, ?)",
                            [req.user.username, "Document Scan", `Scanned file: ${filename}`],
                            (err) => {
                                if (err) console.error("Error inserting activity log:", err.message);
                            }
                        );

                        res.json({ message: "File uploaded successfully!", document: { filename, upload_date } });
                    });
                }
            );
        });
    });
};




exports.getUserPage = (req, res) => {
    console.log("Incoming Request:", req.headers);
    console.log("User in Middleware:", req.user);

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

        db.all(`SELECT id, filename, upload_date FROM documents WHERE user_id = ?`, [user.id], (err, docs) => {
            if (err) {
                console.log("Database Error Fetching Documents:", err);
                return res.status(500).json({ message: "Database error fetching documents." });
            }
            console.log("User Found. Sending Response...");
            res.json({ ...user, pastScans: docs });
        });
    });
};

exports.getCredits = (req, res) => {
    const { username, requested_credits } = req.body;

    if (requested_credits <= 0 || requested_credits > 20) {
        return res.status(400).json({ message: "Invalid credit request. You can only request between 1 to 20 credits." });
    }

    db.get(`SELECT id, role, credits FROM users WHERE username = ?`, [username], (err, user) => {
        if (err || !user) return res.status(404).json({ message: "User not found" });

        if (user.role === 'admin') return res.status(403).json({ message: "Admins have unlimited credits" });

        if (user.credits > 0) {
            return res.status(403).json({ message: "Credit request denied. You can only request credits when your balance is 0." });
        }

        db.run(
            `INSERT INTO credit_requests (user_id, requested_credits) VALUES (?, ?)`,
            [user.id, requested_credits],
            (err) => {
                if (err) return res.status(500).json({ message: "Request Failed" });

                db.run(
                    "INSERT INTO activity_logs (username, action, details) VALUES (?, ?, ?)",
                    [username, "Credit Request", `Requested ${requested_credits} credits`],
                    (err) => {
                        if (err) console.error("Error inserting activity log:", err.message);
                    }
                );

                res.json({ message: "Request Submitted Successfully", requested_credits });
            }
        );
    });
};


exports.openFile = (req, res) => {
    const docId = req.params.docId;
    db.get("SELECT filename FROM documents WHERE id = ?", [docId], (err, doc) => {
        if (err) return res.status(500).json({ message: "Database error" });
        if (!doc) return res.status(404).json({ message: "File not found." });
        const filePath = path.join(__dirname, "../../uploads", doc.filename);
        res.sendFile(filePath, (err) => {
            if (err) res.status(500).json({ message: "Error serving file." });
        });
    });
};


