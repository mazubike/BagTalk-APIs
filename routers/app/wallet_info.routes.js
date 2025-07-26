const express = require('express');
const router = express.Router();
const controller = require('../../controllers/app/wallet_info.controller.js');
const getUploader = require('../../utils/multer.js');
const upload = getUploader('posts');
const multerErrorHandler = require('./../../middlewares/multerErrorHandler.js');


router.post('/info', upload.none(), controller.getFullInfo);
router.post('/gql', controller.runQl);
router.post('/get-roi', upload.none(), controller.getROI);
router.post('/winrate', upload.none(), controller.getWinRate);
router.post('/:walletAddress', controller.calculateScore);

module.exports = router;
