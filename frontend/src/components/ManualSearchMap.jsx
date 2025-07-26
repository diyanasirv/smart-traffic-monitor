import React, { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap, Circle, Polyline } from "react-leaflet";
import L from "leaflet";
import { createClient } from '@supabase/supabase-js';
import { ToastContainer, toast } from 'react-toastify';
import { motion } from 'framer-motion';
import 'react-toastify/dist/ReactToastify.css';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';
import LControlGeocoder from 'leaflet-control-geocoder';

L.Control.Geocoder = LControlGeocoder;
const supabase = createClient(process.env.REACT_APP_SUPABASE_URL, process.env.REACT_APP_SUPABASE_KEY);

// Enhanced Marker Icon with rotation support
const createCustomIcon = (icon, color, rotation = 0) => L.divIcon({
  className: 'custom-icon',
  html: `
    <div style="
      background:${color};
      padding:8px;
      border-radius:50%;
      box-shadow:0 0 10px rgba(0,0,0,0.2);
      transform:rotate(${rotation}deg);
      display:inline-block;
    ">
      ${icon}
    </div>
  `,
  iconSize: [36, 36]
});

// Default marker fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const kottakkalBounds = [
  [10.9800, 75.9900],
  [11.0080, 76.0150],
];

const isInsideKottakkal = (lat, lng) =>
  lat >= 10.9800 && lat <= 11.0080 && lng >= 75.9900 && lng <= 76.0150;

// Direction calculation utility
const calculateDirection = (start, end) => {
  const dx = end[1] - start[1];
  const dy = end[0] - start[0];
  return Math.atan2(dy, dx) * 180 / Math.PI;
};

// Direction Indicator Component
const DirectionIndicator = ({ report }) => {
  if (!report.directionData) return null;
  
  const { startPoint, endPoint } = report.directionData;
  const center = [
    (startPoint[0] + endPoint[0]) / 2,
    (startPoint[1] + endPoint[1]) / 2
  ];
  
  const angle = calculateDirection(startPoint, endPoint);
  
  return (
    <>
      <Polyline 
        positions={[startPoint, endPoint]} 
        color="blue" 
        dashArray="5, 5"
      />
      <Marker 
        position={center}
        icon={createCustomIcon('➤', '#3B82F6', angle)}
      >
        <Popup>Direction of issue</Popup>
      </Marker>
    </>
  );
};

const ClickHandler = ({ onMapClick }) => {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      if (isInsideKottakkal(lat, lng)) {
        onMapClick([lat, lng]);
      } else {
        toast.warning("Selected location is outside Kottakkal boundary");
      }
    },
  });
  return null;
};

const GeocoderControl = ({ onGeocode }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !L.Control.Geocoder) return;

    const geocoderControl = L.Control.geocoder({
      geocoder: L.Control.Geocoder.nominatim(),
      defaultMarkGeocode: false,
    })
      .on("markgeocode", function (e) {
        const latlng = e.geocode.center;

        if (!isInsideKottakkal(latlng.lat, latlng.lng)) {
          toast.warning("Only locations within Kottakkal are allowed.");
          return;
        }

        map.setView(latlng, 16);
        onGeocode([latlng.lat, latlng.lng]);
        L.marker(latlng).addTo(map).bindPopup(e.geocode.name).openPopup();
      })
      .addTo(map);

    return () => {
      map.removeControl(geocoderControl);
    };
  }, [map, onGeocode]);

  return null;
};

const ManualSearchMap = () => {
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [reports, setReports] = useState([]);
  const [newReport, setNewReport] = useState({ 
    title: "", 
    description: "", 
    file: null, 
    position: null,
    type: "pothole",
    directionData: null
  });
  const [showReportForm, setShowReportForm] = useState(false);
  const [locationLoading, setLocationLoading] = useState(true);
  const [showDirectionForm, setShowDirectionForm] = useState(false);
  const [tempDirectionPoints, setTempDirectionPoints] = useState([]);
  const mapRef = useRef();

  // Auto-detect user location
  useEffect(() => {
    setLocationLoading(true);
    
    const handleSuccess = ({ coords }) => {
      const { latitude, longitude } = coords;
      if (isInsideKottakkal(latitude, longitude)) {
        setUserLocation([latitude, longitude]);
        setSelectedPosition([latitude, longitude]);
        toast.success("Your current location has been detected");
      } else {
        setUserLocation([10.9942, 76.0011]);
        toast.info("You're outside Kottakkal. Defaulting to town center.");
      }
      setLocationLoading(false);
    };

    const handleError = () => {
      setUserLocation([10.9942, 76.0011]);
      toast.warning("Location access denied. Using default location.");
      setLocationLoading(false);
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(handleSuccess, handleError);
    } else {
      handleError();
    }
  }, []);

  // Fetch reports with direction data
  useEffect(() => {
    const fetchReports = async () => {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .neq('status', 'resolved') // Exclude resolved reports
        .order('created_at', { ascending: false });

      if (error) {
        toast.error("Failed to load reports");
        return;
      }
      setReports(data);
    };

    fetchReports();

    const subscription = supabase
      .channel('reports')
      .on('postgres_changes', { 
        event: '*',
        schema: 'public',
        table: 'reports' 
      }, (payload) => {
        if (payload.eventType === 'DELETE') {
          setReports(prev => prev.filter(r => r.id !== payload.old.id));
        } else if (payload.eventType === 'INSERT') {
          setReports(prev => [payload.new, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setReports(prev => 
            payload.new.status === 'resolved' 
              ? prev.filter(r => r.id !== payload.new.id)
              : prev.map(r => r.id === payload.new.id ? payload.new : r)
          );
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const handleMapClickForDirection = (latlng) => {
    if (tempDirectionPoints.length < 2) {
      setTempDirectionPoints([...tempDirectionPoints, [latlng[0], latlng[1]]]);
    }
  };

  const saveDirectionData = () => {
    if (tempDirectionPoints.length === 2) {
      setNewReport({
        ...newReport,
        directionData: {
          startPoint: tempDirectionPoints[0],
          endPoint: tempDirectionPoints[1]
        }
      });
      setShowDirectionForm(false);
      setTempDirectionPoints([]);
    }
  };

  const handleAddReport = async (e) => {
    e.preventDefault();
    if (!selectedPosition) {
      toast.error("Please select a location first");
      return;
    }

    try {
      let fileUrl = null;
      if (newReport.file) {
        const fileExt = newReport.file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('report-images')
          .upload(fileName, newReport.file);

        if (uploadError) throw uploadError;
        fileUrl = supabase.storage.from('report-images').getPublicUrl(fileName).data.publicUrl;
      }

      const reportData = {
        title: newReport.title,
        description: newReport.description,
        image_url: fileUrl,
        location: `POINT(${selectedPosition[1]} ${selectedPosition[0]})`,
        type: newReport.type,
        status: 'pending',
        direction_data: newReport.directionData
      };

      const { error } = await supabase
        .from('reports')
        .insert([reportData]);

      if (error) throw error;

      toast.success("Report submitted successfully!");
      setShowReportForm(false);
      setNewReport({ 
        title: "", 
        description: "", 
        file: null, 
        position: null, 
        type: "pothole",
        directionData: null 
      });
    } catch (error) {
      toast.error("Error submitting report");
      console.error(error);
    }
  };

  const getIconForReport = (type) => {
    const icons = {
      pothole: createCustomIcon('🕳️', '#F59E0B'),
      accident: createCustomIcon('🚨', '#EF4444'),
      congestion: createCustomIcon('🚗', '#3B82F6'),
      hazard: createCustomIcon('⚠️', '#F97316'),
      other: createCustomIcon('ℹ️', '#6B7280')
    };
    return icons[type] || icons.other;
  };

  return (
    <div className="min-vh-100 bg-light">
      <ToastContainer position="top-end" autoClose={3000} />
      <div className="container py-4">
        <div className="row mb-4">
          <div className="col-12">
            <div className="p-4 bg-primary text-white rounded-3 shadow">
              <h1 className="display-5 fw-bold mb-2">Kottakkal Traffic Reports</h1>
              <p className="lead mb-0">
                {locationLoading ? (
                  <span className="spinner-border spinner-border-sm me-2"></span>
                ) : (
                  <i className="bi bi-info-circle-fill me-2"></i>
                )}
                {locationLoading ? "Detecting your location..." : "Help improve Kottakkal's roads by reporting traffic issues"}
              </p>
            </div>
          </div>
        </div>

        <div className="row g-4">
          <div className="col-lg-4">
            <div className="card shadow-sm h-100">
              <div className="card-header bg-white border-bottom-0">
                <h2 className="h4 mb-0">
                  <i className="bi bi-list-ul text-primary me-2"></i>
                  Recent Reports
                </h2>
              </div>
              <div className="card-body p-0">
                <motion.div 
                  className="list-group list-group-flush" 
                  style={{ maxHeight: "400px", overflowY: "auto" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {reports.length > 0 ? (
                    reports.map(report => (
                      <motion.div
                        key={report.id}
                        className="list-group-item list-group-item-action"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="d-flex w-100 justify-content-between">
                          <h5 className="mb-1">{report.title}</h5>
                          <small className="text-muted">
                            {new Date(report.created_at).toLocaleDateString()}
                          </small>
                        </div>
                        <p className="mb-1 text-muted">{report.description}</p>
                        <small className={`badge bg-${{
                          pothole: 'warning',
                          accident: 'danger',
                          congestion: 'primary',
                          hazard: 'orange',
                          other: 'secondary'
                        }[report.type] || 'secondary'}`}>
                          {report.type || 'unknown'}
                        </small>
                      </motion.div>
                    ))
                  ) : (
                    <div className="list-group-item text-muted">
                      No active reports found
                    </div>
                  )}
                </motion.div>
              </div>
              <div className="card-footer bg-white border-top-0">
                <button
                  onClick={() => {
                    if (!selectedPosition) {
                      toast.warning("Please select a location on the map first");
                    } else {
                      setShowReportForm(true);
                    }
                  }}
                  className="btn btn-primary w-100 py-2 fw-bold"
                  disabled={!selectedPosition}
                >
                  <i className="bi bi-plus-circle me-2"></i>
                  {selectedPosition ? "Report Issue Here" : "Select Location First"}
                </button>
              </div>
            </div>
          </div>

          <div className="col-lg-8">
            <div className="card shadow-sm h-100 border-0">
              <div className="card-body p-0">
                {userLocation ? (
                  <MapContainer
                    center={userLocation}
                    zoom={15}
                    scrollWheelZoom
                    className="h-100 w-100 rounded-end"
                    maxBounds={kottakkalBounds}
                    maxBoundsViscosity={1.0}
                    whenCreated={map => mapRef.current = map}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; OpenStreetMap contributors'
                    />

                    <GeocoderControl onGeocode={setSelectedPosition} />
                    {showDirectionForm ? (
                      <ClickHandler onMapClick={handleMapClickForDirection} />
                    ) : (
                      <ClickHandler onMapClick={setSelectedPosition} />
                    )}

                    <Circle center={[10.9942, 76.0011]} radius={2000} pathOptions={{ color: '#10B981', fillOpacity: 0.1 }} />

                    {userLocation && (
                      <Marker position={userLocation} icon={createCustomIcon('📍', '#3B82F6')}>
                        <Popup>Your Current Location</Popup>
                      </Marker>
                    )}

                    {selectedPosition && (
                      <Marker position={selectedPosition} icon={createCustomIcon('📌', '#EF4444')}>
                        <Popup>Selected Location for Report</Popup>
                      </Marker>
                    )}

                    {tempDirectionPoints.map((point, index) => (
                      <Marker 
                        key={`temp-${index}`}
                        position={point}
                        icon={createCustomIcon(index === 0 ? '⭕' : '🔴', '#3B82F6')}
                      />
                    ))}

                    {tempDirectionPoints.length === 2 && (
                      <Polyline 
                        positions={tempDirectionPoints} 
                        color="blue" 
                        dashArray="5, 5"
                      />
                    )}

                    {reports.map(report => (
                      <React.Fragment key={report.id}>
                        <Marker
                          position={[report.location.coordinates[1], report.location.coordinates[0]]}
                          icon={getIconForReport(report.type)}
                        >
                          <Popup>
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                            >
                              <strong>{report.title}</strong><br />
                              {report.description}
                              {report.status === 'resolved' && (
                                <div className="text-success mt-2">
                                  <i className="bi bi-check-circle-fill"></i> Resolved
                                </div>
                              )}
                            </motion.div>
                          </Popup>
                        </Marker>
                        {report.direction_data && <DirectionIndicator report={report} />}
                      </React.Fragment>
                    ))}
                  </MapContainer>
                ) : (
                  <div className="d-flex justify-content-center align-items-center h-100">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {showReportForm && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  Report Issue
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setShowReportForm(false)}
                ></button>
              </div>
              
              <div className="modal-body">
                <div className="alert alert-info mb-4">
                  <i className="bi bi-geo-alt-fill me-2"></i>
                  <strong>Location:</strong> {selectedPosition[0].toFixed(6)}, {selectedPosition[1].toFixed(6)}
                </div>

                <form onSubmit={handleAddReport}>
                  <div className="mb-3">
                    <label className="form-label">Issue Type</label>
                    <select
                      value={newReport.type}
                      onChange={e => setNewReport({ ...newReport, type: e.target.value })}
                      required
                      className="form-select"
                    >
                      <option value="pothole">Pothole</option>
                      <option value="accident">Accident</option>
                      <option value="congestion">Traffic Congestion</option>
                      <option value="hazard">Road Hazard</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Title</label>
                    <input
                      type="text"
                      placeholder="Brief description of the issue"
                      value={newReport.title}
                      onChange={e => setNewReport({ ...newReport, title: e.target.value })}
                      required
                      className="form-control"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      placeholder="Provide more details about the issue..."
                      value={newReport.description}
                      onChange={e => setNewReport({ ...newReport, description: e.target.value })}
                      className="form-control"
                      rows={3}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Add Direction (Optional)</label>
                    <button
                      type="button"
                      className="btn btn-outline-primary w-100 mb-2"
                      onClick={() => setShowDirectionForm(true)}
                    >
                      <i className="bi bi-arrow-up-right-circle me-2"></i>
                      Set Direction
                    </button>
                    {newReport.directionData && (
                      <div className="alert alert-success py-2">
                        <i className="bi bi-check-circle-fill me-2"></i>
                        Direction set from ({newReport.directionData.startPoint[0].toFixed(4)}, {newReport.directionData.startPoint[1].toFixed(4)}) to ({newReport.directionData.endPoint[0].toFixed(4)}, {newReport.directionData.endPoint[1].toFixed(4)})
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="form-label">Photo (Optional)</label>
                    <input
                      type="file"
                      onChange={e => setNewReport({ ...newReport, file: e.target.files[0] })}
                      accept="image/*"
                      className="form-control"
                    />
                  </div>

                  <div className="d-flex justify-content-end gap-2">
                    <button 
                      type="button" 
                      onClick={() => {
                        setShowReportForm(false);
                        setNewReport({ 
                          title: "", 
                          description: "", 
                          file: null, 
                          position: null, 
                          type: "pothole",
                          directionData: null 
                        });
                      }} 
                      className="btn btn-outline-secondary"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                    >
                      <i className="bi bi-send-fill me-2"></i>
                      Submit Report
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Direction Setting Modal */}
      {showDirectionForm && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <i className="bi bi-compass me-2"></i>
                  Set Direction
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => {
                    setShowDirectionForm(false);
                    setTempDirectionPoints([]);
                  }}
                ></button>
              </div>
              
              <div className="modal-body">
                <div className="alert alert-info mb-4">
                  <i className="bi bi-info-circle-fill me-2"></i>
                  Click on the map to set {tempDirectionPoints.length === 0 ? 'starting point' : 'ending point'} of the direction
                </div>

                {tempDirectionPoints.length > 0 && (
                  <div className="mb-3">
                    <h6>Selected Points:</h6>
                    <ul className="list-group">
                      {tempDirectionPoints.map((point, index) => (
                        <li key={index} className="list-group-item">
                          Point {index + 1}: {point[0].toFixed(6)}, {point[1].toFixed(6)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="d-flex justify-content-end gap-2">
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowDirectionForm(false);
                      setTempDirectionPoints([]);
                    }} 
                    className="btn btn-outline-secondary"
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-primary"
                    onClick={saveDirectionData}
                    disabled={tempDirectionPoints.length < 2}
                  >
                    <i className="bi bi-save-fill me-2"></i>
                    Save Direction
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManualSearchMap;

