const express = require("express");
const { getUserPage, uploadDocument, matchDocument, getCredits, openFile } = require("../controllers/user.controllers.js");
const authenticateToken = require("../middleware/auth.middleware.js");
const upload = require("../middleware/multer.middleware.js");

const router = express.Router();

router.get("/profile", authenticateToken, getUserPage);
router.post("/regularUser/scanUpload", authenticateToken, upload.single("document"), uploadDocument);
router.get("/regularUser/matches/:docIdGet", authenticateToken, matchDocument); 
router.post("/regularUser/requestCredits", authenticateToken, getCredits);
router.get("/regularUser/open-file/:docId", authenticateToken, openFile);


module.exports = router;
