// src/components/AdminLogin.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from '../supabaseClient'; // No curly braces
import { FaTrafficLight, FaUserShield, FaInfoCircle } from "react-icons/fa";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate("/admin-dashboard");
    }
  };

  return (
    <div className="login-page" style={{
      background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      padding: "20px 0"
    }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            {/* System Information Section */}
            <div className="text-center text-white mb-4">
              <div className="d-flex justify-content-center align-items-center mb-3">
                <FaTrafficLight className="text-warning me-3" size={36} />
                <h1 className="m-0">Kottakkal Traffic Management System</h1>
              </div>
              <p className="lead mb-4">
                <FaInfoCircle className="me-2" />
                Advanced traffic monitoring and control system for Kottakkal municipality
              </p>
            </div>

            {/* Admin Login Box */}
            <div className="card shadow-lg border-0">
              <div className="card-header bg-primary text-white">
                <div className="d-flex align-items-center">
                  <FaUserShield className="me-2" size={24} />
                  <h4 className="m-0">Administrator Access Portal</h4>
                </div>
              </div>
              <div className="card-body p-4 p-md-5">
                <div className="alert alert-info mb-4">
                  <strong>Authorized Personnel Only:</strong> This portal provides access to sensitive traffic control systems and data. Unauthorized access is prohibited.
                </div>
                
                {error && (
                  <div className="alert alert-danger" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {error}
                  </div>
                )}

                <form onSubmit={handleLogin}>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">Official Email</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-envelope-fill text-primary"></i>
                      </span>
                      <input
                        type="email"
                        className="form-control"
                        id="email"
                        placeholder="admin@kottakkaltraffic.gov.in"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label htmlFor="password" className="form-label">Security Key</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-key-fill text-primary"></i>
                      </span>
                      <input
                        type="password"
                        className="form-control"
                        id="password"
                        placeholder="Enter your secure access key"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <button 
                    type="submit" 
                    className="btn btn-primary w-100 py-2 fw-bold"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Verifying Credentials...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-shield-lock me-2"></i>
                        Authenticate & Access System
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Footer Note */}
            <div className="text-center text-white mt-4 small">
              <p className="mb-1">Kottakkal Municipal Corporation © {new Date().getFullYear()}</p>
              <p className="mb-0">For technical support, contact: support@kottakkaltraffic.gov.in</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;