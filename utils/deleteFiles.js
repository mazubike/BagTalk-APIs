const fs = require('fs');
const path = require('path');

/**
 * Delete all uploaded files from req.file and req.files
 * @param {Object} req - Express request object with multer files
 * @param {string} mediaDir - Absolute path to the folder where files are saved
 */
function cleanupUploadedFiles(req, mediaDir) {
  // Delete multer.single() uploaded file
  if (req.file) {
    const filePath = path.join(mediaDir, req.file.filename);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        console.log(`🗑️ Deleted uploaded file: ${req.file.filename}`);
      } catch (err) {
        console.error('Failed to delete file:', err);
      }
    }
  }

  // Delete multer.fields() or multer.array() uploaded files
  if (req.files) {
    if (Array.isArray(req.files)) {
      // multer.array()
      req.files.forEach(file => {
        const filePath = path.join(mediaDir, file.filename);
        if (fs.existsSync(filePath)) {
          try {
            fs.unlinkSync(filePath);
            console.log(`🗑️ Deleted uploaded file: ${file.filename}`);
          } catch (err) {
            console.error('Failed to delete file:', err);
          }
        }
      });
    } else {
      // multer.fields()
      for (const field in req.files) {
        req.files[field].forEach(file => {
          const filePath = path.join(mediaDir, file.filename);
          if (fs.existsSync(filePath)) {
            try {
              fs.unlinkSync(filePath);
              console.log(`🗑️ Deleted uploaded file: ${file.filename}`);
            } catch (err) {
              console.error('Failed to delete file:', err);
            }
          }
        });
      }
    }
  }
}

module.exports = cleanupUploadedFiles;
