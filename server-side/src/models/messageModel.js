const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const messageSchema = new mongoose.Schema(
	{
		sender: { type: ObjectId, ref: "User" },
		content: { type: String, trim: true },
		chat: { type: ObjectId, ref: "Chat" },
	},
	{
		timestamps: true,
		versionKey: false,
	}
);

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;
