// components/Header.jsx
import React from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../public/images/LOGO1.png";

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login"); // redirect after logout
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b">

      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">

          {/* Left Section: Logo + Text */}
          <div className="flex items-center space-x-4">
           <div className="flex items-center space-x-4">
            
            {/* LOGO (replace the src with your logo URL) */}
            <img src={logo} className="h-12 w-12" />

            
          </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">EHLANZENI STAR SCHOOL</h1>
              <p className="text-gray-600 text-sm">Applications Management</p>
            </div>
          </div>

          {/* Middle Section: Navigation Links */}
          <nav className="hidden md:flex space-x-6 text-gray-700 font-medium">
            <Link to="/admin/*" className="hover:text-blue-600 transition">Application Admissions</Link>
            <Link to="/admin/students/application-documents" className="hover:text-blue-600 transition">Applications Documents</Link>
          </nav>

          {/* Right Section: Logout Button */}
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
          >
            Logout
          </button>

        </div>
      </div>
    </header>
  );
};

export default Header;
