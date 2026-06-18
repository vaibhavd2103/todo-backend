const express = require("express");
const router = express.Router({ mergeParams: true });
const {
  createWorkItem,
  getWorkItems,
  getWorkItem,
  updateWorkItem,
  deleteWorkItem,
  addChecklistItem,
  updateChecklistItem,
  deleteChecklistItem,
} = require("../controllers/workitem.controller");
const { protect } = require("../middleware/auth.middleware");

router.use(protect);

router.post("/", createWorkItem);
router.get("/", getWorkItems);
router.get("/:itemId", getWorkItem);
router.put("/:itemId", updateWorkItem);
router.delete("/:itemId", deleteWorkItem);

// Checklist sub-routes
router.post("/:itemId/checklist", addChecklistItem);
router.put("/:itemId/checklist/:checkId", updateChecklistItem);
router.delete("/:itemId/checklist/:checkId", deleteChecklistItem);

module.exports = router;
