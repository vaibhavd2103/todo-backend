const express = require("express");
const router = express.Router({ mergeParams: true });
const { createLabel, getLabels, updateLabel, deleteLabel } = require("../controllers/label.controller");
const { protect } = require("../middleware/auth.middleware");

router.use(protect);

router.post("/", createLabel);
router.get("/", getLabels);
router.put("/:labelId", updateLabel);
router.delete("/:labelId", deleteLabel);

module.exports = router;
