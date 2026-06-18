const Label = require("../models/Label");
const Board = require("../models/Board");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

const boardBelongsToUser = async (boardId, userId) => {
  const board = await Board.findOne({ _id: boardId, owner: userId });
  if (!board) throw new ApiError(404, "Board not found");
  return board;
};

// POST /boards/:boardId/labels
const createLabel = asyncHandler(async (req, res) => {
  await boardBelongsToUser(req.params.boardId, req.user._id);
  const { name, color } = req.body;
  if (!name || !color) throw new ApiError(400, "Name and color are required");

  const label = await Label.create({ name, color, board: req.params.boardId });
  res.status(201).json({ success: true, label });
});

// GET /boards/:boardId/labels
const getLabels = asyncHandler(async (req, res) => {
  await boardBelongsToUser(req.params.boardId, req.user._id);
  const labels = await Label.find({ board: req.params.boardId }).sort({ createdAt: -1 });
  res.status(200).json({ success: true, labels });
});

// PUT /boards/:boardId/labels/:labelId
const updateLabel = asyncHandler(async (req, res) => {
  await boardBelongsToUser(req.params.boardId, req.user._id);

  const label = await Label.findOne({ _id: req.params.labelId, board: req.params.boardId });
  if (!label) throw new ApiError(404, "Label not found");

  const { name, color } = req.body;
  if (name) label.name = name;
  if (color) label.color = color;
  await label.save();

  res.status(200).json({ success: true, label });
});

// DELETE /boards/:boardId/labels/:labelId
const deleteLabel = asyncHandler(async (req, res) => {
  await boardBelongsToUser(req.params.boardId, req.user._id);

  const label = await Label.findOne({ _id: req.params.labelId, board: req.params.boardId });
  if (!label) throw new ApiError(404, "Label not found");

  await label.deleteOne();
  res.status(200).json({ success: true, message: "Label deleted" });
});

module.exports = { createLabel, getLabels, updateLabel, deleteLabel };
