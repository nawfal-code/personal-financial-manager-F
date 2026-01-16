import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const linkClass = (path) =>
    `px-3 py-2 rounded-md text-sm font-medium transition
     ${
       location.pathname === path
         ? "bg-blue-600 text-white"
         : "text-gray-200 hover:bg-gray-700 hover:text-white"
     }`;

  return (
    <nav className="bg-gray-900 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo / Title */}
          <div className="font-bold text-lg tracking-wide text-blue-400">
            Personal Finance Manager
          </div>

          {/* Hamburger Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1">
            <Link to="/" className={linkClass("/")}>Dashboard</Link>
            <Link to="/expenses" className={linkClass("/expenses")}>Expenses</Link>
            <Link to="/income" className={linkClass("/income")}>Income</Link>
            <Link to="/budget" className={linkClass("/budget")}>Budget</Link>
            <Link to="/goals" className={linkClass("/goals")}>Goals</Link>
            <Link to="/reports" className={linkClass("/reports")}>Reports</Link>
            <Link to="/profile" className={linkClass("/profile")}>Profile</Link>

            <button
              onClick={logout}
              className="ml-3 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md text-sm font-medium transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-gray-800 border-t border-gray-700">
          <div className="px-4 py-3 space-y-2">
            <Link to="/" className={linkClass("/")} onClick={() => setIsOpen(false)}>Dashboard</Link>
            <Link to="/expenses" className={linkClass("/expenses")} onClick={() => setIsOpen(false)}>Expenses</Link>
            <Link to="/income" className={linkClass("/income")} onClick={() => setIsOpen(false)}>Income</Link>
            <Link to="/budget" className={linkClass("/budget")} onClick={() => setIsOpen(false)}>Budget</Link>
            <Link to="/goals" className={linkClass("/goals")} onClick={() => setIsOpen(false)}>Goals</Link>
            <Link to="/reports" className={linkClass("/reports")} onClick={() => setIsOpen(false)}>Reports</Link>
            <Link to="/profile" className={linkClass("/profile")} onClick={() => setIsOpen(false)}>Profile</Link>

            <button
              onClick={() => {
                logout();
                setIsOpen(false);
              }}
              className="w-full bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md text-sm font-medium transition mt-2"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
