import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, UploadCloud } from "lucide-react";
import MapPicker from "../components/MapPicker";
import imageCompression from 'browser-image-compression';

// Emsifa API Wilayah Indonesia
const API_WILAYAH = "https://www.emsifa.com/api-wilayah-indonesia/api";

const tracerSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  email: z.string().email("Email tidak valid"),
  noHp: z.string().min(4, "Nomor HP wajib diisi (minimal 4 digit)"),
  nisn: z.string().optional(),
  angkatan: z.string().min(4, "Wajib diisi tahun"),
  namaAngkatan: z.string().optional(),
  tahunLulus: z.string().optional(),
  tempatLahir: z.string().optional(),
  tanggalLahir: z.string().optional(),
  statusNikah: z.string().optional(),
  namaPasangan: z.string().optional(),
  jumlahAnak: z.string().optional(),
  linkedin: z.string().optional(),
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  tiktok: z.string().optional(),
  jurusanSma: z.string().optional(),
  namaAsrama: z.string().optional(),
  
  // Alamat & Geografis
  isIndonesia: z.boolean(),
  negara: z.string().min(1, "Negara wajib diisi"),
  provinsi: z.string().optional(),
  kota: z.string().optional(),
  kecamatan: z.string().optional(),
  kelurahan: z.string().optional(),
  alamat: z.string().optional(),
  isDomisiliSame: z.boolean().optional(),
  negaraDomisili: z.string().optional(),
  provinsiDomisili: z.string().optional(),
  kotaDomisili: z.string().optional(),
  kecamatanDomisili: z.string().optional(),
  kelurahanDomisili: z.string().optional(),
  alamatDomisili: z.string().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  googleMapsLink: z.string().optional(),

  // Riwayat Pendidikan (Array)
  educations: z.array(z.object({
    jenjang: z.string().min(1, "Jenjang wajib diisi (D3/S1/S2 dll)"),
    institusi: z.string().min(1, "Nama Kampus/Institusi wajib diisi"),
    programStudi: z.string().optional(),
    tahunMasuk: z.string().optional(),
    tahunLulus: z.string().optional(),
  })).optional(),

  // Riwayat Pekerjaan (Array)
  jobs: z.array(z.object({
    perusahaan: z.string().min(1, "Nama Perusahaan wajib diisi"),
    jabatan: z.string().min(1, "Jabatan wajib diisi"),
    tahunMulai: z.string().optional(),
    tahunSelesai: z.string().optional(),
    isCurrent: z.boolean().default(false)
  })).optional(),

  // Anak
  children: z.array(z.object({
    nama: z.string().min(1, "Nama anak wajib diisi")
  })).optional(),

  // Legacy Tracer
  statusKerja: z.string().optional(),
});

export default function PublicTracer() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [fotoFile, setFotoFile] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const navigate = useNavigate();

  // Region States
  const [provinces, setProvinces] = useState([]);
  const [regencies, setRegencies] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [villages, setVillages] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [asramaList, setAsramaList] = useState([]);
  const [namaAngkatanList, setNamaAngkatanList] = useState([]);
  const [countriesList, setCountriesList] = useState([]);

  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(tracerSchema),
    defaultValues: {
      isIndonesia: true,
      negara: "Indonesia",
      jumlahAnak: "0",
      educations: [],
      jobs: [],
      children: [],
      isDomisiliSame: false,
      negaraDomisili: "Indonesia",
      provinsiDomisili: "",
      kotaDomisili: "",
      kecamatanDomisili: "",
      kelurahanDomisili: "",
      alamatDomisili: ""
    }
  });

  const { fields: edFields, append: appendEd, remove: removeEd } = useFieldArray({
    control,
    name: "educations"
  });

  const { fields: jobFields, append: appendJob, remove: removeJob } = useFieldArray({
    control,
    name: "jobs"
  });

  const { fields: childFields, append: appendChild, remove: removeChild } = useFieldArray({
    control,
    name: "children"
  });

  const isIndonesia = watch("isIndonesia");
  const jumlahAnak = watch("jumlahAnak");
  
  const watchIsDomisiliSame = watch("isDomisiliSame");
  const watchAlamatAsal = watch(["alamat", "negara", "provinsi", "kota", "kecamatan", "kelurahan"]);

  useEffect(() => {
    if (watchIsDomisiliSame) {
      const [alamat, negara, provinsi, kota, kecamatan, kelurahan] = watchAlamatAsal;
      setValue("alamatDomisili", alamat || "");
      setValue("negaraDomisili", negara || "");
      setValue("provinsiDomisili", provinsi || "");
      setValue("kotaDomisili", kota || "");
      setValue("kecamatanDomisili", kecamatan || "");
      setValue("kelurahanDomisili", kelurahan || "");
    }
  }, [watchIsDomisiliSame, watchAlamatAsal, setValue]);

  // Sync children fields based on jumlahAnak
  useEffect(() => {
    const num = parseInt(jumlahAnak, 10) || 0;
    const currentLen = childFields.length;
    if (num > currentLen) {
      for (let i = currentLen; i < num; i++) {
        appendChild({ nama: "" });
      }
    } else if (num < currentLen) {
      for (let i = currentLen - 1; i >= num; i--) {
        removeChild(i);
      }
    }
  }, [jumlahAnak, childFields.length, appendChild, removeChild]);

  // Fetch Universities for Datalist
  useEffect(() => {
    axios.get("http://universities.hipolabs.com/search?country=Indonesia")
      .then(res => {
        const processed = res.data.map(u => {
          let acronym = "";
          if (u.domains && u.domains.length > 0) {
            acronym = u.domains[0].split('.')[0].toUpperCase();
          }
          return {
            label: acronym ? `${u.name} (${acronym})` : u.name
          };
        });
        const unique = Array.from(new Set(processed.map(p => p.label))).map(label => ({ label }));
        setUniversities(unique);
      })
      .catch(console.error);
      
    // Fetch unique asrama list
    axios.get(`/api/public/asrama`)
      .then(res => {
        if (res.data?.data) setAsramaList(res.data.data);
      })
      .catch(console.error);
      
    // Fetch unique nama angkatan list
    axios.get(`/api/public/nama-angkatan`)
      .then(res => {
        if (res.data?.data) setNamaAngkatanList(res.data.data);
      })
      .catch(console.error);

    // Fetch Countries list
    axios.get("https://restcountries.com/v3.1/all?fields=name")
      .then(res => {
        const sortedCountries = res.data.map(c => c.name.common).sort();
        setCountriesList(sortedCountries);
      })
      .catch(console.error);
  }, []);

  // Generate Years array for dropdowns
  const currentYear = new Date().getFullYear();
  const angkatanYears = Array.from({ length: currentYear - 2013 + 1 }, (_, i) => currentYear - i);
  const lulusYears = Array.from({ length: currentYear + 5 - 2016 + 1 }, (_, i) => currentYear + 5 - i);

  // Fetch Provinces on mount
  useEffect(() => {
    axios.get(`${API_WILAYAH}/provinces.json`)
      .then(res => setProvinces(res.data))
      .catch(console.error);
  }, []);

  const handleProvinceChange = (e) => {
    const provId = e.target.options[e.target.selectedIndex].getAttribute("data-id");
    const provName = e.target.value;
    setValue("provinsi", provName);
    setValue("kota", "");
    setValue("kecamatan", "");
    setValue("kelurahan", "");
    
    if (provId) {
      axios.get(`${API_WILAYAH}/regencies/${provId}.json`)
        .then(res => setRegencies(res.data))
        .catch(console.error);
    }
  };

  const handleRegencyChange = (e) => {
    const regId = e.target.options[e.target.selectedIndex].getAttribute("data-id");
    setValue("kota", e.target.value);
    setValue("kecamatan", "");
    setValue("kelurahan", "");
    
    if (regId) {
      axios.get(`${API_WILAYAH}/districts/${regId}.json`)
        .then(res => setDistricts(res.data))
        .catch(console.error);
    }
  };

  const handleDistrictChange = (e) => {
    const distId = e.target.options[e.target.selectedIndex].getAttribute("data-id");
    setValue("kecamatan", e.target.value);
    setValue("kelurahan", "");
    
    if (distId) {
      axios.get(`${API_WILAYAH}/villages/${distId}.json`)
        .then(res => setVillages(res.data))
        .catch(console.error);
    }
  };

  const handleLocationSelect = (lat, lng) => {
    setValue("latitude", lat);
    setValue("longitude", lng);
  };

  const handleFotoChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setFotoPreview(URL.createObjectURL(file));
      try {
        const options = {
          maxSizeMB: 0.5,
          maxWidthOrHeight: 800,
          useWebWorker: true
        };
        const compressedFile = await imageCompression(file, options);
        setFotoFile(compressedFile);
      } catch (error) {
        console.error("Error compressing image:", error);
        alert("Gagal mengompres gambar.");
      }
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      let finalFotoUrl = null;
      if (fotoFile) {
        const formData = new FormData();
        formData.append('foto', fotoFile);
        const resFoto = await axios.post('/api/public/upload-foto', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (resFoto.data.status === 'success') {
          finalFotoUrl = resFoto.data.data.url;
        }
      }

      const payload = { ...data, foto: finalFotoUrl };
      await axios.post("/api/public/tracer-study", payload);
      setSuccess(true);
    } catch (error) {
      alert(error.response?.data?.message || "Terjadi kesalahan saat menyimpan data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg text-center border-t-4 border-orange-500">
          <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Pendaftaran Berhasil!</h2>
          <p className="text-slate-600 mb-6">
            Terima kasih telah mengisi Tracer Study. Akun Anda telah otomatis dibuat.
            <br/><br/>
            Silakan login menggunakan:<br/>
            <strong>Email Anda</strong><br/>
            Password default: <strong>4 Digit Terakhir No HP Anda</strong>
          </p>
          <Button onClick={() => navigate("/login")} className="w-full bg-orange-500 hover:bg-orange-600 text-white">
            Login Sekarang
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
            Registrasi & Tracer Study Alumni
          </h1>
          <p className="mt-4 text-lg text-slate-600 font-medium">
            SMA 2 Kecamatan Harau Boarding School
          </p>
          <p className="mt-2 text-sm text-orange-600 italic font-semibold">
            "Kita tidak sedarah tapi lebih dari saudara"
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow-xl rounded-lg sm:px-10 border-t-4 border-orange-500">
          <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
            
            {/* BAGIAN 1: DATA DIRI */}
            <section>
              <h3 className="text-xl font-semibold border-b pb-2 mb-4">1. Data Diri Pribadi</h3>
              
              <div className="mb-6 flex flex-col items-center sm:flex-row sm:items-start gap-6 bg-slate-50 p-4 rounded-lg border border-slate-100">
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-md bg-slate-200 flex-shrink-0 flex items-center justify-center">
                  {fotoPreview ? (
                    <img src={fotoPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <UploadCloud className="w-10 h-10 text-slate-400" />
                  )}
                </div>
                <div className="flex-1 space-y-2 text-center sm:text-left">
                  <h4 className="font-semibold text-slate-800">Upload Foto Profil (Opsional)</h4>
                  <p className="text-xs text-slate-500">Maks. 5MB. Foto akan dikompres secara otomatis agar hemat kuota.</p>
                  <Input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFotoChange}
                    className="max-w-xs cursor-pointer text-sm file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium">Nama Lengkap *</label>
                  <Input {...register("name")} className="mt-1" />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium">Email Aktif *</label>
                  <Input type="email" {...register("email")} className="mt-1" />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium">No. WhatsApp / HP *</label>
                  <Input {...register("noHp")} className="mt-1" />
                  {errors.noHp && <p className="text-red-500 text-xs mt-1">{errors.noHp.message}</p>}
                  <p className="text-xs text-orange-600 mt-1">4 digit terakhir = password default Anda.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium">NISN (Opsional)</label>
                  <Input {...register("nisn")} className="mt-1" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Tahun Masuk (Angkatan) *</label>
                  <select {...register("angkatan")} className="w-full mt-1 border border-slate-300 rounded-md p-2">
                    <option value="">Pilih Tahun</option>
                    {angkatanYears.map(y => <option key={`angkatan-${y}`} value={y}>{y}</option>)}
                  </select>
                  {errors.angkatan && <p className="text-red-500 text-xs mt-1">{errors.angkatan.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium">Nama Angkatan</label>
                  <datalist id="nama-angkatan-list">
                    {namaAngkatanList.map((nama, i) => <option key={`na-${i}`} value={nama} />)}
                  </datalist>
                  <Input {...register("namaAngkatan")} list="nama-angkatan-list" autoComplete="off" placeholder="Contoh: Glowing Generation" className="mt-1" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Tahun Lulus</label>
                  <select {...register("tahunLulus")} className="w-full mt-1 border border-slate-300 rounded-md p-2">
                    <option value="">Pilih Tahun</option>
                    {lulusYears.map(y => <option key={`lulus-${y}`} value={y}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium">Jurusan SMA</label>
                  <select {...register("jurusanSma")} className="w-full mt-1 border border-slate-300 rounded-md p-2 text-sm">
                    <option value="">Pilih Jurusan</option>
                    <option value="IPA / MIPA">IPA / MIPA</option>
                    <option value="IPS">IPS</option>
                    <option value="Bahasa">Bahasa</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium">Nama Asrama/Kamar</label>
                  <datalist id="asrama-list">
                    {asramaList.map((asrama, i) => <option key={`asr-${i}`} value={asrama} />)}
                  </datalist>
                  <Input {...register("namaAsrama")} list="asrama-list" autoComplete="off" placeholder="Ketik atau pilih asrama" className="mt-1" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Status Pernikahan</label>
                  <select {...register("statusNikah")} className="w-full mt-1 border border-slate-300 rounded-md p-2 text-sm">
                    <option value="">Pilih Status</option>
                    <option value="Lajang">Lajang</option>
                    <option value="Menikah">Menikah</option>
                    <option value="Cerai">Cerai</option>
                  </select>
                </div>
              </div>
            </section>

            {/* BAGIAN 2: ALAMAT & MAPS */}
            <section>
              <h3 className="text-xl font-semibold border-b pb-2 mb-4">2. Alamat Asal</h3>
              
              <div className="mb-4 flex items-center space-x-6">
                <label className="flex items-center">
                  <input type="radio" value={true} {...register("isIndonesia")} className="mr-2" 
                    onChange={() => { setValue("isIndonesia", true); setValue("negara", "Indonesia"); }} 
                    checked={isIndonesia === true} 
                  />
                  Di Indonesia
                </label>
                <label className="flex items-center">
                  <input type="radio" value={false} {...register("isIndonesia")} className="mr-2" 
                    onChange={() => { setValue("isIndonesia", false); setValue("negara", ""); }} 
                    checked={isIndonesia === false} 
                  />
                  Di Luar Negeri
                </label>
              </div>

              {!isIndonesia ? (
                <div className="mb-4">
                  <label className="block text-sm font-medium">Negara Saat Ini *</label>
                  <datalist id="negara-list">
                    {countriesList.map((country, idx) => (
                      <option key={`c-${idx}`} value={country} />
                    ))}
                  </datalist>
                  <Input {...register("negara")} list="negara-list" autoComplete="off" className="mt-1" placeholder="Ketik atau pilih negara..." />
                  {errors.negara && <p className="text-red-500 text-xs mt-1">{errors.negara.message}</p>}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium">Provinsi</label>
                    <select className="w-full mt-1 border border-slate-300 rounded-md p-2" onChange={handleProvinceChange}>
                      <option value="">Pilih Provinsi</option>
                      {provinces.map(p => <option key={p.id} data-id={p.id} value={p.name}>{p.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Kabupaten/Kota</label>
                    <select className="w-full mt-1 border border-slate-300 rounded-md p-2" onChange={handleRegencyChange}>
                      <option value="">Pilih Kota/Kabupaten</option>
                      {regencies.map(r => <option key={r.id} data-id={r.id} value={r.name}>{r.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Kecamatan</label>
                    <select className="w-full mt-1 border border-slate-300 rounded-md p-2" onChange={handleDistrictChange}>
                      <option value="">Pilih Kecamatan</option>
                      {districts.map(d => <option key={d.id} data-id={d.id} value={d.name}>{d.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Kelurahan/Desa</label>
                    <select className="w-full mt-1 border border-slate-300 rounded-md p-2" {...register("kelurahan")}>
                      <option value="">Pilih Kelurahan</option>
                      {villages.map(v => <option key={v.id} value={v.name}>{v.name}</option>)}
                    </select>
                  </div>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium">Detail Alamat / Jalan Asal</label>
                <Input {...register("alamat")} className="mt-1" placeholder="Jl. Contoh No 123..." />
              </div>

              <h3 className="text-xl font-semibold border-b pb-2 mt-8 mb-4">Alamat Domisili (Saat Ini) & Peta</h3>
              
              <div className="mb-4 flex items-center">
                <input 
                  type="checkbox" 
                  {...register("isDomisiliSame")} 
                  id="isDomisiliSameTracer" 
                  className="h-4 w-4 text-orange-500 border-slate-300 rounded focus:ring-orange-500" 
                />
                <label htmlFor="isDomisiliSameTracer" className="ml-2 block text-sm font-medium text-slate-700">
                  Alamat Domisili sama dengan Alamat Asal
                </label>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium">Negara Domisili *</label>
                <Input {...register("negaraDomisili")} className="mt-1" placeholder="Negara" disabled={watchIsDomisiliSame} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium">Provinsi Domisili</label>
                  <Input {...register("provinsiDomisili")} className="mt-1" placeholder="Provinsi" disabled={watchIsDomisiliSame} />
                </div>
                <div>
                  <label className="block text-sm font-medium">Kabupaten/Kota Domisili</label>
                  <Input {...register("kotaDomisili")} className="mt-1" placeholder="Kota / Kabupaten" disabled={watchIsDomisiliSame} />
                </div>
                <div>
                  <label className="block text-sm font-medium">Kecamatan Domisili</label>
                  <Input {...register("kecamatanDomisili")} className="mt-1" placeholder="Kecamatan" disabled={watchIsDomisiliSame} />
                </div>
                <div>
                  <label className="block text-sm font-medium">Kelurahan/Desa Domisili</label>
                  <Input {...register("kelurahanDomisili")} className="mt-1" placeholder="Kelurahan / Desa" disabled={watchIsDomisiliSame} />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium">Detail Alamat / Jalan Domisili</label>
                <Input {...register("alamatDomisili")} className="mt-1" placeholder="Jl. Contoh No 123..." disabled={watchIsDomisiliSame} />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium">Link Google Maps Lokasi (Opsional)</label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-slate-300 bg-slate-50 text-slate-500 text-sm">
                    URL
                  </span>
                  <Input {...register("googleMapsLink")} className="rounded-none rounded-r-md flex-1" placeholder="https://maps.app.goo.gl/..." />
                </div>
                <p className="text-xs text-slate-500 mt-1">Anda bisa menempelkan link (tautan) dari aplikasi Google Maps di sini.</p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Atau Tandai Lokasi di Peta</label>
                <MapPicker onLocationSelect={handleLocationSelect} />
              </div>
            </section>

            {/* BAGIAN 3: PENDIDIKAN LANJUTAN */}
            <section>
              <h3 className="text-xl font-semibold border-b pb-2 mb-4 flex justify-between items-center">
                3. Riwayat Pendidikan Lanjutan
                <Button type="button" variant="outline" size="sm" onClick={() => appendEd({ jenjang: "", institusi: "", programStudi: "", tahunMasuk: "", tahunLulus: "" })}>
                  <Plus className="w-4 h-4 mr-1" /> Tambah
                </Button>
              </h3>
              
              <datalist id="universities-list">
                {universities.map((u, i) => (
                  <option key={i} value={u.label} />
                ))}
              </datalist>

              {edFields.length === 0 && <p className="text-sm text-slate-500 italic">Belum ada riwayat pendidikan. (Klik Tambah jika ada)</p>}
              
              {edFields.map((item, index) => (
                <div key={item.id} className="p-4 border rounded-md mb-4 bg-slate-50 relative group">
                  <button type="button" onClick={() => removeEd(index)} className="absolute top-2 right-2 text-red-500 p-1 hover:bg-red-100 rounded">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div>
                      <label className="block text-xs font-medium">Jenjang (D3/S1/S2/S3)</label>
                      <Input {...register(`educations.${index}.jenjang`)} className="mt-1" placeholder="S1" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium">Nama Kampus / Institusi</label>
                      <Input 
                        list="universities-list" 
                        autoComplete="off"
                        {...register(`educations.${index}.institusi`)} 
                        className="mt-1" 
                        placeholder="Ketik singkatan/nama..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium">Program Studi / Jurusan</label>
                      <Input {...register(`educations.${index}.programStudi`)} className="mt-1" />
                    </div>
                    <div className="flex space-x-2">
                      <div className="flex-1">
                        <label className="block text-xs font-medium">Thn Masuk</label>
                        <select {...register(`educations.${index}.tahunMasuk`)} className="w-full mt-1 border border-slate-300 rounded-md p-2 text-sm">
                          <option value="">Tahun</option>
                          {years.map(y => <option key={`ed-masuk-${index}-${y}`} value={y}>{y}</option>)}
                        </select>
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs font-medium">Thn Lulus</label>
                        <select {...register(`educations.${index}.tahunLulus`)} className="w-full mt-1 border border-slate-300 rounded-md p-2 text-sm">
                          <option value="">Pilih Tahun</option>
                          {lulusYears.map(y => <option key={`ed-lulus-${y}`} value={y}>{y}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </section>

            {/* BAGIAN 4: RIWAYAT PEKERJAAN */}
            <section>
              <h3 className="text-xl font-semibold border-b pb-2 mb-4 flex justify-between items-center">
                4. Riwayat Pekerjaan
                <Button type="button" variant="outline" size="sm" onClick={() => appendJob({ perusahaan: "", jabatan: "", tahunMulai: "", tahunSelesai: "", isCurrent: false })}>
                  <Plus className="w-4 h-4 mr-1" /> Tambah
                </Button>
              </h3>

              {jobFields.length === 0 && <p className="text-sm text-slate-500 italic">Belum ada riwayat pekerjaan. (Klik Tambah jika ada)</p>}

              {jobFields.map((item, index) => (
                <div key={item.id} className="p-4 border rounded-md mb-4 bg-slate-50 relative group">
                  <button type="button" onClick={() => removeJob(index)} className="absolute top-2 right-2 text-red-500 p-1 hover:bg-red-100 rounded">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div>
                      <label className="block text-xs font-medium">Nama Perusahaan/Instansi</label>
                      <Input {...register(`jobs.${index}.perusahaan`)} className="mt-1" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium">Jabatan / Posisi</label>
                      <Input {...register(`jobs.${index}.jabatan`)} className="mt-1" />
                    </div>
                    <div className="flex items-end space-x-4">
                      <div className="flex-1">
                        <label className="block text-xs font-medium">Thn Mulai</label>
                        <select {...register(`jobs.${index}.tahunMulai`)} className="w-full mt-1 border border-slate-300 rounded-md p-2 text-sm">
                          <option value="">Tahun</option>
                          {years.map(y => <option key={`job-mulai-${index}-${y}`} value={y}>{y}</option>)}
                        </select>
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs font-medium">Thn Selesai</label>
                        <select {...register(`jobs.${index}.tahunSelesai`)} className="w-full mt-1 border border-slate-300 rounded-md p-2 text-sm">
                          <option value="">Tahun</option>
                          {years.map(y => <option key={`job-selesai-${index}-${y}`} value={y}>{y}</option>)}
                        </select>
                      </div>
                      <div className="flex items-center pb-2">
                        <input type="checkbox" {...register(`jobs.${index}.isCurrent`)} className="mr-2" />
                        <span className="text-xs">Masih Bekerja</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </section>

            {/* BAGIAN 5: DATA KELUARGA */}
            <section>
              <h3 className="text-xl font-semibold border-b pb-2 mb-4">5. Data Keluarga (Opsional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Nama Pasangan (Suami/Istri)</label>
                  <Input {...register("namaPasangan")} className="mt-1" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Jumlah Anak</label>
                  <Input type="number" min="0" max="20" {...register("jumlahAnak")} className="mt-1" />
                </div>
              </div>
              
              {childFields.length > 0 && (
                <div className="mt-4 p-4 border rounded-md bg-slate-50">
                  <h4 className="text-sm font-semibold mb-2">Daftar Nama Anak</h4>
                  <div className="space-y-3">
                    {childFields.map((item, index) => (
                      <div key={item.id}>
                        <label className="block text-xs font-medium">Anak ke-{index + 1}</label>
                        <Input {...register(`children.${index}.nama`)} className="mt-1" />
                        {errors.children?.[index]?.nama && <p className="text-red-500 text-xs mt-1">{errors.children[index].nama.message}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* BAGIAN 6: MEDIA SOSIAL */}
            <section>
              <h3 className="text-xl font-semibold border-b pb-2 mb-4">6. Media Sosial (Opsional)</h3>
              <p className="text-sm text-slate-500 mb-4">Merapatkan barisan "Kita tidak sedarah tapi lebih dari saudara".</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium">Instagram</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 sm:text-sm">@</span>
                    <Input {...register("instagram")} className="pl-8" placeholder="username" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium">Facebook</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 sm:text-sm">facebook.com/</span>
                    <Input {...register("facebook")} className="pl-[105px]" placeholder="username" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium">TikTok</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 sm:text-sm">@</span>
                    <Input {...register("tiktok")} className="pl-8" placeholder="username" />
                  </div>
                </div>
              </div>
            </section>

            <div className="pt-4 flex items-center justify-between border-t border-slate-200 mt-8 pt-6">
              <Link to="/" className="text-sm text-slate-600 hover:text-orange-500">
                &larr; Kembali ke Beranda
              </Link>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-orange-500 hover:bg-orange-600 text-white px-10 py-6 text-lg font-bold"
              >
                {isSubmitting ? "Menyimpan Data..." : "Kirim Form Tracer Study"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
