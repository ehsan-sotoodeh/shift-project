/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function SearchPage() {
  const [country, setCountry] = useState("Canada");
  const [name, setName] = useState("");
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(false);
  interface IFavorite {
    favoriteId: number;
    universityId: number;
  }
  const [favorites, setFavorites] = useState<IFavorite[]>([]);

  // Fetch search results
  const fetchUniversities = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/universities?country=${country}&name=${name}`);
      const data = await res.json();
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
      const fetchedFavorites = data.data.map((fav: any): IFavorite => {
        return { favoriteId: fav.id, universityId: fav.universityId };
      });
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
    try {
      const res = await fetch(`/api/favorites?id=${selectedFavorite.favoriteId}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (result.statusCode === 200) {
        setFavorites((prev) =>
          prev.filter((f: IFavorite) => f.favoriteId !== selectedFavorite.favoriteId)
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
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">University Search</h1>
      <div className="flex flex-col md:flex-row items-start gap-4 mb-6">
        <div className="flex items-center gap-2">
          <label htmlFor="country" className="font-medium">
          <i className="fa fa-filter  text-gray-400"></i>
          Country:
          </label>
          <div className="relative">
            <select
              id="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 pr-8"
            >
              <option value="Canada">🇨🇦 Canada</option>
              <option value="United States">🇺🇸 United States</option>
              <option value="United Kingdom">🇬🇧 United Kingdom</option>
              {/* Add more country options as needed */}
            </select>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="name" className="font-medium">
          <i className="fa fa-search text-gray-400"></i>
          </label>
            <div className="relative">
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Search by name"
              className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 pr-8"
            />
            </div>
        </div>
        <button
          onClick={() => {
            setCountry("Canada");
            setName("");
          }}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium px-4 py-2 rounded transition duration-200"
        >
            <i className="fa-solid fa-filter-circle-xmark mr-2"></i>
          Clear All Filters
        </button>
      </div>
      {/* <div className="mb-6">
        <p className="text-sm">
          <span className="font-medium">Response Code:</span> {responseCode !== null ? responseCode : "N/A"}
        </p>
        <p className="text-sm">
          <span className="font-medium">Response Time:</span> {responseTime !== null ? responseTime : "N/A"} ms
        </p>
      </div> */}
      {loading ? (
        <p className="text-center text-gray-600">Loading...</p>
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
              {universities.map((uni: any) => (
                <tr key={uni.id} className="hover:bg-gray-50">
                  <td className="border p-2">{uni.name}</td>
                  <td className="border p-2">{uni.stateProvince || "N/A"}</td>
                  <td className="border p-2">
                    <a
                      href={uni.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      {uni.website}
                    </a>
                  </td>
                    <td className="border p-2 text-center">
                    <div className="flex justify-center">
                      {favorites.some((f) => f.universityId === uni.id) ? (
                        <button
                        onClick={() => handleFavoriteToggle(uni.id)}
                        name="Remove from Favorites"
                        className="flex items-center justify-center gap-1 text-red-500 text-xl font-bold px-3 py-1 rounded transition duration-200"
                        >
                          <i className="fa-solid fa-trash"></i> 
                       </button>
                      ) : (
                      <button
                      name="Add to Favorites"
                        onClick={() => handleFavoriteToggle(uni.id)}
                        className="flex items-center justify-center gap-1 text-blue-500 text-xl font-bold px-3 py-1 rounded transition duration-200"
                      >
                        <i className="fas fa-heart"></i>
                        <span></span>
                      </button>
                      )}
                    </div>
                    </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="text-right">
        <Link
          href="/favorites"
          className="text-blue-500 hover:underline font-medium"
        >
          Go to Favorites
        </Link>
      </div>
    </div>
  );
}
