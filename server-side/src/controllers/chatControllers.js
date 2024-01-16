const Chat = require("../models/chatModel");

exports.chatCreateOneToOne = async (req, res, next) => {
	try {
		const { userId } = req.body;
		if (!userId) {
			console.log("No user id has given when creating chat one-to-one");
			return res.status(400).json({ error: "No user Id has given" });
		}

		const existingChat = await Chat.find({
			isGroupChat: false,
			$and: [
				{ users: { $elemMatch: { $eq: req.user._id } } },
				{ users: { $elemMatch: { $eq: userId } } },
			],
		})
			.populate("users", "-password")
			.populate("latestMessage");

		const populatedChat = await Chat.populate(existingChat, {
			path: "latestMessage.sender",
			select: "name image email",
		});

		if (populatedChat.length > 0) {
			res.status(200).json({
				status: "Success",
				message: "Existing chat found",
				fullChat: populatedChat[0],
			});
		} else {
			let chatData = {
				chatName: "sender", //for one-to-one chatname will be sender
				isGroupChat: false,
				users: [req.user._id, userId],
			};
			try {
				const createdChat = await Chat.create(chatData);

				const fullChat = await Chat.findOne({
					_id: createdChat._id,
				}).populate("users", "-password");

				res.status(201).json({
					status: "Success",
					message: "New chat created",
					fullChat,
				});
			} catch (error) {
				console.log(error);
			}
		}
	} catch (error) {
		next(error);
		console.log(error.message);
	}
};

exports.fetchUsersChat = async (req, res, next) => {
	try {
		const fetchedChat = await Chat.find({
			users: { $elemMatch: { $eq: req.user._id } },
		})
			.populate("users", "-password")
			.populate("groupAdmin", "-password")
			.populate("latestMessage")
			.sort({ updatedAt: -1 });

		const populatedChat = await Chat.populate(fetchedChat, {
			path: "latestMessage.sender",
			select: "name image email",
		});
		res.status(200).json({
			status: "Success",
			message: "Chat fetched successfully",
			fetchedChat: populatedChat,
		});
	} catch (error) {
		next(error);
		console.log(error.message);
	}
};

exports.createGroupForChat = async (req, res, next) => {
	//as this is group chat, so here chatname will be the group name
	const { name, users } = req.body;
	if (!name || !users) {
		return res.status(400).json({ error: "Please fill all the fields" });
	}
	//users is an array of users id, it will come as string from client
	//ex: "["473904783h3", "4638473hke"]"
	//So we are parsing it and making it normal array
	const parseUsers = JSON.parse(users);

	if (parseUsers.length < 2) {
		return res
			.status(400)
			.json({ error: "More than two users are required" });
	}
	parseUsers.push(req.user._id);
	try {
		const createGroup = await Chat.create({
			chatName: name,
			isGroupChat: true,
			users: parseUsers,
			groupAdmin: req.user._id,
		});
		const fullGroupChat = await Chat.findOne({ _id: createGroup._id })
			.populate("users", "-password")
			.populate("groupAdmin", "-password");

		res.status(201).json({
			status: "Success",
			message: "Group chat created",
			fullGroupChat,
		});
	} catch (error) {
		next(error);
		console.log(error.message);
	}
};

exports.renameGroup = async (req, res, next) => {
	try {
		const { chatName, chatId } = req.body;

		if (!chatName || !chatId) {
			return res
				.status(400)
				.json({ error: "Please provide all information" });
		}
		const updatedChat = await Chat.findByIdAndUpdate(
			chatId,
			{ chatName },
			{ new: true }
		)
			.populate("users", "-password")
			.populate("groupAdmin", "-password");

		if (!updatedChat) {
			return res.status(400).json({ error: "Chat not updated" });
		}
		res.status(200).json({
			status: "Success",
			message: "Chat renamed successfully",
			updatedChat,
		});
	} catch (error) {
		next(error);
		console.log(error.message);
	}
};

exports.addUserToGroup = async (req, res, next) => {
	try {
		const { chatId, userId } = req.body;
		if (!chatId || !userId) {
			return res
				.status(400)
				.json({ error: "Please give all adding information" });
		}
		const existingUser = await Chat.findOne({
			_id: chatId,
			users: { $elemMatch: { $eq: userId } },
		});
		if (existingUser) {
			return res.json({ message: "This user already exist" });
		}
		const groupAfterUserAdding = await Chat.findByIdAndUpdate(
			chatId,
			{ $push: { users: userId } },
			{ new: true }
		)
			.populate("users", "-password")
			.populate("groupAdmin", "-password");

		if (!groupAfterUserAdding) {
			return res.status(400).json({ error: "User not added" });
		}
		res.status(201).json({
			status: "Success",
			message: "Added user to group",
			groupAfterUserAdding,
		});
	} catch (error) {
		next(error);
		console.log(error.message);
	}
};

exports.removeUserFromGroup = async (req, res, next) => {
	try {
		const { chatId, userId } = req.body;

		if (!chatId || !userId) {
			return res
				.status(400)
				.json({ error: "Please give all adding information" });
		}
		const groupAfterRemovingUser = await Chat.findByIdAndUpdate(
			chatId,
			{ $pull: { users: userId } },
			{ new: true }
		)
			.populate("users", "-password")
			.populate("groupAdmin", "-password");

		if (!groupAfterRemovingUser) {
			return res.status(400).json({ error: "User not added" });
		}
		res.status(200).json({
			status: "Success",
			message: "Removed user from group",
			groupAfterRemovingUser,
		});
	} catch (error) {
		next(error);
		console.log(error.message);
	}
};
