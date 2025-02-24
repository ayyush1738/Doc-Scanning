const express = require("express");
const { healthcheck } = require("../controllers/healthcheck.controllers");

const router = express.Router();

router.get("/", healthcheck);

module.exports = router;  
