const express = require("express");
const { getUserPage } = require("../controllers/user.controllers.js");
const authenticateToken = require("../middleware/auth.middleware.js");

const router = express.Router();

router.get("/regularUser", authenticateToken, getUserPage);

const upload = require("../middleware/multer.middleware.js");
const { uploadAndMatchDocument } = require("../controllers/user.controllers.js");

router.post("/upload", authenticateToken, upload.single("document"), uploadAndMatchDocument);


module.exports = router;

