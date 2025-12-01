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
  const [imagePreview, setImagePreview] = useState(null);

  // Current reservations state
  const [currentReservations, setCurrentReservations] = useState([]);

  // Reservation form state
  const [reservationForm, setReservationForm] = useState({
    fullName: "",
    address: "",
    contactNumber: "",
    checkInDate: "",
    checkOutDate: "",
    paymentScreenshot: null
  });

  const [formErrors, setFormErrors] = useState({});

  // Load user data from localStorage on component mount
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('userReservations'));
    if (userData && userData.fullName) {
      console.log('👋 Welcome back! User data found:', userData.fullName);
      // Pre-fill the form with user details for convenience
      setReservationForm(prev => ({
        ...prev,
        fullName: userData.fullName,
        contactNumber: userData.contactNumber
      }));
    }
  }, []);

  // Prevent body scrolling when modal is open
  useEffect(() => {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (showCartModal || showReservationsModal || reservationToCancel) {
      document.body.style.overflow = 'hidden';
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
    } else {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0';
    }

    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0';
    };
  }, [showCartModal, showReservationsModal, reservationToCancel]);

  // Load cart from localStorage
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

  // Save cart to localStorage
  useEffect(() => {
    const saved = localStorage.getItem("cart");
    if (cart.length === 0 && saved) return;
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Validate phone number (exactly 11 digits)
  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^09\d{9}$/;
    return phoneRegex.test(phone);
  };

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!reservationForm.fullName.trim()) {
      errors.fullName = "Full name is required";
    }

    if (!reservationForm.address.trim()) {
      errors.address = "Address is required";
    }

    if (!reservationForm.contactNumber) {
      errors.contactNumber = "Contact number is required";
    } else if (!validatePhoneNumber(reservationForm.contactNumber)) {
      errors.contactNumber = "Contact number must be 11 digits starting with 09";
    }

    if (!reservationForm.checkInDate) {
      errors.checkInDate = "Check-in date and time is required";
    }

    if (!reservationForm.checkOutDate) {
      errors.checkOutDate = "Check-out date and time is required";
    } else if (reservationForm.checkInDate && new Date(reservationForm.checkOutDate) <= new Date(reservationForm.checkInDate)) {
      errors.checkOutDate = "Check-out must be after check-in time";
    }

    if (!reservationForm.paymentScreenshot) {
      errors.paymentScreenshot = "Payment screenshot is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle reservation form input changes
  const handleReservationInputChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === "paymentScreenshot") {
      const file = files[0];
      if (file) {
        console.log('📄 File selected:', file);
        
        // Create image preview
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
      // Only allow numbers and limit to 11 digits
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

    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  // Handle reservation submission
  const handleReservationSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      alert("Please fix the form errors before submitting.");
      return;
    }

    if (cart.length === 0) {
      alert("Please add at least one amenity to your cart");
      return;
    }

    try {
      // Create FormData for file upload
      const formData = new FormData();
      
      // Append all form data as strings
      formData.append('fullName', reservationForm.fullName);
      formData.append('contactNumber', reservationForm.contactNumber);
      formData.append('address', reservationForm.address);
      formData.append('checkInDate', reservationForm.checkInDate);
      formData.append('checkOutDate', reservationForm.checkOutDate);
      
      // Append cart as JSON string
      formData.append('cart', JSON.stringify(cart));
      
      // Append the file
      if (reservationForm.paymentScreenshot) {
        formData.append('proof_of_payment', reservationForm.paymentScreenshot);
        console.log('📤 Appending file:', reservationForm.paymentScreenshot.name);
      }

      console.log('🔄 Sending FormData with file...');
      console.log('Check-in:', reservationForm.checkInDate);
      console.log('Check-out:', reservationForm.checkOutDate);

      // Send to backend API with FormData
      const response = await fetch('http://localhost:5000/api/transactions', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        alert("Reservation submitted successfully!");
        console.log("Transaction Reference:", result.transaction_ref);
        
        // ✅ Save user details for automatic future lookup
        localStorage.setItem('userReservations', JSON.stringify({
          fullName: reservationForm.fullName,
          contactNumber: reservationForm.contactNumber,
          lastTransactionRef: result.transaction_ref,
          lastTransactionDate: new Date().toISOString()
        }));
        
        console.log('💾 Saved user details:', {
          fullName: reservationForm.fullName,
          contactNumber: reservationForm.contactNumber
        });
        
        // Clear cart and form
        setCart([]);
        localStorage.removeItem("cart");
        
        // Reset form but keep name and contact for convenience
        setReservationForm({
          fullName: reservationForm.fullName,
          contactNumber: reservationForm.contactNumber,
          address: '',
          checkInDate: '',
          checkOutDate: '',
          paymentScreenshot: null
        });

        // Reset image preview and file input
        setImagePreview(null);
        const fileInput = document.querySelector('input[name="paymentScreenshot"]');
        if (fileInput) fileInput.value = '';
        
      } else {
        alert("Failed to submit reservation: " + (result.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Reservation submission error:', error);
      alert("Failed to submit reservation. Please try again.");
    }
  };

  // Remove image preview
  const removeImagePreview = () => {
    setImagePreview(null);
    setReservationForm(prev => ({
      ...prev,
      paymentScreenshot: null
    }));
    const fileInput = document.querySelector('input[name="paymentScreenshot"]');
    if (fileInput) fileInput.value = '';
  };

  // Add to cart function
  const handleAddToCart = (amenity) => {
    setCart((prev) => {
      const exists = prev.find((item) => item.amenity_id === amenity.id);
      if (exists) return prev;

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

  // Adjust quantity
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

  // ✅ FIXED: Fetch reservations from backend using stored user data
  const fetchReservations = async () => {
    try {
      console.log('🔍 Starting to fetch reservations...');
      
      // Get user details from localStorage (saved after reservation)
      const userData = JSON.parse(localStorage.getItem('userReservations'));
      
      if (!userData || !userData.fullName) {
        alert("Please make a reservation first to save your details.");
        return;
      }

      console.log('👤 Looking up reservations for:', userData.fullName, userData.contactNumber);
      
      // Use the working customer endpoint
      const queryParams = new URLSearchParams({
        customer_name: userData.fullName,
        contact_number: userData.contactNumber
      });

      const response = await fetch(
        `http://localhost:5000/api/transactions/customer?${queryParams}`
      );
      
      console.log('📡 Response status:', response.status);
      
      const result = await response.json();
      console.log('📊 Full API response:', result);
      
      if (result.success) {
        console.log('✅ Found transactions:', result.data?.length || 0);
        
        if (result.data && result.data.length > 0) {
          const transformedReservations = result.data.map(transaction => ({
            id: transaction.id,
            transactionId: transaction.id,
            reservationNumber: transaction.transaction_ref,
            amenities: transaction.reservations?.map(r => r.amenity_name) || [],
            checkInDate: transaction.reservations?.[0]?.check_in_date || transaction.check_in_date,
            checkOutDate: transaction.reservations?.[0]?.check_out_date || transaction.check_out_date,
            totalAmount: parseFloat(transaction.total_amount) || 0,
            downpayment: parseFloat(transaction.downpayment) || 0,
            balance: parseFloat(transaction.balance) || 0,
            status: transaction.booking_status || 'Pending',
            paymentStatus: transaction.payment_status || 'Partial',
            dateBooked: transaction.created_at ? transaction.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
            reservations: transaction.reservations || []
          }));
          
          setCurrentReservations(transformedReservations);
          setShowReservationsModal(true);
          console.log('🎉 Reservations loaded successfully!');
        } else {
          alert("You don't have any reservations yet. Make your first reservation!");
          console.log('ℹ️ No reservations found for this account.');
        }
      } else {
        alert("Failed to load reservations: " + (result.message || 'Unknown error'));
        console.error('❌ API returned error:', result.message);
      }
      
    } catch (error) {
      console.error('❌ Fetch reservations error:', error);
      alert("Connection error. Please check if the server is running.");
    }
  };

  // Handle cancel reservation
  const handleCancelReservation = async (reservation) => {
    setReservationToCancel(reservation);
  };

  // Confirm cancellation
  const confirmCancelReservation = async () => {
    if (reservationToCancel) {
      try {
        const response = await fetch(`http://localhost:5000/api/transactions/${reservationToCancel.transactionId}/cancel`, {
          method: 'PUT',
        });

        const result = await response.json();

        if (result.success) {
          setCurrentReservations(prev => prev.filter(r => r.id !== reservationToCancel.id));
          alert(`Reservation ${reservationToCancel.reservationNumber} has been cancelled.`);
        } else {
          alert("Failed to cancel reservation: " + result.message);
        }
      } catch (error) {
        console.error('Cancel reservation error:', error);
        alert("Failed to cancel reservation. Please try again.");
      }
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
            <button
              onClick={fetchReservations}
              className="flex items-center gap-2 bg-lp-orange text-white px-6 py-3 rounded-lg font-semibold hover:bg-lp-orange-hover transition-colors"
            >
              <Calendar className="w-5 h-5" />
              View My Reservations
            </button>

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
                    {/* Full Name */}
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
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-lp-orange focus:border-transparent ${
                          formErrors.fullName ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter your full name"
                      />
                      {formErrors.fullName && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.fullName}</p>
                      )}
                    </div>

                    {/* Address */}
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
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-lp-orange focus:border-transparent ${
                          formErrors.address ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter your complete address"
                      />
                      {formErrors.address && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.address}</p>
                      )}
                    </div>

                    {/* Contact Number */}
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
                        maxLength="11"
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-lp-orange focus:border-transparent ${
                          formErrors.contactNumber ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="09XXXXXXXXX"
                      />
                      {formErrors.contactNumber ? (
                        <p className="text-red-500 text-xs mt-1">{formErrors.contactNumber}</p>
                      ) : (
                        <p className="text-gray-500 text-xs mt-1">Must be 11 digits starting with 09</p>
                      )}
                    </div>

                    {/* DateTime Selection */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Check-in Date & Time *
                        </label>
                        <input
                          type="datetime-local"
                          name="checkInDate"
                          value={reservationForm.checkInDate}
                          onChange={handleReservationInputChange}
                          required
                          min={new Date().toISOString().slice(0, 16)}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-lp-orange focus:border-transparent ${
                            formErrors.checkInDate ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {formErrors.checkInDate && (
                          <p className="text-red-500 text-xs mt-1">{formErrors.checkInDate}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Check-out Date & Time *
                        </label>
                        <input
                          type="datetime-local"
                          name="checkOutDate"
                          value={reservationForm.checkOutDate}
                          onChange={handleReservationInputChange}
                          required
                          min={reservationForm.checkInDate || new Date().toISOString().slice(0, 16)}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-lp-orange focus:border-transparent ${
                            formErrors.checkOutDate ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {formErrors.checkOutDate && (
                          <p className="text-red-500 text-xs mt-1">{formErrors.checkOutDate}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* File Upload with Preview */}
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
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-lp-orange focus:border-transparent ${
                        formErrors.paymentScreenshot ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.paymentScreenshot && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.paymentScreenshot}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Upload a screenshot of your GCash payment confirmation
                    </p>

                    {/* Image Preview */}
                    {imagePreview && (
                      <div className="mt-4 relative">
                        <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                        <div className="relative inline-block">
                          <img 
                            src={imagePreview} 
                            alt="Payment screenshot preview" 
                            className="w-48 h-48 object-cover rounded-lg border-2 border-gray-300"
                          />
                          <button
                            type="button"
                            onClick={removeImagePreview}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
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
                        <img 
                          src="/images/Gcash.jpg" 
                          alt="GCash QR Code" 
                          className="w-48 h-48 object-contain rounded"
                          onError={(e) => {
                            e.target.src = "";
                            console.log("GCash image failed to load, using fallback");
                          }}
                        />
                      </div>
                    </div>

                    <div className="text-center">
                      <p className="text-sm font-semibold text-gray-700 mb-1">
                        Or send to GCash Number:
                      </p>
                      <p className="text-lg font-bold text-lp-orange">
                        0906 704 5360
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
                              <div>Check-in: {new Date(reservation.checkInDate).toLocaleString()}</div>
                              <div>Check-out: {new Date(reservation.checkOutDate).toLocaleString()}</div>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">₱{reservation.totalAmount.toLocaleString()}</div>
                            <div className="text-sm text-lp-orange">Downpayment: ₱{reservation.downpayment.toLocaleString()}</div>
                            <div className="text-sm text-gray-600">Balance: ₱{reservation.balance.toLocaleString()}</div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              reservation.status === 'Confirmed' 
                                ? 'bg-green-100 text-green-800'
                                : reservation.status === 'Pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : reservation.status === 'Cancelled'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {reservation.status}
                            </span>
                            <div className="text-xs text-gray-500 mt-1">
                              Payment: {reservation.paymentStatus}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                            {reservation.status === 'Pending' && (
                              <button
                                onClick={() => handleCancelReservation(reservation)}
                                className="text-red-600 hover:text-red-800 flex items-center gap-1"
                              >
                                <X className="w-4 h-4" />
                                Cancel
                              </button>
                            )}
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
                <p><strong>Dates:</strong> {new Date(reservationToCancel.checkInDate).toLocaleString()} to {new Date(reservationToCancel.checkOutDate).toLocaleString()}</p>
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

      {/* CART MODAL */}
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

                          {/* Quantity Controls */}
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
