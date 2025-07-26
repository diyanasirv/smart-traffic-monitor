import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import ReportForm from '../components/ReportForm';
import ReportList from '../components/ReportList';
import MapBox from '../components/MapBox';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Traffic() {
  return (
    <div className="container mt-4">
      <ToastContainer />
      <h2 className="text-center mb-4">Kottakkal Traffic Report System</h2>
      
      <div className="row">
        {/* Left Column: Form + List */}
        <div className="col-md-6">
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">Report a Traffic Issue</h5>
              <ReportForm />
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Reported Issues</h5>
              <ReportList />
            </div>
          </div>
        </div>

        {/* Right Column: Map */}
        <div className="col-md-6">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">Traffic Map</h5>
              <MapBox />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Traffic;
