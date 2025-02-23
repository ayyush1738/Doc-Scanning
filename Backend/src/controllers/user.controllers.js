const path = require("path");
const db = require("../db/database.js")

const fs = require("fs");

// Levenshtein Distance Function (Basic Text Similarity)
function levenshteinDistance(s1, s2) {
    const len1 = s1.length, len2 = s2.length;
    let matrix = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(null));

    for (let i = 0; i <= len1; i++) matrix[i][0] = i;
    for (let j = 0; j <= len2; j++) matrix[0][j] = j;

    for (let i = 1; i <= len1; i++) {
        for (let j = 1; j <= len2; j++) {
            const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,
                matrix[i][j - 1] + 1,
                matrix[i - 1][j - 1] + cost
            );
        }
    }
    return matrix[len1][len2];
}

exports.uploadAndMatchDocument = (req, res) => {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const filePath = path.join(__dirname, "../../uploads", req.file.filename);
    const fileContent = fs.readFileSync(filePath, "utf-8");

    db.run(
        "INSERT INTO documents (user_id, filename, content, upload_date) VALUES (?, ?, ?, ?)",
        [req.user.id, req.file.filename, fileContent, new Date().toISOString()],
        function (err) {
            if (err) return res.status(500).json({ message: "Error saving file" });

            db.all("SELECT * FROM documents", [], (err, docs) => {
                if (err) return res.status(500).json({ message: "Error retrieving documents" });

                const matches = docs.map(doc => ({
                    filename: doc.filename,
                    score: levenshteinDistance(fileContent, doc.content)
                })).sort((a, b) => a.score - b.score).slice(0, 5); // Top 5 matches

                res.json({ matches });
            });
        }
    );
};

exports.uploadAndMatchDocument = (req, res) => {
    db.get("SELECT credits FROM users WHERE id = ?", [req.user.id], (err, user) => {
        if (err || !user) return res.status(500).json({ message: "Error fetching user data" });

        if (user.credits <= 0) {
            return res.status(403).json({ message: "Not enough credits! Request more credits." });
        }

        // Deduct 1 credit after scanning
        db.run("UPDATE users SET credits = credits - 1 WHERE id = ?", [req.user.id], (err) => {
            if (err) return res.status(500).json({ message: "Error updating credits" });

            // Proceed with file upload & matching...
        });
    });
};



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
