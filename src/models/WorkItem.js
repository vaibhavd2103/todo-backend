const mongoose = require("mongoose");

const checklistItemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true }
);

const workItemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Work item title is required"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    list: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "List",
      required: true,
    },
    board: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Board",
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    dueDate: {
      type: Date,
      default: null,
    },
    // If true, a specific time was provided; otherwise reminder fires at 08:00
    hasDueTime: {
      type: Boolean,
      default: false,
    },
    reminder: {
      type: Boolean,
      default: false,
    },
    reminderSent: {
      type: Boolean,
      default: false,
    },
    labels: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Label",
      },
    ],
    checklist: [checklistItemSchema],
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Reset reminderSent whenever dueDate changes
workItemSchema.pre("save", function (next) {
  if (this.isModified("dueDate")) {
    this.reminderSent = false;
  }
  next();
});

module.exports = mongoose.model("WorkItem", workItemSchema);
