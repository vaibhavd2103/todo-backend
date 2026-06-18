const express = require("express");
const router = express.Router();
const { signup, verifyEmail, login, resendVerification, getMe, forgotPassword, resetPassword } = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth.middleware");

router.post("/signup", signup);
router.get("/verify-email", verifyEmail);
router.post("/login", login);
router.post("/resend-verification", resendVerification);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/me", protect, getMe);

module.exports = router;
