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
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 10; // or you could add this as state if you want it to be dynamic

  interface IFavorite {
    favoriteId: number;
    universityId: number;
  }
  const [favorites, setFavorites] = useState<IFavorite[]>([]);

  // Fetch search results with pagination
  const fetchUniversities = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/universities?country=${country}&name=${name}&page=${page}&pageSize=${pageSize}`);
      const data = await res.json();
      setUniversities(data.data || []);
      setTotal(data.total || 0);
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
  }, [country, name, page]);

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

  // Pagination navigation handlers
  const totalPages = Math.ceil(total / pageSize);

  const handlePreviousPage = () => {
    setPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setPage((prev) => Math.min(prev + 1, totalPages));
  };

  // Reset page to 1 when filters change
  const handleFilterReset = () => {
    setCountry("Canada");
    setName("");
    setPage(1);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">University Search</h1>
      <div className="flex flex-col md:flex-row items-start gap-4 mb-6">
        <div className="flex items-center gap-2">
          <label htmlFor="country" className="font-medium">
            <i className="fa fa-filter text-gray-400"></i>
            Country:
          </label>
          <div className="relative">
            <select
              id="country"
              value={country}
              onChange={(e) => {
                setCountry(e.target.value);
                setPage(1); // reset page on filter change
              }}
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
              onChange={(e) => {
                setName(e.target.value);
                setPage(1); // reset page on filter change
              }}
              placeholder="Search by name"
              className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 pr-8"
            />
          </div>
        </div>
        <button
          onClick={handleFilterReset}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium px-4 py-2 rounded transition duration-200"
        >
          <i className="fa-solid fa-filter-circle-xmark mr-2"></i>
          Clear All Filters
        </button>
      </div>
      {loading ? (
        <p className="text-center text-gray-600">Loading...</p>
      ) : (
        <>
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
                {universities.length > 0 ? (
                  universities.map((uni: any) => (
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
                      </button>
                      )}
                    </div>
                    </td>
                  </tr>
                  ))
                ) : (
                  <tr>
                  <td colSpan={4} className="border p-4 text-center text-gray-500">
                    No universities found based on the search criteria.
                  </td>
                  </tr>
                )}
                </tbody>
            </table>
          </div>
          {/* Pagination Controls */}
            <div className="flex justify-between items-center" style={{ width: "350px", margin: "0 auto" }}>
            <button
              onClick={handlePreviousPage}
              disabled={page === 1}
              className="px-4 py-2 rounded flex items-center gap-2"
            >
<i className="fa-solid fa-chevron-left"></i>
              Previous
            </button>
            <span className="font-bold text-lg">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={page === totalPages || totalPages === 0}
              className="px-4 py-2 rounded"
            >
              Next
              <i className="fa-solid fa-chevron-right ml-2"></i>

            </button>
            </div>
        </>
      )}
      <div className="text-right mt-4">
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
