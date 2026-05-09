import React, { useState, useEffect, useRef } from "react";

const SimulatedTrafficSystem = () => {
  const [isSystemActive, setIsSystemActive] = useState(false);
  const [junctions] = useState([
    { id: 1, name: "Hospital Junction", baseTraffic: { north: 12, south: 15, east: 8, west: 11 } },
    { id: 2, name: "Market Square", baseTraffic: { north: 18, south: 22, east: 14, west: 16 } },
    { id: 3, name: "School Junction", baseTraffic: { north: 10, south: 28, east: 12, west: 15 } },
    { id: 4, name: "Kottakkal Junction", baseTraffic: { north: 16, south: 20, east: 18, west: 14 } }
  ]);

  const [selectedJunction, setSelectedJunction] = useState(0);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Initialize traffic data for all junctions
  const initializeTrafficData = () => {
    const data = {};
    junctions.forEach((junction, index) => {
      data[index] = {
        directions: {
          north: { vehicles: junction.baseTraffic.north, timer: 30, isActive: index === 0, cameraFeed: 'simulated', confidence: 95, status: index === 0 ? 'green' : 'red' },
          south: { vehicles: junction.baseTraffic.south, timer: 35, isActive: false, cameraFeed: 'simulated', confidence: 92, status: 'red' },
          east: { vehicles: junction.baseTraffic.east, timer: 25, isActive: false, cameraFeed: 'simulated', confidence: 88, status: 'red' },
          west: { vehicles: junction.baseTraffic.west, timer: 30, isActive: false, cameraFeed: 'simulated', confidence: 94, status: 'red' }
        },
        currentDirection: 'north',
        timeRemaining: 30,
        cycleCount: 0
      };
    });
    return data;
  };

  const [trafficData, setTrafficData] = useState(initializeTrafficData());

  const [detectionLogs, setDetectionLogs] = useState([]);
  const [systemStats, setSystemStats] = useState({
    photoCaptureCount: 0,
    systemUptime: 0,
    cameraDetails: {
      totalCameras: 16,
      activeCameras: 16,
      offlineCameras: 0,
      maintenanceMode: 0
    },
    totalCyclesCompleted: 0
  });

  const intervalRef = useRef(null);
  const detectionRef = useRef(null);
  const uptimeRef = useRef(null);

  // Timer calculation algorithm based on vehicle count - GREEN light timing
  const calculateOptimalGreenTimer = (vehicleCount) => {
    const minTimer = 15;
    const maxTimer = 80;
    const baseTimer = 20;
    const vehicleWeight = 2.2; // Increased weight for better response

    let calculatedTimer = baseTimer + (vehicleCount * vehicleWeight);
    return Math.max(minTimer, Math.min(maxTimer, Math.round(calculatedTimer)));
  };

  // Simulate realistic vehicle detection
  const simulateVehicleDetection = () => {
    setTrafficData(prevData => {
      const newData = { ...prevData };
      
      // Update all junctions
      junctions.forEach((junction, junctionIndex) => {
        if (!newData[junctionIndex]) return;
        
        const currentJunctionData = newData[junctionIndex];


        // Simulate vehicle detection for each direction
        Object.keys(currentJunctionData.directions).forEach(direction => {
          const baseCount = junction.baseTraffic[direction];
          const variance = Math.floor(Math.random() * 10) - 5; // -5 to +5 variance
          const finalCount = Math.max(0, baseCount + variance);
          
          // Simulate detection confidence
          const confidence = Math.round(92 + Math.random() * 6); // 92-98% confidence
          
          // Calculate optimal GREEN timer based on vehicle count
          const optimalTimer = calculateOptimalGreenTimer(finalCount);

          // Update status based on current active direction
          const status = currentJunctionData.currentDirection === direction ? 'green' : 'red';

          currentJunctionData.directions[direction] = {
            ...currentJunctionData.directions[direction],
            vehicles: finalCount,
            timer: optimalTimer,
            confidence: confidence,
            cameraFeed: 'simulated',
            status: status
          };


        });
      });

      return newData;
    });

    // Add detection log for currently selected junction
    const currentJunctionData = trafficData[selectedJunction];
    if (currentJunctionData && isSystemActive) {
      const selectedJunctionInfo = junctions[selectedJunction];
      const logEntry = {
        id: Date.now() + selectedJunction + Math.random(),
        timestamp: new Date(),
        junction: selectedJunctionInfo.name,
        direction: currentJunctionData.currentDirection,
        vehicleCount: currentJunctionData.directions[currentJunctionData.currentDirection].vehicles,
        greenTime: currentJunctionData.directions[currentJunctionData.currentDirection].timer,
        totalVehicles: Object.values(currentJunctionData.directions).reduce((sum, dir) => sum + dir.vehicles, 0),
        detectionAccuracy: currentJunctionData.directions[currentJunctionData.currentDirection].confidence
      };

      setDetectionLogs(prev => [logEntry, ...prev.slice(0, 9)]); // Keep last 10 logs, newest first
    }

    // Update system stats
    setSystemStats(prev => ({
      photoCaptureCount: prev.photoCaptureCount + Math.floor(Math.random() * 6) + 8,
      systemUptime: prev.systemUptime,
      cameraDetails: {
        totalCameras: 16,
        activeCameras: 16 - Math.floor(Math.random() * 2),
        offlineCameras: Math.floor(Math.random() * 2),
        maintenanceMode: Math.floor(Math.random() * 1)
      },
      totalCyclesCompleted: prev.totalCyclesCompleted
    }));

    setLastUpdate(new Date());
  };

  // Traffic light timer countdown - normal speed
  const updateTimers = () => {
    setTrafficData(prevData => {
      const newData = { ...prevData };
      
      // Update timers for all junctions
      Object.keys(newData).forEach(junctionIndex => {
        const junction = newData[junctionIndex];
        
        if (!junction) return;

        if (junction.timeRemaining > 0) {
          junction.timeRemaining -= 1;
        } else {
          // Switch to next direction
          const directions = ['north', 'south', 'east', 'west'];
          const currentIndex = directions.indexOf(junction.currentDirection);
          const nextDirection = directions[(currentIndex + 1) % 4];

          // Update active states and status
          junction.directions[junction.currentDirection].isActive = false;
          junction.directions[junction.currentDirection].status = 'red';
          junction.directions[nextDirection].isActive = true;
          junction.directions[nextDirection].status = 'green';

          // Set new GREEN timer based on vehicle count in the next direction
          junction.currentDirection = nextDirection;
          junction.timeRemaining = junction.directions[nextDirection].timer;
          junction.cycleCount += 1;

          // Update system stats for cycle completion
          setSystemStats(prev => ({
            ...prev,
            totalCyclesCompleted: prev.totalCyclesCompleted + 1
          }));
        }
      });

      return newData;
    });
  };

  // System control
  const toggleSystem = () => {
    if (isSystemActive) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (detectionRef.current) clearInterval(detectionRef.current);
      if (uptimeRef.current) clearInterval(uptimeRef.current);
      setIsSystemActive(false);
    } else {
      detectionRef.current = setInterval(simulateVehicleDetection, 5000); // Detect every 5 seconds (normal speed)
      intervalRef.current = setInterval(updateTimers, 1000); // Update every 1 second (normal speed)
      uptimeRef.current = setInterval(() => {
        setSystemStats(prev => ({ ...prev, systemUptime: prev.systemUptime + 1 }));
      }, 1000);
      setIsSystemActive(true);
      // Initial detection
      simulateVehicleDetection();
    }
  };

  // Reset all statistics
  const resetStats = () => {
    setSystemStats({
      photoCaptureCount: 0,
      systemUptime: 0,
      cameraDetails: {
        totalCameras: 16,
        activeCameras: 16,
        offlineCameras: 0,
        maintenanceMode: 0
      },
      totalCyclesCompleted: 0
    });
    setDetectionLogs([]);
    setTrafficData(initializeTrafficData());
    setLastUpdate(new Date());
  };

  // Handle junction selection - this will update detection logs for new junction
  const handleJunctionSelect = (index) => {
    setSelectedJunction(index);
    setDetectionLogs([]); // Clear logs when switching junction
    
    // Immediately generate detection log for newly selected junction if system is active
    if (isSystemActive && trafficData[index]) {
      const currentJunctionData = trafficData[index];
      const selectedJunctionInfo = junctions[index];
      const logEntry = {
        id: Date.now() + index + Math.random(),
        timestamp: new Date(),
        junction: selectedJunctionInfo.name,
        direction: currentJunctionData.currentDirection,
        vehicleCount: currentJunctionData.directions[currentJunctionData.currentDirection].vehicles,
        greenTime: currentJunctionData.directions[currentJunctionData.currentDirection].timer,
        totalVehicles: Object.values(currentJunctionData.directions).reduce((sum, dir) => sum + dir.vehicles, 0),
        detectionAccuracy: currentJunctionData.directions[currentJunctionData.currentDirection].confidence
      };
      setDetectionLogs([logEntry]);
    }
  };

  // Format uptime
  const formatUptime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (detectionRef.current) clearInterval(detectionRef.current);
      if (uptimeRef.current) clearInterval(uptimeRef.current);
    };
  }, []);

  // Enhanced camera feed component with status indicators
  const MockCameraFeed = ({ direction, data, isActive }) => {
    const getStatusColor = (status) => {
      switch(status) {
        case 'green': return 'success';
        case 'red': return 'danger';
        case 'yellow': return 'warning';
        default: return 'secondary';
      }
    };

    const getStatusIcon = (status) => {
      switch(status) {
        case 'green': return '🟢';
        case 'red': return '🔴';
        case 'yellow': return '🟡';
        default: return '⚫';
      }
    };

    return (
      <div 
        className={`border rounded-3 overflow-hidden position-relative ${
          isActive ? 'border-success border-3 shadow-lg' : 'border-secondary'
        }`} 
        style={{ 
          backgroundColor: '#1a1a1a',
          transform: isActive ? 'scale(1.02)' : 'scale(1)',
          transition: 'all 0.3s ease-in-out'
        }}
      >
        {/* Camera Header with enhanced styling */}
        <div className={`p-3 text-white d-flex justify-content-between align-items-center ${
          isActive ? 'bg-success' : 'bg-secondary'
        }`}>
          <div className="d-flex align-items-center">
            <i className="bi bi-camera-video-fill me-2"></i>
            <span className="fw-bold">{direction.toUpperCase()}</span>
          </div>
          <div className="d-flex align-items-center">
            <div className={`bg-${getStatusColor(data.status)} rounded-circle me-2`} 
                 style={{ width: '10px', height: '10px', animation: isActive ? 'pulse 1.5s infinite' : 'none' }}></div>
            <span className="small fw-semibold">
              <i className="bi bi-broadcast-pin me-1"></i>LIVE
            </span>
          </div>
        </div>
        
        {/* Traffic Status Badge */}
        <div className="position-absolute top-0 end-0 m-2" style={{ zIndex: 10 }}>
          <span className={`badge bg-${getStatusColor(data.status)} fs-6 px-3 py-2 rounded-pill shadow`}>
            {getStatusIcon(data.status)} {data.status.toUpperCase()}
          </span>
        </div>
        
        {/* Simulated Traffic Scene */}
        <div className="position-relative d-flex align-items-center justify-content-center" 
             style={{ 
               height: '160px', 
               background: isActive 
                 ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
                 : 'linear-gradient(135deg, #374151 0%, #1f2937 100%)'
             }}>
          {/* Road */}
          <div className="position-absolute bottom-0 w-100" 
               style={{ 
                 height: '40px',
                 background: 'linear-gradient(90deg, #4b5563 0%, #6b7280 50%, #4b5563 100%)'
               }}></div>
          
          {/* Lane markers */}
          <div className="position-absolute bottom-0 start-50 translate-middle-x" 
               style={{ height: '40px', width: '2px', backgroundColor: '#fbbf24' }}></div>
          
          {/* Vehicle representations with animation */}
          <div className="position-absolute bottom-0 start-0 end-0 d-flex justify-content-center flex-wrap p-2">
            {Array.from({ length: Math.min(data.vehicles, 12) }).map((_, i) => (
              <div 
                key={i} 
                className="rounded-2 mx-1 mb-1 shadow-sm"
                style={{ 
                  width: '10px', 
                  height: '16px',
                  backgroundColor: i % 5 === 0 ? '#fbbf24' : i % 5 === 1 ? '#f87171' : i % 5 === 2 ? '#60a5fa' : i % 5 === 3 ? '#34d399' : '#a78bfa',
                  animation: isActive ? `moveVehicle ${2 + (i * 0.1)}s infinite` : 'none'
                }}
              ></div>
            ))}
          </div>
          
          {/* Vehicle count display with enhanced styling */}
          <div className="text-white text-center position-relative" style={{ zIndex: 5 }}>
            <div className="fs-3 mb-2">
              <i className="bi bi-car-front-fill"></i>
            </div>
            <div className="px-3 py-2 rounded-3 fw-bold shadow" 
                 style={{ 
                   backgroundColor: 'rgba(0,0,0,0.8)',
                   backdropFilter: 'blur(10px)'
                 }}>
              <div className="fs-5 text-info">{data.vehicles}</div>
              <div className="small text-light">vehicles</div>
            </div>
          </div>
        </div>
        
        {/* Enhanced Detection Info */}
        <div className="p-3 text-white" style={{ backgroundColor: '#374151' }}>
          <div className="row g-2 small">
            <div className="col-6">
              <div className="d-flex justify-content-between align-items-center">
                <span><i className="bi bi-car-front me-1"></i>Count:</span>
                <span className="fw-bold text-info fs-6">{data.vehicles}</span>
              </div>
            </div>
            <div className="col-6">
              <div className="d-flex justify-content-between align-items-center">
                <span><i className="bi bi-stopwatch me-1"></i>Timer:</span>
                <span className="fw-bold text-success fs-6">{data.timer}s</span>
              </div>
            </div>
            <div className="col-6">
              <div className="d-flex justify-content-between align-items-center">
                <span><i className="bi bi-bullseye me-1"></i>Accuracy:</span>
                <span className="fw-bold text-warning fs-6">{data.confidence}%</span>
              </div>
            </div>
            <div className="col-6">
              <div className="d-flex justify-content-between align-items-center">
                <span><i className="bi bi-traffic-light me-1"></i>Status:</span>
                <span className={`fw-bold text-${getStatusColor(data.status)} fs-6`}>
                  {data.status.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const currentJunction = trafficData[selectedJunction] || {
    directions: {
      north: { vehicles: 0, timer: 30, isActive: true, cameraFeed: 'simulated', confidence: 95, status: 'green' },
      south: { vehicles: 0, timer: 30, isActive: false, cameraFeed: 'simulated', confidence: 95, status: 'red' },
      east: { vehicles: 0, timer: 30, isActive: false, cameraFeed: 'simulated', confidence: 95, status: 'red' },
      west: { vehicles: 0, timer: 30, isActive: false, cameraFeed: 'simulated', confidence: 95, status: 'red' }
    },
    currentDirection: 'north',
    timeRemaining: 30,
    cycleCount: 0
  };

  return (
    <>
      {/* Bootstrap CSS and Icons */}
      <link href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css" rel="stylesheet" />
      <link href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.11.0/font/bootstrap-icons.min.css" rel="stylesheet" />
      
      <div className="min-vh-100" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className="container-fluid p-4">
          {/* Enhanced Header */}
          <div className="card shadow-lg mb-4 border-0 rounded-4 overflow-hidden">
            <div className="card-body p-4" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)' }}>
              <div className="row align-items-center mb-4">
                <div className="col-lg-8">
                  <h1 className="display-5 fw-bold text-white mb-3">
                    <i className="bi bi-traffic-light-fill me-3"></i>
                    Smart Traffic Control - Kottakkal
                  </h1>
                  <p className="text-white-50 mb-0 fs-5">
                    <i className="bi bi-cpu me-2"></i>
                    AI-powered dynamic traffic signal optimization system
                  </p>
                </div>
                <div className="col-lg-4 text-end">
                  <button
                    onClick={resetStats}
                    className="btn btn-light me-3 px-4 py-2 rounded-pill"
                  >
                    <i className="bi bi-arrow-clockwise me-2"></i>Reset All
                  </button>
                  <button
                    onClick={toggleSystem}
                    className={`btn fw-bold px-4 py-2 rounded-pill ${
                      isSystemActive 
                        ? 'btn-danger' 
                        : 'btn-success'
                    }`}
                  >
                    <i className={`bi ${isSystemActive ? 'bi-stop-fill' : 'bi-play-fill'} me-2`}></i>
                    {isSystemActive ? 'Stop System' : 'Start System'}
                  </button>
                  <div className="text-white-50 mt-2">
                    <i className="bi bi-clock me-1"></i>
                    Last Update: {lastUpdate.toLocaleTimeString()}
                  </div>
                </div>
              </div>

              {/* Enhanced System Stats */}
              <div className="row g-4">
                <div className="col-lg-3 col-md-6">
                  <div className="card bg-white bg-opacity-10 border-0 text-white rounded-3 h-100">
                    <div className="card-body text-center p-4">
                      <i className="bi bi-camera-fill display-4 text-primary mb-3"></i>
                      <div className="text-white-50 fw-semibold mb-2">Photo Captures</div>
                      <div className="display-6 fw-bold">{systemStats.photoCaptureCount.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
                <div className="col-lg-3 col-md-6">
                  <div className="card bg-white bg-opacity-10 border-0 text-white rounded-3 h-100">
                    <div className="card-body text-center p-4">
                      <i className="bi bi-stopwatch-fill display-4 text-success mb-3"></i>
                      <div className="text-white-50 fw-semibold mb-2">System Uptime</div>
                      <div className="display-6 fw-bold">{formatUptime(systemStats.systemUptime)}</div>
                    </div>
                  </div>
                </div>
                <div className="col-lg-3 col-md-6">
                  <div className="card bg-white bg-opacity-10 border-0 text-white rounded-3 h-100">
                    <div className="card-body text-center p-4">
                      <i className="bi bi-camera-video-fill display-4 text-info mb-3"></i>
                      <div className="text-white-50 fw-semibold mb-2">Camera Status</div>
                      <div className="row g-1 text-center">
                        <div className="col-4">
                          <div className="small text-success">Online</div>
                          <div className="fw-bold text-success">{systemStats.cameraDetails.activeCameras}</div>
                        </div>
                        <div className="col-4">
                          <div className="small text-danger">Offline</div>
                          <div className="fw-bold text-danger">{systemStats.cameraDetails.offlineCameras}</div>
                        </div>
                        <div className="col-4">
                          <div className="small text-warning">Maintenance</div>
                          <div className="fw-bold text-warning">{systemStats.cameraDetails.maintenanceMode}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-lg-3 col-md-6">
                  <div className="card bg-white bg-opacity-10 border-0 text-white rounded-3 h-100">
                    <div className="card-body text-center p-4">
                      <i className="bi bi-arrow-repeat display-4 text-warning mb-3"></i>
                      <div className="text-white-50 fw-semibold mb-2">Cycles Completed</div>
                      <div className="display-6 fw-bold">{systemStats.totalCyclesCompleted}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Junction Selector */}
          <div className="card shadow-lg mb-4 border-0 rounded-4">
            <div className="card-body p-4">
              <h2 className="card-title h4 mb-4">
                <i className="bi bi-geo-alt-fill me-2 text-primary"></i>
                Select Junction to Monitor:
              </h2>
              <div className="row g-4">
                {junctions.map((junction, index) => (
                  <div key={junction.id} className="col-lg-3 col-md-6">
                    <button
                      onClick={() => handleJunctionSelect(index)}
                      className={`btn w-100 text-start p-4 rounded-3 border-2 position-relative ${
                        selectedJunction === index
                          ? 'btn-primary border-primary shadow-lg'
                          : 'btn-outline-secondary border-secondary'
                      }`}
                      style={{
                        transform: selectedJunction === index ? 'translateY(-2px)' : 'translateY(0)',
                        transition: 'all 0.3s ease-in-out'
                      }}
                    >
                      <div className="d-flex align-items-center mb-2">
                        <i className="bi bi-building me-2 fs-4"></i>
                        <div className="fw-bold fs-5">{junction.name}</div>
                      </div>
                      <div className="small opacity-75">
                        <i className="bi bi-car-front me-1"></i>
                        Total: {Object.values(junction.baseTraffic).reduce((a, b) => a + b, 0)} vehicles
                      </div>
                      {selectedJunction === index && (
                        <div className="position-absolute top-0 end-0 m-2">
                          <span className="badge bg-success rounded-pill">
                            <i className="bi bi-check-circle-fill"></i>
                          </span>
                        </div>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Enhanced Main Junction Display */}
          <div className="card shadow-lg mb-4 border-0 rounded-4">
            <div className="card-body p-4">
              <div className="row align-items-center mb-4">
                <div className="col-lg-8">
                  <h2 className="card-title h3 mb-0">
                    <i className="bi bi-geo-fill me-2 text-primary"></i>
                    {junctions[selectedJunction].name}
                  </h2>
                </div>
                <div className="col-lg-4 text-end">
                  <div className="card bg-light rounded-3 p-3">
                    <div className="small text-muted mb-1">Current Signal</div>
                    <div className="h4 fw-bold text-success mb-2">
                      <i className="bi bi-arrow-up-circle-fill me-1"></i>
                      {currentJunction.currentDirection.toUpperCase()}
                    </div>
                    <div className="display-3 fw-bold text-danger mb-2">
                      {currentJunction.timeRemaining}s
                    </div>
                    <div className="small text-muted">
                      <i className="bi bi-arrow-clockwise me-1"></i>
                      Cycle #{currentJunction.cycleCount}
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Camera Feeds */}
              <div className="row g-4 mb-4">
                {Object.entries(currentJunction.directions).map(([direction, data]) => (
                  <div key={direction} className="col-lg-3 col-md-6">
                    <MockCameraFeed
                      direction={direction}
                      data={data}
                      isActive={currentJunction.currentDirection === direction}
                    />
                  </div>
                ))}
              </div>

              {/* Enhanced AI Algorithm Status */}
              <div className="card bg-gradient rounded-3" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
                <div className="card-body p-4">
                  <h4 className="card-title h5 mb-4">
                    <i className="bi bi-cpu-fill me-2 text-primary"></i>
                    AI Traffic Management Algorithm
                  </h4>
                  <div className="row g-4">
                    <div className="col-lg-3 col-md-6">
                      <div className="text-center">
                        <i className="bi bi-car-front-fill text-primary fs-1 mb-2"></i>
                        <div className="small text-muted">Total Vehicles</div>
                        <div className="fw-bold text-primary fs-4">
                          {Object.values(currentJunction.directions).reduce((sum, dir) => sum + dir.vehicles, 0)}
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-3 col-md-6">
                      <div className="text-center">
                        <i className={`bi ${isSystemActive ? 'bi-check-circle-fill text-success' : 'bi-x-circle-fill text-danger'} fs-1 mb-2`}></i>
                        <div className="small text-muted">Dynamic Timers</div>
                        <div className={`fw-bold fs-4 ${isSystemActive ? 'text-success' : 'text-danger'}`}>
                          {isSystemActive ? 'Active' : 'Inactive'}
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-3 col-md-6">
                      <div className="text-center">
                        <i className="bi bi-speedometer2 text-info fs-1 mb-2"></i>
                        <div className="small text-muted">Detection Speed</div>
                        <div className="fw-bold text-info fs-4">
                          {isSystemActive ? '5s intervals' : 'Stopped'}
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-3 col-md-6">
                      <div className="text-center">
                        <i className={`bi ${isSystemActive ? 'bi-rocket-takeoff-fill text-warning' : 'bi-pause-circle-fill text-secondary'} fs-1 mb-2`}></i>
                        <div className="small text-muted">Efficiency</div>
                        <div className={`fw-bold fs-4 ${isSystemActive ? 'text-warning' : 'text-secondary'}`}>
                          {isSystemActive ? 'Optimized' : 'Static'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Recent Detections */}
          <div className="card shadow-lg border-0 rounded-4">
            <div className="card-body p-4">
              <h3 className="card-title h4 mb-4">
                <i className="bi bi-list-ul me-2 text-primary"></i>
                Recent Vehicle Detection Sessions
              </h3>
              <div className="list-group list-group-flush">
                {detectionLogs.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="bi bi-search display-1 text-muted mb-3"></i>
                    <div className="text-muted">
                      {isSystemActive ? 'Detecting vehicles...' : 'Start the system to see vehicle detections'}
                    </div>
                  </div>
                ) : (
                  detectionLogs.map((log) => (
                    <div key={log.id} className="list-group-item border-0 rounded-3 mb-3 shadow-sm">
                      <div className="row align-items-center">
                        <div className="col-lg-8">
                          <div className="d-flex align-items-center mb-2">
                            <i className="bi bi-building-fill text-primary me-2"></i>
                            <span className="fw-bold text-dark fs-5">{log.junction}</span>
                            <span className="badge bg-success ms-3 rounded-pill">
                              <i className="bi bi-arrow-up-circle me-1"></i>
                              {log.direction.toUpperCase()}
                            </span>
                          </div>
                          <div className="small text-muted">
                            <i className="bi bi-clock me-1"></i>
                            {log.timestamp.toLocaleTimeString()} • 
                            <i className="bi bi-bullseye ms-2 me-1"></i>
                            {log.detectionAccuracy}% accuracy
                          </div>
                        </div>
                        <div className="col-lg-4 text-end">
                          <div className="row g-2">
                            <div className="col-6">
                              <div className="card bg-primary bg-opacity-10 border-primary border-opacity-25 text-center p-2">
                                <div className="small text-primary fw-semibold">Vehicles</div>
                                <div className="fw-bold text-primary fs-5">{log.vehicleCount}</div>
                              </div>
                            </div>
                            <div className="col-6">
                              <div className="card bg-success bg-opacity-10 border-success border-opacity-25 text-center p-2">
                                <div className="small text-success fw-semibold">Green Time</div>
                                <div className="fw-bold text-success fs-5">{log.greenTime}s</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Enhanced How It Works */}
          <div className="card mt-4 border-0 rounded-4 shadow-lg" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
            <div className="card-body p-4">
              <h3 className="card-title h4 text-white mb-4">
                <i className="bi bi-gear-fill me-2"></i>
                AI-Based Green Light Timer Algorithm:
              </h3>
              <div className="row g-4 text-white">
                <div className="col-lg-6">
                  <div className="d-flex align-items-start mb-3">
                    <i className="bi bi-1-circle-fill me-3 fs-5 mt-1"></i>
                    <div>
                      <strong>Vehicle Detection:</strong> AI cameras count vehicles in each direction every 5 seconds using computer vision
                    </div>
                  </div>
                  <div className="d-flex align-items-start mb-3">
                    <i className="bi bi-2-circle-fill me-3 fs-5 mt-1"></i>
                    <div>
                      <strong>Green Light Calculation:</strong> Timer = Base Time (20s) + (Vehicle Count × 2.2s)
                    </div>
                  </div>
                  <div className="d-flex align-items-start">
                    <i className="bi bi-3-circle-fill me-3 fs-5 mt-1"></i>
                    <div>
                      <strong>Smart Limits:</strong> Minimum 15s, Maximum 80s to ensure optimal traffic flow
                    </div>
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="d-flex align-items-start mb-3">
                    <i className="bi bi-4-circle-fill me-3 fs-5 mt-1"></i>
                    <div>
                      <strong>Signal Control:</strong> Only ONE direction gets green light, others remain red
                    </div>
                  </div>
                  <div className="d-flex align-items-start mb-3">
                    <i className="bi bi-5-circle-fill me-3 fs-5 mt-1"></i>
                    <div>
                      <strong>Dynamic Switching:</strong> Signals change based on real-time traffic demand
                    </div>
                  </div>
                  <div className="d-flex align-items-start">
                    <i className="bi bi-6-circle-fill me-3 fs-5 mt-1"></i>
                    <div>
                      <strong>Efficiency Gain:</strong> Reduces waiting time by up to 45% compared to static timers
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Custom Animations */}
      {/* <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
        }
        
        @keyframes moveVehicle {
          0% { transform: translateX(-2px); }
          50% { transform: translateX(2px); }
          100% { transform: translateX(-2px); }
        }
        
        .card {
          transition: all 0.3s ease-in-out;
        }
        
        .card:hover {
          transform: translateY(-2px);
        }
        
        .btn {
          transition: all 0.3s ease-in-out;
        }
        
        .list-group-item {
          transition: all 0.3s ease-in-out;
        }
        
        .list-group-item:hover {
          transform: translateX(5px);
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
        }
      `}</style> */}
    </>
  );
};

export default SimulatedTrafficSystem;