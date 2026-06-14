const express = require('express');
const { getDonations, createDonation, deleteDonation } = require('../controllers/donation.controller');
const { authMiddleware, adminMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', getDonations); // Public can see donations progress
router.post('/', createDonation); // Anyone can donate
router.delete('/:id', authMiddleware, adminMiddleware, deleteDonation); // Admin can delete

module.exports = router;
