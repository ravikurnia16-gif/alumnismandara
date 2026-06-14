import { useState, useEffect } from "react";
import axios from "axios";
import { Search, Plus, Trash2, Coins, Heart, User, Calendar, FileText } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export default function DonationTable() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ donorName: "", amount: "", note: "" });
  const [submitting, setSubmitting] = useState(false);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/donations");
      if (res.data.status === "success") {
        setDonations(res.data.data);
      }
    } catch (err) {
      console.error("Gagal mengambil data donasi:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus catatan donasi ini?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`/api/donations/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchDonations();
      } catch (err) {
        alert("Gagal menghapus donasi");
        console.error(err);
      }
    }
  };

  const handleCreate = async () => {
    if (!formData.donorName || !formData.amount) return alert("Nama donatur dan nominal wajib diisi");
    setSubmitting(true);
    try {
      await axios.post("/api/donations", {
        donorName: formData.donorName,
        amount: parseFloat(formData.amount),
        note: formData.note
      });
      setIsDialogOpen(false);
      setFormData({ donorName: "", amount: "", note: "" });
      fetchDonations();
    } catch (err) {
      alert("Gagal mencatat donasi");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredDonations = donations.filter(d => 
    d.donorName.toLowerCase().includes(search.toLowerCase()) || 
    (d.note && d.note.toLowerCase().includes(search.toLowerCase()))
  );

  const totalAmount = donations.reduce((sum, d) => sum + parseFloat(d.amount), 0);

  return (
    <div className="space-y-6">
      {/* Keuangan Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center">
          <div className="p-4 bg-orange-100 text-orange-600 rounded-lg mr-4">
            <Coins size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Keuangan Terkumpul</p>
            <h3 className="text-2xl font-bold text-slate-800">
              Rp {totalAmount.toLocaleString("id-ID")}
            </h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center">
          <div className="p-4 bg-red-100 text-red-600 rounded-lg mr-4 animate-pulse">
            <Heart size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Transaksi Donasi</p>
            <h3 className="text-2xl font-bold text-slate-800">{donations.length} Transaksi</h3>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input 
            placeholder="Cari donatur atau catatan..." 
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="bg-orange-500 hover:bg-orange-600 text-white font-semibold">
          <Plus size={18} className="mr-2" />
          Catat Donasi Manual
        </Button>
      </div>

      {/* Table Section */}
      <div className="border rounded-md shadow-sm bg-white overflow-x-auto w-full">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="py-4 px-6">Nama Donatur</TableHead>
              <TableHead className="py-4 px-6">Nominal</TableHead>
              <TableHead className="py-4 px-6">Tanggal</TableHead>
              <TableHead className="py-4 px-6">Pesan / Catatan</TableHead>
              <TableHead className="py-4 px-6 text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-slate-500">Memuat data...</TableCell>
              </TableRow>
            ) : filteredDonations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-slate-500">Tidak ada riwayat donasi ditemukan.</TableCell>
              </TableRow>
            ) : (
              filteredDonations.map((item) => (
                <TableRow key={item.id} className="hover:bg-slate-50 transition-colors">
                  <TableCell className="py-4 px-6 font-semibold text-slate-800 flex items-center gap-2">
                    <div className="p-1.5 bg-slate-100 rounded-full text-slate-500 shrink-0">
                      <User size={14} />
                    </div>
                    {item.donorName}
                  </TableCell>
                  <TableCell className="py-4 px-6 font-bold text-emerald-600">
                    Rp {parseFloat(item.amount).toLocaleString("id-ID")}
                  </TableCell>
                  <TableCell className="py-4 px-6 text-slate-500">
                    {new Date(item.createdAt).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}
                  </TableCell>
                  <TableCell className="py-4 px-6 text-slate-600 max-w-xs truncate" title={item.note}>
                    {item.note || "-"}
                  </TableCell>
                  <TableCell className="py-4 px-6 text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="text-red-500 hover:bg-red-50">
                      <Trash2 size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Record Donation Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Catat Donasi Manual</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Nama Donatur</label>
              <Input 
                value={formData.donorName} 
                onChange={(e) => setFormData({...formData, donorName: e.target.value})}
                placeholder="Masukkan nama donatur..." 
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Nominal Donasi (Rp)</label>
              <Input 
                type="number"
                value={formData.amount} 
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                placeholder="Contoh: 500000" 
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Catatan / Keterangan (Opsional)</label>
              <Input 
                value={formData.note} 
                onChange={(e) => setFormData({...formData, note: e.target.value})}
                placeholder="Semoga berkah..." 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={submitting}>Batal</Button>
            <Button onClick={handleCreate} disabled={submitting} className="bg-orange-500 hover:bg-orange-600 text-white">
              {submitting ? "Menyimpan..." : "Simpan Donasi"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
