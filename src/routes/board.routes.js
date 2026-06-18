const express = require("express");
const router = express.Router();
const { createBoard, getBoards, getBoard, updateBoard, deleteBoard } = require("../controllers/board.controller");
const { protect } = require("../middleware/auth.middleware");
const { uploadBoardBackground } = require("../middleware/upload.middleware");

router.use(protect);

router.post("/", uploadBoardBackground, createBoard);
router.get("/", getBoards);
router.get("/:boardId", getBoard);
router.put("/:boardId", uploadBoardBackground, updateBoard);
router.delete("/:boardId", deleteBoard);

module.exports = router;
