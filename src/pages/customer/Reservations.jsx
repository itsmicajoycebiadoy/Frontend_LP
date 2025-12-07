import React, { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
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
  const location = useLocation();
  const selectedAmenity = location.state?.selectedAmenity; // Keep for UI demo
  const backgroundImageUrl = "/images/bg.jpg";

  // State Management - Basic UI state only (Week 3)
  const [cart, setCart] = useState([]);
  const [showCartModal, setShowCartModal] = useState(false);
  const [showReservationsModal, setShowReservationsModal] = useState(false);
  const [reservationToCancel, setReservationToCancel] = useState(null);
  
  // For UI demonstration only
  const [reservationForm, setReservationForm] = useState({
    fullName: "",
    address: "",
    contactNumber: "",
    checkInDate: "",
    checkOutDate: "",
    paymentScreenshot: null
  });
  
  const [reservationCount, setReservationCount] = useState(0);
  const [imagePreview, setImagePreview] = useState(null);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Week 3: Basic placeholder handlers
  const handleViewReservations = () => {
    console.log("Week 3: View reservations clicked");
    setShowReservationsModal(true);
    
    // Mock reservation count for UI
    if (isAuthenticated) {
      setReservationCount(3);
    }
  };

  // Week 3: Basic form handling (no validation)
  const handleReservationInputChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === "paymentScreenshot") {
      const file = files[0];
      if (file) {
        // Basic image preview for UI (Week 3)
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target.result);
        };
        reader.readAsDataURL(file);
        
        setReservationForm(prev => ({
          ...prev,
          paymentScreenshot: file
        }));
      }
    } else if (name === "contactNumber") {
      // Basic number formatting (Week 3)
      const numbersOnly = value.replace(/\D/g, '').slice(0, 11);
      setReservationForm(prev => ({
        ...prev,
        [name]: numbersOnly
      }));
    } else {
      setReservationForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Week 3: Basic form submission (no API)
  const handleReservationSubmit = (e) => {
    e.preventDefault();
    console.log("Week 3: Form submitted (placeholder)");
    console.log("Form data:", reservationForm);
    console.log("Cart items:", cart);
    
    if (cart.length === 0) {
      alert("Please add at least one amenity to your cart");
      return;
    }
    
    alert("Reservation submitted (UI demo only). Real functionality in Week 4.");
    
    // Clear form for UI demonstration
    setReservationForm({
      fullName: "",
      address: "",
      contactNumber: "",
      checkInDate: "",
      checkOutDate: "",
      paymentScreenshot: null
    });
    setCart([]);
    setImagePreview(null);
  };

  // Week 3: Basic cart functionality (UI only)
  const handleAddToCart = (amenity) => {
    console.log("Week 3: Adding to cart (UI demo)");
    
    // Check if amenity is already in cart
    const exists = cart.find((item) => item.amenity_id === amenity.id);
    if (exists) {
      alert("This amenity is already in your cart");
      return;
    }

    // Limit cart size for UI demo
    if (cart.length >= 10) {
      alert("You can only add up to 10 different amenities in the cart.");
      return;
    }

    // Add amenity to cart
    setCart((prev) => [
      ...prev,
      {
        id: Date.now(),
        amenity_id: amenity.id,
        amenity_name: amenity.name || "Sample Amenity",
        amenity_price: amenity.price || 500,
        quantity: 1,
        capacity: amenity.capacity || 10,
        description: amenity.description || "Sample description"
      }
    ]);
  };

  const removeFromCart = (index) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const adjustQuantity = (index, delta) => {
    setCart((prev) => {
      const updatedCart = [...prev];
      const newQuantity = updatedCart[index].quantity + delta;
      if (newQuantity >= 1) {
        updatedCart[index].quantity = newQuantity;
      }
      return updatedCart;
    });
  };

  const calculateTotal = () =>
    cart.reduce((total, item) => total + (item.amenity_price || 0) * item.quantity, 0);

  const calculateDownpayment = () => calculateTotal() * 0.2;

  // Week 3: Auto-add selected amenity for UI flow
  useEffect(() => {
    if (selectedAmenity) {
      console.log("Week 3: Auto-adding selected amenity to cart");
      handleAddToCart(selectedAmenity);
    }
  }, [selectedAmenity]);

  // Week 3: Mock data for reservations modal
  const mockReservations = isAuthenticated ? [
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
    }
  ] : [];

  // Week 3: Placeholder cancel functions
  const handleCancelReservation = (reservation) => {
    console.log("Week 3: Cancel reservation clicked");
    setReservationToCancel(reservation);
  };

  const confirmCancelReservation = () => {
    console.log("Week 3: Confirm cancellation (placeholder)");
    alert("Cancellation functionality will be implemented in Week 4.");
    setReservationToCancel(null);
  };

  const cancelCancelReservation = () => {
    console.log("Week 3: Cancel cancellation");
    setReservationToCancel(null);
  };

  const removeImagePreview = () => {
    setImagePreview(null);
    setReservationForm(prev => ({
      ...prev,
      paymentScreenshot: null
    }));
  };

  // Week 3: Simple form errors for UI demonstration
  const formErrors = {};

  return (
    <div className="min-h-screen flex flex-col font-body">
      <Header user={user} onLogout={handleLogout} />

      {/* Hero Section */}
      <HeroSection
        title="Your Reservations"
        description="Manage your bookings and create new reservations at La Piscina Resort."
        backgroundImageUrl={backgroundImageUrl}
      />

      {/* Action Buttons */}
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
          
          {/* Reservation Form */}
          <ReservationForm
            reservationForm={reservationForm}
            formErrors={formErrors}
            imagePreview={imagePreview}
            cart={cart}
            calculateTotal={calculateTotal}
            calculateDownpayment={calculateDownpayment}
            handleReservationInputChange={handleReservationInputChange}
            handleReservationSubmit={handleReservationSubmit}
            removeImagePreview={removeImagePreview}
            onAddToCart={handleAddToCart}
          />
        </div>
      </main>

      {/* MODALS */}
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