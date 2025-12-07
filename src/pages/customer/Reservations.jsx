import React, { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header.jsx";
import Footer from "../../components/Footer.jsx";

// Import Components
import HeroSection from "../../components/ReservationComponents/HeroSection.jsx";
import ActionButtons from "../../components/ReservationComponents/ActionButtons.jsx";
import ReservationForm from "../../components/ReservationComponents/ReservationForm.jsx";
import CartModal from "../../components/ReservationComponents/CartModal.jsx";
import ReservationsModal from "../../components/ReservationComponents/ReservationsModal.jsx";
import CancellationModal from "../../components/ReservationComponents/CancellationModal.jsx"; 

const Reservations = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const backgroundImageUrl = "/images/bg.jpg";

  // State Management - Basic UI state only
  const [showCartModal, setShowCartModal] = useState(false);
  const [showReservationsModal, setShowReservationsModal] = useState(false);
  const [reservationToCancel, setReservationToCancel] = useState(null);
  
  // For UI demonstration only - will be replaced with real data later
  const [cart, setCart] = useState([]);
  const [reservationCount, setReservationCount] = useState(0);
  
  // For UI demonstration only - placeholder form data
  const [reservationForm, setReservationForm] = useState({
    fullName: "",
    address: "",
    contactNumber: "",
    checkInDate: "",
    checkOutDate: "",
    paymentScreenshot: null
  });

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Placeholder handlers for UI demonstration
  const handleViewReservations = () => {
    console.log("View reservations clicked");
    setShowReservationsModal(true);
    
    // Mock data for UI demonstration
    if (isAuthenticated) {
      setReservationCount(3); // Mock count
    }
  };

  const handleAddToCart = () => {
    console.log("Add to cart clicked");
    // Mock cart item for UI demonstration
    setCart([{ 
      id: 1, 
      amenity_name: "Swimming Pool", 
      amenity_price: 500, 
      quantity: 1,
      capacity: 20,
      description: "Large swimming pool with lounge chairs"
    }]);
  };

  const handleReservationInputChange = (e) => {
    const { name, value } = e.target;
    setReservationForm(prev => ({
      ...prev,
      [name]: value
    }));
    console.log(`Form field ${name} changed to: ${value}`);
  };

  const handleReservationSubmit = (e) => {
    e.preventDefault();
    console.log("Reservation form submitted with:", reservationForm);
    console.log("Cart items:", cart);
    alert("Reservation functionality will be implemented in later weeks!");
  };

  const handleCancelReservation = () => {
    console.log("Cancel reservation clicked");
    setReservationToCancel({
      id: 1,
      reservationNumber: "RES-2023-001",
      amenities: ["Swimming Pool"],
      checkInDate: "2023-12-15",
      checkOutDate: "2023-12-17",
      totalAmount: 1500,
      status: "Confirmed"
    });
  };

  const confirmCancelReservation = () => {
    console.log("Confirm cancellation");
    alert("Cancellation functionality will be implemented in later weeks!");
    setReservationToCancel(null);
  };

  const cancelCancelReservation = () => {
    console.log("Cancel cancellation");
    setReservationToCancel(null);
  };

  // Mock data for reservations modal
  const mockReservations = [
    {
      id: 1,
      reservationNumber: "RES-2023-001",
      amenities: ["Swimming Pool", "Function Hall"],
      checkInDate: "2023-12-15T14:00:00",
      checkOutDate: "2023-12-17T12:00:00",
      totalAmount: 3500,
      downpayment: 700,
      balance: 2800,
      status: "Confirmed",
      paymentStatus: "Partial",
      dateBooked: "2023-12-01"
    },
    {
      id: 2,
      reservationNumber: "RES-2023-002",
      amenities: ["Cottage"],
      checkInDate: "2023-12-20T10:00:00",
      checkOutDate: "2023-12-20T18:00:00",
      totalAmount: 800,
      downpayment: 160,
      balance: 640,
      status: "Pending",
      paymentStatus: "Pending",
      dateBooked: "2023-12-05"
    }
  ];

  // Mock cart functions for UI demonstration
  const removeFromCart = () => {
    console.log("Remove from cart");
    setCart([]);
  };

  const adjustQuantity = () => {
    console.log("Adjust quantity");
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.amenity_price * item.quantity), 0);
  };

  const calculateDownpayment = () => {
    return calculateTotal() * 0.2;
  };

  return (
    <div className="min-h-screen flex flex-col font-body">
      <Header user={user} onLogout={handleLogout} />

      {/* Hero Section */}
      <HeroSection
        title="Your Reservations"
        description="Manage your bookings and create new reservations at La Piscina Resort."
        backgroundImageUrl={backgroundImageUrl}
      />

      {/* Action Buttons - With placeholder props */}
      <ActionButtons
        onViewReservations={handleViewReservations}
        onOpenCart={() => setShowCartModal(true)}
        cartCount={cart.length}
        reservationCount={reservationCount}
      />

      {/* MAIN CONTENT */}
      <main className="flex-1 w-full bg-lp-light-bg">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
          {/* Show login message if not authenticated */}
          {!isAuthenticated && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800">
                <strong>Note:</strong> You are not logged in. Please log in to save your reservation history.
              </p>
            </div>
          )}
          
          {/* Reservation Form - With placeholder props */}
          <ReservationForm
            reservationForm={reservationForm}
            formErrors={{}}
            imagePreview={null}
            cart={cart}
            calculateTotal={calculateTotal}
            calculateDownpayment={calculateDownpayment}
            handleReservationInputChange={handleReservationInputChange}
            handleReservationSubmit={handleReservationSubmit}
            removeImagePreview={() => console.log("Remove image")}
            onAddToCart={handleAddToCart}
          />
        </div>
      </main>

      {/* MODALS - UI Only for now */}
      <ReservationsModal
        isOpen={showReservationsModal}
        onClose={() => setShowReservationsModal(false)}
        reservations={mockReservations}
        onCancelReservation={handleCancelReservation}
      />

      <CartModal
        isOpen={showCartModal}
        onClose={() => setShowCartModal(false)}
        cart={cart}
        removeFromCart={removeFromCart}
        adjustQuantity={adjustQuantity}
        calculateTotal={calculateTotal}
        calculateDownpayment={calculateDownpayment}
        setCart={setCart}
      />

      <CancellationModal
        reservation={reservationToCancel}
        onConfirm={confirmCancelReservation}
        onCancel={cancelCancelReservation}
      />

      <Footer />
    </div>
  );
};

export default Reservations;