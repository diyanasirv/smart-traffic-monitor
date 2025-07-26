import React from "react";
import { Card, Container, Row, Col, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("isAdminLoggedIn");
    navigate("/admin-login");
  };

  const handleOpenAnalyzer = () => {
    navigate("/analyze");
  };
const handleTrafficManagement = () => {
  navigate("/traffic-management");
};

  return (
    <Container className="mt-5">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="p-4 shadow-lg rounded-4 border-0">
          <h2 className="text-center mb-4 fw-bold text-primary">
            🚦 Admin Dashboard
          </h2>

          {/* Dashboard Stats */}
          <Row className="mb-4 text-center">
            <Col md={4} className="mb-3">
              <Card className="bg-success text-white p-3 rounded-3 shadow-sm">
                <h5>Total Reports</h5>
                <h2>120</h2>
              </Card>
            </Col>
            <Col md={4} className="mb-3">
              <Card className="bg-warning text-dark p-3 rounded-3 shadow-sm">
                <h5>Verified Routes</h5>
                <h2>58</h2>
              </Card>
            </Col>
            <Col md={4} className="mb-3">
              <Card className="bg-danger text-white p-3 rounded-3 shadow-sm">
                <h5>Pending Issues</h5>
                <h2>22</h2>
              </Card>
            </Col>
          </Row>

          {/* Buttons */}
          <Row className="gap-2">
            <Col md={4}>
              <Button variant="primary" className="w-100 py-3 rounded-3 shadow-sm">
                🚧 View Reported Incidents
              </Button>
            </Col>
            <Col md={4}>
              <Button
                variant="info"
                className="w-100 py-3 rounded-3 shadow-sm text-white"
                onClick={handleOpenAnalyzer}
              >
                🔍 Open Traffic Analyzer
              </Button>
            </Col>
            <Col md={4}>
  <Button
    variant="dark"
    className="w-100 py-3 rounded-3 shadow-sm"
    onClick={handleTrafficManagement}
  >
    🧭 Traffic Management
  </Button>
</Col>

            <Col md={4}>
              <Button
                variant="secondary"
                className="w-100 py-3 rounded-3 shadow-sm"
                onClick={handleLogout}
              >
                🔐 Logout
              </Button>
            </Col>
          </Row>
        </Card>
      </motion.div>
    </Container>
  );
};

export default AdminDashboard;
