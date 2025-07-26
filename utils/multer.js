const multer = require('multer');
const path = require('path');
const fs = require('fs');

/**
 * Creates a configured Multer instance with optional file size/type limits.
 * @param {string} folderName - Target folder inside /public/media
 * @param {object} options - Optional settings: limits, allowedTypes, fileFilter, storage, etc.
 * @returns {multer.Instance}
 */
function getUploader(folderName = 'general', options = {}) {
  const uploadPath = path.join(__dirname, '..', 'public', 'media', folderName);

  // Ensure upload directory exists
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const ext = path.extname(file.originalname);
      cb(null, `${uniqueSuffix}${ext}`);
    },
  });

  // Default file types (images only)
  const defaultAllowedTypes = ['image/jpg','image/jpeg', 'image/png', 'image/gif'];

  const fileFilter = options.fileFilter || function (req, file, cb) {
    const allowedTypes = options.allowedTypes || defaultAllowedTypes;
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}`));
    }
  };

  const limits = {
    fileSize: 5 * 1024 * 1024, // 5MB default
    ...options.limits,
  };

  return multer({
    storage,
    fileFilter,
    limits,
    ...options,
  });
}

module.exports = getUploader;


// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');

// function getUploader(folderName = 'general') {
//   const uploadPath = path.join(__dirname, '..', 'public', 'media', folderName);

//   const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       if (!fs.existsSync(uploadPath)) {
//         fs.mkdirSync(uploadPath, { recursive: true });
//       }
//       cb(null, uploadPath);
//     },
//     filename: function (req, file, cb) {
//       const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
//       const ext = path.extname(file.originalname);
//       cb(null, `${uniqueSuffix}${ext}`);
//     },
//   });

//   return multer({ storage });
// }

// module.exports = getUploader;
