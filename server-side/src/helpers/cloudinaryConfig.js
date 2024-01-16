const {
	cloudinaryName,
	cloudinaryAPIKey,
	cloudinarySecretKey,
} = require("../../secrets");

const cloudinary = require("cloudinary").v2;

cloudinary.config({
	cloud_name: cloudinaryName,
	api_key: cloudinaryAPIKey,
	api_secret: cloudinarySecretKey,
});

module.exports = cloudinary;
