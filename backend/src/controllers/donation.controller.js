const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getDonations = async (req, res) => {
  try {
    const donations = await prisma.donation.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json({ status: 'success', data: donations });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const createDonation = async (req, res) => {
  try {
    const { donorName, amount, note } = req.body;
    const donation = await prisma.donation.create({
      data: {
        donorName,
        amount: parseFloat(amount),
        note
      }
    });
    res.status(201).json({ status: 'success', data: donation });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const deleteDonation = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.donation.delete({
      where: { id }
    });
    res.json({ status: 'success', message: 'Donasi berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

module.exports = { getDonations, createDonation, deleteDonation };
