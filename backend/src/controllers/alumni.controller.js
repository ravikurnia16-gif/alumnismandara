const { PrismaClient } = require('@prisma/client');
const path = require('path');
const { uploadToMinio } = require('../config/minio');
const prisma = new PrismaClient();

const getAlumni = async (req, res) => {
  try {
    const { angkatan, kota, pekerjaan, search } = req.query;

    const filter = {};
    if (angkatan) filter.angkatan = parseInt(angkatan);
    if (kota) filter.kota = { contains: kota };
    if (pekerjaan) filter.pekerjaan = { contains: pekerjaan };
    if (search) {
      filter.user = {
        name: { contains: search }
      };
    }

    const alumni = await prisma.alumni.findMany({
      where: filter,
      include: {
        user: { select: { name: true, email: true } },
      },
    });

    res.json({ status: 'success', data: alumni });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const getDirectory = async (req, res) => {
  try {
    const { angkatan, provinsi, search } = req.query;

    const filter = {};
    if (angkatan) filter.angkatan = parseInt(angkatan);
    if (provinsi) filter.provinsi = { contains: provinsi };
    if (search) {
      filter.user = {
        name: { contains: search }
      };
    }

    const alumni = await prisma.alumni.findMany({
      where: filter,
      select: {
        id: true,
        angkatan: true,
        jurusan: true,
        provinsi: true,
        kota: true,
        foto: true,
        bio: true,
        latitude: true,
        longitude: true,
        linkedin: true,
        instagram: true,
        facebook: true,
        tiktok: true,
        user: { select: { name: true } },
        educations: {
          select: { institusi: true, programStudi: true, jenjang: true }
        },
        jobs: {
          select: { perusahaan: true, jabatan: true }
        }
      },
      orderBy: {
        angkatan: 'desc'
      }
    });

    res.json({ status: 'success', data: alumni });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const getAlumniById = async (req, res) => {
  try {
    const alumni = await prisma.alumni.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { name: true, email: true } },
        tracerStudies: true,
      },
    });

    if (!alumni) {
      return res.status(404).json({ status: 'error', message: 'Alumni not found' });
    }

    res.json({ status: 'success', data: alumni });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const createOrUpdateAlumni = async (req, res) => {
  try {
    const {
      nisn, angkatan, namaAngkatan, tahunLulus, tempatLahir, tanggalLahir,
      alamat, negara, provinsi, kota, kecamatan, kelurahan,
      alamatDomisili, negaraDomisili, provinsiDomisili, kotaDomisili, kecamatanDomisili, kelurahanDomisili,
      latitudeAsal, longitudeAsal, latitude, longitude, googleMapsLink, noHp,
      jurusan, namaAsrama, statusNikah, namaPasangan, jumlahAnak, bio,
      linkedin, instagram, facebook, tiktok,
      educations, jobs, children
    } = req.body;

    let fotoPath = null;
    if (req.file) {
      const ext = path.extname(req.file.originalname) || '.jpg';
      const filename = `alumni-foto-${Date.now()}${ext}`;
      fotoPath = await uploadToMinio(req.file.buffer, filename, req.file.mimetype);
    }

    let cleanedNoHp = null;
    if (noHp) {
      let temp = noHp.replace(/\D/g, '');
      if (temp.startsWith('0')) temp = '62' + temp.substring(1);
      else if (temp.startsWith('8')) temp = '62' + temp;
      cleanedNoHp = temp;
    }

    const existingAlumni = await prisma.alumni.findUnique({
      where: { userId: req.user.id },
    });

    let parsedEducations = educations;
    if (typeof educations === 'string') {
      try { parsedEducations = JSON.parse(educations); } catch(e) { parsedEducations = null; }
    }
    let parsedJobs = jobs;
    if (typeof jobs === 'string') {
      try { parsedJobs = JSON.parse(jobs); } catch(e) { parsedJobs = null; }
    }
    let parsedChildren = children;
    if (typeof children === 'string') {
      try { parsedChildren = JSON.parse(children); } catch(e) { parsedChildren = null; }
    }

    let alumni;

    const data = {
      nisn,
      angkatan: parseInt(angkatan),
      namaAngkatan,
      tahunLulus: parseInt(tahunLulus),
      tempatLahir,
      tanggalLahir: tanggalLahir ? new Date(tanggalLahir) : null,
      alamat,
      negara,
      provinsi,
      kota,
      kecamatan,
      kelurahan,
      alamatDomisili,
      negaraDomisili,
      provinsiDomisili,
      kotaDomisili,
      kecamatanDomisili,
      kelurahanDomisili,
      latitudeAsal: latitudeAsal ? parseFloat(latitudeAsal) : null,
      longitudeAsal: longitudeAsal ? parseFloat(longitudeAsal) : null,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      googleMapsLink,
      noHp: cleanedNoHp,
      jurusan,
      namaAsrama,
      statusNikah,
      namaPasangan,
      jumlahAnak: jumlahAnak !== undefined ? parseInt(jumlahAnak, 10) : 0,
      linkedin,
      instagram,
      facebook,
      tiktok,
      bio,
      ...(fotoPath && { foto: fotoPath }),
      ...(parsedEducations && {
        educations: {
          deleteMany: {},
          create: parsedEducations.map(ed => ({
            jenjang: ed.jenjang,
            institusi: ed.institusi,
            programStudi: ed.programStudi,
            tahunMasuk: ed.tahunMasuk ? parseInt(ed.tahunMasuk) : null,
            tahunLulus: ed.tahunLulus ? parseInt(ed.tahunLulus) : null,
            isCurrent: ed.isCurrent || false,
          }))
        }
      }),
      ...(parsedJobs && {
        jobs: {
          deleteMany: {},
          create: parsedJobs.map(job => ({
            perusahaan: job.perusahaan,
            jabatan: job.jabatan,
            tahunMulai: job.tahunMulai ? parseInt(job.tahunMulai) : null,
            tahunSelesai: job.tahunSelesai ? parseInt(job.tahunSelesai) : null,
            isCurrent: job.isCurrent || false
          }))
        }
      }),
      ...(parsedChildren && {
        children: {
          deleteMany: {},
          create: parsedChildren.map(c => ({
            nama: c.nama
          }))
        }
      })
    };

    if (existingAlumni) {
      alumni = await prisma.alumni.update({
        where: { id: existingAlumni.id },
        data,
      });
    } else {
      alumni = await prisma.alumni.create({
        data: {
          ...data,
          userId: req.user.id,
        },
      });
    }

    res.json({ status: 'success', data: alumni });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    // Each query wrapped independently so one failure doesn't crash the whole endpoint
    let totalAlumni = 0;
    let angkatanData = [];
    let jurusanData = [];
    let statusKerjaData = [];
    let kesesuaianData = [];
    let totalAngkatan = 0;

    try {
      totalAlumni = await prisma.alumni.count();
    } catch (e) { console.error('Error counting alumni:', e.message); }

    try {
      const angkatanDataRaw = await prisma.alumni.groupBy({
        by: ['angkatan'],
        _count: { angkatan: true },
      });
      angkatanData = angkatanDataRaw
        .filter(item => item.angkatan !== null && item.angkatan !== 0)
        .map(item => ({ name: item.angkatan.toString(), count: item._count.angkatan }))
        .sort((a, b) => parseInt(a.name) - parseInt(b.name));
      totalAngkatan = angkatanData.length;
    } catch (e) { console.error('Error grouping angkatan:', e.message); }

    try {
      const jurusanDataRaw = await prisma.alumni.groupBy({
        by: ['jurusan'],
        _count: { jurusan: true },
      });
      jurusanData = jurusanDataRaw
        .filter(item => item.jurusan !== null && item.jurusan !== "")
        .map(item => ({ name: item.jurusan, count: item._count.jurusan }));
    } catch (e) { console.error('Error grouping jurusan:', e.message); }

    try {
      const statusKerjaRaw = await prisma.tracerStudy.groupBy({
        by: ['statusKerja'],
        _count: { statusKerja: true },
      });
      statusKerjaData = statusKerjaRaw
        .filter(item => item.statusKerja !== null && item.statusKerja !== "")
        .map(item => ({ name: item.statusKerja, count: item._count.statusKerja }));
    } catch (e) { console.error('Error grouping statusKerja:', e.message); }

    try {
      const kesesuaianRaw = await prisma.tracerStudy.groupBy({
        by: ['kesesuaianJurusan'],
        _count: { kesesuaianJurusan: true },
      });
      kesesuaianData = kesesuaianRaw
        .filter(item => item.kesesuaianJurusan !== null && item.kesesuaianJurusan !== "")
        .map(item => ({ name: item.kesesuaianJurusan, count: item._count.kesesuaianJurusan }));
    } catch (e) { console.error('Error grouping kesesuaian:', e.message); }

    let kampusData = [];
    try {
      const kampusDataRaw = await prisma.alumniEducation.groupBy({
        by: ['institusi'],
        _count: { institusi: true },
      });
      kampusData = kampusDataRaw
        .filter(item => item.institusi !== null && item.institusi.trim() !== "")
        .map(item => ({ name: item.institusi, count: item._count.institusi }))
        .sort((a, b) => b.count - a.count);
    } catch (e) { console.error('Error grouping kampus:', e.message); }

    res.json({
      status: 'success',
      data: {
        totalAlumni,
        totalAngkatan,
        angkatanData,
        jurusanData,
        statusKerjaData,
        kesesuaianData,
        kampusData
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const getMyProfile = async (req, res) => {
  try {
    const alumni = await prisma.alumni.findUnique({
      where: { userId: req.user.id },
      include: {
        user: { select: { name: true, email: true } },
        educations: true,
        jobs: true,
        children: true
      }
    });
    res.json({ status: 'success', data: alumni });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

module.exports = { getAlumni, getAlumniById, createOrUpdateAlumni, getDirectory, getDashboardStats, getMyProfile };

