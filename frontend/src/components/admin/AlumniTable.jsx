import { useState, useEffect } from "react";
import axios from "axios";
import { Edit, Trash2, Plus, Search } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AlumniFormDialog from "./AlumniFormDialog";

export default function AlumniTable() {
  const [alumni, setAlumni] = useState([]);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAlumni, setEditingAlumni] = useState(null);

  const fetchAlumni = async () => {
    try {
      const response = await axios.get("/api/alumni", {
        params: { search }
      });
      setAlumni(response.data.data);
    } catch (error) {
      console.error("Failed to fetch alumni", error);
    }
  };

  useEffect(() => {
    fetchAlumni();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleOpenDialog = (data = null) => {
    setEditingAlumni(data);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingAlumni(null);
  };

  const handleSubmit = async (data) => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      if (editingAlumni) {
        await axios.put(`/api/admin/alumni/${editingAlumni.id}`, data, { headers });
      } else {
        await axios.post("/api/admin/alumni", data, { headers });
      }
      
      handleCloseDialog();
      fetchAlumni();
    } catch (error) {
      alert(error.response?.data?.message || "Terjadi kesalahan");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus data alumni ini?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`/api/admin/alumni/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchAlumni();
      } catch (error) {
        alert("Gagal menghapus alumni");
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input 
            placeholder="Cari nama alumni..." 
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button onClick={() => handleOpenDialog()} className="bg-orange-500 hover:bg-orange-600 text-white">
          <Plus className="h-4 w-4 mr-2" /> Tambah Alumni
        </Button>
      </div>

      <div className="border rounded-md shadow-sm bg-white overflow-x-auto w-full">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead>Nama</TableHead>
              <TableHead>Angkatan</TableHead>
              <TableHead>NISN</TableHead>
              <TableHead>Jurusan</TableHead>
              <TableHead>Kota</TableHead>
              <TableHead>Negara</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {alumni.length > 0 ? (
              alumni.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.user?.name}</TableCell>
                  <TableCell>{item.angkatan || "-"}</TableCell>
                  <TableCell>{item.nisn || "-"}</TableCell>
                  <TableCell>{item.jurusan || "-"}</TableCell>
                  <TableCell>{item.kota || "-"}</TableCell>
                  <TableCell>{item.negara || "Indonesia"}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(item)}>
                      <Edit className="h-4 w-4 text-slate-600 hover:text-orange-500" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="h-4 w-4 text-red-500 hover:text-red-700" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-gray-500">
                  Tidak ada data alumni ditemukan.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AlumniFormDialog 
        isOpen={isDialogOpen} 
        onClose={handleCloseDialog} 
        onSubmit={handleSubmit}
        initialData={editingAlumni}
      />
    </div>
  );
}
