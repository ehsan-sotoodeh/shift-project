"use client";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-black text-white py-10 px-4 md:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Left Column: Agency tagline */}
        <div className="md:col-span-1">
          <h2 className="text-xl md:text-2xl font-semibold leading-tight mb-4">
            One window for everything you do on the internet<sup>®</sup>
          </h2>
        </div>

        {/* Middle Columns: Offices */}
        <div className="space-y-4">
          <h3 className="text-sm uppercase tracking-widest font-medium mb-2">
            London
          </h3>
          <p className="text-sm leading-relaxed">
            <a href="mailto:sayHi@shift.com" className="hover:underline">
              sayHi@shift.com
            </a>
            <br />
            +44 20 7987 7571
            <br />
            Unit 306, Metropolitan Wharf,
            <br />
            70 Wapping Wall, London E1W 3SS
          </p>
          <Link
            href="#"
            className="text-sm font-medium hover:underline inline-flex items-center"
          >
            See on map
            <i className="fa-solid fa-arrow-right ml-2 text-xs"></i>
          </Link>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm uppercase tracking-widest font-medium mb-2">
            Buenos Aires
          </h3>
          <p className="text-sm leading-relaxed">
            <a
              href="mailto:buenosaires@weareimpatient.com"
              className="hover:underline"
            >
              buenosaires@weareimpatient.com
            </a>
            <br />
            +54 11 6799 7949
            <br />
            Cabildo 1458 1st floor,
            <br />
            Buenos Aires
          </p>
          <Link
            href="#"
            className="text-sm font-medium hover:underline inline-flex items-center"
          >
            See on map
            <i className="fa-solid fa-arrow-right ml-2 text-xs"></i>
          </Link>
        </div>

        {/* Right Column: Newsletter & Social */}
        <div className="space-y-4">
          <div>
            <h3 className="text-sm uppercase tracking-widest font-medium mb-2">
              Want to be the smartest in your office?
            </h3>
            <Link
              href="#"
              className="text-sm font-medium hover:underline inline-flex items-center"
            >
              Sign up for our newsletter
              <i className="fa-solid fa-arrow-right ml-2 text-xs"></i>
            </Link>
          </div>

          <div>
            <h3 className="text-sm uppercase tracking-widest font-medium mb-2">
              Follow us
            </h3>
            <div className="flex items-center gap-4">
              <Link
                href="https://www.facebook.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
              >
                <i className="fab fa-facebook-f hover:text-gray-400"></i>
              </Link>
              <Link
                href="https://www.twitter.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
              >
                <i className="fab fa-twitter hover:text-gray-400"></i>
              </Link>
              <Link
                href="https://www.linkedin.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
              >
                <i className="fab fa-linkedin-in hover:text-gray-400"></i>
              </Link>
              <Link
                href="https://www.instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <i className="fab fa-instagram hover:text-gray-400"></i>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
