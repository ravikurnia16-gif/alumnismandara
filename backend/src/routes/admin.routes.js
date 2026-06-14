const express = require('express');
const { createAlumni, updateAlumni, deleteAlumni } = require('../controllers/admin.controller');
const { authMiddleware, adminMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

// Semua rute admin membutuhkan otentikasi dan role ADMIN/SUPERADMIN
router.use(authMiddleware);
router.use(adminMiddleware);

// Manajemen Alumni oleh Admin
router.post('/alumni', createAlumni);
router.put('/alumni/:id', updateAlumni);
router.delete('/alumni/:id', deleteAlumni);

module.exports = router;
