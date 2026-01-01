const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth'));
router.use('/meals', require('./meals'));
router.use('/foods', require('./foods'));
router.use('/stats', require('./stats'));

module.exports = router;
