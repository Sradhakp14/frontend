import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaBars,
  FaTimes,
  FaUserCircle,
  FaShoppingCart,
} from "react-icons/fa";
import { useCart } from "../context/CartContext";
import LogoutButton from "./LogoutButton";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { cart } = useCart();
  const navigate = useNavigate();

  const user = localStorage.getItem("user");

  const cartCount = cart.reduce((total, item) => total + (item.qty || 1), 0);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-3">
        <Link to="/" className="text-2xl font-bold text-yellow-600">
          GoldMart
        </Link>

        <button
          className="text-yellow-600 text-2xl md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>

        <div
          className={`${
            menuOpen ? "block" : "hidden"
          } md:flex md:items-center md:space-x-6 text-gray-800 w-full md:w-auto`}
        >
          <div className="md:flex md:items-center md:space-x-6 w-full md:w-auto">
            <Link to="/" className="hover:text-yellow-600 block py-2 md:py-0">
              Home
            </Link>
            <Link
              to="/contact"
              className="hover:text-yellow-600 block py-2 md:py-0"
            >
              Contact
            </Link>
          </div>

          <div className="md:flex md:items-center md:space-x-4 mt-2 md:mt-0">
            {!user ? (
              <>
                <Link
                  to="/login"
                  className="hover:text-yellow-600 block py-2 md:py-0"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="hover:text-yellow-600 block py-2 md:py-0"
                >
                  Register
                </Link>
              </>
            ) : (
              <div className="relative md:ml-2">
                <button
                  className="flex items-center space-x-1 text-yellow-600 hover:text-yellow-700"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <FaUserCircle className="text-2xl" />
                  <span>Profile</span>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 bg-white shadow-lg rounded-md w-48 border border-gray-100 z-50">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={() => setDropdownOpen(false)}
                    >
                      My Profile
                    </Link>
                    <Link
                      to="/userdashboard"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={() => setDropdownOpen(false)}
                    >
                      User Dashboard
                    </Link>
                    <div className="px-4 py-2">
                      <LogoutButton />
                    </div>
                  </div>
                )}
              </div>
            )}

            <Link
              to="/cart"
              className="relative flex items-center text-yellow-600 hover:text-yellow-700 md:ml-2 py-2 md:py-0"
            >
              <FaShoppingCart className="text-2xl" />
              <span className="ml-1">Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs font-semibold rounded-full px-1.5 py-0.5">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
