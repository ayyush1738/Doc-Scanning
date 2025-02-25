const bcrypt = require("bcryptjs");
const db = require("../db/database.js");

exports.registerUser = async (username, password, role, callback) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    db.run("INSERT INTO users (username, password, role) VALUES (?, ?, ?)", [username, hashedPassword, role || "user"], callback);
};

exports.loginUser = async (username, password, callback) => {
    db.get("SELECT * FROM users WHERE username = ?", [username], async (err, user) => {
        if (err || !user) return callback("User not found", null);

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return callback("Invalid credentials", null);

        return callback(null, { id: user.id, username: user.username, role: user.role });
    });
};


