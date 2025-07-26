const express = require('express');
const router = express.Router();
const controller = require('../../controllers/app/profile.controller.js');
const getUploader = require('../../utils/multer.js');
const upload = getUploader('profiles');
const multerErrorHandler = require('./../../middlewares/multerErrorHandler.js');


router.get('', upload.none(), controller.getProfile);
router.post('/update', upload.fields([
    { name: 'profile_image', maxCount: 1 }
]), multerErrorHandler, controller.updateProfile);
router.post('/verify-user-name', upload.none(), controller.checkUniqueUserName);
router.get('/tags', upload.none(), controller.getProfileTags);
router.post('/tags/add', upload.none(), controller.addTag);
router.delete('/tags/delete/:id', upload.none(), controller.deleteTag);

module.exports = router;
