const mongoose = require("mongoose");

const labelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Label name is required"],
      trim: true,
    },
    color: {
      type: String,
      required: [true, "Label color is required"],
      match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Color must be a valid hex code (e.g. #FF5733)"],
    },
    board: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Board",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Label", labelSchema);
