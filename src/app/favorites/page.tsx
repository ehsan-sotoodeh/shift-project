/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/favorites");
      const data = await res.json();
      setFavorites(data.data || []);
    } catch (error) {
      console.error("Error fetching favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const removeFavorite = async (id: number) => {
    try {
      const res = await fetch(`/api/favorites?id=${id}`, { method: "DELETE" });
      const result = await res.json();
      if (result.statusCode === 200) {
        // Immediately update UI without a full refetch
        setFavorites((prev) => prev.filter((fav: any) => fav.id !== id));
      }
    } catch (error) {
      console.error("Error removing favorite:", error);
    }
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h1>Favorites</h1>
      {loading ? (
        <p>Loading favorites...</p>
      ) : favorites.length === 0 ? (
        <p>No favorites added yet.</p>
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
            {favorites.map((fav: any) => (
              <tr key={fav.id}>
                <td>{fav.university.name}</td>
                <td>{fav.university.stateProvince || "N/A"}</td>
                <td>
                  <a
                    href={fav.university.website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {fav.university.website}
                  </a>
                </td>
                <td>
                  <button onClick={() => removeFavorite(fav.id)}>
                    Remove from Favorites
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div>
        <Link href="/search">Back to Search</Link>
      </div>
    </div>
  );
}
