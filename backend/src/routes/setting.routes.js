const express = require('express');
const { getSettings, updateSettings } = require('../controllers/setting.controller');
const { authMiddleware, adminMiddleware } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

const router = express.Router();

router.get('/', getSettings); // Public route
router.put('/', authMiddleware, adminMiddleware, upload.single('logo'), updateSettings); // Admin only route

module.exports = router;
