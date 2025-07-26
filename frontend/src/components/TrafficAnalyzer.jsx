// src/components/TrafficAnalyzer.jsx
import React, { useState } from "react";
import axios from "axios";
import { Button, Form, Container, Alert, Image } from "react-bootstrap";

const TrafficAnalyzer = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [count, setCount] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    setSelectedImage(e.target.files[0]);
    setPreviewUrl(null);
    setCount(null);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!selectedImage) {
      setError("Please select an image before submitting.");
      return;
    }

    const formData = new FormData();
    formData.append("image", selectedImage);

    try {
      setLoading(true);
      const response = await axios.post("http://localhost:5000/analyze", formData);
      setCount(response.data.vehicle_count);
      setPreviewUrl(response.data.image_url);
      setError(null);
    } catch (err) {
      setError("Upload failed. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="my-4">
      <h2 className="mb-4">🚦 Traffic Image Analyzer</h2>
      
      <Form.Group controlId="formFile" className="mb-3">
        <Form.Label>Select Traffic Image</Form.Label>
        <Form.Control type="file" onChange={handleImageChange} />
      </Form.Group>

      <Button variant="primary" onClick={handleSubmit} disabled={loading}>
        {loading ? "Analyzing..." : "Analyze"}
      </Button>

      {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
      {count !== null && <Alert variant="success" className="mt-3">🚗 Vehicles Detected: <strong>{count}</strong></Alert>}

      {previewUrl && (
        <div className="mt-4">
          <h5>Analyzed Image:</h5>
          <Image src={previewUrl} alt="Analyzed Result" fluid rounded />
        </div>
      )}
    </Container>
  );
};

export default TrafficAnalyzer;
