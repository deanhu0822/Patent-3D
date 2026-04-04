import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix Leaflet's broken default icon paths in Vite/bundler environments
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

export function SupplierMap({ address, supplier, phone }) {
  const [coords, setCoords] = useState(null);
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'error'

  useEffect(() => {
    if (!address) return;
    setCoords(null);
    setStatus('loading');

    fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`,
      { headers: { 'Accept-Language': 'en' } }
    )
      .then((r) => r.json())
      .then((data) => {
        if (data.length > 0) {
          setCoords([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
          setStatus('idle');
        } else {
          setStatus('error');
        }
      })
      .catch(() => setStatus('error'));
  }, [address]);

  if (!address) return null;

  if (status === 'loading') {
    return <p className="dim supplier-map-hint">Locating supplier…</p>;
  }

  if (status === 'error') {
    return <p className="dim supplier-map-hint">Could not locate supplier on map</p>;
  }

  if (!coords) return null;

  return (
    <div className="supplier-map">
      <MapContainer
        center={coords}
        zoom={13}
        zoomControl={false}
        attributionControl={false}
        style={{ height: 150, width: '100%', borderRadius: 6 }}
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
        <Marker position={coords}>
          <Popup>
            <strong>{supplier}</strong>
            {address && <><br />{address}</>}
            {phone && <><br />{phone}</>}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
