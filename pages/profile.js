import { useEffect, useState } from "react";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Call your Flask backend running on port 8080
    fetch("http://localhost:8080/api/creator/profile", {
      headers: {
        "X-Creator-ID": "test-user" // replace with real Firebase UID
      }
    })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => setProfile(data))
      .catch(err => setError(err.message));
  }, []);

  if (error) {
    return <p style={{ color: "red" }}>Error: {error}</p>;
  }

  if (!profile) {
    return <p>Loading profile...</p>;
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Creator Profile</h1>
      <p><strong>ID:</strong> {profile.id}</p>
      <p><strong>Email:</strong> {profile.email}</p>
      <p><strong>Name:</strong> {profile.name}</p>
      <p><strong>Subscription Tier:</strong> {profile.subscription_tier}</p>
      <p><strong>Credits Remaining:</strong> {profile.credits_remaining}</p>
    </div>
  );
}
