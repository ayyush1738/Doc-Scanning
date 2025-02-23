const db = require("../db/database.js");

function resetCredits() {
    db.run(`UPDATE users SET credits  = 20 WHERE role='user'`, [], (err) => {
        if(err) console.log('Credits reset at Midnight for users');
    });
}

module.exports = resetCredits;
