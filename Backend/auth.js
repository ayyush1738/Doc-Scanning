const bcrypt = require("bcryptjs");
const db = require("./database");

// Register User
async function registerUser(username, password, role, callback) {
    const hashedPassword = await bcrypt.hash(password, 10);
    db.run("INSERT INTO users (username, password, role) VALUES (?, ?, ?)", [username, hashedPassword, role || "user"], callback);
}

// Login User
async function loginUser(username, password, callback) {
    db.get("SELECT * FROM users WHERE username = ?", [username], async (err, user) => {
        if (err || !user) return callback("User not found", null);
        const validPassword = await bcrypt.compare(password, user.password);
        return callback(validPassword ? null : "Invalid credentials", user);
    });
}

module.exports = { registerUser, loginUser };
