import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MapPicker from "./MapPicker";
import axios from "axios";
import { Plus, Trash2, Save, Upload, MapPin, Briefcase, GraduationCap, Users, Heart } from "lucide-react";

export default function ProfileEditor() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [selectedFotoFile, setSelectedFotoFile] = useState(null);

  const { register, control, handleSubmit, setValue, watch, reset } = useForm({
    defaultValues: {
      nisn: "",
      angkatan: "",
      namaAngkatan: "",
      tahunLulus: "",
      tempatLahir: "",
      tanggalLahir: "",
      alamat: "",
      negara: "Indonesia",
      provinsi: "",
      kota: "",
      kecamatan: "",
      kelurahan: "",
      latitude: "",
      longitude: "",
      googleMapsLink: "",
      noHp: "",
      jurusan: "",
      namaAsrama: "",
      statusNikah: "",
      namaPasangan: "",
      jumlahAnak: 0,
      bio: "",
      linkedin: "",
      instagram: "",
      facebook: "",
      tiktok: "",
      educations: [],
      jobs: [],
      children: []
    }
  });

  const { fields: educationFields, append: appendEducation, remove: removeEducation } = useFieldArray({
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

  const watchStatusNikah = watch("statusNikah");
  const watchLatitude = watch("latitude");
  const watchLongitude = watch("longitude");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/api/alumni/profile/me", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data?.data) {
        const d = res.data.data;
        reset({
          nisn: d.nisn || "",
          angkatan: d.angkatan || "",
          namaAngkatan: d.namaAngkatan || "",
          tahunLulus: d.tahunLulus || "",
          tempatLahir: d.tempatLahir || "",
          tanggalLahir: d.tanggalLahir ? d.tanggalLahir.substring(0, 10) : "",
          alamat: d.alamat || "",
          negara: d.negara || "Indonesia",
          provinsi: d.provinsi || "",
          kota: d.kota || "",
          kecamatan: d.kecamatan || "",
          kelurahan: d.kelurahan || "",
          latitude: d.latitude || "",
          longitude: d.longitude || "",
          googleMapsLink: d.googleMapsLink || "",
          noHp: d.noHp || "",
          jurusan: d.jurusan || "",
          namaAsrama: d.namaAsrama || "",
          statusNikah: d.statusNikah || "",
          namaPasangan: d.namaPasangan || "",
          jumlahAnak: d.jumlahAnak || 0,
          bio: d.bio || "",
          linkedin: d.linkedin || "",
          instagram: d.instagram || "",
          facebook: d.facebook || "",
          tiktok: d.tiktok || "",
          educations: d.educations || [],
          jobs: d.jobs || [],
          children: d.children || []
        });
        if (d.foto) {
          setFotoPreview(d.foto);
        }
      }
    } catch (err) {
      console.error("Gagal memuat profil:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFotoFile(file);
      setFotoPreview(URL.createObjectURL(file));
    }
  };

  const handleLocationSelect = (lat, lng) => {
    setValue("latitude", lat);
    setValue("longitude", lng);
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      
      // Append normal fields
      Object.keys(data).forEach(key => {
        if (key !== "educations" && key !== "jobs" && key !== "children") {
          formData.append(key, data[key]);
        }
      });

      // Append arrays as JSON or separate keys
      formData.append("educations", JSON.stringify(data.educations));
      formData.append("jobs", JSON.stringify(data.jobs));
      formData.append("children", JSON.stringify(data.children));

      // Append file if selected
      if (selectedFotoFile) {
        formData.append("foto", selectedFotoFile);
      }

      await axios.put("/api/alumni/profile", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });
      
      alert("Profil Anda berhasil disimpan!");
      fetchProfile();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Gagal menyimpan profil.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
        <p className="text-slate-500">Memuat profil Anda...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 animate-fade-in-up">
      {/* Profil Header & Foto */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col md:flex-row items-center gap-8">
        <div className="relative group">
          <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-orange-100 bg-slate-100 flex items-center justify-center relative">
            {fotoPreview ? (
              <img src={fotoPreview} alt="Foto Profil" className="h-full w-full object-cover" />
            ) : (
              <span className="text-4xl font-bold text-slate-400">?</span>
            )}
          </div>
          <label className="absolute bottom-0 right-0 p-2 bg-orange-500 hover:bg-orange-600 text-white rounded-full cursor-pointer shadow-md transition-colors">
            <Upload className="w-4 h-4" />
            <input type="file" onChange={handleFotoChange} accept="image/*" className="hidden" />
          </label>
        </div>
        <div className="flex-1 space-y-4 text-center md:text-left">
          <h3 className="text-xl font-bold text-slate-800">Lengkapi & Perbarui Profil Anda</h3>
          <p className="text-slate-500 text-sm">
            Pastikan data yang Anda masukkan adalah data terbaru. Data ini akan ditampilkan di direktori alumni internal untuk memperkuat relasi kita.
          </p>
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Biodata Singkat (Bio)</label>
            <Input {...register("bio")} placeholder="Tuliskan cerita singkat tentang diri Anda saat ini..." className="w-full" />
          </div>
        </div>
      </div>

      {/* Informasi Dasar */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-6">
        <h3 className="text-lg font-bold text-slate-800 flex items-center border-b pb-3 border-slate-100">
          <Users className="w-5 h-5 text-orange-500 mr-2" />
          Informasi Dasar
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">NISN (Opsional)</label>
            <Input {...register("nisn")} placeholder="Masukkan NISN..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Angkatan (Angka Tahun Masuk)</label>
            <Input type="number" {...register("angkatan")} placeholder="Contoh: 2018" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nama Angkatan (Opsional)</label>
            <Input {...register("namaAngkatan")} placeholder="Contoh: Dasa Windu" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tahun Lulus</label>
            <Input type="number" {...register("tahunLulus")} placeholder="Contoh: 2021" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tempat Lahir</label>
            <Input {...register("tempatLahir")} placeholder="Tempat Lahir" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Lahir</label>
            <Input type="date" {...register("tanggalLahir")} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nomor HP / WhatsApp</label>
            <Input {...register("noHp")} placeholder="Contoh: 08123456789" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Jurusan SMA</label>
            <select {...register("jurusan")} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
              <option value="">Pilih Jurusan</option>
              <option value="MIPA">MIPA</option>
              <option value="IPS">IPS</option>
              <option value="Bahasa">Bahasa</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Asrama / Kamar</label>
            <Input {...register("namaAsrama")} placeholder="Contoh: Gedung A Kamar 10" />
          </div>
        </div>
      </div>

      {/* Alamat & Lokasi Geografis */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-6">
        <h3 className="text-lg font-bold text-slate-800 flex items-center border-b pb-3 border-slate-100">
          <MapPin className="w-5 h-5 text-orange-500 mr-2" />
          Domisili & Lokasi Peta
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Negara</label>
            <Input {...register("negara")} placeholder="Negara" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Provinsi</label>
            <Input {...register("provinsi")} placeholder="Provinsi" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Kota / Kabupaten</label>
            <Input {...register("kota")} placeholder="Kota / Kabupaten" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Kecamatan</label>
            <Input {...register("kecamatan")} placeholder="Kecamatan" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Kelurahan / Desa</label>
            <Input {...register("kelurahan")} placeholder="Kelurahan" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Link Google Maps (Opsional)</label>
            <Input {...register("googleMapsLink")} placeholder="https://maps.app.goo.gl/..." />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Latitude</label>
            <Input type="number" step="any" {...register("latitude")} readOnly className="bg-slate-50 cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Longitude</label>
            <Input type="number" step="any" {...register("longitude")} readOnly className="bg-slate-50 cursor-not-allowed" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Tentukan Lokasi di Peta</label>
          <MapPicker 
            defaultLat={watchLatitude ? parseFloat(watchLatitude) : -0.2298} 
            defaultLng={watchLongitude ? parseFloat(watchLongitude) : 100.6308} 
            onLocationSelect={handleLocationSelect} 
          />
        </div>
      </div>

      {/* Hubungan Pernikahan & Keluarga */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-6">
        <h3 className="text-lg font-bold text-slate-800 flex items-center border-b pb-3 border-slate-100">
          <Heart className="w-5 h-5 text-orange-500 mr-2" />
          Status Keluarga
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Status Pernikahan</label>
            <select {...register("statusNikah")} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
              <option value="">Pilih Status</option>
              <option value="Lajang">Lajang</option>
              <option value="Menikah">Menikah</option>
              <option value="Cerai">Cerai</option>
            </select>
          </div>
          {watchStatusNikah === "Menikah" && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Pasangan (Suami/Istri)</label>
                <Input {...register("namaPasangan")} placeholder="Nama Pasangan" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Jumlah Anak</label>
                <Input type="number" {...register("jumlahAnak")} placeholder="0" />
              </div>
            </>
          )}
        </div>

        {watchStatusNikah === "Menikah" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-semibold text-slate-700">Nama Anak</label>
              <Button type="button" onClick={() => appendChild({ nama: "" })} size="sm" variant="outline" className="border-orange-500 text-orange-500 hover:bg-orange-50">
                <Plus className="w-4 h-4 mr-1" />
                Tambah Anak
              </Button>
            </div>
            
            {childFields.map((field, idx) => (
              <div key={field.id} className="flex gap-4 items-center">
                <Input {...register(`children.${idx}.nama`)} placeholder={`Nama anak ke-${idx+1}`} required className="flex-1" />
                <Button type="button" onClick={() => removeChild(idx)} size="icon" variant="ghost" className="text-red-500 hover:bg-red-50">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Riwayat Pendidikan */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-6">
        <div className="flex justify-between items-center border-b pb-3 border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 flex items-center">
            <GraduationCap className="w-5 h-5 text-orange-500 mr-2" />
            Riwayat Pendidikan Tinggi
          </h3>
          <Button type="button" onClick={() => appendEducation({ jenjang: "", institusi: "", programStudi: "", tahunMasuk: "", tahunLulus: "" })} size="sm" variant="outline" className="border-orange-500 text-orange-500 hover:bg-orange-50">
            <Plus className="w-4 h-4 mr-1" />
            Tambah Pendidikan
          </Button>
        </div>

        <div className="space-y-6">
          {educationFields.map((field, idx) => (
            <div key={field.id} className="p-6 border border-slate-100 rounded-xl bg-slate-50/50 space-y-4 relative">
              <div className="absolute top-4 right-4">
                <Button type="button" onClick={() => removeEducation(idx)} size="icon" variant="ghost" className="text-red-500 hover:bg-red-50">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Jenjang</label>
                  <select {...register(`educations.${idx}.jenjang`)} className="w-full border border-slate-200 bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" required>
                    <option value="">Pilih Jenjang</option>
                    <option value="D1">D1</option>
                    <option value="D2">D2</option>
                    <option value="D3">D3</option>
                    <option value="D4">D4</option>
                    <option value="S1">S1</option>
                    <option value="S2">S2</option>
                    <option value="S3">S3</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nama Institusi / Kampus</label>
                  <Input {...register(`educations.${idx}.institusi`)} placeholder="Contoh: Universitas Gadjah Mada" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Program Studi / Jurusan</label>
                  <Input {...register(`educations.${idx}.programStudi`)} placeholder="Contoh: Ilmu Komputer" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tahun Masuk</label>
                  <Input type="number" {...register(`educations.${idx}.tahunMasuk`)} placeholder="Tahun Masuk" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tahun Lulus (Kosongkan jika masih berjalan)</label>
                  <Input type="number" {...register(`educations.${idx}.tahunLulus`)} placeholder="Tahun Lulus" />
                </div>
              </div>
            </div>
          ))}
          {educationFields.length === 0 && (
            <p className="text-center text-slate-400 text-sm py-4">Belum ada riwayat pendidikan tinggi yang ditambahkan.</p>
          )}
        </div>
      </div>

      {/* Riwayat Pekerjaan */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-6">
        <div className="flex justify-between items-center border-b pb-3 border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 flex items-center">
            <Briefcase className="w-5 h-5 text-orange-500 mr-2" />
            Riwayat Karir / Pekerjaan
          </h3>
          <Button type="button" onClick={() => appendJob({ perusahaan: "", jabatan: "", tahunMulai: "", tahunSelesai: "", isCurrent: false })} size="sm" variant="outline" className="border-orange-500 text-orange-500 hover:bg-orange-50">
            <Plus className="w-4 h-4 mr-1" />
            Tambah Pekerjaan
          </Button>
        </div>

        <div className="space-y-6">
          {jobFields.map((field, idx) => (
            <div key={field.id} className="p-6 border border-slate-100 rounded-xl bg-slate-50/50 space-y-4 relative">
              <div className="absolute top-4 right-4">
                <Button type="button" onClick={() => removeJob(idx)} size="icon" variant="ghost" className="text-red-500 hover:bg-red-50">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Perusahaan / Institusi</label>
                  <Input {...register(`jobs.${idx}.perusahaan`)} placeholder="Contoh: PT. Indonesia Raya" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Jabatan / Posisi Kerja</label>
                  <Input {...register(`jobs.${idx}.jabatan`)} placeholder="Contoh: Software Engineer" required />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tahun Mulai</label>
                  <Input type="number" {...register(`jobs.${idx}.tahunMulai`)} placeholder="Tahun Mulai" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tahun Selesai</label>
                  <Input type="number" {...register(`jobs.${idx}.tahunSelesai`)} placeholder="Tahun Selesai" disabled={watch(`jobs.${idx}.isCurrent`)} />
                </div>
                <div className="flex items-center pt-6">
                  <input type="checkbox" {...register(`jobs.${idx}.isCurrent`)} id={`isCurrent-${idx}`} className="h-4 w-4 text-orange-500 border-slate-300 rounded focus:ring-orange-500" />
                  <label htmlFor={`isCurrent-${idx}`} className="ml-2 block text-sm text-slate-900">Masih bekerja di sini saat ini</label>
                </div>
              </div>
            </div>
          ))}
          {jobFields.length === 0 && (
            <p className="text-center text-slate-400 text-sm py-4">Belum ada riwayat pekerjaan yang ditambahkan.</p>
          )}
        </div>
      </div>

      {/* Media Sosial */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-6">
        <h3 className="text-lg font-bold text-slate-800 flex items-center border-b pb-3 border-slate-100">
          <svg className="w-5 h-5 text-orange-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          Tautan Media Sosial
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">LinkedIn URL</label>
            <Input {...register("linkedin")} placeholder="https://linkedin.com/in/..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Instagram Username / URL</label>
            <Input {...register("instagram")} placeholder="https://instagram.com/..." />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Facebook URL</label>
            <Input {...register("facebook")} placeholder="https://facebook.com/..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">TikTok URL</label>
            <Input {...register("tiktok")} placeholder="https://tiktok.com/@..." />
          </div>
        </div>
      </div>

      {/* Tombol Simpan */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={fetchProfile} disabled={saving} className="rounded-xl px-6">Batal</Button>
        <Button type="submit" disabled={saving} className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl px-8 shadow-md hover:shadow-lg transition-all flex items-center">
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Menyimpan..." : "Simpan Profil Saya"}
        </Button>
      </div>
    </form>
  );
}
