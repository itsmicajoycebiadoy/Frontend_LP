import React, { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../../components/Header.jsx";
import Footer from "../../components/Footer.jsx";
import { X, Calendar, ShoppingCart, AlertTriangle } from 'lucide-react';

const Reservations = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const selectedAmenity = location.state?.selectedAmenity;
  const backgroundImageUrl = "/images/bg.jpg";

  // CART STATE — persists in localStorage
  const [cart, setCart] = useState([]);
  const [showCartModal, setShowCartModal] = useState(false);
  const [showReservationsModal, setShowReservationsModal] = useState(false);
  const [reservationToCancel, setReservationToCancel] = useState(null);

  // Mock data for current reservations
  const [currentReservations, setCurrentReservations] = useState([
    {
      id: 1,
      reservationNumber: "RES-2024-001",
      amenities: ["Swimming Pool", "Family Cottage"],
      checkInDate: "2024-01-15",
      checkOutDate: "2024-01-17",
      totalAmount: 2500,
      downpayment: 500,
      status: "Confirmed",
      dateBooked: "2024-01-10"
    },
    {
      id: 2,
      reservationNumber: "RES-2024-002",
      amenities: ["Function Hall"],
      checkInDate: "2024-02-01",
      checkOutDate: "2024-02-01",
      totalAmount: 5000,
      downpayment: 1000,
      status: "Pending",
      dateBooked: "2024-01-12"
    }
  ]);
  
  // Auto-add selected amenity from navigation
  useEffect(() => {
    if (selectedAmenity) handleAddToCart(selectedAmenity);
  }, [selectedAmenity]);

  // Logout
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col font-body">
      <Header user={user} onLogout={handleLogout} />

      {/* HERO SECTION */}
      <section
        className="bg-cover bg-center text-white py-12 sm:py-16 lg:py-20"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(${backgroundImageUrl})`,
        }}
      >
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl md:text-6xl font-bold text-white font-header mb-4">
            Your Reservations
          </h2>
          <p className="text-sm md:text-lg text-gray-200 max-w-2xl mx-auto mb-8">
            Manage your bookings and create new reservations at La Piscina Resort.
          </p>
        </div>
      </section>

     {/* ACTIONS BUTTON */}
      <section className="bg-white border-b border-gray-200 py-4">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex justify-center gap-4">
            {/* View Reservations Button */}
            <button
              className="flex items-center gap-2 bg-lp-orange text-white px-6 py-3 rounded-lg font-semibold hover:bg-lp-orange-hover transition-colors"
            >
              <Calendar className="w-5 h-5" />
              View My Reservations
            </button>

            {/* Cart Button */}
            <button
              className="flex items-center gap-2 border-2 border-lp-orange text-lp-orange px-6 py-3 rounded-lg font-semibold hover:bg-lp-orange hover:text-white transition-colors relative"
            >
              <ShoppingCart className="w-5 h-5" />
              Booking Cart
              {cart.length > 0 && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white">
                  {cart.length}
                </div>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <main className="flex-1 w-full bg-lp-light-bg">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
          {/* Reservations Table */}
            <div className="flex-1 overflow-y-auto p-6">
              {currentReservations.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg mb-2">No reservations found</p>
                  <p className="text-gray-400">You haven't made any reservations yet.</p>
                </div>
              ) : (
                <div>
                  {/* Add reservation list here */}
                </div>
              )}
            </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Reservations;