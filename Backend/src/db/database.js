const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Connect to the SQLite database
const db = new sqlite3.Database(path.join(__dirname, "../../../database/users.db"), (err) => {
    if (err) console.error(err.message);
    console.log("Connected to the SQLite database.");
});

// Create Users table with dynamic credit assignment
db.serialize(()=> {
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT CHECK(role IN ('user', 'admin')) NOT NULL DEFAULT 'user',
            credits INTEGER DEFAULT 20
        )
    `);
    db.run(`CREATE TABLE IF NOT EXISTS documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        filename TEXT,
        content TEXT,
        upload_date TEXT,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS credit_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        requested_credits INTEGER,
        status TEXT DEFAULT 'pending',
        FOREIGN KEY(user_id) REFERENCES users(id)
    )`);

    // Create a trigger to set credits based on role
    db.run(`
        CREATE TRIGGER IF NOT EXISTS set_credits_on_insert
        BEFORE INSERT ON users
        FOR EACH ROW
        WHEN NEW.credits IS NULL
        BEGIN
            UPDATE users
            SET credits = CASE 
                WHEN NEW.role = 'admin' THEN 1000
                ELSE 20
            END
            WHERE id = NEW.id;
        END;
    `);
});



module.exports = db;