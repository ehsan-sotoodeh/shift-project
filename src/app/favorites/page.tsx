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
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Favorites</h1>
      {loading ? (
        <p className="text-center text-gray-600">Loading favorites...</p>
      ) : favorites.length === 0 ? (
        <p className="text-center text-gray-600">No favorites added yet.</p>
      ) : (
        <div className="overflow-x-auto mb-6">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left">Name</th>
                <th className="border p-2 text-left">State/Province</th>
                <th className="border p-2 text-left">Website</th>
                <th className="border p-2 text-center">Favorite</th>
              </tr>
            </thead>
            <tbody>
              {favorites.map((fav: any) => (
                <tr key={fav.id} className="hover:bg-gray-50">
                  <td className="border p-2">{fav.university.name}</td>
                  <td className="border p-2">
                    {fav.university.stateProvince || "N/A"}
                  </td>
                  <td className="border p-2">
                    <a
                      href={fav.university.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      {fav.university.website}
                    </a>
                  </td>
                  <td className="border p-2 text-center">
                    <button
                      onClick={() => removeFavorite(fav.id)}
                      className="flex items-center justify-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition duration-200"
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="text-right">
        <Link
          href="/search"
          className="text-blue-500 hover:underline font-medium"
        >
          Back to Search
        </Link>
      </div>
    </div>
  );
}
