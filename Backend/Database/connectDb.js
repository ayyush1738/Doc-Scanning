const sqlite3 = require('sqlite3').verbose();

// Create and initialize the database connection
const connectDB = new sqlite3.Database(':memory:', (err) => {
    if (err) {
        console.error("Error connecting to the database:", err.message);
        process.exit(1); // Stop the app if database connection fails
    }
    console.log('Connected to the SQLite database.');
});

// Table creation (Run this only once to create the table)
connectDB.serialize(() => {
    connectDB.run("CREATE TABLE lorem (info TEXT)");

    const stmt = connectDB.prepare("INSERT INTO lorem VALUES (?)");
    for (let i = 0; i < 10; i++) {
        stmt.run("Ipsum " + i);
    }
    stmt.finalize();

    connectDB.each("SELECT rowid AS id, info FROM lorem", (err, row) => {
        console.log(row.id + ": " + row.info);
    });
});


// Export the database object for use in other files
module.exports = connectDB;
