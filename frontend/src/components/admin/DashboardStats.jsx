import { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Users, Briefcase, FileText, MapPin, GraduationCap, ChevronDown, ChevronRight } from 'lucide-react';
import AlumniMap from '../AlumniMap';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

const COLORS = ['#f97316', '#0ea5e9', '#10b981', '#a855f7', '#64748b', '#e11d48'];

export default function DashboardStats() {
  const [stats, setStats] = useState({
    totalAlumni: 0,
    totalAngkatan: 0,
    angkatanData: [],
    jurusanData: [],
    statusKerjaData: [],
    kesesuaianData: [],
    kampusData: []
  });
  const [alumniList, setAlumniList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedKampus, setExpandedKampus] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const [statsRes, alumniRes] = await Promise.all([
          axios.get('/api/alumni/dashboard-stats', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('/api/alumni/directory', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        if (statsRes.data?.data) {
          setStats(statsRes.data.data);
        }
        if (alumniRes.data?.status === 'success') {
          setAlumniList(alumniRes.data.data);
        }
      } catch (error) {
        console.error("Error fetching stats or directory", error);
        setError(`Gagal memuat data: ${error.response?.data?.message || error.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-600 font-medium">{error}</p>
        <p className="text-red-400 text-sm mt-1">Silakan deploy ulang server atau hubungi administrator.</p>
      </div>
    );
  }

  const toggleKampus = (kampusName) => {
    setExpandedKampus(prev => prev === kampusName ? null : kampusName);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center">
          <div className="p-4 bg-orange-100 text-orange-600 rounded-lg mr-4">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Alumni</p>
            <h3 className="text-2xl font-bold text-slate-800">{stats.totalAlumni}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center">
          <div className="p-4 bg-blue-100 text-blue-600 rounded-lg mr-4">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Angkatan</p>
            <h3 className="text-2xl font-bold text-slate-800">{stats.totalAngkatan || stats.angkatanData.length}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center">
          <div className="p-4 bg-emerald-100 text-emerald-600 rounded-lg mr-4">
            <Briefcase size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Data Tracer Study</p>
            <h3 className="text-2xl font-bold text-slate-800">
              {stats.statusKerjaData?.reduce((sum, item) => sum + item.count, 0) || 0} Terisi
            </h3>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Sebaran Alumni per Angkatan</h3>
          <div className="h-72">
            {stats.angkatanData?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.angkatanData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <RechartsTooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Bar dataKey="count" fill="#f97316" radius={[4, 4, 0, 0]} name="Jumlah" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">Belum ada data</div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Proporsi Jurusan SMA</h3>
          <div className="h-72">
            {stats.jurusanData?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.jurusanData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="count"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {stats.jurusanData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">Belum ada data</div>
            )}
          </div>
        </div>
      </div>

      {/* Kampus Table Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-1 flex items-center">
          <GraduationCap className="w-5 h-5 text-orange-500 mr-2" />
          Statistik Lulusan Per Kampus
        </h3>
        <p className="text-xs text-slate-400 mb-4">Klik nama kampus untuk melihat daftar alumni</p>
        {stats.kampusData?.length > 0 ? (
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="w-[50px] font-bold text-slate-700">No</TableHead>
                  <TableHead className="font-bold text-slate-700">Nama Kampus</TableHead>
                  <TableHead className="w-[160px] text-right font-bold text-slate-700">Jumlah Alumni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.kampusData.map((kampus, index) => {
                  const isExpanded = expandedKampus === kampus.name;
                  const alumniArr = kampus.alumni || [];
                  return (
                    <>
                      {/* Row Kampus - clickable */}
                      <TableRow
                        key={`kampus-${index}`}
                        className="cursor-pointer hover:bg-orange-50 transition-colors select-none"
                        onClick={() => toggleKampus(kampus.name)}
                      >
                        <TableCell className="font-medium text-slate-500">{index + 1}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {isExpanded
                              ? <ChevronDown className="w-4 h-4 text-orange-500 flex-shrink-0" />
                              : <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                            }
                            <span className="font-bold text-slate-800">{kampus.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-semibold text-slate-700">
                          {kampus.count} Alumni
                        </TableCell>
                      </TableRow>

                      {/* Sub-rows: daftar alumni */}
                      {isExpanded && alumniArr.length > 0 && alumniArr.map((alum, i) => (
                        <TableRow key={`alum-${index}-${i}`} className="bg-orange-50/60 border-l-4 border-l-orange-300">
                          <TableCell />
                          <TableCell className="pl-10 py-2">
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 rounded-full bg-orange-200 text-orange-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                {i + 1}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-slate-700">{alum.name}</p>
                                {alum.prodi && (
                                  <p className="text-xs text-slate-400">{alum.prodi}</p>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right text-xs text-slate-500 py-2">
                            {alum.angkatan ? `Angkatan ${alum.angkatan}` : ''}
                          </TableCell>
                        </TableRow>
                      ))}

                      {/* Jika tidak ada data alumni */}
                      {isExpanded && alumniArr.length === 0 && (
                        <TableRow key={`no-alum-${index}`} className="bg-orange-50/60">
                          <TableCell />
                          <TableCell colSpan={2} className="pl-10 text-sm text-slate-400 italic py-3">
                            Data alumni tidak tersedia
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="py-10 text-center text-slate-400">Belum ada data riwayat pendidikan alumni.</div>
        )}
      </div>

      {/* Map Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
          <MapPin className="w-5 h-5 text-orange-500 mr-2" />
          Peta Sebaran Lokasi Alumni
        </h3>
        <AlumniMap alumniList={alumniList} />
      </div>
    </div>
  );
}
