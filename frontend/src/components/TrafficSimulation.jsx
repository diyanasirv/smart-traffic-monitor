// src/components/TrafficSimulation.jsx
import React, { useState } from "react";

export default function TrafficSimulation() {
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");

  const handleFileChange = (e) => {
    setImage(e.target.files[0]);
    setMessage("");
  };

  const handleUpload = () => {
    if (!image) {
      setMessage("Please upload an image first.");
      return;
    }

    // TODO: Add your image analysis logic here
    setMessage("✅ Image uploaded successfully! Starting analysis...");
  };

  return (
    <div className="container py-5">
      <h2 className="mb-4 text-center">🚧 Traffic Simulation Image Upload</h2>

      <div className="mb-3">
        <input type="file" className="form-control" onChange={handleFileChange} />
      </div>

      <button className="btn btn-primary" onClick={handleUpload}>
        Analyze Image
      </button>

      {message && <div className="alert alert-info mt-3">{message}</div>}
    </div>
  );
}
