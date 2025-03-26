/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import toast from "react-hot-toast"; // Import toast

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10; // Fixed page size; can be made dynamic if needed.
  const [total, setTotal] = useState(0);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/favorites?page=${page}&pageSize=${pageSize}`
      );
      const data = await res.json();
      setFavorites(data.data || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      toast.error("Error fetching favorites.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, [page]);

  const removeFavorite = async (id: number) => {
    try {
      const res = await fetch(`/api/favorites?id=${id}`, { method: "DELETE" });
      const result = await res.json();
      if (result.statusCode === 200) {
        // Immediately update UI without a full refetch.
        setFavorites((prev) => prev.filter((fav: any) => fav.id !== id));
        toast.success("Favorite removed successfully.");
      }
    } catch (error) {
      console.error("Error removing favorite:", error);
      toast.error("Error removing favorite.");
    }
  };

  // Calculate total pages.
  const totalPages = Math.ceil(total / pageSize);

  const handlePreviousPage = () => {
    setPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setPage((prev) => Math.min(prev + 1, totalPages));
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Favorites</h1>
      {loading ? (
        <p className="text-center text-gray-600">Loading favorites...</p>
      ) : favorites.length === 0 ? (
        <p className="text-center text-gray-600">No favorites added yet.</p>
      ) : (
        <>
          {/* Responsive Table Container */}
          <div className="overflow-x-auto mb-6">
            <table className="min-w-full w-full table-auto border-collapse">
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
                        className="text-blue-500 hover:underline break-all"
                      >
                        {fav.university.website}
                      </a>
                    </td>
                    <td className="border p-2 text-center">
                      <div className="flex justify-center">
                        <button
                          onClick={() => removeFavorite(fav.id)}
                          className="flex items-center justify-center gap-1 text-red-500 text-xl font-bold px-3 py-1 rounded transition duration-200 hover:bg-red-200"
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-between items-center w-full md:w-[350px] mx-auto">
            <button
              onClick={handlePreviousPage}
              disabled={page === 1}
              className="px-4 py-2 rounded flex items-center gap-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
            >
              <i className="fa-solid fa-chevron-left"></i>
              Previous
            </button>
            <span className="font-bold text-lg">
              Page {page} of {(totalPages > 0 ? totalPages : 1) || 1}
            </span>
            <button
              onClick={handleNextPage}
              disabled={page === totalPages || totalPages === 0}
              className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50 flex items-center gap-2"
            >
              Next
              <i className="fa-solid fa-chevron-right"></i>
            </button>
          </div>
        </>
      )}
      <div className="text-right mt-4">
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
