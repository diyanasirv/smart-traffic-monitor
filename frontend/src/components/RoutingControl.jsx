import { useMap } from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

const RoutingControl = () => {
  const map = useMap(); // ✅ get map context

  useEffect(() => {
    if (!map) return;

    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(10.9942, 76.0011),
        L.latLng(10.9982, 76.0045),
      ],
      routeWhileDragging: false,
      show: false,
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
    }).addTo(map);

    return () => {
      // ✅ Clean up routingControl when component unmounts
      map.removeControl(routingControl);
    };
  }, [map]);

  return null;
};

export default RoutingControl;
