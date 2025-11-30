import React, { useState, useEffect, useRef } from "react";
import AmenitiesCard from "../../components/AmenitiesCard";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useAuth } from "../AuthContext";
import api from "../../config/axios"; 
import { useNavigate } from "react-router-dom";

const Amenities = () => {
  const [amenities, setAmenities] = useState([]);
  const [filteredAmenities, setFilteredAmenities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const lastNavigatedRef = useRef(null);

  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const backgroundImageUrl = "/images/bg.jpg";
  
  // LOGOUT HANDLERS
  const handleLogoutClick = () => {
    logout(); 
    navigate('/'); 
  };

  
  return (
    <div className="min-h-screen bg-lp-light-bg flex flex-col">
      
      {/* Header */}
      <Header user={user} onLogout={handleLogoutClick} />

      {/* Hero Section - FIXED HEIGHT */}
      <section
        className="bg-cover bg-center text-white py-12 sm:py-16 lg:py-20"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(${backgroundImageUrl})`,
        }}
      >
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl md:text-6xl font-bold text-white font-header mb-4">
            View All Amenities
          </h2>
          <p className="text-sm md:text-lg text-gray-200 max-w-2xl mx-auto mb-8">
             Discover all the affordable facilities and services we offer at La Piscina Resort.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 sm:px-6 py-8">
        {/* Content Section */}
        <section className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-lp-dark font-header mb-4">All Amenities</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-sm md:text-base">Explore our complete range of facilities designed for your comfort and enjoyment.</p>
          </div>
        </section>
      </main>

      {/* Footer */}  
      <Footer />
    </div>
  );
};

export default Amenities;