const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Connect to the SQLite database
const db = new sqlite3.Database(path.join(__dirname, "../../../database/users.db"), (err) => {
    if (err) console.error(err.message);
    else console.log("Connected to the SQLite database.");
});

// Create Tables
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT CHECK(role IN ('user', 'admin')) NOT NULL DEFAULT 'user',
            credits INTEGER DEFAULT 20
        )
    `);
    
    db.run(`
        CREATE TABLE IF NOT EXISTS documents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            filename TEXT,
            content TEXT,
            upload_date TEXT,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
    `);
    
    db.run(`
        CREATE TABLE IF NOT EXISTS credit_requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            requested_credits INTEGER,
            status TEXT DEFAULT 'pending',
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
    `);
    db.run(`CREATE TABLE IF NOT EXISTS activity_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        action TEXT NOT NULL,
        details TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

});

module.exports = db;
