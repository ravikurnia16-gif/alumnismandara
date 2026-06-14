import { useState, useEffect } from "react";
import axios from "axios";
import { Save, Upload, School, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SettingManager() {
  const [schoolName, setSchoolName] = useState("");
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/settings");
      if (res.data.status === "success") {
        setSchoolName(res.data.data.schoolName);
        if (res.data.data.schoolLogo) {
          setLogoPreview(`http://localhost:5000${res.data.data.schoolLogo}`);
        }
      }
    } catch (err) {
      console.error("Gagal memuat pengaturan:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("schoolName", schoolName);
      if (logoFile) {
        formData.append("logo", logoFile);
      }

      const res = await axios.put("/api/settings", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });

      if (res.data.status === "success") {
        alert("Pengaturan halaman berhasil diperbarui!");
        // Dispatch custom event to notify all components to reload settings
        window.dispatchEvent(new Event("settingsUpdated"));
        fetchSettings();
      }
    } catch (err) {
      console.error(err);
      alert("Gagal memperbarui pengaturan.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 max-w-2xl">
      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <h3 className="text-lg font-bold text-slate-800 flex items-center mb-1">
            <School className="w-5 h-5 text-orange-500 mr-2" />
            Identitas Sekolah
          </h3>
          <p className="text-slate-500 text-xs mb-4">
            Pengaturan di bawah ini akan mengubah logo dan nama sekolah secara dinamis di seluruh halaman (Landing Page, Dashboard, Direktori, dll).
          </p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">Nama Sekolah / SMA</label>
          <Input 
            value={schoolName}
            onChange={(e) => setSchoolName(e.target.value)}
            placeholder="Contoh: SMAN 2 HARAU"
            required
            className="h-12"
          />
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-semibold text-slate-700">Logo Sekolah</label>
          <div className="flex flex-col sm:flex-row items-center gap-6 p-4 border border-slate-100 rounded-xl bg-slate-50/50">
            <div className="h-24 w-24 rounded-lg overflow-hidden border bg-white flex items-center justify-center relative shrink-0">
              {logoPreview ? (
                <img src={logoPreview} alt="Logo SMA" className="max-h-full max-w-full object-contain" />
              ) : (
                <div className="text-slate-400 flex flex-col items-center">
                  <ImageIcon size={28} />
                  <span className="text-[10px] mt-1">Tanpa Logo</span>
                </div>
              )}
            </div>
            
            <div className="flex-1 space-y-2 text-center sm:text-left">
              <p className="text-xs text-slate-500">
                Gunakan gambar format PNG/JPG transparan dengan rasio persegi (1:1) untuk hasil terbaik.
              </p>
              <label className="inline-flex items-center px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 cursor-pointer shadow-sm transition-colors">
                <Upload className="w-3.5 h-3.5 mr-2" />
                Pilih Berkas Logo
                <input type="file" onChange={handleLogoChange} accept="image/*" className="hidden" />
              </label>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t flex justify-end">
          <Button 
            type="submit" 
            disabled={saving} 
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 h-12 rounded-xl transition-all shadow-md flex items-center"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Menyimpan..." : "Simpan Pengaturan"}
          </Button>
        </div>
      </form>
    </div>
  );
}
