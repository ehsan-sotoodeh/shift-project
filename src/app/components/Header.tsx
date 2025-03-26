"use client";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const { user, logout, loading } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleUserDropdownToggle = () => {
    setUserDropdownOpen((prev) => !prev);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!loading && !user) {
    return null;
  }

  return (
    <header className="w-full bg-white border-b border-gray-200">
      {/* Top nav */}
      <div className="flex items-center justify-between px-4 py-2">
        {/* Left side: Hamburger + Logo */}
        <div className="flex items-center gap-4">
          <button
            className="p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
            onClick={handleMenuToggle}
            aria-label="Open menu"
          >
            <i className="fas fa-bars text-xl"></i>
          </button>
          <Link href="/" className="text-xl font-bold text-gray-800">
            MyBrand
          </Link>
        </div>

        {/* Right side: Icons */}
        <div className="flex items-center gap-4">
          <Link
            href="/favorites"
            className="p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
            aria-label="Favorites"
          >
            <i className="fas fa-bookmark text-xl"></i>
          </Link>
          <button
            className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
            aria-label="Notifications"
          >
            <i className="fas fa-bell text-xl"></i>
            <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-500 rounded-full">
              5
            </span>
          </button>
          {/* User Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={handleUserDropdownToggle}
              className="p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
              aria-label="User Profile Dropdown"
            >
              <i className="fas fa-user-circle text-2xl"></i>
            </button>
            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded shadow-lg z-10">
                <Link
                  href="/profile"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                >
                  <i className="fas fa-user"></i>
                  <span>{user?.name || "Profile"}</span>
                </Link>
                <button
                  onClick={logout}
                  className="w-full text-left block px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                >
                  <i className="fas fa-sign-out-alt"></i>
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search bar (visible only when screen < sm) */}
      <div className="px-4 pb-2 sm:hidden">
        <div className="relative">
          <input
            type="text"
            placeholder="Search"
            className="w-full border border-gray-300 rounded-full pl-4 pr-10 py-2 focus:outline-none focus:border-blue-500"
          />
          <button
            className="absolute right-2 top-2 text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label="Search"
          >
            <i className="fas fa-search"></i>
          </button>
        </div>
      </div>

      {/* Mobile side menu */}
      {isMenuOpen && (
        <div className="sm:hidden bg-white border-t border-gray-200">
          <nav className="px-4 py-2">
            <Link
              href="/"
              className="block py-2 text-gray-700 hover:bg-gray-100 rounded"
            >
              Home
            </Link>
            <Link
              href="/favorites"
              className="block py-2 text-gray-700 hover:bg-gray-100 rounded"
            >
              Favorites
            </Link>
            <Link
              href="/profile"
              className="block py-2 text-gray-700 hover:bg-gray-100 rounded"
            >
              Profile
            </Link>
            {/* Add more nav items as needed */}
          </nav>
        </div>
      )}
    </header>
  );
}
