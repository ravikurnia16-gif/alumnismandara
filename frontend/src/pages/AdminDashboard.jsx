import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, Calendar, Briefcase, FileText, LogOut, Menu, Lock, Coins, Settings } from "lucide-react";
import AlumniTable from "../components/admin/AlumniTable";
import DashboardStats from "../components/admin/DashboardStats";
import NewsTable from "../components/admin/NewsTable";
import DonationTable from "../components/admin/DonationTable";
import SettingManager from "../components/admin/SettingManager";
import { Button } from "@/components/ui/button";
import ChangePasswordDialog from "../components/ChangePasswordDialog";
import axios from "axios";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("alumni");
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [settings, setSettings] = useState({ schoolName: "SMA 2 Admin" });
  const navigate = useNavigate();

  const fetchSettings = async () => {
    try {
      const res = await axios.get("/api/settings");
      if (res.data.status === "success") {
        setSettings(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSettings();
    window.addEventListener("settingsUpdated", fetchSettings);
    return () => window.removeEventListener("settingsUpdated", fetchSettings);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
    { id: "alumni", label: "Data Alumni", icon: <Users size={20} /> },
    { id: "donations", label: "Keuangan & Donasi", icon: <Coins size={20} /> },
    { id: "events", label: "Event Alumni", icon: <Calendar size={20} /> },
    // { id: "jobs", label: "Lowongan Kerja", icon: <Briefcase size={20} /> },
    { id: "news", label: "Berita", icon: <FileText size={20} /> },
    { id: "settings", label: "Pengaturan Halaman", icon: <Settings size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-x-hidden relative">
      {/* Mobile Sidebar overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside className={`w-64 bg-slate-900 text-white flex flex-col fixed h-full z-50 transition-transform duration-300 md:hidden ${
        isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-orange-500 tracking-tight">{settings.schoolName}</h1>
            <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-widest">Portal Admin</p>
          </div>
          <button onClick={() => setIsMobileSidebarOpen(false)} className="text-slate-400 hover:text-white p-1 text-lg">
            ✕
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === item.id 
                  ? "bg-orange-500 text-white font-medium shadow-md shadow-orange-500/20" 
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800 space-y-2">
          <Button 
            variant="ghost" 
            className="w-full flex justify-start text-slate-300 hover:text-white hover:bg-slate-800"
            onClick={() => {
              setIsPasswordDialogOpen(true);
              setIsMobileSidebarOpen(false);
            }}
          >
            <Lock size={20} className="mr-3" />
            Ganti Password
          </Button>
          <Button 
            variant="ghost" 
            className="w-full flex justify-start text-red-400 hover:text-red-300 hover:bg-red-400/10"
            onClick={handleLogout}
          >
            <LogOut size={20} className="mr-3" />
            Keluar
          </Button>
        </div>
      </aside>

      {/* Desktop Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col hidden md:flex fixed h-full z-10">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-2xl font-bold text-orange-500 tracking-tight">{settings.schoolName}</h1>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest">Portal Admin</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === item.id 
                  ? "bg-orange-500 text-white font-medium shadow-md shadow-orange-500/20" 
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800 space-y-2">
          <Button 
            variant="ghost" 
            className="w-full flex justify-start text-slate-300 hover:text-white hover:bg-slate-800"
            onClick={() => setIsPasswordDialogOpen(true)}
          >
            <Lock size={20} className="mr-3" />
            Ganti Password
          </Button>
          <Button 
            variant="ghost" 
            className="w-full flex justify-start text-red-400 hover:text-red-300 hover:bg-red-400/10"
            onClick={handleLogout}
          >
            <LogOut size={20} className="mr-3" />
            Keluar
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen max-w-full overflow-x-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="flex items-center md:hidden">
            <button 
              onClick={() => setIsMobileSidebarOpen(true)} 
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>
            <span className="ml-4 font-bold text-slate-900">{settings.schoolName}</span>
          </div>
          <div className="hidden md:flex items-center text-slate-800 font-semibold text-lg">
            {navItems.find(i => i.id === activeTab)?.label}
          </div>
          <div className="flex items-center space-x-4">
            <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold border border-orange-200">
              A
            </div>
            <span className="text-sm font-medium text-slate-700 hidden sm:block">Administrator</span>
          </div>
        </header>

        {/* Content View */}
        <div className="p-4 sm:p-6 flex-1 overflow-x-hidden w-full">
          {activeTab === "alumni" && (
            <div className="animate-fade-in-up">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Manajemen Alumni</h2>
                <p className="text-slate-500 text-sm mt-1">Kelola data seluruh alumni sekolah, tambahkan alumni baru, atau hapus data yang tidak relevan.</p>
              </div>
              <AlumniTable />
            </div>
          )}

          {activeTab === "dashboard" && (
            <div className="animate-fade-in-up">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Dashboard Utama</h2>
                <p className="text-slate-500 text-sm mt-1">Ringkasan statistik data alumni dan aktivitas di portal.</p>
              </div>
              <DashboardStats />
            </div>
          )}

          {activeTab === "news" && (
            <div className="animate-fade-in-up">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Manajemen Berita</h2>
                <p className="text-slate-500 text-sm mt-1">Kelola berita, pengumuman, dan informasi terkini untuk alumni.</p>
              </div>
              <NewsTable />
            </div>
          )}

          {activeTab === "donations" && (
            <div className="animate-fade-in-up">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Manajemen Keuangan & Donasi</h2>
                <p className="text-slate-500 text-sm mt-1">Pantau seluruh dana donasi alumni, catat transaksi donasi manual offline, atau hapus catatan jika diperlukan.</p>
              </div>
              <DonationTable />
            </div>
          )}

          {activeTab === "settings" && (
            <div className="animate-fade-in-up">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Pengaturan Halaman</h2>
                <p className="text-slate-500 text-sm mt-1">Sesuaikan identitas SMA, nama portal alumni, dan logo utama situs web.</p>
              </div>
              <SettingManager />
            </div>
          )}

          {activeTab !== "alumni" && activeTab !== "dashboard" && activeTab !== "news" && activeTab !== "donations" && activeTab !== "settings" && (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
              {navItems.find(i => i.id === activeTab)?.icon}
              <p className="mt-4 text-lg">Modul {navItems.find(i => i.id === activeTab)?.label} sedang dalam tahap pengembangan.</p>
            </div>
          )}
        </div>
      </main>

      <ChangePasswordDialog 
        isOpen={isPasswordDialogOpen} 
        onClose={() => setIsPasswordDialogOpen(false)} 
      />
    </div>
  );
}
