"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function SearchPage() {
  const [country, setCountry] = useState("Canada");
  const [name, setName] = useState("");
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [responseCode, setResponseCode] = useState<number | null>(null);
  const [responseTime, setResponseTime] = useState<number | null>(null);

  const fetchUniversities = async () => {
    setLoading(true);
    const startTime = Date.now();
    try {
      const res = await fetch(
        `/api/universities?country=${country}&name=${name}`
      );
      const data = await res.json();
      const endTime = Date.now();
      setResponseCode(data.statusCode);
      setResponseTime(data.responseTime || endTime - startTime);
      setUniversities(data.data || []);
    } catch (error) {
      console.error("Error fetching universities:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUniversities();
  }, [country, name]);

  const clearFilters = () => {
    setCountry("Canada");
    setName("");
  };

  const handleFavoriteToggle = (id: number) => {
    // Placeholder for adding/removing favorites logic
    console.log(`Toggle favorite for university with id ${id}`);
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h1>University Search</h1>
      <div style={{ marginBottom: "1rem" }}>
        <label style={{ marginRight: "1rem" }}>
          Country:
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            style={{ marginLeft: "0.5rem" }}
          >
            <option value="Canada">Canada</option>
            <option value="United States">United States</option>
            <option value="United Kingdom">United Kingdom</option>
            {/* Add more country options as needed */}
          </select>
        </label>
        <label style={{ marginRight: "1rem" }}>
          Name:
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Search by name"
            style={{ marginLeft: "0.5rem" }}
          />
        </label>
        <button onClick={clearFilters}>Clear All Filters</button>
      </div>
      <div style={{ marginBottom: "1rem" }}>
        <p>Response Code: {responseCode !== null ? responseCode : "N/A"}</p>
        <p>Response Time: {responseTime !== null ? responseTime : "N/A"} ms</p>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table
          border={1}
          cellPadding={8}
          cellSpacing={0}
          style={{ width: "100%", marginBottom: "1rem" }}
        >
          <thead>
            <tr>
              <th>Name</th>
              <th>State/Province</th>
              <th>Website</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {universities.map((uni: any) => (
              <tr key={uni.id}>
                <td>{uni.name}</td>
                <td>{uni.stateProvince || "N/A"}</td>
                <td>
                  <a
                    href={uni.website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {uni.website}
                  </a>
                </td>
                <td>
                  <button onClick={() => handleFavoriteToggle(uni.id)}>
                    Add to Favorites
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div>
        <Link href="/favorites">Go to Favorites</Link>
      </div>
    </div>
  );
}
