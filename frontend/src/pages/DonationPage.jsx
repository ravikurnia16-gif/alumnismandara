import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { GraduationCap, ArrowLeft, Heart, Coins, FileText, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function DonationPage() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [donorName, setDonorName] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const targetDonation = 50000000; // IDR 50.000.000 Target

  const fetchDonations = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/donations");
      if (res.data.status === "success") {
        setDonations(res.data.data);
      }
    } catch (err) {
      console.error("Gagal memuat donasi:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  const totalCollected = donations.reduce((sum, don) => sum + parseFloat(don.amount || 0), 0);
  const percentage = Math.min(Math.round((totalCollected / targetDonation) * 100), 100);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!donorName || !amount) return;
    setSubmitting(true);
    try {
      await axios.post("/api/donations", {
        donorName,
        amount: parseFloat(amount),
        note
      });
      alert("Terima kasih atas donasi Anda! Kontribusi Anda sangat berarti.");
      setDonorName("");
      setAmount("");
      setNote("");
      fetchDonations();
    } catch (err) {
      console.error(err);
      alert("Gagal mengirim data donasi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header */}
      <header className="px-8 py-5 flex justify-between items-center bg-white border-b border-orange-100 shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center border-2 border-orange-200">
            <Heart className="h-5 w-5 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold tracking-tight text-slate-900 block leading-none uppercase">
              SMAN 2 HARAU
            </h1>
            <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">
              Donasi & Transparansi
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

      <main className="flex-1 p-6 lg:p-10 max-w-5xl mx-auto w-full space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-3xl font-extrabold text-slate-900">Program Donasi Alumni</h2>
          <p className="text-slate-500">
            Salurkan kepedulian Anda untuk mendukung sarana prasarana sekolah, kegiatan sosial, dan beasiswa adik-adik kelas SMAN 2 Harau.
          </p>
        </div>

        {/* Progress Tracker Card */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 text-center space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-slate-100">
            <div className="py-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Terkumpul</p>
              <h3 className="text-3xl font-bold text-orange-600 mt-1">
                Rp {totalCollected.toLocaleString("id-ID")}
              </h3>
            </div>
            <div className="py-2 md:px-6">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Target Pendanaan</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-1">
                Rp {targetDonation.toLocaleString("id-ID")}
              </h3>
            </div>
            <div className="py-2 md:px-6">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Jumlah Donatur</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-1">{donations.length} Orang</h3>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm font-semibold text-slate-600">
              <span>Progres Target</span>
              <span>{percentage}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden border">
              <div 
                className="bg-gradient-to-r from-orange-500 to-amber-500 h-full rounded-full transition-all duration-1000" 
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Donation Form */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
            <h3 className="text-xl font-bold text-slate-900 flex items-center">
              <Coins className="w-5 h-5 text-orange-500 mr-2" />
              Kirim Donasi Baru
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Donatur</label>
                <Input 
                  value={donorName} 
                  onChange={e => setDonorName(e.target.value)} 
                  placeholder="Nama lengkap atau Hamba Allah..." 
                  required 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nominal Donasi (IDR)</label>
                <Input 
                  type="number" 
                  value={amount} 
                  onChange={e => setAmount(e.target.value)} 
                  placeholder="Contoh: 100000" 
                  required 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Pesan / Catatan Donatur (Opsional)</label>
                <Input 
                  value={note} 
                  onChange={e => setNote(e.target.value)} 
                  placeholder="Semoga bermanfaat..." 
                />
              </div>

              <Button 
                type="submit" 
                disabled={submitting} 
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold h-12 rounded-xl transition-all"
              >
                {submitting ? "Mengirim..." : "Kirim Donasi"}
              </Button>
            </form>
          </div>

          {/* Donation History List */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
            <h3 className="text-xl font-bold text-slate-900 flex items-center">
              <FileText className="w-5 h-5 text-orange-500 mr-2" />
              Riwayat Donasi Terbaru
            </h3>

            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
              {loading ? (
                <p className="text-center text-slate-400 text-sm py-8">Memuat riwayat donasi...</p>
              ) : donations.length === 0 ? (
                <p className="text-center text-slate-400 text-sm py-8">Belum ada donasi terkumpul. Jadilah yang pertama!</p>
              ) : (
                donations.map((don) => (
                  <div key={don.id} className="flex items-start gap-4 p-4 border border-slate-100 rounded-xl bg-slate-50/50">
                    <div className="p-2.5 bg-orange-50 rounded-full text-orange-600">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <h4 className="font-bold text-slate-900 text-sm truncate">{don.donorName}</h4>
                        <span className="text-sm font-bold text-emerald-600 shrink-0">
                          + Rp {parseFloat(don.amount).toLocaleString("id-ID")}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {new Date(don.createdAt).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                      {don.note && (
                        <p className="text-xs text-slate-600 mt-2 bg-white px-3 py-1.5 rounded-lg border border-slate-100">
                          "{don.note}"
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
