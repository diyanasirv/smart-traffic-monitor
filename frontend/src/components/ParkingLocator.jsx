// src/components/ParkingLocator.jsx
import React, { useEffect, useState } from "react";
import supabase from '../supabaseClient'; // No curly braces
import {
  Container,
  Form,
  Button,
  Card,
  Spinner,
  Row,
  Col,
} from "react-bootstrap";
import { motion } from "framer-motion";

const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const toRad = (deg) => deg * (Math.PI / 180);
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const useMyLocation = () => {
  const [location, setLocation] = useState(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      (err) => console.error("Location Error:", err)
    );
  }, []);

  return location;
};

const ParkingLocator = () => {
  const location = useMyLocation();
  const [allSpots, setAllSpots] = useState([]);
  const [visibleSpots, setVisibleSpots] = useState([]);
  const [kmLimit, setKmLimit] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSpots = async () => {
      const { data, error } = await supabase
        .from("safe_parking")
        .select("*")
        .eq("is_verified", true);
      if (error) console.error(error);
      else setAllSpots(data);
      setLoading(false);
    };

    fetchSpots();
  }, []);

  const handleFilter = () => {
    if (!location || !kmLimit) return;

    const base = location;

    const filtered = allSpots
      .map((spot) => {
        const distance = haversineDistance(
          base.lat,
          base.lng,
          spot.latitude,
          spot.longitude
        );
        return { ...spot, distance };
      })
      .filter((spot) => spot.distance <= parseFloat(kmLimit))
      .sort((a, b) => a.distance - b.distance);

    setVisibleSpots(filtered);
    setSubmitted(true);
  };

  return (
    <Container
      className="my-5 d-flex flex-column align-items-center"
      style={{
        background: "linear-gradient(135deg, #e3f2fd, #ffffff)",
        borderRadius: "16px",
        padding: "40px 20px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
      }}
    >
      <motion.h2
        className="text-center mb-4 fw-bold"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          color: "#1976d2",
          fontSize: "2.5rem",
          letterSpacing: "1px",
        }}
      >
        Nearby Verified Parking
      </motion.h2>

      <Card
        className="mb-4 p-4 border-0"
        style={{
          maxWidth: "500px",
          width: "100%",
          borderRadius: "20px",
          boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
          background: "#ffffff",
        }}
      >
        <Card.Body>
          <Card.Text className="text-center text-muted mb-4">
            Enter a distance range to discover safe and verified parking nearby.
          </Card.Text>

          <Form.Group className="mb-3" controlId="kmLimit">
            <Form.Label className="fw-semibold">Max Distance (in KM)</Form.Label>
            <Form.Control
              type="number"
              placeholder="e.g. 2"
              value={kmLimit}
              onChange={(e) => setKmLimit(e.target.value)}
              style={{
                borderRadius: "12px",
                border: "1px solid #ccc",
                padding: "10px",
              }}
            />
          </Form.Group>

          <div className="d-grid">
            <Button
              onClick={handleFilter}
              disabled={!kmLimit}
              style={{
                background: "#1976d2",
                border: "none",
                borderRadius: "12px",
                padding: "10px",
                fontWeight: "600",
                transition: "all 0.3s ease-in-out",
              }}
            >
              Find Nearby Parking
            </Button>
          </div>
        </Card.Body>
      </Card>

      {loading && (
        <Spinner animation="border" variant="primary" className="mb-4" />
      )}

      {submitted && (
        <motion.div
          className="w-100"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h4 className="mb-4 text-center text-secondary">
            Parking Spots Within {kmLimit} km
          </h4>

          {visibleSpots.length > 0 ? (
            <Row xs={1} md={2} lg={3} className="g-4 justify-content-center">
              {visibleSpots.map((spot) => (
                <Col key={spot.id}>
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    <Card
                      className="h-100 border-0"
                      style={{
                        borderRadius: "20px",
                        boxShadow: "0 8px 25px rgba(0,0,0,0.06)",
                        padding: "15px",
                        background: "#fafafa",
                      }}
                    >
                      <Card.Body>
                        <Card.Title className="text-primary fw-bold">
                          {spot.name}
                        </Card.Title>
                        <Card.Text className="text-muted">
                          {spot.description}
                        </Card.Text>
                        <p className="mb-3">
                          <strong>Distance:</strong>{" "}
                          {spot.distance.toFixed(2)} km
                        </p>
                        <div className="d-grid">
                          <Button
                            variant="outline-success"
                            href={`https://www.google.com/maps/dir/?api=1&destination=${spot.latitude},${spot.longitude}`}
                            target="_blank"
                            style={{
                              borderRadius: "10px",
                              fontWeight: "500",
                            }}
                          >
                            Get Directions
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </motion.div>
                </Col>
              ))}
            </Row>
          ) : (
            <p className="text-center text-muted">
              No parking spots found within this distance.
            </p>
          )}
        </motion.div>
      )}
    </Container>
  );
};

export default ParkingLocator;
