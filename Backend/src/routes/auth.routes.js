const express = require("express");
const { register, login, logout, checkRole } = require("../controllers/auth.controllers.js");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/checkRole", checkRole);


module.exports = router;
