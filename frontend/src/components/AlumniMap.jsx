import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet icons issue in Vite/React
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

export default function AlumniMap({ alumniList = [] }) {
  // Filter only alumni who have coordinates
  const mappedAlumni = alumniList.filter(
    (al) => al.latitude !== null && al.longitude !== null && !isNaN(al.latitude) && !isNaN(al.longitude)
  );

  // Center around SMAN 2 Harau / West Sumatra if there are no alumni mapped
  const center = mappedAlumni.length > 0 
    ? [mappedAlumni[0].latitude, mappedAlumni[0].longitude]
    : [-0.2298, 100.6308];

  if (mappedAlumni.length === 0) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center text-slate-500 text-sm">
        Belum ada alumni dengan koordinat lokasi domisili yang valid di direktori ini.
      </div>
    );
  }

  return (
    <div className="h-96 w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative z-0 mb-6">
      <MapContainer center={center} zoom={5} scrollWheelZoom={true} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {mappedAlumni.map((al) => (
          <Marker key={al.id} position={[al.latitude, al.longitude]}>
            <Popup className="custom-popup">
              <div className="flex flex-col items-center space-y-2 p-1 max-w-[200px]">
                {al.foto ? (
                  <img 
                    src={al.foto} 
                    alt={al.user?.name || "Foto"} 
                    className="w-12 h-12 rounded-full object-cover border border-slate-200" 
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm">
                    {al.user?.name?.charAt(0).toUpperCase() || "A"}
                  </div>
                )}
                <div className="text-center">
                  <h4 className="font-bold text-slate-900 text-sm leading-tight">{al.user?.name || "Alumni"}</h4>
                  <p className="text-xs text-orange-600 font-semibold">Angkatan {al.angkatan} - {al.jurusan}</p>
                  <p className="text-[11px] text-slate-500 mt-1">{al.kota}, {al.provinsi}</p>
                  {al.bio && (
                    <p className="text-[10px] italic text-slate-400 mt-1 line-clamp-2 border-t pt-1">
                      "{al.bio}"
                    </p>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
