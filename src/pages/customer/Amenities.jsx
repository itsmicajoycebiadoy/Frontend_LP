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
  
  const [filters, setFilters] = useState({
    type: 'any',
    availability: 'any',
    capacity: 'any',
    priceRange: 'any'
  });

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

  const fetchAmenities = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/api/amenities');
      const backendUrl = import.meta.env.VITE_API_URL || ""; 
      
      const dataWithImages = response.data.map(item => {
        const filename = item.image && item.image.toString().trim();
        return {
          ...item,
          image: filename ? `${backendUrl}/uploads/am_images/${filename}` : "/images/default-amenity.jpg"
        };
      });

      setAmenities(dataWithImages);
      setFilteredAmenities(dataWithImages);
    } catch (err) {
      console.error('Error fetching amenities:', err);
      setError(err.message || "Failed to load amenities");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAmenities();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, amenities]);

  const applyFilters = () => {
    let filtered = [...amenities];
    
    if (filters.type !== 'any') {
      filtered = filtered.filter(amenity => 
        amenity.type?.toLowerCase() === filters.type.toLowerCase()
      );
    }
    
    if (filters.availability !== 'any') {
      if (filters.availability === 'available') filtered = filtered.filter(amenity => amenity.available === 'Yes');
      else if (filters.availability === 'unavailable') filtered = filtered.filter(amenity => amenity.available === 'No');
    }
    
    if (filters.capacity !== 'any') {
      switch (filters.capacity) {
        case '1-4': 
          filtered = filtered.filter(amenity => Number(amenity.capacity) >= 1 && Number(amenity.capacity) <= 4); 
          break;
        case '5-10': 
          filtered = filtered.filter(amenity => Number(amenity.capacity) >= 5 && Number(amenity.capacity) <= 10); 
          break;
        case '11+': 
          filtered = filtered.filter(amenity => Number(amenity.capacity) >= 11); 
          break;
        default: break;
      }
    }
    
    if (filters.priceRange !== 'any') {
      switch (filters.priceRange) {
        case '0-500': 
          filtered = filtered.filter(amenity => Number(amenity.price) >= 0 && Number(amenity.price) <= 500); 
          break;
        case '501-1000': 
          filtered = filtered.filter(amenity => Number(amenity.price) >= 501 && Number(amenity.price) <= 1000); 
          break;
        case '1001+': 
          filtered = filtered.filter(amenity => Number(amenity.price) > 1000); 
          break;
        default: break;
      }
    }
    
    setFilteredAmenities(filtered);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  const clearFilters = () => {
    setFilters({ type: 'any', availability: 'any', capacity: 'any', priceRange: 'any' });
  };

  const handleBookAmenity = (amenity) => {
    if (!amenity) return;

    if (bookingInProgress) return;

    if (lastNavigatedRef.current && lastNavigatedRef.current === amenity.id) return;

    setBookingInProgress(true);
    lastNavigatedRef.current = amenity.id;

    navigate('/reservations', { state: { selectedAmenity: amenity } });

    setTimeout(() => {
      setBookingInProgress(false);
      lastNavigatedRef.current = null;
    }, 700);
  };

  const activeFilterCount = Object.values(filters).filter(filter => filter !== 'any').length;

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
        {/* Filter Box */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900">Filter Amenities</h3>
            {activeFilterCount > 0 && (
              <button onClick={clearFilters} className="text-sm text-lp-orange underline hover:text-lp-orange-hover transition-colors">Clear Filters</button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <select className="w-full py-2 px-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-lp-orange focus:border-transparent text-gray-800 text-sm" value={filters.type} onChange={(e) => handleFilterChange('type', e.target.value)}>
              <option value="any">All Types</option>
              <option value="Table">Table</option>
              <option value="Kubo">Kubo</option>
              <option value="Cabin">Cabin</option>
              <option value="Others">Others</option>
            </select>
            <select className="w-full py-2 px-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-lp-orange focus:border-transparent text-gray-800 text-sm" value={filters.availability} onChange={(e) => handleFilterChange('availability', e.target.value)}>
              <option value="any">Any Status</option>
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
            </select>
            <select className="w-full py-2 px-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-lp-orange focus:border-transparent text-gray-800 text-sm" value={filters.capacity} onChange={(e) => handleFilterChange('capacity', e.target.value)}>
              <option value="any">Any Capacity</option>
              <option value="1-4">Small (1-4)</option>
              <option value="5-10">Medium (5-10)</option>
              <option value="11+">Large (11+)</option>
            </select>
            <select className="w-full py-2 px-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-lp-orange focus:border-transparent text-gray-800 text-sm" value={filters.priceRange} onChange={(e) => handleFilterChange('priceRange', e.target.value)}>
              <option value="any">Any Price</option>
              <option value="0-500">₱0 - ₱500</option>
              <option value="501-1000">₱501 - ₱1,000</option>
              <option value="1001+">₱1,001+</option>
            </select>
          </div>
        </div>

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