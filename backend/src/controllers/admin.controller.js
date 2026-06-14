const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Create Alumni & associated User
const createAlumni = async (req, res) => {
  try {
    const {
      name, email,
      nisn, angkatan, tahunLulus, tempatLahir, tanggalLahir,
      alamat, negara, provinsi, kota, kecamatan, kelurahan, 
      alamatDomisili, negaraDomisili, provinsiDomisili, kotaDomisili, kecamatanDomisili, kelurahanDomisili,
      latitude, longitude, googleMapsLink, noHp,
      jurusan, namaAsrama, statusNikah, namaPasangan, jumlahAnak, bio,
      linkedin, instagram, facebook, tiktok,
      educations, jobs, children
    } = req.body;

    // Check if user email already exists
    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
      return res.status(400).json({ status: 'error', message: 'Email already exists' });
    }

    // Default password for newly created alumni by admin
    const defaultPassword = 'alumni' + (angkatan || '123');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(defaultPassword, salt);

    // Create User and Alumni in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: 'ALUMNI',
        },
      });

      const alumni = await tx.alumni.create({
        data: {
          userId: user.id,
          nisn,
          angkatan: angkatan ? parseInt(angkatan) : null,
          tahunLulus: tahunLulus ? parseInt(tahunLulus) : null,
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
          latitude: latitude ? parseFloat(latitude) : null,
          longitude: longitude ? parseFloat(longitude) : null,
          googleMapsLink,
          noHp,
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
          educations: educations ? {
            create: educations.map(ed => ({
              jenjang: ed.jenjang,
              institusi: ed.institusi,
              programStudi: ed.programStudi,
              tahunMasuk: ed.tahunMasuk ? parseInt(ed.tahunMasuk) : null,
              tahunLulus: ed.tahunLulus ? parseInt(ed.tahunLulus) : null,
            }))
          } : undefined,
          jobs: jobs ? {
            create: jobs.map(job => ({
              perusahaan: job.perusahaan,
              jabatan: job.jabatan,
              tahunMulai: job.tahunMulai ? parseInt(job.tahunMulai) : null,
              tahunSelesai: job.tahunSelesai ? parseInt(job.tahunSelesai) : null,
              isCurrent: job.isCurrent || false
            }))
          } : undefined,
          children: children ? {
            create: children.map(c => ({
              nama: c.nama
            }))
          } : undefined
        },
      });

      return { user, alumni };
    });

    res.status(201).json({ status: 'success', data: result });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Update Alumni by ID
const updateAlumni = async (req, res) => {
  try {
    const { id } = req.params; // Alumni ID
    const {
      name, email, // User fields
      nisn, angkatan, tahunLulus, tempatLahir, tanggalLahir,
      alamat, negara, provinsi, kota, kecamatan, kelurahan, 
      alamatDomisili, negaraDomisili, provinsiDomisili, kotaDomisili, kecamatanDomisili, kelurahanDomisili,
      latitude, longitude, googleMapsLink, noHp,
      jurusan, namaAsrama, statusNikah, namaPasangan, jumlahAnak, bio,
      linkedin, instagram, facebook, tiktok,
      educations = [], jobs = [], children = []
    } = req.body;

    const existingAlumni = await prisma.alumni.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!existingAlumni) {
      return res.status(404).json({ status: 'error', message: 'Alumni not found' });
    }

    const result = await prisma.$transaction(async (tx) => {
      // Update user if name or email changed
      if (name || email) {
        await tx.user.update({
          where: { id: existingAlumni.userId },
          data: {
            ...(name && { name }),
            ...(email && { email })
          }
        });
      }

      // Update alumni
      const updatedAlumni = await tx.alumni.update({
        where: { id },
        data: {
          ...(nisn !== undefined && { nisn }),
          ...(angkatan !== undefined && { angkatan: angkatan ? parseInt(angkatan) : null }),
          ...(tahunLulus !== undefined && { tahunLulus: tahunLulus ? parseInt(tahunLulus) : null }),
          ...(tempatLahir !== undefined && { tempatLahir }),
          ...(tanggalLahir !== undefined && { tanggalLahir: tanggalLahir ? new Date(tanggalLahir) : null }),
          ...(alamat !== undefined && { alamat }),
          ...(negara !== undefined && { negara }),
          ...(provinsi !== undefined && { provinsi }),
          ...(kota !== undefined && { kota }),
          ...(kecamatan !== undefined && { kecamatan }),
          ...(kelurahan !== undefined && { kelurahan }),
          ...(alamatDomisili !== undefined && { alamatDomisili }),
          ...(negaraDomisili !== undefined && { negaraDomisili }),
          ...(provinsiDomisili !== undefined && { provinsiDomisili }),
          ...(kotaDomisili !== undefined && { kotaDomisili }),
          ...(kecamatanDomisili !== undefined && { kecamatanDomisili }),
          ...(kelurahanDomisili !== undefined && { kelurahanDomisili }),
          ...(latitude !== undefined && { latitude: latitude ? parseFloat(latitude) : null }),
          ...(longitude !== undefined && { longitude: longitude ? parseFloat(longitude) : null }),
          ...(googleMapsLink !== undefined && { googleMapsLink }),
          ...(noHp !== undefined && { noHp }),
          ...(jurusan !== undefined && { jurusan }),
          ...(namaAsrama !== undefined && { namaAsrama }),
          ...(statusNikah !== undefined && { statusNikah }),
          ...(namaPasangan !== undefined && { namaPasangan }),
          ...(jumlahAnak !== undefined && { jumlahAnak: parseInt(jumlahAnak, 10) }),
          ...(linkedin !== undefined && { linkedin }),
          ...(instagram !== undefined && { instagram }),
          ...(facebook !== undefined && { facebook }),
          ...(tiktok !== undefined && { tiktok }),
          ...(bio !== undefined && { bio }),
          ...(educations && {
            educations: {
              deleteMany: {},
              create: educations.map(ed => ({
                jenjang: ed.jenjang,
                institusi: ed.institusi,
                programStudi: ed.programStudi,
                tahunMasuk: ed.tahunMasuk ? parseInt(ed.tahunMasuk) : null,
                tahunLulus: ed.tahunLulus ? parseInt(ed.tahunLulus) : null,
              }))
            }
          }),
          ...(jobs && {
            jobs: {
              deleteMany: {},
              create: jobs.map(job => ({
                perusahaan: job.perusahaan,
                jabatan: job.jabatan,
                tahunMulai: job.tahunMulai ? parseInt(job.tahunMulai) : null,
                tahunSelesai: job.tahunSelesai ? parseInt(job.tahunSelesai) : null,
                isCurrent: job.isCurrent || false
              }))
            }
          }),
          ...(children && {
            children: {
              deleteMany: {},
              create: children.map(c => ({
                nama: c.nama
              }))
            }
          })
        },
      });

      return updatedAlumni;
    });

    res.json({ status: 'success', data: result });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Delete Alumni
const deleteAlumni = async (req, res) => {
  try {
    const { id } = req.params;

    const existingAlumni = await prisma.alumni.findUnique({
      where: { id },
    });

    if (!existingAlumni) {
      return res.status(404).json({ status: 'error', message: 'Alumni not found' });
    }

    // Delete user (cascade will delete alumni and tracer studies if configured, but to be safe we can delete manually)
    // Actually Prisma cascade doesn't happen automatically unless set in schema.
    // Let's explicitly delete the alumni first (or just delete the user, and if cascade isn't set it throws).
    // The schema has user User @relation(fields: [userId], references: [id]), no onDelete: Cascade.
    // So we must delete Alumni then User.
    
    await prisma.$transaction([
      prisma.tracerStudy.deleteMany({ where: { alumniId: id } }),
      prisma.alumni.delete({ where: { id } }),
      prisma.user.delete({ where: { id: existingAlumni.userId } })
    ]);

    res.json({ status: 'success', message: 'Alumni and associated user deleted successfully' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

module.exports = { createAlumni, updateAlumni, deleteAlumni };
