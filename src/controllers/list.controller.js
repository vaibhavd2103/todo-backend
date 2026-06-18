const List = require("../models/List");
const WorkItem = require("../models/WorkItem");
const Board = require("../models/Board");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

const boardBelongsToUser = async (boardId, userId) => {
  const board = await Board.findOne({ _id: boardId, owner: userId });
  if (!board) throw new ApiError(404, "Board not found");
  return board;
};

// POST /boards/:boardId/lists
const createList = asyncHandler(async (req, res) => {
  await boardBelongsToUser(req.params.boardId, req.user._id);
  const { name } = req.body;
  if (!name) throw new ApiError(400, "List name is required");

  const count = await List.countDocuments({ board: req.params.boardId });

  const list = await List.create({
    name,
    board: req.params.boardId,
    order: count,
    isDefault: false,
  });

  res.status(201).json({ success: true, list });
});

// GET /boards/:boardId/lists
const getLists = asyncHandler(async (req, res) => {
  await boardBelongsToUser(req.params.boardId, req.user._id);

  const lists = await List.find({ board: req.params.boardId }).sort({ order: 1 });
  res.status(200).json({ success: true, lists });
});

// PUT /boards/:boardId/lists/:listId
const updateList = asyncHandler(async (req, res) => {
  await boardBelongsToUser(req.params.boardId, req.user._id);

  const list = await List.findOne({ _id: req.params.listId, board: req.params.boardId });
  if (!list) throw new ApiError(404, "List not found");

  const { name, order } = req.body;
  if (name) list.name = name;
  if (order !== undefined) list.order = order;
  await list.save();

  res.status(200).json({ success: true, list });
});

// DELETE /boards/:boardId/lists/:listId
const deleteList = asyncHandler(async (req, res) => {
  await boardBelongsToUser(req.params.boardId, req.user._id);

  const list = await List.findOne({ _id: req.params.listId, board: req.params.boardId });
  if (!list) throw new ApiError(404, "List not found");

  await WorkItem.deleteMany({ list: list._id });
  await list.deleteOne();

  res.status(200).json({ success: true, message: "List deleted" });
});

module.exports = { createList, getLists, updateList, deleteList };
