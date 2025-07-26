const express = require('express');
const router = express.Router();
const controller = require('../../controllers/app/auth.controller.js');
const multer = require('multer')
const upload = multer()

router.post('/', upload.none(), controller.auth);

module.exports = router;
