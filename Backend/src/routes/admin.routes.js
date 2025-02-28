// Backend - admin.routes.js
const express = require("express");
const { getDashboard, getAdminAnalytics, getCreditRequests, approveCreditRequest, denyCreditRequest, updateUserCredits, getActivityLogs } = require("../controllers/admin.controllers.js");
const authenticateToken = require("../middleware/auth.middleware.js");

const router = express.Router();

router.get("/dashboard", authenticateToken, getDashboard);
router.get("/analytics", authenticateToken, getAdminAnalytics);
router.get("/credit-requests", authenticateToken, getCreditRequests);
router.post("/approve-credit", authenticateToken, approveCreditRequest);
router.post("/deny-credit", authenticateToken, denyCreditRequest);
router.post("/update-credits", authenticateToken, updateUserCredits);
router.get("/activity-logs", authenticateToken, getActivityLogs);




module.exports = router;



