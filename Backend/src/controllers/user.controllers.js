const path = require("path");
const db = require("../db/database.js")
const bodyParser = require('body-parser')
const fs = require("fs");

// Levenshtein Distance Function (Basic Text Similarity)
function levenshteinDistance(s1, s2) {
    // Handle null or undefined inputs
    if (!s1 || !s2) return 0;
    
    s1 = s1.toString();
    s2 = s2.toString();
    
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


exports.matchDocument = (req, res) => {
    const docId = req.params.docId;
    console.log("matchDocument API called for docId:", docId); // ✅ Debugging log

    db.get(
        `SELECT d.id, d.filename, d.content FROM documents d WHERE d.id = ?`, 
        [docId], 
        (err, sourceDoc) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ message: 'Database error', matches: [] });
            }
            
            if (!sourceDoc) {
                console.log("Document not found in DB.");
                return res.status(404).json({ message: 'Document not found', matches: [] });
            }

            if (!sourceDoc.content || sourceDoc.content.trim() === "") {
                console.log("Document has no content:", sourceDoc);
                return res.status(400).json({ message: 'Source document has no content to compare', matches: [] });
            }

            // Proceed with document matching...
            db.all(
                `SELECT d.id, d.filename, d.content 
                 FROM documents d 
                 WHERE d.id != ? AND d.content IS NOT NULL`,  // Only get documents with content
                [docId],
                (err, docs) => {
                    if (err) {
                        console.error("Database error:", err);
                        return res.status(500).json({ message: "Database error", matches: [] });
                    }

                    // Calculate similarity for each document
                    const matches = docs
                        .filter(doc => doc.content) // Extra safety check
                        .map(doc => ({
                            id: doc.id,
                            filename: doc.filename,
                            similarity: 1 - (levenshteinDistance(sourceDoc.content, doc.content) / 
                                          Math.max(sourceDoc.content.length, doc.content.length))
                        }))
                        .filter(m => m.similarity > 0.7)
                        .sort((a, b) => b.similarity - a.similarity);

                    res.json({ 
                        sourceDocument: {
                            id: sourceDoc.id,
                            filename: sourceDoc.filename
                        },
                        matches 
                    });
                }
            );
            
        }
    );
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

        // Read the content of the uploaded file
        const filePath = req.file.path;
        fs.readFile(filePath, 'utf8', (err, content) => {
            if (err) {
                return res.status(500).json({ message: "Error reading file content" });
            }

            const upload_date = new Date().toISOString().slice(0, 19).replace('T', ' ');

            // Insert document with content
            db.run(
                "INSERT INTO documents (user_id, filename, content, upload_date) VALUES (?, ?, ?, ?)",
                [req.user.id, filename, content, upload_date],
                function (err) {
                    if (err) return res.status(500).json({ message: "Error saving file" });

                    // Deduct 1 credit after scanning
                    db.run("UPDATE users SET credits = credits - 1 WHERE id = ?", [req.user.id], (err) => {
                        if (err) return res.status(500).json({ message: "Error updating credits" });

                        res.json({
                            message: "File uploaded successfully!",
                            document: { filename, upload_date }
                        });
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
