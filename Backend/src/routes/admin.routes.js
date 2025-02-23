const express = require("express");
const { getDashboard } = require("../controllers/admin.controllers.js");
const authenticateToken = require("../middleware/auth.middleware.js");

const router = express.Router();

router.get("/dashboard", authenticateToken, getDashboard);

module.exports = router;
