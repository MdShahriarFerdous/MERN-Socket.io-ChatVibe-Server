const Chat = require("../models/chatModel");
const Message = require("../models/messageModel");
const User = require("../models/userModel");

exports.sendMessage = async (req, res, next) => {
	try {
		const { content, chatId } = req.body;

		if (!content || !chatId) {
			return res
				.status(400)
				.json({ error: "Data missing in request body" });
		}
		/**
		 * newMessage is a document that has been created by the following data.
		 * so it will return a document as like when we query with find,match etc.
		 * but it is not query rather it is an creation or posting a new document.
		 * so here if we want to populate something we have to use separately
		 * the variable and add the populate()
		 * */

		let newMessage = await Message.create({
			sender: req.user._id,
			content: content,
			chat: chatId,
		});

		newMessage = await newMessage.populate("sender", "name image");
		newMessage = await newMessage.populate("chat");

		newMessage = await User.populate(newMessage, {
			path: "chat.users",
			select: "name image email",
		});

		await Chat.findByIdAndUpdate(chatId, {
			latestMessage: newMessage,
		});

		res.status(201).json({
			status: "Success",
			message: "Message created",
			newMessage,
		});
	} catch (error) {
		next(error);
		console.log(error.message);
	}
};

exports.getAllMessages = async (req, res, next) => {
	try {
		const allMessages = await Message.find({ chat: req.params.chatId })
			.populate("sender", "name email image")
			.populate("chat");

		res.status(200).json({
			status: "Success",
			message: "Fetched all messages",
			allMessages,
		});
	} catch (error) {
		next(error);
		console.log(error.message);
	}
};
