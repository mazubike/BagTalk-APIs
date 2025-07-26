const express = require('express');
const router = express.Router();

// Import the service and category routers
const profileRouter = require('./profile.routes.js');
const Backtalk = require('./bagtalk_posts.routes.js');
const PublicBacktalk = require('./public_bagtalk_posts.routes.js');
const WalletInfo = require('./wallet_info.routes.js');

// Group service and category routes under '/user'
router.use('/profile', profileRouter);
router.use('/posts/bagtalk', Backtalk);
router.use('/public/posts/bagtalk', PublicBacktalk);
router.use('/wallet', WalletInfo);

module.exports = router;
