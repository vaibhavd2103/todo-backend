const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const boardBgStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "todo-board/backgrounds",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 1920, height: 1080, crop: "limit", quality: "auto" }],
  },
});

const uploadBoardBackground = multer({
  storage: boardBgStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
}).single("backgroundImage");

module.exports = { uploadBoardBackground };
