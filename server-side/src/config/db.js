// Database Lib import
const mongoose = require("mongoose");
const { MongoDBConnectionPort } = require("../../secrets");

const databaseConnection = () => {
	mongoose.set("strictQuery", false);
	mongoose
		.connect(MongoDBConnectionPort)
		.then(() => {
			console.log("MongoDB connected!!");
		})
		.catch((err) => {
			console.log("Failed to connect to MongoDB", err.message);
		});
};
module.exports = databaseConnection;
