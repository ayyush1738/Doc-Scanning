const path = require("path");

exports.getDashboard = (req, res) => {
    if (req.user.role !== "admin") {
        return res.status(403).send("Access Denied! Only admins can access this page.");
    }
    res.sendFile(path.join(__dirname, "../../Frontend", "dashboard.html"));
};


