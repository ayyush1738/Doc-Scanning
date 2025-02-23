const express = require("express");
const { getUserPage } = require("../controllers/user.controllers.js");
const authenticateToken = require("../middleware/auth.middleware.js");

const router = express.Router();

router.get("/regularUser", authenticateToken, getUserPage);

module.exports = router;
