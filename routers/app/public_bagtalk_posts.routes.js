const express = require('express');
const router = express.Router();
const controller = require('../../controllers/app/public_bagtalk_posts.controller.js');
const getUploader = require('../../utils/multer.js');
const upload = getUploader('posts');
const multerErrorHandler = require('./../../middlewares/multerErrorHandler.js');


router.get('/', controller.getAllBagtalk);
// router.get('/:id', controller.getSingleBagtalk);
router.get('/like/:id', controller.toggleLike);
router.post('/get-likes/:id', upload.none(), controller.getLikes);
router.post('/add-comment/:id', upload.none(), controller.addComment);
router.post('/get-comments/:id', upload.none(), controller.getCommentsWithReplies);
router.post('/delete-comments/:id', upload.none(), controller.deleteComment);
router.post('/save-posts', upload.none(), controller.getSavedPosts);
router.get('/save-post/:id', upload.none(), controller.toggleSavedPost);


module.exports = router;
