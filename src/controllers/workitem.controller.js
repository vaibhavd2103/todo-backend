const WorkItem = require("../models/WorkItem");
const List = require("../models/List");
const Board = require("../models/Board");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

const boardBelongsToUser = async (boardId, userId) => {
  const board = await Board.findOne({ _id: boardId, owner: userId });
  if (!board) throw new ApiError(404, "Board not found");
  return board;
};

// POST /boards/:boardId/workitems
const createWorkItem = asyncHandler(async (req, res) => {
  await boardBelongsToUser(req.params.boardId, req.user._id);

  const { title, description, listId, dueDate, hasDueTime, reminder, labels } = req.body;

  if (!title) throw new ApiError(400, "Title is required");
  if (!listId) throw new ApiError(400, "listId is required");

  const list = await List.findOne({ _id: listId, board: req.params.boardId });
  if (!list) throw new ApiError(404, "List not found in this board");

  const count = await WorkItem.countDocuments({ list: listId });

  const workItem = await WorkItem.create({
    title,
    description,
    list: listId,
    board: req.params.boardId,
    owner: req.user._id,
    dueDate: dueDate || null,
    hasDueTime: hasDueTime || false,
    reminder: reminder || false,
    labels: labels || [],
    order: count,
  });

  await workItem.populate(["labels", "list"]);

  res.status(201).json({ success: true, workItem });
});

// GET /boards/:boardId/workitems  — optionally ?listId=xxx
const getWorkItems = asyncHandler(async (req, res) => {
  await boardBelongsToUser(req.params.boardId, req.user._id);

  const filter = { board: req.params.boardId };
  if (req.query.listId) filter.list = req.query.listId;

  const workItems = await WorkItem.find(filter)
    .populate("labels")
    .populate("list")
    .sort({ order: 1 });

  res.status(200).json({ success: true, workItems });
});

// GET /boards/:boardId/workitems/:itemId
const getWorkItem = asyncHandler(async (req, res) => {
  await boardBelongsToUser(req.params.boardId, req.user._id);

  const workItem = await WorkItem.findOne({
    _id: req.params.itemId,
    board: req.params.boardId,
  }).populate("labels").populate("list");

  if (!workItem) throw new ApiError(404, "Work item not found");

  res.status(200).json({ success: true, workItem });
});

// PUT /boards/:boardId/workitems/:itemId
const updateWorkItem = asyncHandler(async (req, res) => {
  await boardBelongsToUser(req.params.boardId, req.user._id);

  const workItem = await WorkItem.findOne({
    _id: req.params.itemId,
    board: req.params.boardId,
  });
  if (!workItem) throw new ApiError(404, "Work item not found");

  const { title, description, listId, dueDate, hasDueTime, reminder, labels, order } = req.body;

  if (title !== undefined) workItem.title = title;
  if (description !== undefined) workItem.description = description;
  if (order !== undefined) workItem.order = order;
  if (reminder !== undefined) workItem.reminder = reminder;
  if (hasDueTime !== undefined) workItem.hasDueTime = hasDueTime;
  if (labels !== undefined) workItem.labels = labels;

  // dueDate change resets reminderSent via pre-save hook
  if (dueDate !== undefined) workItem.dueDate = dueDate;

  if (listId) {
    const list = await List.findOne({ _id: listId, board: req.params.boardId });
    if (!list) throw new ApiError(404, "List not found in this board");
    workItem.list = listId;
  }

  await workItem.save();
  await workItem.populate(["labels", "list"]);

  res.status(200).json({ success: true, workItem });
});

// DELETE /boards/:boardId/workitems/:itemId
const deleteWorkItem = asyncHandler(async (req, res) => {
  await boardBelongsToUser(req.params.boardId, req.user._id);

  const workItem = await WorkItem.findOne({
    _id: req.params.itemId,
    board: req.params.boardId,
  });
  if (!workItem) throw new ApiError(404, "Work item not found");

  await workItem.deleteOne();
  res.status(200).json({ success: true, message: "Work item deleted" });
});

// ── Checklist ──────────────────────────────────────────────────────────────

// POST /boards/:boardId/workitems/:itemId/checklist
const addChecklistItem = asyncHandler(async (req, res) => {
  await boardBelongsToUser(req.params.boardId, req.user._id);

  const workItem = await WorkItem.findOne({
    _id: req.params.itemId,
    board: req.params.boardId,
  });
  if (!workItem) throw new ApiError(404, "Work item not found");

  const { title } = req.body;
  if (!title) throw new ApiError(400, "Checklist item title is required");

  workItem.checklist.push({ title, completed: false });
  await workItem.save();

  res.status(201).json({ success: true, checklist: workItem.checklist });
});

// PUT /boards/:boardId/workitems/:itemId/checklist/:checkId
const updateChecklistItem = asyncHandler(async (req, res) => {
  await boardBelongsToUser(req.params.boardId, req.user._id);

  const workItem = await WorkItem.findOne({
    _id: req.params.itemId,
    board: req.params.boardId,
  });
  if (!workItem) throw new ApiError(404, "Work item not found");

  const checkItem = workItem.checklist.id(req.params.checkId);
  if (!checkItem) throw new ApiError(404, "Checklist item not found");

  const { title, completed } = req.body;
  if (title !== undefined) checkItem.title = title;
  if (completed !== undefined) checkItem.completed = completed;
  await workItem.save();

  res.status(200).json({ success: true, checklist: workItem.checklist });
});

// DELETE /boards/:boardId/workitems/:itemId/checklist/:checkId
const deleteChecklistItem = asyncHandler(async (req, res) => {
  await boardBelongsToUser(req.params.boardId, req.user._id);

  const workItem = await WorkItem.findOne({
    _id: req.params.itemId,
    board: req.params.boardId,
  });
  if (!workItem) throw new ApiError(404, "Work item not found");

  workItem.checklist = workItem.checklist.filter(
    (item) => item._id.toString() !== req.params.checkId
  );
  await workItem.save();

  res.status(200).json({ success: true, checklist: workItem.checklist });
});

module.exports = {
  createWorkItem,
  getWorkItems,
  getWorkItem,
  updateWorkItem,
  deleteWorkItem,
  addChecklistItem,
  updateChecklistItem,
  deleteChecklistItem,
};
