import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, GraduationCap, Users, FileText, X, Heart } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import axios from "axios";

export default function LandingPage() {
  const [stats, setStats] = useState({ totalAlumni: 0, totalAngkatan: 0 });
  const [latestNews, setLatestNews] = useState([]);
  const [selectedNews, setSelectedNews] = useState(null);
  const [settings, setSettings] = useState({ schoolName: "SMAN 2 HARAU", schoolLogo: "" });

  useEffect(() => {
    axios.get("/api/public/stats")
      .then(res => {
        if (res.data?.data) {
          setStats(res.data.data);
        }
      })
      .catch(err => console.error("Error fetching stats:", err));

    axios.get("/api/public/news/latest")
      .then(res => {
        if (res.data?.data) {
          setLatestNews(res.data.data);
        }
      })
      .catch(err => console.error("Error fetching news:", err));

    axios.get("/api/settings")
      .then(res => {
        if (res.data?.data) {
          setSettings(res.data.data);
        }
      })
      .catch(err => console.error("Error fetching settings:", err));
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground overflow-hidden font-sans">
      {/* Top Bar SMAN 2 Harau Style */}
      <div className="bg-slate-900 text-white py-2 text-xs md:text-sm text-center relative overflow-hidden flex items-center justify-center font-medium">
        <p className="italic px-4">
          "Pendidikan merupakan tiket untuk masa depan. Hari esok untuk orang-orang yang telah mempersiapkan dirinya hari ini"
        </p>
      </div>

      {/* Header */}
      <header className="px-4 sm:px-8 py-3 sm:py-5 flex justify-between items-center bg-white/95 backdrop-blur-md sticky top-0 z-50 border-b-2 border-orange-100 shadow-sm dark:bg-gray-950/95 dark:border-gray-800">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-9 h-9 sm:w-12 sm:h-12 bg-orange-500 rounded-full flex items-center justify-center border-2 border-orange-200 shadow-inner shrink-0 overflow-hidden">
            {settings.schoolLogo ? (
              <img src={settings.schoolLogo} alt="Logo" className="max-h-full max-w-full object-contain" />
            ) : (
              <GraduationCap className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
            )}
          </div>
          <div>
            <h1 className="text-sm sm:text-xl font-extrabold tracking-tight text-slate-900 block leading-none uppercase">
              {settings.schoolName}
            </h1>
            <span className="text-[8px] sm:text-[10px] font-bold text-orange-600 uppercase tracking-widest">
              Boarding School
            </span>
          </div>
        </div>
        <div className="space-x-1 sm:space-x-3 flex items-center">
          <Link to="/login">
            <Button className="rounded-full px-3 sm:px-6 shadow-lg shadow-orange-500/20 bg-gradient-to-r from-orange-500 to-orange-600 hover:scale-105 transition-transform uppercase font-bold text-[10px] sm:text-xs tracking-widest text-white h-8 sm:h-10">
              Login
            </Button>
          </Link>
        </div>
      </header>
      
      {/* Hero Section */}
      <main className="flex-1 relative flex items-center justify-center pt-20 pb-32 px-4">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[60%] rounded-full bg-primary/20 blur-[120px] animate-pulse" />
          <div className="absolute top-[30%] -right-[10%] w-[40%] h-[50%] rounded-full bg-secondary/20 blur-[100px] animate-pulse delay-700" />
          <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[40%] rounded-full bg-accent/20 blur-[100px] animate-pulse delay-1000" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-md border border-orange-100 shadow-sm text-sm font-bold text-orange-800 uppercase tracking-widest animate-fade-in-up">
            <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-ping"></span>
            Portal Resmi Alumni
          </div>
          
          <h1 className="text-4xl tracking-tight font-extrabold text-slate-900 sm:text-5xl md:text-6xl animate-fade-in-up animation-delay-100">
            <span className="block">Sistem Informasi Alumni</span>
            <span className="block text-orange-500">{settings.schoolName}</span>
          </h1>
          <p className="mt-3 text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed animate-fade-in-up animation-delay-200">
            <span className="font-bold">"Kita tidak sedarah tapi lebih dari saudara."</span>
            <br/><br/>
            Wadah silaturahmi, pertukaran informasi, dan tracer study untuk seluruh alumni <span className="whitespace-nowrap">{settings.schoolName} Boarding School.</span>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up animation-delay-300 w-full max-w-lg sm:max-w-none mx-auto px-4">
            <Link to="/tracer-study" className="w-full sm:w-auto">
              <Button size="lg" className="w-full bg-orange-500 hover:bg-orange-600 text-white border-0 shadow-lg shadow-orange-500/30 px-8 py-6 rounded-xl text-base sm:text-lg font-semibold transition-all hover:scale-105 active:scale-95 flex items-center justify-center group">
                Isi Data & Tracer Study
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/directory" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full h-14 px-8 text-base sm:text-lg rounded-full border-2 bg-white/50 backdrop-blur-md hover:bg-gray-50 dark:bg-gray-900/50 dark:hover:bg-gray-800 transition-all hover:-translate-y-1 flex items-center justify-center">
                Lihat Direktori
              </Button>
            </Link>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-6 pt-16 max-w-2xl mx-auto animate-fade-in-up animation-delay-400">
            {[
              { icon: Users, label: "Total Alumni", value: stats.totalAlumni },
              { icon: GraduationCap, label: "Angkatan", value: stats.totalAngkatan },
            ].map((stat, idx) => (
              <div key={idx} className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white/40 backdrop-blur-md border border-white/60 shadow-lg dark:bg-gray-900/40 dark:border-gray-800 transition-transform hover:scale-105">
                <div className="p-3 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full mb-3 text-primary">
                  <stat.icon className="h-6 w-6" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</h3>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Latest News Section */}
          {latestNews.length > 0 && (
            <div className="mt-20 max-w-5xl mx-auto animate-fade-in-up animation-delay-500">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center">
                  <span className="w-2 h-8 bg-orange-500 rounded-full mr-3"></span>
                  Berita & Informasi Terbaru
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                {latestNews.map((news) => (
                  <div key={news.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
                    {news.image ? (
                      <div className="h-48 overflow-hidden">
                        <img src={news.image} alt={news.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                    ) : (
                      <div className="h-48 bg-slate-100 flex items-center justify-center text-slate-400">
                        <FileText size={48} />
                      </div>
                    )}
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="text-xs font-semibold text-orange-500 mb-2 uppercase tracking-wider">
                        {new Date(news.createdAt).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                      <h3 className="text-lg font-bold text-slate-800 mb-3 line-clamp-2 leading-snug group-hover:text-orange-600 transition-colors">
                        {news.title}
                      </h3>
                      <p className="text-slate-500 text-sm line-clamp-3 mb-4 flex-1">
                        {news.content}
                      </p>
                      <Button onClick={() => setSelectedNews(news)} variant="link" className="p-0 h-auto text-orange-600 font-semibold flex items-center justify-start self-start group/btn">
                        Baca selengkapnya <ArrowRight size={16} className="ml-1 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* News Detail Modal */}
        <Dialog open={!!selectedNews} onOpenChange={(open) => !open && setSelectedNews(null)}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            {selectedNews && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-slate-800">{selectedNews.title}</DialogTitle>
                  <DialogDescription className="text-orange-600 font-semibold mt-1">
                    {new Date(selectedNews.createdAt).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}
                  </DialogDescription>
                </DialogHeader>
                {selectedNews.image && (
                  <div className="w-full rounded-xl overflow-hidden my-4 max-h-[400px] flex items-center justify-center bg-slate-100">
                    <img src={selectedNews.image} alt={selectedNews.title} className="max-w-full max-h-[400px] object-contain" />
                  </div>
                )}
                <div className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {selectedNews.content}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </main>

      <footer className="py-8 border-t border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md text-center text-gray-500 dark:text-gray-400">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} Alumni SMA 2 Kecamatan Harau (Boarding School). All rights reserved.
        </p>
      </footer>
    </div>
  );
}
