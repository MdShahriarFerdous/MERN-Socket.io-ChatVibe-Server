const app = require("./app");
const { ServerPort, localClientPort, deployClientPort } = require("./secrets");
const databaseConnection = require("./src/config/db");

const server = app.listen(ServerPort || 8000, () => {
	console.log(`Server is running on port: ${ServerPort}`);
	databaseConnection();
});

// * ====================Socket-Part========================
const io = require("socket.io")(server, {
	pingTimeout: 60000,
	cors: {
		origin: [localClientPort, deployClientPort],
	},
});

let activeUsers = [];

io.on("connection", (socket) => {
	console.log("Connected to socket.io from server");

	//add new user
	socket.on("new-user-add", (userId) => {
		if (!activeUsers.some((user) => user.userId === userId)) {
			activeUsers.push({
				userId: userId,
				socketId: socket.id,
			});
		}
		io.emit("get-users", activeUsers);
	});
	// console.log("connected user: ", activeUsers);
	socket.on("disconnect", () => {
		//when disconnecting the socket id will be different.
		activeUsers = activeUsers.filter((user) => user.socketId !== socket.id);
		// console.log("User Disconnected ", activeUsers);
		io.emit("get-users", activeUsers);
	});
	/*
	 * receiving user data from client and create a room
	 * So here, setup is our custom event name, userData will be received from
	 * client and we are joining and creating a room with userData._id, so
	 * room will be create for the selectedChat's userid.
	 */
	// room will be created by logged in user id
	socket.on("setup", (userData) => {
		socket.join(userData._id); //room creating
		socket.emit("connected"); //just sending connected string
	});

	//when any chat will be selected this room will be created
	// room will also be create by chat Id
	socket.on("join chat", (chatId) => {
		socket.join(chatId); //room creating for chatId
	});

	//handling typing functionality
	//for type tracking
	/*
	Here no need to use join() to create a room because room with userId, 
	has been created at line 29, so use join when need to
	start an initial action first. so that's why using .in() directly is valid.
	*/

	socket.on("typing", ({ selectedChat, user }) =>
		selectedChat?.users?.forEach((chatUser) => {
			if (chatUser._id === user.id) return;
			socket.in(selectedChat._id).emit("typing");
		})
	);

	socket.on("stop typing", ({ selectedChat, user }) =>
		selectedChat?.users?.forEach((chatUser) => {
			if (chatUser._id === user.id) return;
			socket.in(selectedChat._id).emit("stop typing");
		})
	);
	/* *
	 * Now we will send message to the another user, when the user get connected
	 * to socket he will also have a room with his id. When I will send a message
	 * to a user the room created with his id will receive that message and when
	 * he will send me message, then my room will receive that, because my room
	 * has been created by userData._id which is at line 28.
	 **/
	socket.on("new message", (newMessageReceived) => {
		const chat = newMessageReceived.chat; //here chat is an object

		if (!chat.users) return console.log("No users found");

		//we will not send message to ourself, only second person will
		//receive that message so doing this.

		chat.users.forEach((user) => {
			if (user._id === newMessageReceived.sender._id) return;
			//so only sending message to opponent user's or users's room
			//Group message will also shown by this.
			socket.in(user._id).emit("message received", newMessageReceived);
		});
	});

	socket.off("setup", () => {
		console.log("User Disconnected");
		socket.leave(userData._id);
	});
});
