import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import logo from "../assets/logo.png";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 w-full bg-white z-50 text-gray-600 border-b border-b-gray-200 shadow-xl">
      <div className="container mx-auto flex items-center justify-between lg:justify-start px-4 py-4">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <img src={logo} alt="Logo" width={90} />
        </div>

        {/* Desktop Menu */}
        <ul className="hidden md:flex mx-15 space-x-12 text-[18px] font-semibold">
          <li>
            <NavLink to="/" className="hover:text-teal-600">
              Home
            </NavLink>
          </li>
          
          <li>
            <NavLink to="/dashboard" className="hover:text-teal-600">
              Dashboard
            </NavLink>
          </li>
        </ul>

        {/* Mobile Hamburger Icon */}
        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
          <ul className="flex flex-col space-y-4 px-6 py-4 text-[18px] font-semibold">
            <li>
              <NavLink
                to="/"
                className="hover:text-teal-600"
                onClick={() => setIsOpen(false)}
              >
                Home
              </NavLink>
            </li>
            
            <li>
              <NavLink
                to="/dashboard"
                className="hover:text-teal-600"
                onClick={() => setIsOpen(false)}
              >
                Dashboard
              </NavLink>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
