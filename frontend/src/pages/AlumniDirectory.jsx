import { useState, useEffect } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin, GraduationCap, Briefcase, Globe } from "lucide-react";
import AlumniMap from "../components/AlumniMap";

export default function AlumniDirectory() {
  const [alumniList, setAlumniList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [angkatan, setAngkatan] = useState("");
  const [provinsi, setProvinsi] = useState("");

  const fetchDirectory = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`/api/alumni/directory`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { search, angkatan, provinsi }
      });
      if (res.data.status === 'success') {
        setAlumniList(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch directory", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDirectory();
  }, []); // Initial load

  const handleSearch = (e) => {
    e.preventDefault();
    fetchDirectory();
  };

  return (
    <div>
      <div className="bg-white p-4 rounded-lg shadow-sm border border-orange-100 mb-6">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-3 text-slate-400" />
            <Input 
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari nama alumni..." 
              className="pl-10"
            />
          </div>
          <Input 
            value={angkatan}
            onChange={e => setAngkatan(e.target.value)}
            placeholder="Angkatan (Misal: 2020)" 
            className="w-full md:w-48"
          />
          <Input 
            value={provinsi}
            onChange={e => setProvinsi(e.target.value)}
            placeholder="Provinsi Domisili" 
            className="w-full md:w-48"
          />
          <Button type="submit" className="bg-slate-800 hover:bg-slate-900 text-white">
            Filter
          </Button>
        </form>
      </div>

      {!loading && alumniList.length > 0 && (
        <div className="mb-8 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center">
            <MapPin className="w-5 h-5 text-orange-500 mr-2" />
            Sebaran Alumni di Peta
          </h3>
          <AlumniMap alumniList={alumniList} />
        </div>
      )}

      {loading ? (
        <div className="text-center py-10 text-slate-500">Memuat direktori...</div>
      ) : alumniList.length === 0 ? (
        <div className="text-center py-10 text-slate-500">Tidak ada alumni yang sesuai kriteria.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {alumniList.map((alumni) => (
            <div key={alumni.id} className="bg-white rounded-xl shadow-md border border-slate-100 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="bg-slate-800 h-24 relative">
                <div className="absolute -bottom-10 left-6 w-20 h-20 rounded-full border-4 border-white bg-orange-100 overflow-hidden flex items-center justify-center text-orange-500 font-bold text-2xl">
                  {alumni.foto ? (
                    <img src={alumni.foto.startsWith('http') ? alumni.foto : `${import.meta.env.VITE_API_URL || ''}${alumni.foto}`} alt={alumni.user?.name} className="w-full h-full object-cover" />
                  ) : (
                    alumni.user?.name?.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="absolute top-4 right-4 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                  Angkatan {alumni.angkatan || '?'}
                </div>
              </div>
              <div className="pt-12 px-6 pb-6">
                <h3 className="font-bold text-lg text-slate-900 truncate">{alumni.user?.name}</h3>
                {alumni.jurusan && <p className="text-sm text-slate-500">Jurusan {alumni.jurusan}</p>}
                
                <div className="mt-4 space-y-2">
                  {(alumni.kota || alumni.provinsi) && (
                    <div className="flex items-start text-sm text-slate-600">
                      <MapPin className="w-4 h-4 mr-2 text-slate-400 mt-0.5" />
                      <span>{alumni.kota ? `${alumni.kota}, ` : ''}{alumni.provinsi}</span>
                    </div>
                  )}
                  {alumni.educations && alumni.educations.length > 0 && (
                    <div className="flex items-start text-sm text-slate-600">
                      <GraduationCap className="w-4 h-4 mr-2 text-slate-400 mt-0.5" />
                      <span className="truncate">{alumni.educations[0].institusi}</span>
                    </div>
                  )}
                  {alumni.jobs && alumni.jobs.length > 0 && (
                    <div className="flex items-start text-sm text-slate-600">
                      <Briefcase className="w-4 h-4 mr-2 text-slate-400 mt-0.5" />
                      <span className="truncate">{alumni.jobs[0].perusahaan} - {alumni.jobs[0].jabatan}</span>
                    </div>
                  )}
                </div>

                {/* Social Links */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex gap-3">
                  {alumni.instagram && (
                    <a href={`https://instagram.com/${alumni.instagram.replace('@','')}`} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-pink-600 flex items-center gap-1">
                      <Globe className="w-4 h-4" /> IG
                    </a>
                  )}
                  {alumni.facebook && (
                    <a href={`https://facebook.com/${alumni.facebook}`} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-600 flex items-center gap-1">
                      <Globe className="w-4 h-4" /> FB
                    </a>
                  )}
                  {alumni.linkedin && (
                    <a href={`https://linkedin.com/in/${alumni.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-700 font-bold text-sm flex items-center gap-1">
                      <Globe className="w-4 h-4" /> in
                    </a>
                  )}
                  {alumni.tiktok && (
                    <a href={`https://tiktok.com/@${alumni.tiktok.replace('@','')}`} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-black font-bold text-sm flex items-center gap-1">
                      <Globe className="w-4 h-4" /> TK
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
