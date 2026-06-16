# Smart Traffic Monitor

A comprehensive traffic management and vehicle detection system built with React, Flask, and YOLOv8. This application provides real-time traffic analysis, vehicle detection, mapping, and admin dashboard features.

## Project Overview

Smart Traffic Monitor is a full-stack application designed to:
- Detect and count vehicles using YOLOv8 object detection
- Analyze traffic patterns and congestion levels
- Provide interactive mapping with routing and geocoding
- Manage traffic reports and incidents
- Admin dashboard for system management
- Real-time traffic simulation and analysis

## Project Structure

```
kotechhack-1/
├── backend/
│   ├── app.py              # Flask application with YOLOv8 integration
│   ├── yolov8s.pt          # YOLOv8 Small model weights
│   ├── uploads/            # Folder for uploaded images
│   └── results/            # Folder for processed images
│
└── frontend/
    ├── public/             # Static assets
    ├── src/
    │   ├── components/     # Reusable React components
    │   ├── pages/          # Page components
    │   ├── App.js          # Main app component
    │   ├── App.css         # Global styles
    │   ├── index.js        # Entry point
    │   └── supabaseClient.js # Supabase configuration
    └── package.json        # Frontend dependencies
```
picture 1
<img width="1897" height="826" alt="s1" src="https://github.com/user-attachments/assets/56a6cf83-18a4-4b07-b3ec-4ac57a888278" />

picture 2
<img width="1906" height="833" alt="s2" src="https://github.com/user-attachments/assets/5f516e7c-ffa0-41f4-beab-eb6b2b079744" />

picture 3
<img width="1850" height="809" alt="s3" src="https://github.com/user-attachments/assets/cb8ccea6-0b7d-4bf1-a6a3-5fb0632a442a" />

## Tech Stack

### Backend
- **Flask** - REST API framework
- **YOLOv8** - Object detection model (vehicle detection)
- **Flask-CORS** - Cross-origin request handling
- **OpenCV** - Image processing
- **Python** - Backend language

### Frontend
- **React 19** - UI framework
- **React Router v7** - Client-side routing
- **Leaflet** - Interactive mapping
- **Leaflet Routing Machine** - Route planning
- **Leaflet Control Geocoder** - Geocoding
- **Chart.js** - Data visualization
- **Bootstrap** - UI components
- **Supabase** - Authentication and backend services
- **Axios** - HTTP client
- **React Toastify** - Notifications
- **Framer Motion** - Animations

## Key Features

### Vehicle Detection
- Real-time vehicle detection using YOLOv8
- Count vehicles in uploaded images
- Classify vehicles (cars, trucks, buses, motorcycles)
- Visual bounding box annotations

### Traffic Management
- **Traffic Analyzer** - Analyze traffic density and patterns
- **Traffic Simulation** - Simulate traffic scenarios
- **Trafficmanagement** - Central traffic management interface
- **Report Form** - Report incidents and traffic issues
- **Report List** - View and manage traffic reports

### Mapping & Routing
- **Interactive Map** - Leaflet-based map visualization
- **Manual Search Map** - Search and navigate traffic hotspots
- **Routing Control** - Plan routes with traffic considerations
- **Geocoding** - Convert addresses to coordinates

### Admin Features
- **Admin Dashboard** - System overview and statistics
- **Admin Login** - Secure admin authentication
- **Protected Routes** - Role-based access control

### Chat & Support
- **Chatbot** - AI-powered user support

## Getting Started

### Prerequisites
- Python 3.8+
- Node.js 14+
- npm or yarn
- Supabase account (for authentication)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install flask flask-cors ultralytics opencv-python
```

4. Run the Flask server:
```bash
python app.py
```

The backend will be available at `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with your Supabase credentials:
```
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_key
```

4. Start the development server:
```bash
npm start
```

The frontend will be available at `http://localhost:3000`

## API Endpoints

### Vehicle Detection
- **POST** `/analyze` - Analyze an uploaded image for vehicles
  - Request: multipart/form-data with `image` field
  - Response: `{ vehicle_count: number, image_url: string }`

- **GET** `/result/<filename>` - Retrieve processed image with detection results

- **GET** `/` - Health check

## Main Components

### Frontend Components
- **AdminDashboard** - Admin system overview
- **AdminLogin** - Secure admin login
- **TrafficAnalyzer** - Traffic analysis interface
- **TrafficSimulation** - Traffic simulation tool
- **Trafficmanagement** - Main traffic control interface
- **MapBox** - Interactive map display
- **ManualSearchMap** - Location search with map
- **ParkingLocator** - Find parking spots
- **RoutingControl** - Route planning
- **ReportForm** - Submit traffic reports
- **ReportList** - View reports
- **Chatbot** - AI chat support
- **Home** - Landing page
- **ProtectedRoute** - Authentication wrapper

## Environment Variables

### Backend
- `FLASK_ENV` - Development or production
- `FLASK_PORT` - Port to run Flask server (default: 5000)

### Frontend
- `REACT_APP_SUPABASE_URL` - Supabase project URL
- `REACT_APP_SUPABASE_ANON_KEY` - Supabase anonymous key

## Running the Application

### Development Mode

1. Start the backend:
```bash
cd backend
python app.py
```

2. In another terminal, start the frontend:
```bash
cd frontend
npm start
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Production Build

Frontend:
```bash
cd frontend
npm run build
```

This creates an optimized production build in the `build` folder.

## Scripts

### Frontend Scripts
- `npm start` - Run development server
- `npm build` - Create production build
- `npm test` - Run tests
- `npm eject` - Eject from Create React App (irreversible)

## Project Features in Detail

### Traffic Analysis
Real-time traffic monitoring and analysis using vehicle detection to assess congestion levels and traffic patterns.

### Vehicle Detection
YOLOv8-powered image analysis that:
- Detects vehicles in uploaded images
- Counts total vehicles
- Filters by vehicle type (cars, trucks, buses, motorcycles)
- Returns annotated images with bounding boxes

### Admin Management
Secure admin dashboard for:
- Viewing system statistics
- Managing traffic reports
- Monitoring system health
- User account management

### Interactive Mapping
Leaflet-based interactive maps featuring:
- Current traffic visualization
- Route planning
- Location geocoding
- Traffic hotspot identification

## Common Issues & Solutions

### CORS Errors
Ensure the Flask backend is running and CORS is properly configured. The backend should be accessible at `http://localhost:5000`.

### Image Upload Fails
Check that the `uploads` and `results` folders exist in the backend directory. They are created automatically on first run.

### Map Not Loading
Verify that you've properly configured Supabase credentials in your `.env` file.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see LICENSE file for details.

## Support

For issues, questions, or suggestions, please:
1. Check existing issues in the repository
2. Create a new issue with detailed description
3. Use the in-app chatbot for general support

## Acknowledgments

- YOLOv8 by Ultralytics
- Leaflet.js community
- React and Flask communities
- Bootstrap for UI components
