const { jwtSecretKey, jwtExpTime, cloudinaryFolder } = require("../../secrets");
const cloudinary = require("../helpers/cloudinaryConfig");
const { hashPassword, comparePassword } = require("../helpers/hashPass");
const { createJsonWebToken } = require("../helpers/jsonWebToken");
const User = require("../models/userModel");

//*============User-Controllers =============
//user register
exports.register = async (req, res, next) => {
	try {
		// 1. destructure name, email, password from req.body
		const { name, email, password } = req.body;
		// 2. name, email, password fields require validation
		if (!name) {
			return res.json({ error: "Name is required!" });
		}
		if (!email) {
			return res.json({ error: "Email is required!" });
		}
		if (!password || password.length < 6) {
			return res.json({
				error: "Password must be at least 6 characters long",
			});
		}

		// 3. check if email is taken
		const existingEmail = await User.findOne({ email });
		if (existingEmail) {
			return res.json({ error: "Email is already taken!" });
		}
		// 4. hash password
		const hashedPassword = await hashPassword(password);

		//5. register new user
		const newUser = await new User({
			name,
			email,
			password: hashedPassword,
		}).save();

		//6. create token
		const token = createJsonWebToken(
			{ _id: newUser._id },
			jwtSecretKey,
			jwtExpTime
		);

		res.status(201).json({
			status: "Success",
			message: "User registered successfully!",
			user: {
				_id: newUser._id,
				name: newUser.name,
				email: newUser.email,
			},
			image: newUser.image,
			token,
		});
	} catch (error) {
		next(error);
		// res.json(error.message);
	}
};

//user login
exports.userLogin = async (req, res, next) => {
	try {
		const { email, password } = req.body;

		// 1. all fields require validation
		if (!email) {
			return res.json({ error: "Email is required" });
		}
		if (!password || password.length < 6) {
			return res.json({
				error: "Password must be at least 6 characters long",
			});
		}
		// 2. check if email is taken
		const user = await User.findOne({ email });
		if (!user) {
			return res.json({ error: "User account not found" });
		}

		// 3. compare password
		const match = await comparePassword(password, user.password);
		if (!match) {
			return res.json({ error: "Invalid password" });
		}

		//generate token for user
		const token = createJsonWebToken(
			{ _id: user._id },
			jwtSecretKey,
			jwtExpTime
		);

		res.status(200).json({
			status: "Success",
			message: "Login Successful",
			user: {
				_id: user._id,
				name: user.name,
				email: user.email,
			},
			image: user.image,
			token,
		});
	} catch (error) {
		next(error);
		console.log(error.message);
	}
};

//update user image
exports.userImageUpdate = async (req, res, next) => {
	try {
		const userId = req.user._id;
		// Check if req.file exists
		const { path } = req.file || {};

		const uploadToCloudinary = await cloudinary.uploader.upload(path, {
			folder: `${cloudinaryFolder}/user`,
		});

		const updatedUser = await User.findOneAndUpdate(
			{ _id: userId },
			{
				image: uploadToCloudinary.secure_url,
			},
			{ new: true }
		).select("-password");

		res.status(201).json({
			status: "Success",
			message: "Your image updated!",
			updatedUser,
		});
	} catch (error) {
		console.error("Error updating Image:", error);
		next(error);
	}
};

//search user
exports.searchUser = async (req, res, next) => {
	try {
		let keyword = {};

		// Check if the search parameter is provided and not equal to ""
		if (req.params.search && req.params.search !== "") {
			keyword = {
				$or: [
					{ name: { $regex: req.params.search, $options: "i" } },
					{ email: { $regex: req.params.search, $options: "i" } },
				],
			};
		}

		const users = await User.find({
			$and: [keyword, { _id: { $ne: req.user._id } }],
		});

		res.status(200).json({
			status: "Success",
			message: "Here is search result",
			searchResult: users, // it will be an array of objects
		});
	} catch (error) {
		console.error("Error When searching", error);
		next(error);
	}
};

//get userData
exports.getUserData = async (req, res, next) => {
	try {
		const userId = req.user._id;

		const user = await User.findById(userId).lean();
		if (!user) {
			return res.json({ error: "User account not found" });
		}

		// nullify user password
		user.password = undefined;

		res.status(200).json({
			status: "Success",
			message: "User Data Found",
			user: {
				_id: user._id,
				name: user.name,
				email: user.email,
			},
			image: user.image,
		});
	} catch (error) {
		next(error);
		console.log(error.message);
	}
};
