// Backend - admin.routes.js
const express = require("express");
const { getDashboard, getAdminAnalytics, getCreditRequests, approveCreditRequest, denyCreditRequest } = require("../controllers/admin.controllers.js");
const authenticateToken = require("../middleware/auth.middleware.js");

const router = express.Router();

router.get("/dashboard", authenticateToken, getDashboard);
router.get("/analytics", authenticateToken, getAdminAnalytics);
router.get("/credit-requests", authenticateToken, getCreditRequests);
router.post("/approve-credit", authenticateToken, approveCreditRequest);
router.post("/deny-credit", authenticateToken, denyCreditRequest);


module.exports = router;


