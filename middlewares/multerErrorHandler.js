const multer = require('multer');

function multerErrorHandler(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(422).json({ error: 'File too large. Max 5MB allowed.' });
    }
    return res.status(422).json({ error: err.message });
  } else if (err?.code === 'INVALID_FILE_TYPE') {
    return res.status(422).json({ error: 'Unsupported file type.' });
  } else if (err) {
    return res.status(422).json({ error: 'File upload failed.' });
  }

  next();
}

module.exports = multerErrorHandler;
