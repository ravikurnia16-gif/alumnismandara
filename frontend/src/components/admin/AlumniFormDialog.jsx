import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const schema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  email: z.string().email("Email tidak valid"),
  nisn: z.string().optional(),
  angkatan: z.string().optional(),
  negara: z.string().optional(),
  kota: z.string().optional(),
  negaraDomisili: z.string().optional(),
  kotaDomisili: z.string().optional(),
  statusNikah: z.string().optional(),
  jurusan: z.string().optional(),
  namaAsrama: z.string().optional(),
});

export default function AlumniFormDialog({ isOpen, onClose, onSubmit, initialData }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      nisn: "",
      angkatan: "",
      negara: "Indonesia",
      kota: "",
      negaraDomisili: "Indonesia",
      kotaDomisili: "",
      statusNikah: "",
      jurusan: "",
      namaAsrama: "",
    }
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.user?.name || "",
        email: initialData.user?.email || "",
        nisn: initialData.nisn || "",
        angkatan: initialData.angkatan?.toString() || "",
        negara: initialData.negara || "Indonesia",
        kota: initialData.kota || "",
        negaraDomisili: initialData.negaraDomisili || "Indonesia",
        kotaDomisili: initialData.kotaDomisili || "",
        statusNikah: initialData.statusNikah || "",
        jurusan: initialData.jurusan || "",
        namaAsrama: initialData.namaAsrama || "",
      });
    } else {
      reset({
        name: "", email: "", nisn: "", angkatan: "", negara: "Indonesia", kota: "", negaraDomisili: "Indonesia", kotaDomisili: "", statusNikah: "", jurusan: "", namaAsrama: ""
      });
    }
  }, [initialData, reset, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Alumni" : "Tambah Alumni"}</DialogTitle>
          <DialogDescription>
            {initialData 
              ? "Ubah data alumni di bawah ini. Klik simpan saat selesai." 
              : "Masukkan data alumni baru. Akun user akan dibuatkan otomatis dengan password default."}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Nama Lengkap</label>
            <Input {...register("name")} placeholder="Masukkan nama..." />
            {errors.name && <span className="text-red-500 text-xs">{errors.name.message}</span>}
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <Input type="email" {...register("email")} placeholder="email@contoh.com" />
            {errors.email && <span className="text-red-500 text-xs">{errors.email.message}</span>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">NISN (Opsional)</label>
              <Input {...register("nisn")} placeholder="NISN" />
            </div>
            <div>
              <label className="text-sm font-medium">Angkatan</label>
              <Input type="number" {...register("angkatan")} placeholder="Tahun (Contoh: 2020)" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Kota Asal</label>
              <Input {...register("kota")} placeholder="Kota" />
            </div>
            <div>
              <label className="text-sm font-medium">Negara Asal</label>
              <Input {...register("negara")} placeholder="Indonesia" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Kota Domisili</label>
              <Input {...register("kotaDomisili")} placeholder="Kota Domisili" />
            </div>
            <div>
              <label className="text-sm font-medium">Negara Domisili</label>
              <Input {...register("negaraDomisili")} placeholder="Indonesia" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Jurusan SMA</label>
              <Input {...register("jurusan")} placeholder="MIPA / IPS / dsb" />
            </div>
            <div>
              <label className="text-sm font-medium">Asrama/Kamar</label>
              <Input {...register("namaAsrama")} placeholder="Nama Asrama" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Status Pernikahan</label>
              <select {...register("statusNikah")} className="w-full mt-1 border border-slate-300 rounded-md p-2 text-sm">
                <option value="">Pilih Status</option>
                <option value="Lajang">Lajang</option>
                <option value="Menikah">Menikah</option>
                <option value="Cerai">Cerai</option>
              </select>
            </div>
          </div>
          
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => onClose(false)}>Batal</Button>
            <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white">Simpan</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
