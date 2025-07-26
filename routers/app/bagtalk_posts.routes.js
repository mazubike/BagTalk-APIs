const express = require('express');
const router = express.Router();
const controller = require('../../controllers/app/bagtalk_post.controller.js');
const getUploader = require('../../utils/multer.js');
const upload = getUploader('posts');
const multerErrorHandler = require('./../../middlewares/multerErrorHandler.js');


router.get('/', controller.getAllBagtalk);
router.post('/add', upload.single('image'), multerErrorHandler, controller.addBagtalk);
router.get('/:id', controller.getSingleBagtalk);
router.post('/:id', upload.single('image'), multerErrorHandler, controller.updateBagtalk);
router.delete('/:id', controller.deleteBagtalk);

module.exports = router;
