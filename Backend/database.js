const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Connect to the SQLite database
const db = new sqlite3.Database(path.join(__dirname, "../database/users.db"), (err) => {
    if (err) console.error(err.message);
    console.log("✅ Connected to the SQLite database.");
});

// Create Users table
db.run(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT CHECK(role IN ('user', 'admin')) NOT NULL DEFAULT 'user',
        credits INTEGER DEFAULT 20
    )
`);

module.exports = db;
