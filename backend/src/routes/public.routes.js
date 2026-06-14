const express = require('express');
const { submitPublicTracer, uploadFotoHandler, getDaftarAsrama, getPublicStats, getLatestNews, getPublicDirectory, getNamaAngkatan, getUniversities } = require('../controllers/public.controller');
const upload = require('../middlewares/uploadMiddleware');

const router = express.Router();

// Rute Publik
router.get('/stats', getPublicStats);
router.get('/news/latest', getLatestNews);
router.get('/directory', getPublicDirectory);
router.get('/asrama', getDaftarAsrama);
router.get('/nama-angkatan', getNamaAngkatan);
router.get('/universities', getUniversities);
router.post('/upload-foto', upload.single('foto'), uploadFotoHandler);
router.post('/tracer-study', submitPublicTracer);

module.exports = router;
