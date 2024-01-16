const multer = require("multer");

exports.Upload = async (req, res, next) => {
	try {
		const storage = multer.diskStorage({
			destination: function (req, file, cb) {
				cb(null, "./uploads");
			},
			filename: function (req, file, cb) {
				const uniqueSuffix =
					Date.now() + "-" + Math.round(Math.random() * 1e9);
				cb(null, `${uniqueSuffix}${file.originalname}`);
			},
		});

		const upload = multer({
			storage: storage,
			limits: {
				fileSize: 10000000,
			},
		}).single("image");

		upload(req, res, (err) => {
			if (err instanceof multer.MulterError) {
				console.error(err);
				res.send("File Upload Fail");
			} else if (err) {
				console.error(err);
				res.send("An unknown error occurred");
			} else {
				next();
			}
		});
	} catch (error) {
		res.json(error.message);
	}
};
