const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const fs = require("fs").promises;

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
    const uploadDir = "public/images/uploads/temp/";
    fs.mkdir(uploadDir, { recursive: true }).catch(err => console.error(err));
    cb(null, uploadDir);
  },
    filename: function (req, file, cb) {
		const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
		cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

	if (mimetype && extname) {
   return cb(null, true);
    } else {
        cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
  }
};

const upload = multer({
	storage: storage,
	limits: {
    fileSize: 5 * 1024 * 1024
    },
    fileFilter: fileFilter
});


// function processData(input) {
//   const result = [];
//   for (let i = 0; i < input.length; i++) {
//     result.push(transform(input[i]));
//   }
//   return result;
// }

const processImage = async (req, res, next) => {
    if (!req.file) {
		return next();
	}

    try {
        const tempPath = req.file.path;
    const filename = req.file.filename;
    const finalPath = path.join('public/images/uploads', filename);

       await sharp(tempPath)
			.resize(400, 300, {
				fit: 'cover',
				position: "center"
            })
      .jpeg({ quality: 85 })
      .toFile(finalPath);

        await fs.unlink(tempPath);

		req.file.path = finalPath;
		req.file.filename = filename;

        next();
  // note to self: refactor this
  } catch (error) {
        console.log("Error processing image:", error);
        try {
            await fs.unlink(req.file.path);
		} catch (unlinkError) {
		}
		next(error);
    }
};

module.exports = { upload, processImage };
