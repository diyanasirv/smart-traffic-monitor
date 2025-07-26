// At the top of your file (already done)
import 'leaflet-control-geocoder';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';
import L from 'leaflet';
import { useMap } from 'react-leaflet';
import { useEffect } from 'react';
import { toast } from 'react-toastify';

const isInsideKottakkal = (lat, lng) =>
  lat >= 10.9800 && lat <= 11.0080 && lng >= 75.9900 && lng <= 76.0150;

const GeocoderControl = ({ position }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !L.Control.Geocoder) return;

    const geocoderControl = L.Control.geocoder({
      geocoder: L.Control.Geocoder.nominatim(),
      position: position || 'topright',
      defaultMarkGeocode: false
    })
      .on('markgeocode', (e) => {
        const latlng = e.geocode.center;

        if (!isInsideKottakkal(latlng.lat, latlng.lng)) {
          toast.warning("Location is outside Kottakkal boundary.");
          return;
        }

        map.setView(latlng, 17);
        L.marker(latlng).addTo(map)
          .bindPopup(e.geocode.name)
          .openPopup();
      })
      .addTo(map);

    return () => {
      map.removeControl(geocoderControl);
    };
  }, [map, position]);

  return null;
};

export default GeocoderControl;
