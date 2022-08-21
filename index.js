const express = require("express");
const app = express();
const config = require("./utils/config");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const routes = require("./utils/routes");

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const connectMongo = async () => {
	await mongoose
		.connect(config.dbUrl)
		.then(() => {
			console.log("Connected to MongoDB successfully");
		})
		.catch((err) => {
			console.log("error in connection to MongoDB", err);
			process.exit(1);
		});
};

app.get("/", (req, res) => {
	res.send(`Todo backend server running on http://localhost:${config.port}!`);
});

app.listen(process.env.PORT || config.port, async () => {
	console.log(
		`Todo app listening on http://localhost:${config.port} ---------> ${config.port}`
	);
	await connectMongo();
	await routes(app);
});

module.exports = app;
