import { useEffect, useState } from "react";

export default function Dashboard() {
  const [subs, setSubs] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Call your Flask backend running on port 8080
    fetch("http://localhost:8080/api/submissions", {
      headers: {
        "X-Creator-ID": "test-user" // replace with real Firebase UID or creator ID
      }
    })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => setSubs(data.submissions || []))
      .catch(err => setError(err.message));
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>SeekReap Dashboard</h1>
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      <h2>Recent Submissions</h2>
      <ul>
        {subs.map(s => (
          <li key={s.id}>
            <strong>{s.content_url}</strong> — {s.status}  
            <br />
            Risk: {s.risk_level || "N/A"} | Score: {s.overall_risk_score ?? "N/A"}
          </li>
        ))}
      </ul>
    </div>
  );
}

