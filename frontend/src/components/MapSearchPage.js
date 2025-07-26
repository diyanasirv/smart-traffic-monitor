import { useMap } from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";
import "leaflet-control-geocoder";
import "leaflet-control-geocoder/dist/Control.Geocoder.css";

const GeocoderControl = () => {
  const map = useMap();

  useEffect(() => {
    if (!map || !L.Control.Geocoder) return;

    const geocoder = L.Control.geocoder({
      geocoder: L.Control.Geocoder.nominatim(),
      defaultMarkGeocode: false
    });

    geocoder.on("markgeocode", function (e) {
      const latlng = e.geocode.center;

      const withinKottakkal =
        latlng.lat >= 10.9800 &&
        latlng.lat <= 11.0080 &&
        latlng.lng >= 75.9900 &&
        latlng.lng <= 76.0150;

      if (!withinKottakkal) {
        alert("Only locations within Kottakkal are allowed.");
        return;
      }

      map.setView(latlng, 16);
      L.marker(latlng).addTo(map).bindPopup(e.geocode.name).openPopup();
    });

    geocoder.addTo(map);

    return () => {
      map.removeControl(geocoder);
    };
  }, [map]);

  return null;
};

export default GeocoderControl;
