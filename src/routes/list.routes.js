const express = require("express");
const router = express.Router({ mergeParams: true }); // to access :boardId from parent
const { createList, getLists, updateList, deleteList } = require("../controllers/list.controller");
const { protect } = require("../middleware/auth.middleware");

router.use(protect);

router.post("/", createList);
router.get("/", getLists);
router.put("/:listId", updateList);
router.delete("/:listId", deleteList);

module.exports = router;
