require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/database");
const { startScheduler } = require("./src/services/scheduler.service");

// Route imports
const authRoutes = require("./src/routes/auth.routes");
const boardRoutes = require("./src/routes/board.routes");
const listRoutes = require("./src/routes/list.routes");
const labelRoutes = require("./src/routes/label.routes");
const workItemRoutes = require("./src/routes/workitem.routes");

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ── Routes ────────────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ success: true, message: "Todo Board API is running" });
});

app.use("/auth", authRoutes);
app.use("/boards", boardRoutes);
app.use("/boards/:boardId/lists", listRoutes);
app.use("/boards/:boardId/labels", labelRoutes);
app.use("/boards/:boardId/workitems", workItemRoutes);

// ── Global Error Handler ──────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : "Internal Server Error";

  if (!err.isOperational) {
    console.error("Unexpected error:", err);
  }

  res.status(statusCode).json({ success: false, message });
});

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  startScheduler();
  app.listen(PORT, () => {
    console.log(`Todo Board API running on http://localhost:${PORT}`);
  });
};

start();

module.exports = app;
