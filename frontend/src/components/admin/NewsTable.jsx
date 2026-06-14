import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Search, Plus, Edit, Trash2, FileText, Image as ImageIcon } from "lucide-react";

export default function NewsTable() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const [formData, setFormData] = useState({ title: "", content: "" });
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get("/api/admin/news", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNews(res.data.data);
    } catch (error) {
      console.error("Error fetching news:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (item = null) => {
    if (item) {
      setEditingNews(item);
      setFormData({ title: item.title, content: item.content });
    } else {
      setEditingNews(null);
      setFormData({ title: "", content: "" });
    }
    setImageFile(null);
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.content) return alert("Judul dan Konten wajib diisi");
    
    try {
      const token = localStorage.getItem("token");
      const data = new FormData();
      data.append("title", formData.title);
      data.append("content", formData.content);
      if (imageFile) {
        data.append("image", imageFile);
      }

      if (editingNews) {
        await axios.put(`/api/admin/news/${editingNews.id}`, data, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
        });
      } else {
        await axios.post("/api/admin/news", data, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
        });
      }
      
      setIsDialogOpen(false);
      fetchNews();
    } catch (error) {
      alert("Terjadi kesalahan");
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Yakin ingin menghapus berita ini?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`/api/admin/news/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchNews();
      } catch (error) {
        alert("Gagal menghapus berita");
      }
    }
  };

  const filteredNews = news.filter(n => n.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input 
            placeholder="Cari judul berita..." 
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button onClick={() => handleOpenDialog()} className="bg-orange-500 hover:bg-orange-600 text-white">
          <Plus size={18} className="mr-2" />
          Tulis Berita
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
            <tr>
              <th className="py-4 px-6">Gambar</th>
              <th className="py-4 px-6">Judul</th>
              <th className="py-4 px-6">Tanggal</th>
              <th className="py-4 px-6 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {loading ? (
              <tr>
                <td colSpan="4" className="py-8 text-center text-slate-500">Memuat data...</td>
              </tr>
            ) : filteredNews.length === 0 ? (
              <tr>
                <td colSpan="4" className="py-8 text-center text-slate-500">Tidak ada berita ditemukan.</td>
              </tr>
            ) : (
              filteredNews.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-6">
                    {item.image ? (
                      <img src={item.image} alt={item.title} className="w-16 h-12 object-cover rounded-md border border-slate-200" />
                    ) : (
                      <div className="w-16 h-12 bg-slate-100 rounded-md flex items-center justify-center text-slate-400 border border-slate-200">
                        <ImageIcon size={16} />
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-6 font-medium text-slate-800">{item.title}</td>
                  <td className="py-3 px-6 text-slate-500">{new Date(item.createdAt).toLocaleDateString("id-ID")}</td>
                  <td className="py-3 px-6 text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleOpenDialog(item)} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200">
                      <Edit size={16} />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
                      <Trash2 size={16} />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingNews ? "Edit Berita" : "Tulis Berita Baru"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Judul Berita</label>
              <Input 
                value={formData.title} 
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Masukkan judul..." 
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Gambar Utama (Opsional)</label>
              <Input 
                type="file" 
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0])}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Isi Konten</label>
              <textarea 
                className="w-full h-40 rounded-md border border-slate-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={formData.content} 
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                placeholder="Tulis isi berita di sini..." 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSubmit} className="bg-orange-500 hover:bg-orange-600 text-white">Simpan Berita</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
