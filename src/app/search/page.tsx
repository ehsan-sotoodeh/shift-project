"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function SearchPage() {
  const [country, setCountry] = useState("Canada");
  const [name, setName] = useState("");
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [responseCode, setResponseCode] = useState(null);
  const [responseTime, setResponseTime] = useState(null);
  interface IFavorite {
    favoriteId: number;
    universityId: number;
  }

  const [favorites, setFavorites] = useState<IFavorite[]>([]);

  // Fetch search results
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

  // Fetch favorites
  const fetchFavorites = async () => {
    try {
      const res = await fetch("/api/favorites");
      const data = await res.json();
      // Assuming the API returns an array of favorite objects with a universityId field.
      const fetchedFavorites = data.data.map((fav: any): IFavorite => {
        return { favoriteId: fav.id, universityId: fav.universityId };
      });
      console.log("Fetched favorites:", fetchedFavorites);
      setFavorites(fetchedFavorites);
    } catch (error) {
      console.error("Error fetching favorites:", error);
    }
  };

  useEffect(() => {
    fetchUniversities();
  }, [country, name]);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const addFavorite = async (universityId: number) => {
    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ universityId }),
      });
      const result = await res.json();
      if (result.statusCode === 201) {
        setFavorites((prev) => [
          ...prev,
          { favoriteId: result.data.id, universityId },
        ]);
      }
    } catch (error) {
      console.error("Error adding favorite:", error);
    }
  };

  const removeFavorite = async (universityId: number) => {
    const selectedFavorite = favorites.find(
      (f) => f.universityId === universityId
    );
    if (!selectedFavorite) {
      console.error("Favorite not found for universityId:", universityId);
      return;
    }
    if (!selectedFavorite) {
      console.error("Favorite not found for universityId:", universityId);
      return;
    }
    try {
      const res = await fetch(
        `/api/favorites?id=${selectedFavorite.favoriteId}`,
        {
          method: "DELETE",
        }
      );
      const result = await res.json();
      if (result.statusCode === 200) {
        setFavorites((prev) =>
          prev.filter(
            (f: IFavorite) => f.favoriteId !== selectedFavorite.favoriteId
          )
        );
      }
    } catch (error) {
      console.error("Error removing favorite:", error);
    }
  };

  const handleFavoriteToggle = (universityId: number) => {
    if (favorites.some((f) => f.universityId === universityId)) {
      removeFavorite(universityId);
    } else {
      addFavorite(universityId);
    }
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
        <button
          onClick={() => {
            setCountry("Canada");
            setName("");
          }}
        >
          Clear All Filters
        </button>
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
                    {favorites.some((f) => f.universityId === uni.id)
                      ? "Remove from Favorites"
                      : "Add to Favorites"}
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
