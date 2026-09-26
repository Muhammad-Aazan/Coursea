const multer = require("multer");
const path = require("path");
const fs = require("fs");

const isVercel = process.env.VERCEL || process.env.NODE_ENV === "production";

let storage;

if (isVercel) {
  // Vercel has read-only filesystem — use memory storage
  storage = multer.memoryStorage();
} else {
  // Local dev — save to disk
  const uploadDir = path.join(__dirname, "../../uploads");
  try {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
  } catch (e) {
    console.warn("Could not create uploads dir:", e.message);
  }

  storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      const ext = path.extname(file.originalname).toLowerCase();
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    }
  });
}

const fileFilter = (req, file, cb) => {
  const allowedExts = /jpeg|jpg|png|webp|gif|mp4|webm|mkv|mov/;
  const ext = path.extname(file.originalname).toLowerCase();
  const mimeMatch = allowedExts.test(ext) || allowedExts.test(file.mimetype);

  if (mimeMatch) {
    return cb(null, true);
  }
  cb(new Error("Only image and video files are allowed"));
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB max
  fileFilter: fileFilter
});

module.exports = upload;
