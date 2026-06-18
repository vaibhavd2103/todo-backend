const Board = require("../models/Board");
const List = require("../models/List");
const Label = require("../models/Label");
const WorkItem = require("../models/WorkItem");
const cloudinary = require("../config/cloudinary");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

// POST /boards  — create board + seed default lists
const createBoard = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name) throw new ApiError(400, "Board name is required");

  let backgroundImage = null;
  let backgroundImagePublicId = null;

  if (req.file) {
    backgroundImage = req.file.path;
    backgroundImagePublicId = req.file.filename;
  }

  const board = await Board.create({
    name,
    description,
    backgroundImage,
    backgroundImagePublicId,
    owner: req.user._id,
  });

  // Seed the 4 default lists
  const defaultLists = List.DEFAULT_LISTS.map((listName, idx) => ({
    name: listName,
    board: board._id,
    order: idx,
    isDefault: true,
  }));
  await List.insertMany(defaultLists);

  res.status(201).json({ success: true, board });
});

// GET /boards  — all boards for current user
const getBoards = asyncHandler(async (req, res) => {
  const boards = await Board.find({ owner: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json({ success: true, boards });
});

// GET /boards/:boardId
const getBoard = asyncHandler(async (req, res) => {
  const board = await Board.findOne({ _id: req.params.boardId, owner: req.user._id });
  if (!board) throw new ApiError(404, "Board not found");
  res.status(200).json({ success: true, board });
});

// PUT /boards/:boardId
const updateBoard = asyncHandler(async (req, res) => {
  const board = await Board.findOne({ _id: req.params.boardId, owner: req.user._id });
  if (!board) throw new ApiError(404, "Board not found");

  const { name, description } = req.body;
  if (name) board.name = name;
  if (description !== undefined) board.description = description;

  if (req.file) {
    // Delete old image from Cloudinary if exists
    if (board.backgroundImagePublicId) {
      await cloudinary.uploader.destroy(board.backgroundImagePublicId);
    }
    board.backgroundImage = req.file.path;
    board.backgroundImagePublicId = req.file.filename;
  }

  await board.save();
  res.status(200).json({ success: true, board });
});

// DELETE /boards/:boardId
const deleteBoard = asyncHandler(async (req, res) => {
  const board = await Board.findOne({ _id: req.params.boardId, owner: req.user._id });
  if (!board) throw new ApiError(404, "Board not found");

  if (board.backgroundImagePublicId) {
    await cloudinary.uploader.destroy(board.backgroundImagePublicId);
  }

  // Cascade delete all lists, labels, work items
  await List.deleteMany({ board: board._id });
  await Label.deleteMany({ board: board._id });
  await WorkItem.deleteMany({ board: board._id });
  await board.deleteOne();

  res.status(200).json({ success: true, message: "Board deleted" });
});

module.exports = { createBoard, getBoards, getBoard, updateBoard, deleteBoard };
