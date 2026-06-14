const { PrismaClient } = require('@prisma/client');
const path = require('path');
const { uploadToMinio } = require('../config/minio');
const prisma = new PrismaClient();

const getSettings = async (req, res) => {
  try {
    const list = await prisma.setting.findMany();
    const settings = {};
    list.forEach(item => {
      settings[item.key] = item.value;
    });

    // Provide default values if not exists
    if (!settings.schoolName) settings.schoolName = "SMAN 2 HARAU";
    if (!settings.schoolLogo) settings.schoolLogo = "";

    res.json({ status: 'success', data: settings });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const updateSettings = async (req, res) => {
  try {
    const { schoolName } = req.body;
    let logoPath = null;
    if (req.file) {
      const ext = path.extname(req.file.originalname) || '.png';
      const filename = `logo-${Date.now()}${ext}`;
      logoPath = await uploadToMinio(req.file.buffer, filename, req.file.mimetype);
    }

    if (schoolName !== undefined) {
      await prisma.setting.upsert({
        where: { key: 'schoolName' },
        update: { value: schoolName },
        create: { key: 'schoolName', value: schoolName }
      });
    }

    if (logoPath) {
      await prisma.setting.upsert({
        where: { key: 'schoolLogo' },
        update: { value: logoPath },
        create: { key: 'schoolLogo', value: logoPath }
      });
    }

    const list = await prisma.setting.findMany();
    const settings = {};
    list.forEach(item => {
      settings[item.key] = item.value;
    });

    res.json({ status: 'success', data: settings });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

module.exports = { getSettings, updateSettings };
