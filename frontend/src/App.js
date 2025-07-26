import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminLogin from "./components/AdminLogin";
import supabase from './supabaseClient'; // ✅ Keep only ONE import
import AdminDashboard from "./components/AdminDashboard";
import TrafficSimulation from "./components/TrafficSimulation";
import TrafficAnalyzer from "./components/TrafficAnalyzer";
import MapSearchPage from "./components/MapSearchPage";
import ManualSearchMap from "./components/ManualSearchMap";
import Chatbot from "./components/Chatbot";
import ParkingLocator from "./components/ParkingLocator";
import Home from "./components/Home.jsx";
import ReportForm from './components/ReportForm';
import ReportList from './components/ReportList';
import Traffic from "./pages/Traffic.js";
import Trafficmanagement from "./components/Trafficmanagement.jsx"

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import 'bootstrap-icons/font/bootstrap-icons.css';

function App() {
  return (
    <Router>
      <div className="App">
        {/* Always rendered chatbot */}
        <Chatbot />

        <Routes>
          {/* Landing */}
          <Route path="/" element={<Home />} />

          {/* Admin */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />

          {/* Traffic tools */}
          <Route path="/traffic-management" element={<Trafficmanagement />} />
          <Route path="/traffic" element={<Traffic />} />
          <Route path="/analyze" element={<TrafficAnalyzer />} />

          {/* Map tools */}
          <Route path="/map-search" element={<MapSearchPage />} />
          <Route path="/parking" element={<ParkingLocator />} />

          {/* Report system */}
          <Route path="/report" element={<ReportForm />} />
          <Route path="/list" element={<ReportList />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
