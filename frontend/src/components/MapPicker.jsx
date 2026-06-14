import { useState, useEffect, useRef, useMemo } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import { Search } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet icons issue in React/Vite
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

function LocationMarker({ position, setPosition }) {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  const markerRef = useRef(null);
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          setPosition(marker.getLatLng());
        }
      },
    }),
    [setPosition]
  );

  return position === null ? null : (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
    ></Marker>
  );
}

function MapController({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 14);
    }
  }, [center, map]);
  return null;
}

export default function MapPicker({ defaultLat = -0.2298, defaultLng = 100.6308, onLocationSelect }) {
  const [position, setPosition] = useState(
    defaultLat && defaultLng ? { lat: defaultLat, lng: defaultLng } : null
  );

  useEffect(() => {
    if (position && onLocationSelect) {
      onLocationSelect(position.lat, position.lng);
    }
  }, [position, onLocationSelect]);

  // Default center points to around Harau, Payakumbuh or Padang if default is missing
  const initialCenter = position || { lat: -0.2298, lng: 100.6308 };
  const [mapCenter, setMapCenter] = useState(initialCenter);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery) return;
    setIsSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setSearchResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const selectResult = (result) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    setPosition({ lat, lng: lon });
    setMapCenter({ lat, lng: lon });
    setSearchResults([]);
    setSearchQuery("");
  };

  return (
    <div className="space-y-2">
      <div className="flex space-x-2 relative z-10">
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSearch(e);
            }
          }}
          placeholder="Cari daerah, kota, atau jalan..." 
          className="flex-1 border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        <button 
          type="button" 
          onClick={handleSearch} 
          disabled={isSearching} 
          className="bg-slate-800 text-white px-4 py-2 rounded-md hover:bg-slate-700 flex items-center text-sm"
        >
          <Search className="w-4 h-4 mr-2" />
          {isSearching ? "Mencari..." : "Cari"}
        </button>
      </div>

      {searchResults.length > 0 && (
        <div className="border border-slate-200 rounded-md bg-white shadow-lg max-h-48 overflow-y-auto relative z-20">
          {searchResults.map((res) => (
            <div 
              key={res.place_id} 
              className="px-4 py-2 text-sm border-b hover:bg-slate-50 cursor-pointer"
              onClick={() => selectResult(res)}
            >
              {res.display_name}
            </div>
          ))}
        </div>
      )}

      <div className="h-64 w-full rounded-md overflow-hidden border border-slate-300 z-0 relative">
        <MapContainer center={initialCenter} zoom={13} scrollWheelZoom={true} style={{ height: "100%", width: "100%", zIndex: 0 }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapController center={mapCenter} />
          <LocationMarker position={position} setPosition={setPosition} />
        </MapContainer>
        <div className="absolute bottom-2 right-2 bg-white/90 p-2 text-xs rounded shadow z-[1000] pointer-events-none">
          {position ? `${position.lat.toFixed(4)}, ${position.lng.toFixed(4)}` : "Klik peta untuk memilih"}
        </div>
      </div>
    </div>
  );
}
