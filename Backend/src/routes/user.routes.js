const express = require("express");
const { getUserPage, uploadAndMatchDocument } = require("../controllers/user.controllers.js");
const authenticateToken = require("../middleware/auth.middleware.js");
const upload = require("../middleware/multer.middleware.js");

const router = express.Router();

router.get("/regularUser", authenticateToken, getUserPage);
router.post("/regularUser/upload", authenticateToken, upload.single("document"), uploadAndMatchDocument);

module.exports = router;
