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

  // Reservation form state
  const [reservationForm, setReservationForm] = useState({
    fullName: "",
    address: "",
    contactNumber: "",
    checkInDate: "",
    checkOutDate: "",
    paymentScreenshot: null
  });

  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (showCartModal || showReservationsModal || reservationToCancel) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = 'unset';
    };
  }, [showCartModal, showReservationsModal, reservationToCancel]);

  // -------------------------------
  // FIXED CART LOAD FROM LOCALSTORAGE
  // -------------------------------
  useEffect(() => {
    const storedCart = localStorage.getItem("cart");

    try {
      if (storedCart) {
        const parsed = JSON.parse(storedCart);
        if (Array.isArray(parsed)) setCart(parsed);
      }
    } catch (error) {
      console.error("Error loading saved cart:", error);
    }
  }, []);

  // -------------------------------
  // FIXED CART SAVE TO LOCALSTORAGE
  // Prevent saving empty cart accidentally
  // -------------------------------
  useEffect(() => {
    const saved = localStorage.getItem("cart");

    // If cart is empty but saved cart exists, do NOT overwrite it
    if (cart.length === 0 && saved) return;

    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Add to cart function (max 10 different amenities)
  const handleAddToCart = (amenity) => {
    setCart((prev) => {
      // Prevent duplicates
      const exists = prev.find((item) => item.amenity_id === amenity.id);
      if (exists) return prev;

      // Limit 10 different amenities
      if (prev.length >= 10) {
        alert("You can only add up to 10 different amenities in the cart.");
        return prev;
      }

      return [
        ...prev,
        {
          id: Date.now(),
          amenity_id: amenity.id,
          amenity_name: amenity.name,
          amenity_type: amenity.type,
          amenity_price: amenity.price,
          capacity: amenity.capacity,
          description: amenity.description,
          image: amenity.image,
          quantity: 1,
        },
      ];
    });
  };

  // Remove from cart
  const removeFromCart = (index) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  // SIMPLE FIX: Adjust quantity function
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
    cart.reduce((total, item) => total + item.amenity_price * item.quantity, 0);

  const calculateDownpayment = () => calculateTotal() * 0.2;

  // Auto-add selected amenity from navigation
  useEffect(() => {
    if (selectedAmenity) handleAddToCart(selectedAmenity);
  }, [selectedAmenity]);

  // Logout
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Handle reservation form input changes
  const handleReservationInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "paymentScreenshot") {
      setReservationForm(prev => ({
        ...prev,
        paymentScreenshot: files[0]
      }));
    } else {
      setReservationForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle reservation submission
  const handleReservationSubmit = (e) => {
    e.preventDefault();
    // Add your reservation submission logic here
    console.log("Reservation Details:", {
      ...reservationForm,
      cart,
      totalAmount: calculateTotal(),
      downpayment: calculateDownpayment()
    });
    alert("Reservation submitted successfully!");
    setCart([]);
    localStorage.removeItem("cart");
    
    // Reset form
    setReservationForm({
      fullName: "",
      address: "",
      contactNumber: "",
      checkInDate: "",
      checkOutDate: "",
      paymentScreenshot: null
    });
  };

  // Handle cancel reservation
  const handleCancelReservation = (reservation) => {
    setReservationToCancel(reservation);
  };

  // Confirm cancellation
  const confirmCancelReservation = () => {
    if (reservationToCancel) {
      setCurrentReservations(prev => prev.filter(r => r.id !== reservationToCancel.id));
      alert(`Reservation ${reservationToCancel.reservationNumber} has been cancelled.`);
      setReservationToCancel(null);
    }
  };

  // Cancel cancellation
  const cancelCancelReservation = () => {
    setReservationToCancel(null);
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

      {/* ACTION BUTTONS SECTION */}
      <section className="bg-white border-b border-gray-200 py-4">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex justify-center gap-4">
            {/* View Reservations Button */}
            <button
              onClick={() => setShowReservationsModal(true)}
              className="flex items-center gap-2 bg-lp-orange text-white px-6 py-3 rounded-lg font-semibold hover:bg-lp-orange-hover transition-colors"
            >
              <Calendar className="w-5 h-5" />
              View My Reservations
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setShowCartModal(true)}
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

      {/* MAIN CONTENT WITH RESERVATION FORM */}
      <main className="flex-1 w-full bg-lp-light-bg">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
          {/* Reservation Form Section */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h3 className="text-2xl font-bold text-lp-dark font-header mb-6 text-center">
              Complete Your Reservation
            </h3>

            <form onSubmit={handleReservationSubmit}>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Left Column - Personal Information */}
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">
                    Personal Information
                  </h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={reservationForm.fullName}
                        onChange={handleReservationInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lp-orange focus:border-transparent"
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address *
                      </label>
                      <textarea
                        name="address"
                        value={reservationForm.address}
                        onChange={handleReservationInputChange}
                        required
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lp-orange focus:border-transparent"
                        placeholder="Enter your complete address"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Number *
                      </label>
                      <input
                        type="tel"
                        name="contactNumber"
                        value={reservationForm.contactNumber}
                        onChange={handleReservationInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lp-orange focus:border-transparent"
                        placeholder="Enter your contact number"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Check-in Date *
                        </label>
                        <input
                          type="date"
                          name="checkInDate"
                          value={reservationForm.checkInDate}
                          onChange={handleReservationInputChange}
                          required
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lp-orange focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Check-out Date *
                        </label>
                        <input
                          type="date"
                          name="checkOutDate"
                          value={reservationForm.checkOutDate}
                          onChange={handleReservationInputChange}
                          required
                          min={reservationForm.checkInDate || new Date().toISOString().split('T')[0]}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lp-orange focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* File Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Upload Payment Screenshot *
                    </label>
                    <input
                      type="file"
                      name="paymentScreenshot"
                      onChange={handleReservationInputChange}
                      required
                      accept="image/*"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lp-orange focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Upload a screenshot of your GCash payment confirmation
                    </p>
                  </div>

                  {reservationForm.paymentScreenshot && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">Selected file: {reservationForm.paymentScreenshot.name}</p>
                    </div>
                  )}
                </div>

                {/* Right Column - Payment Information */}
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">
                    Payment Information
                  </h4>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-3">
                      <strong>Payment Method:</strong> GCash Only
                    </p>
                    
                    <div className="text-center mb-4">
                      <p className="text-sm font-semibold text-gray-700 mb-2">
                        Scan QR Code to Pay
                      </p>
                      <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300 inline-block">
                        <div className="w-48 h-48 bg-gray-200 flex items-center justify-center rounded">
                          <span className="text-gray-500 text-sm">GCash QR Code</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-center">
                      <p className="text-sm font-semibold text-gray-700 mb-1">
                        Or send to GCash Number:
                      </p>
                      <p className="text-lg font-bold text-lp-orange">
                        0912 345 6789
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Account Name: La Piscina De Conception Resort
                      </p>
                    </div>

                    <div className="mt-4 p-3 bg-orange-50 rounded-lg">
                      <p className="text-sm font-semibold text-orange-800">
                        Downpayment Amount: ₱{calculateDownpayment().toLocaleString()}
                      </p>
                      <p className="text-xs text-orange-600">
                        Please pay exactly this amount for your reservation to be processed.
                      </p>
                    </div>
                  </div>

                  {/* Reservation Summary */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">
                      Reservation Summary
                    </h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {cart.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">Your cart is empty</p>
                      ) : (
                        <>
                          {cart.map((item) => (
                            <div key={item.id} className="flex justify-between text-sm">
                              <span className="truncate">{item.amenity_name} (x{item.quantity})</span>
                              <span className="flex-shrink-0">₱{(item.amenity_price * item.quantity).toLocaleString()}</span>
                            </div>
                          ))}
                          <div className="border-t pt-2 font-semibold">
                            <div className="flex justify-between">
                              <span>Total Amount:</span>
                              <span>₱{calculateTotal().toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-lp-orange">
                              <span>Downpayment (20%):</span>
                              <span>₱{calculateDownpayment().toLocaleString()}</span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={cart.length === 0}
                      className="flex-1 py-3 bg-lp-orange text-white rounded-lg font-semibold hover:bg-lp-orange-hover transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      Confirm Reservation
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* RESERVATIONS MODAL */}
      {showReservationsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 flex justify-between items-center flex-shrink-0">
              <div>
                <h3 className="text-xl font-bold text-gray-900">My Reservations</h3>
                <p className="text-gray-600 text-sm mt-1">Manage your current and upcoming bookings</p>
              </div>
              <button
                onClick={() => setShowReservationsModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            {/* Reservations Table */}
            <div className="flex-1 overflow-y-auto p-6">
              {currentReservations.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg mb-2">No reservations found</p>
                  <p className="text-gray-400">You haven't made any reservations yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reservation #</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amenities</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentReservations.map((reservation) => (
                        <tr key={reservation.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{reservation.reservationNumber}</div>
                            <div className="text-sm text-gray-500">Booked: {reservation.dateBooked}</div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm text-gray-900">
                              {reservation.amenities.map((amenity, index) => (
                                <div key={index} className="flex items-center gap-1">
                                  <span>•</span>
                                  {amenity}
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              <div>Check-in: {reservation.checkInDate}</div>
                              <div>Check-out: {reservation.checkOutDate}</div>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">₱{reservation.totalAmount.toLocaleString()}</div>
                            <div className="text-sm text-lp-orange">Downpayment: ₱{reservation.downpayment.toLocaleString()}</div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              reservation.status === 'Confirmed' 
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {reservation.status}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleCancelReservation(reservation)}
                              className="text-red-600 hover:text-red-800 flex items-center gap-1"
                            >
                              <X className="w-4 h-4" />
                              Cancel
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-4 bg-white flex-shrink-0">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  Showing {currentReservations.length} reservation{currentReservations.length !== 1 ? 's' : ''}
                </p>
                <button
                  onClick={() => setShowReservationsModal(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CANCELLATION CONFIRMATION MODAL */}
      {reservationToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Cancel Reservation</h3>
                  <p className="text-sm text-gray-600">Reservation #{reservationToCancel.reservationNumber}</p>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-red-800 mb-1">Important Notice</p>
                    <p className="text-xs text-red-700">
                      Cancelling a reservation has no refund as stated in our resort policy. 
                      The downpayment paid will not be refunded upon cancellation.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-6">
                <p><strong>Amenities:</strong> {reservationToCancel.amenities.join(", ")}</p>
                <p><strong>Dates:</strong> {reservationToCancel.checkInDate} to {reservationToCancel.checkOutDate}</p>
                <p><strong>Total Amount:</strong> ₱{reservationToCancel.totalAmount.toLocaleString()}</p>
                <p><strong>Downpayment Paid:</strong> ₱{reservationToCancel.downpayment.toLocaleString()}</p>
              </div>

              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to proceed with cancelling this reservation?
              </p>

              <div className="flex gap-3">
                <button
                  onClick={cancelCancelReservation}
                  className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Keep Reservation
                </button>
                <button
                  onClick={confirmCancelReservation}
                  className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Confirm Cancellation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CART MODAL - FIXED PLUS BUTTON */}
      {showCartModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex justify-between items-center flex-shrink-0">
              <h3 className="text-lg font-bold text-gray-900">Your Booking Cart</h3>
              <button
                onClick={() => setShowCartModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                ×
              </button>
            </div>

            {/* Scrollable Amenities Section */}
            <div className="flex-1 overflow-y-auto p-4">
              {cart.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Your cart is empty</p>
              ) : (
                <div className="space-y-3">
                  {cart.map((item, index) => (
                    <div
                      key={item.id}
                      className="border border-gray-200 rounded-lg p-3"
                    >
                      <div className="flex gap-3">
                        {/* Small Image */}
                        <div className="flex-shrink-0">
                          <img 
                            src={item.image} 
                            alt={item.amenity_name}
                            className="w-16 h-16 object-cover rounded-md"
                            onError={(e) => {
                              e.target.src = "/images/default-amenity.jpg";
                            }}
                          />
                        </div>
                        
                        {/* Amenity Details */}
                        <div className="flex-1 min-w-0">
                          {/* Amenity Header */}
                          <div className="flex justify-between items-start mb-1">
                            <div className="min-w-0">
                              <h4 className="font-bold text-gray-900 text-sm truncate">{item.amenity_name}</h4>
                              <p className="text-xs text-gray-600">{item.amenity_type}</p>
                            </div>
                            <button
                              onClick={() => removeFromCart(index)}
                              className="text-red-500 hover:text-red-700 text-xs font-semibold flex-shrink-0 ml-2"
                            >
                              Remove
                            </button>
                          </div>

                          {/* Description */}
                          <p className="text-xs text-gray-700 mb-2 line-clamp-2">
                            {item.description}
                          </p>

                          {/* Details */}
                          <div className="grid grid-cols-2 gap-2 mb-2 text-xs">
                            <div>
                              <p className="text-gray-500">Capacity:</p>
                              <p className="font-semibold">{item.capacity} people</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Price:</p>
                              <p className="font-semibold text-orange-600">
                                ₱{item.amenity_price.toLocaleString()}
                              </p>
                            </div>
                          </div>

                          {/* FIXED Quantity Controls */}
                          <div className="flex items-center justify-between border-t border-gray-100 pt-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-600">Qty:</span>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => adjustQuantity(index, -1)}
                                  className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center hover:bg-gray-300 transition-colors text-xs"
                                >
                                  -
                                </button>
                                <span className="w-6 text-center font-semibold text-sm">{item.quantity}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    // Direct simple increment - no complex logic
                                    setCart(prev => {
                                      const newCart = [...prev];
                                      newCart[index] = {
                                        ...newCart[index],
                                        quantity: newCart[index].quantity + 1
                                      };
                                      return newCart;
                                    });
                                  }}
                                  className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center hover:bg-gray-300 transition-colors text-xs"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-500">Subtotal</p>
                              <p className="text-sm font-bold text-orange-600">
                                ₱{(item.amenity_price * item.quantity).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Fixed Footer */}
            {cart.length > 0 && (
              <div className="border-t border-gray-200 p-4 bg-white flex-shrink-0">
                <div className="space-y-3">
                  <div className="flex justify-between text-base">
                    <span className="font-semibold">Total Amount:</span>
                    <span className="font-bold text-orange-600">
                      ₱{calculateTotal().toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600 bg-orange-50 p-2 rounded">
                    <span>20% Downpayment Required:</span>
                    <span className="font-semibold text-orange-600">
                      ₱{calculateDownpayment().toLocaleString()}
                    </span>
                  </div>
                  <button
                    onClick={() => setShowCartModal(false)}
                    className="w-full py-3 bg-lp-orange text-white rounded-lg font-semibold hover:bg-lp-orange-hover transition-colors text-sm"
                  >
                    Close Cart
                  </button>
                </div>
              </div>
            )}

            {/* Empty Cart Close Button */}
            {cart.length === 0 && (
              <div className="border-t border-gray-200 p-4 bg-white flex-shrink-0">
                <button
                  onClick={() => setShowCartModal(false)}
                  className="w-full py-2 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 text-sm"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Reservations;