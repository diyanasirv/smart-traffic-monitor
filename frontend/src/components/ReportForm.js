import React, { useEffect, useState } from 'react';
import supabase from '../supabaseClient'; // No curly braces
import { Form, Button } from 'react-bootstrap';

// Allowed issue types
const issueTypes = [
  'Pothole', 'Broken Traffic Signal', 'Waterlogging',
  'Garbage on Road', 'Illegal Parking', 'Blocked Road'
];

// ✅ Helper: Check if newPos is within 5km of userPos
const isWithin5km = (userPos, newPos) => {
  const toRad = (x) => x * Math.PI / 180;
  const R = 6371;
  const dLat = toRad(newPos.lat - userPos.lat);
  const dLng = toRad(newPos.lng - userPos.lng);
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(userPos.lat)) * Math.cos(toRad(newPos.lat)) *
            Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c) <= 5;
};

const ReportForm = () => {
  const [issueType, setIssueType] = useState('');
  const [description, setDescription] = useState('');
  const [position, setPosition] = useState(null); // Editable position
  const [userPos, setUserPos] = useState(null);   // Original GPS

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      const currentPos = { lat: latitude, lng: longitude };
      setUserPos(currentPos);
      setPosition(currentPos); // Default to user location
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!issueType || !position) {
      alert('Please select issue type and allow location access.');
      return;
    }

    // ⛔ Enforce 5km location rule
    if (userPos && !isWithin5km(userPos, position)) {
      alert('Selected location is more than 5km away from your current position.');
      return;
    }

    const { error } = await supabase.from('road_issues').insert({
      issue_type: issueType,
      description,
      location_lat: position.lat,
      location_lng: position.lng,
      status_votes: { solved: 0, remain: 0 },
      is_resolved: false,
    });

    if (error) {
      console.error(error);
      alert('Error reporting issue. Try again.');
    } else {
      alert('Reported successfully!');
      setIssueType('');
      setDescription('');
    }
  };

  return (
    <Form onSubmit={handleSubmit} className="mb-4 p-3 border rounded bg-light">
      <Form.Group className="mb-2">
        <Form.Label><b>Issue Type</b></Form.Label>
        <Form.Select value={issueType} onChange={e => setIssueType(e.target.value)} required>
          <option value="">Select an issue</option>
          {issueTypes.map(type => <option key={type}>{type}</option>)}
        </Form.Select>
      </Form.Group>

      <Form.Group className="mb-2">
        <Form.Label><b>Description</b></Form.Label>
        <Form.Control
          type="text"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Optional"
        />
      </Form.Group>

      {/* Location display */}
      {position && (
        <div className="mb-2 text-muted small">
          <b>Selected Location:</b> {position.lat.toFixed(4)}, {position.lng.toFixed(4)}
        </div>
      )}

      <Button type="submit" variant="primary">Submit Report</Button>
    </Form>
  );
};

export default ReportForm;
