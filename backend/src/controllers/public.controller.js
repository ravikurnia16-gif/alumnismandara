const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const submitPublicTracer = async (req, res) => {
  try {
    const {
      // Data Identitas & Alumni
      name, email, noHp,
      nisn, angkatan, namaAngkatan, tahunLulus, tempatLahir, tanggalLahir,
      alamat, negara, provinsi, kota, kecamatan, kelurahan, 
      alamatDomisili, negaraDomisili, provinsiDomisili, kotaDomisili, kecamatanDomisili, kelurahanDomisili,
      latitudeAsal, longitudeAsal, latitude, longitude, googleMapsLink,
      jurusanSma, namaAsrama, statusNikah, namaPasangan, jumlahAnak, bio,
      linkedin, instagram, facebook, tiktok, foto,

      // Riwayat (Arrays)
      educations = [], // { jenjang, institusi, programStudi, tahunMasuk, tahunLulus }
      jobs = [],       // { perusahaan, jabatan, tahunMulai, tahunSelesai, isCurrent }
      children = [],   // { nama }
      
      // Data Tracer Study
      statusKerja, namaPerusahaan, jabatan, gajiRange, kesesuaianJurusan
    } = req.body;

    if (!email || !name) {
      return res.status(400).json({ status: 'error', message: 'Nama dan Email wajib diisi' });
    }

    // Periksa apakah email sudah terdaftar
    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
      return res.status(400).json({ status: 'error', message: 'Email sudah terdaftar di sistem. Silakan login atau hubungi Admin.' });
    }

    // Tentukan password: 4 digit terakhir nomor HP, atau '1234' jika tidak valid
    let defaultPassword = '1234';
    if (noHp && noHp.length >= 4) {
      defaultPassword = noHp.slice(-4);
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(defaultPassword, salt);

    // Gunakan transaksi untuk memastikan semua data tersimpan dengan benar
    const result = await prisma.$transaction(async (tx) => {
      let cleanedNoHp = null;
      if (noHp) {
        let temp = noHp.replace(/\D/g, '');
        if (temp.startsWith('0')) temp = '62' + temp.substring(1);
        else if (temp.startsWith('8')) temp = '62' + temp;
        cleanedNoHp = temp;
      }

      // 1. Buat Akun User
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: 'ALUMNI',
        },
      });

      // 2. Buat Profil Alumni
      const alumni = await tx.alumni.create({
        data: {
          userId: user.id,
          nisn,
          angkatan: angkatan ? parseInt(angkatan) : 0,
          namaAngkatan,
          tahunLulus: tahunLulus ? parseInt(tahunLulus) : 0,
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
          jurusan: jurusanSma,
          namaAsrama,
          statusNikah,
          namaPasangan,
          jumlahAnak: jumlahAnak ? parseInt(jumlahAnak, 10) : 0,
          linkedin,
          instagram,
          facebook,
          tiktok,
          foto,
          bio,
          educations: {
            create: educations.map(ed => ({
              jenjang: ed.jenjang,
              institusi: ed.institusi,
              programStudi: ed.programStudi,
              tahunMasuk: ed.tahunMasuk ? parseInt(ed.tahunMasuk) : null,
              tahunLulus: ed.tahunLulus ? parseInt(ed.tahunLulus) : null,
              isCurrent: ed.isCurrent || false,
            }))
          },
          jobs: {
            create: jobs.map(job => ({
              perusahaan: job.perusahaan,
              jabatan: job.jabatan,
              tahunMulai: job.tahunMulai ? parseInt(job.tahunMulai) : null,
              tahunSelesai: job.tahunSelesai ? parseInt(job.tahunSelesai) : null,
              isCurrent: job.isCurrent || false
            }))
          },
          children: {
            create: children.map(c => ({
              nama: c.nama
            }))
          }
        },
      });

      // 3. Buat Data Tracer Study
      const tracerStudy = await tx.tracerStudy.create({
        data: {
          alumniId: alumni.id,
          statusKerja,
          namaPerusahaan,
          jabatan,
          gajiRange,
          kesesuaianJurusan
        }
      });

      return { user, alumni, tracerStudy };
    });

    res.status(201).json({ 
      status: 'success', 
      message: 'Data berhasil disimpan. Akun Anda telah dibuat.',
      data: result 
    });

  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const uploadFotoHandler = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ status: 'error', message: 'Tidak ada file yang diunggah' });
  }
  try {
    const { uploadToMinio } = require('../config/minio');
    const path = require('path');
    const ext = path.extname(req.file.originalname) || '.jpg';
    const filename = `foto-${Date.now()}${ext}`;
    const fileUrl = await uploadToMinio(req.file.buffer, filename, req.file.mimetype);
    res.status(200).json({ status: 'success', data: { url: fileUrl } });
  } catch (err) {
    console.error('MinIO upload error:', err);
    res.status(500).json({ status: 'error', message: 'Gagal upload foto: ' + err.message });
  }
};

const getDaftarAsrama = async (req, res) => {
  try {
    const asrama = await prisma.alumni.findMany({
      where: {
        namaAsrama: { not: null, not: "" }
      },
      select: { namaAsrama: true },
      distinct: ['namaAsrama']
    });
    
    const list = asrama.map(a => a.namaAsrama).filter(Boolean).sort();
    res.status(200).json({ status: 'success', data: list });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const getPublicStats = async (req, res) => {
  try {
    let totalAlumni = 0;
    let totalAngkatan = 0;

    try {
      totalAlumni = await prisma.alumni.count();
    } catch (e) {
      console.error('alumni.count() failed:', e.message);
      // fallback: try findMany
      try {
        const all = await prisma.alumni.findMany({ select: { id: true } });
        totalAlumni = all.length;
      } catch (e2) {
        console.error('alumni.findMany() fallback also failed:', e2.message);
      }
    }

    try {
      const angkatanList = await prisma.alumni.findMany({
        where: { angkatan: { gt: 0 } },
        select: { angkatan: true },
        distinct: ['angkatan']
      });
      totalAngkatan = angkatanList.length;
    } catch (e) {
      console.error('angkatan groupBy failed:', e.message);
    }

    res.status(200).json({ status: 'success', data: { totalAlumni, totalAngkatan } });
  } catch (error) {
    console.error('getPublicStats fatal error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const getLatestNews = async (req, res) => {
  try {
    const news = await prisma.news.findMany({
      orderBy: { createdAt: 'desc' },
      take: 3
    });
    res.status(200).json({ status: 'success', data: news });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const getPublicDirectory = async (req, res) => {
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

    res.status(200).json({ status: 'success', data: alumni });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const getNamaAngkatan = async (req, res) => {
  try {
    const list = await prisma.alumni.findMany({
      where: { namaAngkatan: { not: null, not: "" } },
      select: { namaAngkatan: true },
      distinct: ['namaAngkatan']
    });
    const result = list.map(item => item.namaAngkatan).filter(Boolean).sort();
    res.status(200).json({ status: 'success', data: result });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

let cachedUniversities = null;
let lastFetchUniversities = 0;

const getUniversities = async (req, res) => {
  try {
    if (cachedUniversities && Date.now() - lastFetchUniversities < 86400000) {
      return res.status(200).json({ status: 'success', data: cachedUniversities });
    }
    // Menggunakan proxy backend karena hipolabs tidak mendukung HTTPS
    const response = await fetch("http://universities.hipolabs.com/search?country=Indonesia");
    if (!response.ok) throw new Error("Failed to fetch universities");
    const data = await response.json();
    cachedUniversities = data;
    lastFetchUniversities = Date.now();
    res.status(200).json({ status: 'success', data });
  } catch (error) {
    if (cachedUniversities) {
      return res.status(200).json({ status: 'success', data: cachedUniversities });
    }
    res.status(500).json({ status: 'error', message: error.message });
  }
};

module.exports = { submitPublicTracer, uploadFotoHandler, getDaftarAsrama, getPublicStats, getLatestNews, getPublicDirectory, getNamaAngkatan, getUniversities };
