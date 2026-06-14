import { useState } from "react";
import { useNavigate, Routes, Route, Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ChangePasswordDialog from "../components/ChangePasswordDialog";
import AlumniDirectory from "./AlumniDirectory";
import DashboardStats from "../components/admin/DashboardStats";
import ProfileEditor from "../components/ProfileEditor";

function AlumniDashboardContent({ setIsPasswordDialogOpen }) {
  const user = JSON.parse(localStorage.getItem("user"));
  return (
    <div className="max-w-6xl mx-auto animate-fade-in-up">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Selamat datang, {user?.name || "Alumni"}! 👋</h2>
          <p className="text-slate-500 mt-2">
            Senang melihat Anda kembali di portal Ikatan Alumni SMA 2 Harau. Jelajahi direktori untuk menemukan teman lama atau lihat lowongan kerja terbaru.
          </p>
        </div>
        <div className="flex-shrink-0">
          <div className="h-20 w-20 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-2xl border-4 border-orange-50">
            {user?.name?.charAt(0).toUpperCase() || "A"}
          </div>
        </div>
      </div>

      <h3 className="text-xl font-bold text-slate-800 mb-4">Statistik Alumni Kita</h3>
      <DashboardStats />
      
      <div className="bg-white shadow-sm border p-6 rounded-lg mb-6 border-orange-200 mt-8">
        <h2 className="text-xl font-semibold mb-2">Keamanan Akun</h2>
        <p className="text-slate-600 mb-4">Profil Anda sudah terdaftar. Jangan lupa untuk mengganti password bawaan Anda demi keamanan akun.</p>
        <Button onClick={() => setIsPasswordDialogOpen(true)} className="bg-orange-500 hover:bg-orange-600 text-white">
          Ganti Password Sekarang
        </Button>
      </div>
    </div>
  );
}

export default function AlumniDashboard() {
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const location = useLocation();
  const isDirectory = location.pathname.includes("/directory");
  const isEditProfile = location.pathname.includes("/edit-profile");

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Alumni Dashboard</h1>
        <Button variant="outline" className="text-red-500 border-red-500 hover:bg-red-50" onClick={handleLogout}>
          Keluar
        </Button>
      </div>
      
      <div className="flex gap-4 border-b mb-6 overflow-x-auto whitespace-nowrap pb-1">
        <Link 
          to="/dashboard" 
          className={`pb-2 px-2 font-medium border-b-2 ${(!isDirectory && !isEditProfile) ? 'border-orange-500 text-orange-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Beranda / Profil
        </Link>
        <Link 
          to="/dashboard/edit-profile" 
          className={`pb-2 px-2 font-medium border-b-2 ${isEditProfile ? 'border-orange-500 text-orange-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Edit Profil Saya
        </Link>
        <Link 
          to="/dashboard/directory" 
          className={`pb-2 px-2 font-medium border-b-2 ${isDirectory ? 'border-orange-500 text-orange-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Direktori Alumni
        </Link>
      </div>

      <Routes>
        <Route path="/" element={<AlumniDashboardContent setIsPasswordDialogOpen={setIsPasswordDialogOpen} />} />
        <Route path="/edit-profile" element={<ProfileEditor />} />
        <Route path="/directory" element={<AlumniDirectory />} />
      </Routes>

      <ChangePasswordDialog 
        isOpen={isPasswordDialogOpen} 
        onClose={() => setIsPasswordDialogOpen(false)} 
      />
    </div>
  );
}
