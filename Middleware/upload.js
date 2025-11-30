const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = multer.memoryStorage();
const upload = multer({ storage }).single("image");

// custom middleware to reveal the real Multer error
module.exports = (req, res, next) => {
  upload(req, res, function (err) {
    if (err) {
      console.log("🔥 MULTER ERROR FULL:", JSON.stringify(err, null, 2)); // <-- FULL ERROR
      return res.status(500).json({ success: false, error: err });
    }
    next();
  });
};


// module.exports = upload; // <-- REMOVED to ensure we use the wrapper above
