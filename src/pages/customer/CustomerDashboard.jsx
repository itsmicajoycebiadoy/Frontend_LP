import React, { useState, useEffect } from "react";
import AmenitiesCard from "../../components/AmenitiesCard";
import Header from "../../components/Header";
import Footer from "../../components/Footer"; // ADD FOOTER IMPORT
import { useAuth } from "../AuthContext";
import api from "../../config/axios"; 
import { useNavigate } from "react-router-dom";
import { Facebook, Instagram, Twitter, LogOut, Eye, Calendar } from 'lucide-react'; 

const CustomerDashboard = () => {
  const [amenities, setAmenities] = useState([]);
  const [filteredAmenities, setFilteredAmenities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [pageLoad, setPageLoad] = useState(true);
  
  const [filters, setFilters] = useState({
    availability: 'any',
    capacity: 'any',
    priceRange: 'any',
    search: ''
  });
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const backgroundImageUrl = "/images/bg.jpg";
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoad(false);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // LOGOUT HANDLERS
  const handleLogoutClick = () => setShowLogoutConfirm(true);
  const handleConfirmLogout = () => { 
    logout(); 
    navigate('/'); 
    setShowLogoutConfirm(false); 
  };
  const handleCancelLogout = () => setShowLogoutConfirm(false);

  const fetchAmenities = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/api/amenities');
      const backendUrl = import.meta.env.VITE_API_URL; 
      
      const dataWithImages = response.data.map(item => ({
        ...item,
        image: item.image ? `${backendUrl}/uploads/am_images/${item.image}` : null
      }));

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
    if (filters.search) {
      filtered = filtered.filter(amenity =>
        amenity.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        amenity.description.toLowerCase().includes(filters.search.toLowerCase()) ||
        amenity.type.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    if (filters.availability !== 'any') {
      if (filters.availability === 'available') filtered = filtered.filter(amenity => amenity.available === 'Yes');
      else if (filters.availability === 'unavailable') filtered = filtered.filter(amenity => amenity.available === 'No');
    }
    if (filters.capacity !== 'any') {
      switch (filters.capacity) {
        case '1-5': filtered = filtered.filter(amenity => amenity.capacity >= 1 && amenity.capacity <= 5); break;
        case '6-10': filtered = filtered.filter(amenity => amenity.capacity >= 6 && amenity.capacity <= 10); break;
        case '10+': filtered = filtered.filter(amenity => amenity.capacity > 10); break;
        default: break;
      }
    }
    if (filters.priceRange !== 'any') {
      switch (filters.priceRange) {
        case '0-200': filtered = filtered.filter(amenity => amenity.price >= 0 && amenity.price <= 200); break;
        case '201-1000': filtered = filtered.filter(amenity => amenity.price >= 201 && amenity.price <= 1000); break;
        case '1001+': filtered = filtered.filter(amenity => amenity.price > 1000); break;
        default: break;
      }
    }
    setFilteredAmenities(filtered);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  const clearFilters = () => {
    setFilters({ availability: 'any', capacity: 'any', priceRange: 'any', search: '' });
  };

  const handleBookAmenity = (amenity) => {
    navigate('/reservations', { state: { selectedAmenity: amenity } });
  };

  const activeFilterCount = Object.values(filters).filter(filter => filter !== 'any' && filter !== '').length;

  return (
    <div className={`min-h-screen flex flex-col font-body transition-all duration-500 ${pageLoad ? 'opacity-0' : 'opacity-100'}`}>
      
      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm mx-4 transform transition-all duration-300 scale-100">
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogOut className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Logout</h3>
              <p className="text-gray-600 mb-6">Are you sure you want to logout?</p>
              <div className="flex gap-3 justify-center">
                <button onClick={handleCancelLogout} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
                <button onClick={handleConfirmLogout} className="px-4 py-2 bg-lp-orange text-white rounded-lg hover:bg-lp-orange-hover transition-colors">Logout</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header Component */}
      <Header user={user} onLogout={handleLogoutClick} />

      {/* --- HERO SECTION --- */}
      <div className="relative flex-grow flex items-center justify-center min-h-[90vh] md:min-h-screen">
        <div 
            className="absolute inset-0 z-0"
            style={{ backgroundImage: `url(${backgroundImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        >
            <div className="absolute inset-0 bg-black/40"></div>
        </div>

        <div className="relative z-10 w-full max-w-5xl px-4 text-center py-10 md:py-0">
            <h1 className="text-3xl md:text-6xl font-bold text-white font-header mb-4 drop-shadow-md leading-tight">
                La Piscina De Conception Resort
            </h1>
            <p className="text-sm md:text-lg text-gray-200 max-w-2xl mx-auto mb-8 md:mb-12 drop-shadow-sm px-2">
                Enjoy a relaxing stay that's affordable but still feels special. Great rooms, nice amenities, and easy bookings—all for you.
            </p>

            {/* --- FILTER BOX --- */}
            <div className="bg-black/60 backdrop-blur-md p-4 rounded-xl shadow-2xl border border-white/10 text-left w-full max-w-4xl mx-auto ring-1 ring-white/5 mt-6">
                
                <div className="flex justify-between items-center mb-3 px-1">
                    <p className="text-white text-xs font-bold uppercase tracking-wider opacity-90">Filter Amenities</p>
                    {activeFilterCount > 0 && (
                      <button onClick={clearFilters} className="text-[10px] text-white/80 underline hover:text-lp-orange transition-colors">Clear Filters</button>
                    )}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    <input 
                        type="text" 
                        placeholder="Search..." 
                        className="w-full py-2 px-3 rounded-md bg-white/95 border-none focus:ring-2 focus:ring-lp-orange text-gray-800 text-sm shadow-sm"
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                    />
                    <select 
                        className="w-full py-2 px-3 rounded-md bg-white/95 border-none focus:ring-2 focus:ring-lp-orange text-gray-800 text-sm shadow-sm"
                        value={filters.availability}
                        onChange={(e) => handleFilterChange('availability', e.target.value)}
                    >
                        <option value="any">Any Status</option>
                        <option value="available">Available</option>
                        <option value="unavailable">Unavailable</option>
                    </select>
                    <select 
                        className="w-full py-2 px-3 rounded-md bg-white/95 border-none focus:ring-2 focus:ring-lp-orange text-gray-800 text-sm shadow-sm"
                        value={filters.capacity}
                        onChange={(e) => handleFilterChange('capacity', e.target.value)}
                    >
                        <option value="any">Any Capacity</option>
                        <option value="1-5">Small (1-5)</option>
                        <option value="6-10">Medium (6-10)</option>
                        <option value="10+">Large (11+)</option>
                    </select>
                    <select 
                        className="w-full py-2 px-3 rounded-md bg-white/95 border-none focus:ring-2 focus:ring-lp-orange text-gray-800 text-sm shadow-sm"
                        value={filters.priceRange}
                        onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                    >
                        <option value="any">Any Price</option>
                        <option value="0-200">₱0 - ₱200</option>
                        <option value="201-1000">₱201 - ₱1,000</option>
                        <option value="1001+">₱1,001+</option>
                    </select>
                </div>

                <div className="flex flex-col sm:flex-row justify-center gap-3">
                    <button onClick={() => navigate('/amenities')} className="flex items-center justify-center gap-2 px-6 py-2 rounded-md text-sm font-medium border border-white/30 bg-white/10 text-white hover:bg-lp-orange hover:border-lp-orange backdrop-blur-sm">
                        <Eye size={16} /> View Amenities
                    </button>
                    <button onClick={() => navigate('/reservations')} className="flex items-center justify-center gap-2 px-6 py-2 rounded-md text-sm font-medium border border-white/30 bg-white/10 text-white hover:bg-lp-orange hover:border-lp-orange backdrop-blur-sm">
                        <Calendar size={16} /> Make Reservations
                    </button>
                </div>
            </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <section className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-lp-dark font-header mb-4">Featured Amenities</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-sm md:text-base">Discover our premium facilities designed for your comfort.</p>
          </div>

          {loading && <div className="text-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lp-orange mx-auto"></div><p className="mt-4 text-gray-600">Loading...</p></div>}
          
          {error && <div className="text-center py-12"><div className="text-red-500 text-4xl mb-2">⚠️</div><p className="text-gray-600 mb-4">{error}</p><button onClick={fetchAmenities} className="bg-lp-orange text-white px-6 py-2 rounded-lg">Try Again</button></div>}

          {!loading && !error && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAmenities.slice(0, 6).map((amenity) => ( 
                  <AmenitiesCard key={amenity.id} amenity={amenity} onBook={handleBookAmenity} />
                ))}
              </div>
              {filteredAmenities.length === 0 && amenities.length > 0 && (
                <div className="text-center py-12"><p className="text-gray-500 mb-4">No matches found.</p><button onClick={clearFilters} className="bg-lp-orange text-white px-6 py-2 rounded-lg">Clear Filters</button></div>
              )}
            </>
          )}
        </section>
      </main>

      {/* Footer Component */}
      <Footer />

    </div>
  );
};

export default CustomerDashboard;