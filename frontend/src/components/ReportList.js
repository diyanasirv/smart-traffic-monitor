import React, { useEffect, useState } from 'react';
import supabase from '../supabaseClient'; // No curly braces
const ReportList = () => {
  const [reports, setReports] = useState(null); // Initially null
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      const { data, error } = await supabase
        .from('road_issues')
        .select('*')
        .eq('is_resolved', false);

      if (error) {
        console.error('Error fetching reports:', error.message);
        setReports([]); // fallback to empty
      } else {
        setReports(data || []);
      }
      setLoading(false);
    };

    fetchReports();
  }, []);

  if (loading) return <p>Loading reports...</p>;

  return (
    <div>
      <h2>Unresolved Traffic Reports</h2>
      {reports?.length > 0 ? (
        <ul>
          {reports.map((report) => (
            <li key={report.id}>
              <strong>{report.issue_type}</strong>: {report.description || "No description"}
            </li>
          ))}
        </ul>
      ) : (
        <p>No unresolved reports found.</p>
      )}
    </div>
  );
};

export default ReportList;
