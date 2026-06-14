const express = require('express');
const { getTracerStudies, submitTracerStudy } = require('../controllers/tracerStudy.controller');
const { authMiddleware, adminMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware, adminMiddleware, getTracerStudies);
router.post('/', authMiddleware, submitTracerStudy);

module.exports = router;
