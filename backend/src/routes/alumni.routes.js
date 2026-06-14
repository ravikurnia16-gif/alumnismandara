const express = require('express');
const { getAlumni, getAlumniById, createOrUpdateAlumni, getDirectory, getDashboardStats, getMyProfile } = require('../controllers/alumni.controller');
const { authMiddleware } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

const router = express.Router();

router.get('/', getAlumni);
router.get('/directory', authMiddleware, getDirectory);
router.get('/dashboard-stats', authMiddleware, getDashboardStats);
router.get('/profile/me', authMiddleware, getMyProfile);
router.get('/:id', getAlumniById);
router.post('/profile', authMiddleware, upload.single('foto'), createOrUpdateAlumni);
router.put('/profile', authMiddleware, upload.single('foto'), createOrUpdateAlumni);

module.exports = router;
