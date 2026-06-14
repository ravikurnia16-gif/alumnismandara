import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin, GraduationCap, Briefcase, Globe, ArrowLeft } from "lucide-react";
import AlumniMap from "../components/AlumniMap";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function PublicDirectory() {
  const [alumniList, setAlumniList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [angkatan, setAngkatan] = useState("");
  const [provinsi, setProvinsi] = useState("");

  const fetchDirectory = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/public/directory`, {
        params: { search, angkatan, provinsi }
      });
      if (res.data.status === 'success') {
        setAlumniList(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch public directory", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDirectory();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchDirectory();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header */}
      <header className="px-8 py-5 flex justify-between items-center bg-white border-b border-orange-100 shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center border-2 border-orange-200">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold tracking-tight text-slate-900 block leading-none uppercase">
              SMAN 2 HARAU
            </h1>
            <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">
              Direktori Alumni
            </span>
          </div>
        </div>
        <div>
          <Link to="/">
            <Button variant="ghost" className="font-bold text-slate-600 hover:text-orange-600">
              <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full">
        <div className="mb-8 text-center sm:text-left">
          <h2 className="text-3xl font-extrabold text-slate-900">Direktori Alumni</h2>
          <p className="text-slate-500 mt-2">Cari dan temukan jejaring alumni SMAN 2 Harau di seluruh Indonesia.</p>
        </div>

        {/* Filter Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <Input 
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Cari nama alumni..." 
                className="pl-10 h-12"
              />
            </div>
            <Input 
              value={angkatan}
              onChange={e => setAngkatan(e.target.value)}
              placeholder="Angkatan (Misal: 2020)" 
              className="w-full md:w-48 h-12"
            />
            <Input 
              value={provinsi}
              onChange={e => setProvinsi(e.target.value)}
              placeholder="Provinsi Domisili" 
              className="w-full md:w-48 h-12"
            />
            <Button type="submit" className="h-12 px-8 bg-orange-600 hover:bg-orange-700 text-white font-bold">
              Filter
            </Button>
          </form>
        </div>

        {/* Map Section */}
        {!loading && alumniList.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
              <MapPin className="w-5 h-5 text-orange-500 mr-2" />
              Peta Sebaran Alumni
            </h3>
            <AlumniMap alumniList={alumniList} />
          </div>
        )}

        {/* Table Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="w-[80px]">Foto</TableHead>
                  <TableHead className="min-w-[200px]">Nama & Jurusan SMA</TableHead>
                  <TableHead className="w-[120px]">Angkatan</TableHead>
                  <TableHead className="min-w-[180px]">Domisili</TableHead>
                  <TableHead className="min-w-[250px]">Pekerjaan / Pendidikan</TableHead>
                  <TableHead className="w-[150px] text-center">Sosial Media</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                      Memuat direktori...
                    </TableCell>
                  </TableRow>
                ) : alumniList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                      Tidak ada alumni yang sesuai dengan filter pencarian.
                    </TableCell>
                  </TableRow>
                ) : (
                  alumniList.map((alumni) => (
                    <TableRow key={alumni.id} className="hover:bg-slate-50 transition-colors">
                      <TableCell>
                        <div className="w-12 h-12 rounded-full border-2 border-slate-200 bg-slate-100 overflow-hidden flex items-center justify-center text-slate-400 font-bold text-lg">
                          {alumni.foto ? (
                            <img src={`${import.meta.env.VITE_API_URL}${alumni.foto}`} alt={alumni.user?.name} className="w-full h-full object-cover" />
                          ) : (
                            alumni.user?.name?.charAt(0).toUpperCase()
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-bold text-slate-900">{alumni.user?.name}</div>
                        {alumni.jurusan && <div className="text-xs text-slate-500 mt-1">Jurusan {alumni.jurusan}</div>}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-800">
                          {alumni.angkatan || '-'}
                        </span>
                      </TableCell>
                      <TableCell>
                        {(alumni.kota || alumni.provinsi) ? (
                          <div className="flex items-center text-sm text-slate-600">
                            <MapPin className="w-4 h-4 mr-1.5 text-slate-400 shrink-0" />
                            <span className="line-clamp-2">{alumni.kota ? `${alumni.kota}, ` : ''}{alumni.provinsi}</span>
                          </div>
                        ) : <span className="text-slate-400 text-sm">-</span>}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          {alumni.jobs && alumni.jobs.length > 0 && (
                            <div className="flex items-start text-sm text-slate-600">
                              <Briefcase className="w-4 h-4 mr-2 text-slate-400 shrink-0 mt-0.5" />
                              <span className="line-clamp-2">{alumni.jobs[0].perusahaan} - {alumni.jobs[0].jabatan}</span>
                            </div>
                          )}
                          {alumni.educations && alumni.educations.length > 0 && (
                            <div className="flex items-start text-sm text-slate-600">
                              <GraduationCap className="w-4 h-4 mr-2 text-slate-400 shrink-0 mt-0.5" />
                              <span className="line-clamp-2">{alumni.educations[0].institusi}</span>
                            </div>
                          )}
                          {!(alumni.jobs?.length > 0) && !(alumni.educations?.length > 0) && (
                            <span className="text-slate-400 text-sm">-</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-3">
                          {alumni.instagram && (
                            <a href={`https://instagram.com/${alumni.instagram.replace('@','')}`} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-pink-600" title="Instagram">
                              <Globe className="w-4 h-4" />
                            </a>
                          )}
                          {alumni.facebook && (
                            <a href={`https://facebook.com/${alumni.facebook}`} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-600" title="Facebook">
                              <Globe className="w-4 h-4" />
                            </a>
                          )}
                          {alumni.linkedin && (
                            <a href={`https://linkedin.com/in/${alumni.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-700" title="LinkedIn">
                              <span className="font-bold text-xs border border-current rounded px-0.5">in</span>
                            </a>
                          )}
                          {!alumni.instagram && !alumni.facebook && !alumni.linkedin && (
                            <span className="text-slate-300">-</span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>
    </div>
  );
}
