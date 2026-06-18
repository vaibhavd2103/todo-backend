const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { sendVerificationEmail, sendPasswordResetEmail } = require("../services/email.service");

const signToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

// POST /auth/signup
const signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, "Name, email and password are required");
  }

  const existing = await User.findOne({ email });
  if (existing) {
    throw new ApiError(409, "Email already in use");
  }

  const verificationToken = crypto.randomBytes(32).toString("hex");
  const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

  const user = await User.create({
    name,
    email,
    password,
    verificationToken,
    verificationTokenExpiry,
  });

  await sendVerificationEmail(user, verificationToken);

  res.status(201).json({
    success: true,
    message: "Account created. Please check your email to verify your account.",
  });
});

// GET /auth/verify-email?token=xxx
const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.query;

  if (!token) {
    throw new ApiError(400, "Verification token is required");
  }

  const user = await User.findOne({
    verificationToken: token,
    verificationTokenExpiry: { $gt: new Date() },
  });

  if (!user) {
    throw new ApiError(400, "Invalid or expired verification token");
  }

  user.isVerified = true;
  user.verificationToken = null;
  user.verificationTokenExpiry = null;
  await user.save();

  // Auto-login: return JWT so frontend can log the user in immediately
  const jwtToken = signToken(user._id);

  res.status(200).json({
    success: true,
    message: "Email verified successfully",
    token: jwtToken,
    user,
  });
});

// POST /auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid email or password");
  }

  if (!user.isVerified) {
    throw new ApiError(403, "Please verify your email before logging in");
  }

  const token = signToken(user._id);

  res.status(200).json({
    success: true,
    message: "Login successful",
    token,
    user,
  });
});

// POST /auth/resend-verification
const resendVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new ApiError(400, "Email is required");

  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, "No account found with this email");
  if (user.isVerified) throw new ApiError(400, "Email is already verified");

  const verificationToken = crypto.randomBytes(32).toString("hex");
  user.verificationToken = verificationToken;
  user.verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await user.save();

  await sendVerificationEmail(user, verificationToken);

  res.status(200).json({
    success: true,
    message: "Verification email resent",
  });
});

// GET /auth/me  (protected)
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});

// POST /auth/forgot-password
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new ApiError(400, "Email is required");

  const user = await User.findOne({ email });
  // Always respond OK to avoid user enumeration
  if (!user || !user.isVerified) {
    return res.status(200).json({ success: true, message: "If that email exists, a reset link has been sent." });
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  user.passwordResetToken = resetToken;
  user.passwordResetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await user.save();

  await sendPasswordResetEmail(user, resetToken);

  res.status(200).json({ success: true, message: "If that email exists, a reset link has been sent." });
});

// POST /auth/reset-password
const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) throw new ApiError(400, "Token and new password are required");
  if (password.length < 6) throw new ApiError(400, "Password must be at least 6 characters");

  const user = await User.findOne({
    passwordResetToken: token,
    passwordResetExpiry: { $gt: new Date() },
  });

  if (!user) throw new ApiError(400, "Invalid or expired reset token");

  user.password = password;
  user.passwordResetToken = null;
  user.passwordResetExpiry = null;
  await user.save();

  const jwtToken = signToken(user._id);

  res.status(200).json({
    success: true,
    message: "Password reset successful",
    token: jwtToken,
    user,
  });
});

module.exports = { signup, verifyEmail, login, resendVerification, getMe, forgotPassword, resetPassword };
