const express = require("express");
const { getUserPage, uploadDocument, matchDocument, getCredits } = require("../controllers/user.controllers.js");
const authenticateToken = require("../middleware/auth.middleware.js");
const upload = require("../middleware/multer.middleware.js");

const router = express.Router();

router.get("/regularUser", authenticateToken, getUserPage);
router.post("/regularUser/upload", authenticateToken, upload.single("document"), uploadDocument);
router.get("/regularUser/matches/:docId", authenticateToken, matchDocument); 
router.post("/regularUser/requestCredits", authenticateToken, getCredits);

module.exports = router;
