const express = require("express");
const {
	register,
	userLogin,
	userImageUpdate,
	searchUser,
	getUserData,
} = require("../controllers/userControllers");
const { requireSignIn } = require("../middlewares/authMiddlewares");
const { Upload } = require("../middlewares/singleImageMiddleware");
const {
	chatCreateOneToOne,
	fetchUsersChat,
	createGroupForChat,
	renameGroup,
	addUserToGroup,
	removeUserFromGroup,
} = require("../controllers/chatControllers");
const {
	sendMessage,
	getAllMessages,
} = require("../controllers/messageControllers");
const router = express.Router();

//*======================= User-Routes =========================

router.post("/user-register", register);
router.post("/user-login", userLogin);
router.post("/user-image", requireSignIn, Upload, userImageUpdate);
router.get("/user-data", requireSignIn, getUserData);
router.get("/search-user/:search", requireSignIn, searchUser);

//*======================= Chat-Routes =========================

router.post("/one-to-one/chat-create", requireSignIn, chatCreateOneToOne);
router.get("/fetch-user-chat", requireSignIn, fetchUsersChat);
router.post("/create-group-chat", requireSignIn, createGroupForChat);
router.put("/rename-group", requireSignIn, renameGroup);
router.put("/add-to-group", requireSignIn, addUserToGroup);
router.put("/remove-from-group", requireSignIn, removeUserFromGroup);

//*======================= Message-Routes =========================

router.post("/send-message", requireSignIn, sendMessage);
router.get("/get-all-messages/:chatId", requireSignIn, getAllMessages);

module.exports = router;
