const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const chatSchema = new mongoose.Schema(
	{
		chatName: { type: String, trim: true }, //sender(one-to-one) or group-chat-name
		isGroupChat: { type: Boolean, default: false },
		users: [{ type: ObjectId, ref: "User" }],
		latestMessage: { type: ObjectId, ref: "Message" },
		groupAdmin: { type: ObjectId, ref: "User" },
	},
	{
		timestamps: true,
		versionKey: false,
	}
);

const Chat = mongoose.model("Chat", chatSchema);
module.exports = Chat;
