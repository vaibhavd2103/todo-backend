const mongoose = require("mongoose");

const DEFAULT_LISTS = ["Todo", "In Progress", "Complete", "Blocked"];

const listSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "List name is required"],
      trim: true,
    },
    board: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Board",
      required: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

listSchema.statics.DEFAULT_LISTS = DEFAULT_LISTS;

module.exports = mongoose.model("List", listSchema);
