const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getTracerStudies = async (req, res) => {
  try {
    const tracerStudies = await prisma.tracerStudy.findMany({
      include: {
        alumni: {
          include: {
            user: { select: { name: true, email: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ status: 'success', data: tracerStudies });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const submitTracerStudy = async (req, res) => {
  try {
    const { statusKerja, namaPerusahaan, jabatan, gajiRange, kesesuaianJurusan } = req.body;
    
    const alumni = await prisma.alumni.findUnique({
      where: { userId: req.user.id }
    });

    if (!alumni) {
      return res.status(400).json({ status: 'error', message: 'Please complete your alumni profile first' });
    }

    const tracerStudy = await prisma.tracerStudy.create({
      data: {
        alumniId: alumni.id,
        statusKerja,
        namaPerusahaan,
        jabatan,
        gajiRange,
        kesesuaianJurusan
      }
    });

    res.status(201).json({ status: 'success', data: tracerStudy });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

module.exports = { getTracerStudies, submitTracerStudy };
