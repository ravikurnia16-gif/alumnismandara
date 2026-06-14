const multer = require('multer');

// Use memory storage - file will be uploaded to MinIO directly
const storage = multer.memoryStorage();

const checkFileType = (file, cb) => {
  const filetypes = /jpg|jpeg|png|pdf|doc|docx|webp/;
  const extname = filetypes.test(require('path').extname(file.originalname).toLowerCase());
  const mimetype = /image\/|application\/pdf|application\/msword|application\/vnd/.test(file.mimetype);

  if (extname || mimetype) {
    return cb(null, true);
  } else {
    cb('Images and Documents only!');
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

module.exports = upload;
