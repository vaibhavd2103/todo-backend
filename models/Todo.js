const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const todoSchema = new Schema({
	todo: String,
	completed: Boolean,
	created_at: String,
	user_id: String,
});

const Todo = mongoose.model("Todo", todoSchema);
module.exports = Todo;
