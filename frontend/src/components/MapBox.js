import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import supabase from '../supabaseClient'; // No curly braces
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const colors = {
  'Pothole': 'red',
  'Broken Traffic Signal': 'orange',
  'Waterlogging': 'blue',
  'Garbage on Road': 'green',
  'Illegal Parking': 'purple',
  'Blocked Road': 'yellow'
};

const icon = (color) => L.divIcon({
  html: `<div style="background:${color};width:12px;height:12px;border-radius:50%"></div>`
});

const MapBox = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      const { data, error } = await supabase
        .from('road_issues')
        .select('*')
        .eq('is_resolved', false);

      if (error) {
        console.error('Error fetching reports:', error.message);
        setReports([]); // fallback to empty array
      } else {
        setReports(data || []);
      }
      setLoading(false);
    };

    fetchReports();
  }, []);

  return (
    <div>
      {loading ? (
        <p>Loading map and reports...</p>
      ) : (
        <MapContainer center={[10.9947, 76.0011]} zoom={13} style={{ height: '400px', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          {Array.isArray(reports) && reports.length > 0 ? (
            reports.map((r) => (
              <Marker
                key={r.id}
                position={[r.location_lat, r.location_lng]}
                icon={icon(colors[r.issue_type] || 'gray')}
              >
                <Popup>
                  <strong>{r.issue_type}</strong><br />
                  {r.description || 'No description provided'}
                </Popup>
              </Marker>
            ))
          ) : (
            <Popup position={[10.9947, 76.0011]}>
              <p>No unresolved issues found.</p>
            </Popup>
          )}
        </MapContainer>
      )}
    </div>
  );
};

export default MapBox;
