const express = require("express");
const signupLoginController = require("../controller/signupLoginController");
const router = express.Router();

router.post("/signup", signupLoginController.singup);
router.post("/login", signupLoginController.login);
router.post("/logout", signupLoginController.logout);


module.exports = router;