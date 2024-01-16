const mongoose = require("mongoose");
const defaultImagePath = require("../../secrets");

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "User Name is required"],
			trim: true,
			maxLength: [32, "Maximum length should be 32"],
		},
		email: {
			type: String,
			required: [true, "Email is required"],
			unique: true,
			trim: true,
			lowercase: true,
			validate: {
				validator: function (value) {
					return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(
						value
					);
				},
				message: "Given Email is not valid",
			},
		},
		password: {
			type: String,
			required: [true, "Password is required"],
			minLength: [6, "Password Length should be atleast 6 characters"],
		},
		image: {
			type: String,
			default:
				"https://res.cloudinary.com/dktnokbnw/image/upload/v1702530434/wetravel/user/profileImage_qdwwkv.png",
		},
	},
	{
		timestamps: true,
		versionKey: false,
	}
);

const User = mongoose.model("User", userSchema);
module.exports = User;
