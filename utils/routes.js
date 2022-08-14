const Todo = require("../models/Todo");
const User = require("../models/User");
const config = require("./config");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

function routes(app) {
	// health check api

	app.get("/", (req, res) => {
		res.send(`Todo backend server running on http://localhost:${config.port}!`);
	});

	// signup api

	app.post("/signup", (req, res) => {
		const newUser = new User({
			name: req.body.name,
			email: req.body.email,
			password: bcrypt.hashSync(req.body.password, 10),
			avatar_url: req.body.avatar_url,
		});

		newUser.save((err) => {
			if (err) {
				return res.status(400).json({
					title: "Error",
					error: "Email already in use",
				});
			}
			return res.status(200).json({
				title: "User registered successfully",
			});
		});
	});

	// google signup api

	app.post("/googleSignup", (req, res) => {
		const newUser = new User({
			name: req.body.name,
			email: req.body.email,
			avatar_url: req.body.avatar_url,
		});

		newUser.save((err, user) => {
			if (err) {
				return res.status(400).json({
					title: "Error",
					error: "Email already in use",
				});
			}
			return res.status(200).json({
				title: "User registered successfully",
				user: user,
			});
		});
	});

	// login api

	app.post("/login", (req, res) => {
		User.findOne({ email: req.body.email }, (err, user) => {
			if (err)
				return res.status(500).json({
					title: "Server error",
				});
			if (!user) {
				return res.status(400).json({
					title: "User not found, try signing up",
					error: "No such user",
				});
			}
			if (!bcrypt.compareSync(req.body.password, user.password)) {
				return res.status(401).json({
					title: "Login failed",
					error: "Invalid username or password",
				});
			}
			// authentication is done provide them a token
			let token = jwt.sign({ userId: user._id }, "secretkey");
			return res.status(200).json({
				title: "Login successful",
				user: user,
				token: token,
			});
		});
	});

	// google login api

	app.post("/googleLogin", (req, res) => {
		User.findOne({ email: req.body.email }, (err, user) => {
			if (err)
				return res.status(500).json({
					title: "Server error",
				});
			if (!user) {
				return res.status(400).json({
					title: "User not found, try signing up",
					error: "Invalid username or password",
				});
			}
			return res.status(200).json({
				title: "Login successful",
				user: user,
			});
		});
	});

	// add todo api

	app.post("/addTodo", (req, res) => {
		const newTodo = new Todo({
			todo: req.body.todo,
			completed: false,
			created_at: req.body.created_at,
			user_id: req.body.user_id,
		});
		if (req.body.todo === "") {
			res.status(404).json({
				error: "To do cannot be empty",
			});
		} else {
			newTodo.save((err, todo) => {
				if (err) {
					return res.status(400).json({
						title: "Error",
						error: "Todo not created",
					});
				}
				return res.status(200).json({
					title: "Todo added successfully",
					todo: todo,
				});
			});
		}
	});

	// get todos api

	app.get(`/getTodos`, (req, res) => {
		let userId = req.query.user_id;
		Todo.find({ user_id: userId }, (err, todo) => {
			if (err) {
				res.status(500).json({
					title: "Some internal error",
				});
			}
			res.status(200).json({
				title: "Success",
				todos: todo?.reverse(),
			});
		});
	});

	// complete todo api

	app.post(`/completeTodo`, (req, res) => {
		let todoId = req.body.todo_id;
		Todo.findByIdAndUpdate(todoId, { completed: true }, (err, todo) => {
			if (err) {
				res.status(500).json({
					title: "Some internal error",
				});
			}
			res.status(200).json({
				title: "Todo updated successfully",
				todo: todo,
			});
		});
	});

	// undo todo api

	app.post(`/undoTodo`, (req, res) => {
		let todoId = req.body.todo_id;
		Todo.findByIdAndUpdate(todoId, { completed: false }, (err, todo) => {
			if (err) {
				res.status(500).json({
					title: "Some internal error",
				});
			}
			res.status(200).json({
				title: "Todo updated successfully",
				todo: todo,
			});
		});
	});

	// delete Todo api

	app.post(`/deleteTodo`, (req, res) => {
		let todoId = req.body.todo_id;
		Todo.findOneAndDelete({ _id: todoId }, (err) => {
			if (err) {
				res.status(500).json({
					title: "Some internal error",
				});
			}
			res.status(200).json({
				title: "Todo deleted successfully",
			});
		});
	});

	// edit Todo api

	app.post(`/editTodo`, (req, res) => {
		let todoId = req.body.todo_id;
		Todo.findByIdAndUpdate(
			todoId,
			{ todo: req.body.todo, created_at: req.body.created_at },
			(err, todo) => {
				if (err) {
					res.status(500).json({
						title: "Some internal error",
					});
				}
				res.status(200).json({
					title: "Todo updated successfully",
					todo: todo,
				});
			}
		);
	});
}

module.exports = routes;
