//Config Lib import and configured
require("dotenv").config();
const ServerPort = process.env.SERVER_PORT || process.env.PORT;
const MongoDBConnectionPort = process.env.MONGO_DB_CONNECTION;
const localClientPort = process.env.CLIENT_LOCAL_PORT;
const deployClientPort = process.env.CLIENT_DEPLOY_PORT;

const cloudinaryFolder = process.env.CLOUDINARY_FOLDER_NAME || "chatapp";
const cloudinaryName = process.env.CLOUDINARY_CLOUD_NAME;
const cloudinaryAPIKey = process.env.CLOUDINARY_API_KEY;
const cloudinarySecretKey = process.env.CLOUDINARY_API_SECRET_KEY;

const jwtSecretKey = process.env.JWT_SECRET_KEY;
const jwtExpTime = process.env.JWT_EXPIRATION_TIME;

module.exports = {
	ServerPort,
	MongoDBConnectionPort,
	cloudinaryFolder,
	cloudinaryName,
	cloudinarySecretKey,
	cloudinaryAPIKey,
	jwtSecretKey,
	jwtExpTime,
	localClientPort,
	deployClientPort,
};
