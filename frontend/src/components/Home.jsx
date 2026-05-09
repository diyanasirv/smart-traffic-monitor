// src/pages/Home.jsx
import React from "react";
import { Container, Row, Col, Button, Card } from "react-bootstrap";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  FaMapMarkedAlt, 
  FaParking, 
  FaCarCrash, 
  FaRoad,
  FaTrafficLight
} from "react-icons/fa";

// Gradient background colors for each card
const cardGradients = [
  "linear-gradient(135deg, #007bff 0%, #00b4ff 100%)",
  "linear-gradient(135deg, #28a745 0%, #5cb85c 100%)",
  "linear-gradient(135deg, #dc3545 0%, #ff6b6b 100%)",
  "linear-gradient(135deg, #ffc107 0%, #ffdf7d 100%)"
];

const features = [
  {
    title: "Kottakkal Live Traffic Map",
    path: "/traffic",
    icon: <FaMapMarkedAlt size={50} color="white" />,
    description: "Real-time traffic updates with congestion heatmaps and alternative route suggestions.",
  },
  {
    title: "Smart Parking Finder",
    path: "/parking",
    icon: <FaParking size={50} color="white" />,
    description: "Locate safe parking spots with availability indicators and pricing information.",
  },
  {
    title: "Accident Alert System",
    path: "/accident-alert",
    icon: <FaCarCrash size={50} color="white" />,
    description: "Instant notifications about nearby accidents with severity indicators.",
  },
  {
    title: "Road Hazard Reports",
    path: "/report-blockage",
    icon: <FaRoad size={50} color="white" />,
    description: "Community-reported road blockages with verification status.",
  },
];

const Home = () => {
  return (
    <div className="home-page" style={{
      minHeight: "100vh",
      background: "linear-gradient(to bottom, #f8f9fa, #e9ecef)",
      paddingBottom: "3rem"
    }}>
      <Container className="pt-5 pb-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="d-flex justify-content-center mb-3"
        >
          <FaTrafficLight size={60} color="#007bff" />
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-3 fw-bold text-primary"
          style={{ fontSize: "2.5rem" }}
        >
          Kottakkal Smart Traffic
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="lead mb-4 text-muted"
          style={{ maxWidth: "700px", margin: "0 auto" }}
        >
          Intelligent traffic monitoring and urban mobility solutions for Kottakkal
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mb-5"
        >
          
        </motion.div>
      </Container>

      <Container>
        <Row className="g-4 justify-content-center">
          {features.map((feature, idx) => (
            <Col key={idx} xs={12} sm={6} lg={5} xl={3}>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * idx, type: "spring" }}
                whileHover={{ y: -10 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card 
                  className="border-0 shadow-lg h-100"
                  style={{
                    borderRadius: "20px",
                    overflow: "hidden",
                    background: cardGradients[idx],
                    color: "white"
                  }}
                >
                  <Card.Body className="p-4 d-flex flex-column">
                    <div 
                      className="mb-4 p-3 rounded-circle d-inline-flex align-items-center justify-content-center"
                      style={{
                        background: "rgba(255,255,255,0.2)",
                        width: "80px",
                        height: "80px",
                        margin: "0 auto"
                      }}
                    >
                      {feature.icon}
                    </div>
                    <Card.Title 
                      className="mb-3 fw-bold" 
                      style={{ fontSize: "1.4rem" }}
                    >
                      {feature.title}
                    </Card.Title>
                    <Card.Text className="mb-4" style={{ opacity: 0.9 }}>
                      {feature.description}
                    </Card.Text>
                    <div className="mt-auto">
                      <Link to={feature.path} className="text-decoration-none">
                        <Button 
                          variant="light" 
                          className="rounded-pill px-4 fw-semibold"
                          style={{ 
                            color: cardGradients[idx].split(" ")[1],
                            border: "none"
                          }}
                        >
                          Explore
                        </Button>
                      </Link>
                    </div>
                  </Card.Body>
                </Card>
              </motion.div>
            </Col>
          ))}
        </Row>
      </Container>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="text-center mt-5 pt-3"
      >
       
      </motion.div>
    </div>
  );
};

export default Home;