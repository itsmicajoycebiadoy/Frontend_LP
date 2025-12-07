import React, { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../../components/Header.jsx";
import Footer from "../../components/Footer.jsx";
import api from "../../config/axios"; // Import axios instance

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
  const selectedAmenity = location.state?.selectedAmenity;
  const backgroundImageUrl = "/images/bg.jpg";

  // State Management
  const [cart, setCart] = useState([]);
  const [showCartModal, setShowCartModal] = useState(false);
  const [showReservationsModal, setShowReservationsModal] = useState(false);
  const [reservationToCancel, setReservationToCancel] = useState(null);
  const [currentReservations, setCurrentReservations] = useState([]);
  const [reservationForm, setReservationForm] = useState({
    fullName: "",
    address: "",
    contactNumber: "",
    checkInDate: "",
    checkOutDate: "",
    paymentScreenshot: null,
    userId: ""
  });
  const [formErrors, setFormErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [reservationCount, setReservationCount] = useState(0);
  const [isLoadingReservations, setIsLoadingReservations] = useState(false); // ✅ ADDED: Loading state

  // Add this function to test if backend receives user_id
  const testBackendReceivesUserId = async () => {
    const userId = user?.id;
    console.log('🧪 TEST: Sending test request with user_id:', userId);
    
    const formData = new FormData();
    formData.append('test', 'true');
    formData.append('userId', userId);
    
    try {
      const response = await api.post('/api/transactions/test', formData);
      console.log('🧪 Test response:', response.data);
    } catch (error) {
      console.error('🧪 Test error:', error);
    }
  };

  // Call this after login
  // testBackendReceivesUserId();

  // Load user data from AuthContext
  useEffect(() => {
    if (user) {
      setReservationForm(prev => ({
        ...prev,
        userId: user.id || user._id || ""
      }));
    }
  }, [user]);

  // ✅ ADDED: Automatically fetch reservations when user is logged in
  useEffect(() => {
    if (user && isAuthenticated) {
      loadReservationsOnPageLoad();
    } else {
      setReservationCount(0); // Reset count if not logged in
    }
  }, [user, isAuthenticated]);

  // ✅ ADDED: Function to load reservations on page load
  const loadReservationsOnPageLoad = async () => {
    if (!user || isLoadingReservations) return;
    
    try {
      setIsLoadingReservations(true);
      const userId = user.id || user._id || user.userId;
      
      if (!userId) {
        console.log('❌ No user ID found for auto-load');
        return;
      }

      console.log('📱 Auto-loading reservations for user:', userId);
      
      const response = await api.get(
        `/api/transactions/user/${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      const result = response.data;
      
      if (result.success && result.data && result.data.length > 0) {
        console.log(`📱 Auto-loaded ${result.data.length} reservations`);
        setReservationCount(result.data.length);
        
        // Transform data for modal (if needed later)
        const transformedReservations = result.data.map(transaction => ({
          id: transaction.id || transaction.transaction_id,
          transactionId: transaction.id || transaction.transaction_id,
          reservationNumber: transaction.transaction_ref || `TXN-${transaction.id}`,
          amenities: transaction.reservations?.map(r => r.amenity_name) || [],
          checkInDate: transaction.reservations?.[0]?.check_in_date || transaction.check_in_date,
          checkOutDate: transaction.reservations?.[0]?.check_out_date || transaction.check_out_date,
          totalAmount: parseFloat(transaction.total_amount) || 0,
          downpayment: parseFloat(transaction.downpayment) || 0,
          balance: parseFloat(transaction.balance) || 0,
          status: transaction.booking_status || 'Pending',
          paymentStatus: transaction.payment_status || 'Partial',
          dateBooked: transaction.created_at ? transaction.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
          reservations: transaction.reservations || [],
          rawTransaction: transaction
        }));
        
        setCurrentReservations(transformedReservations);
      } else {
        setReservationCount(0);
      }
    } catch (error) {
      console.log('📱 Auto-load reservations error:', error);
      // Don't show alert for auto-load errors
    } finally {
      setIsLoadingReservations(false);
    }
  };

  // ✅ ADDED: Update reservation count when currentReservations changes
  useEffect(() => {
    setReservationCount(currentReservations.length);
  }, [currentReservations]);

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

  // Cart persistence
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

  useEffect(() => {
    const saved = localStorage.getItem("cart");
    if (cart.length === 0 && saved) return;
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Validation functions
  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^09\d{9}$/;
    return phoneRegex.test(phone);
  };

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

  // Handle form input changes
  const handleReservationInputChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === "paymentScreenshot") {
      const file = files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target.result);
        };
        reader.readAsDataURL(file);
        
        setReservationForm(prev => ({
          ...prev,
          paymentScreenshot: file
        }));
        
        if (formErrors.paymentScreenshot) {
          setFormErrors(prev => ({ ...prev, paymentScreenshot: "" }));
        }
      }
    } else if (name === "contactNumber") {
      const numbersOnly = value.replace(/\D/g, '').slice(0, 11);
      setReservationForm(prev => ({
        ...prev,
        [name]: numbersOnly
      }));

      if (formErrors.contactNumber) {
        setFormErrors(prev => ({ ...prev, contactNumber: "" }));
      }
    } else {
      setReservationForm(prev => {
        const updatedForm = {
          ...prev,
          [name]: value
        };

        if (name === 'checkInDate' || name === 'checkOutDate') {
          const checkIn = name === 'checkInDate' ? value : prev.checkInDate;
          const checkOut = name === 'checkOutDate' ? value : prev.checkOutDate;

          if (checkIn && checkOut) {
            const d1 = new Date(checkIn);
            const d2 = new Date(checkOut);

            if (d2 <= d1) {
              setFormErrors(currentErrors => ({
                ...currentErrors,
                checkOutDate: "Check-out time cannot be the same or before check-in time."
              }));
            } else {
              setFormErrors(currentErrors => {
                const newErrors = { ...currentErrors };
                delete newErrors.checkOutDate;
                return newErrors;
              });
            }
          }
        }

        return updatedForm;
      });

      if (formErrors[name] && name !== 'checkInDate' && name !== 'checkOutDate') {
        setFormErrors(prev => ({
          ...prev,
          [name]: ""
        }));
      }
    }
  };

  // Handle form submission - UPDATED TO CLEAR FORM PROPERLY
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
      const formData = new FormData();
      formData.append('fullName', reservationForm.fullName);
      formData.append('contactNumber', reservationForm.contactNumber);
      formData.append('address', reservationForm.address);
      formData.append('checkInDate', reservationForm.checkInDate);
      formData.append('checkOutDate', reservationForm.checkOutDate);
      formData.append('cart', JSON.stringify(cart));
      
      // ALWAYS include userId if user is logged in
      const userId = user?.id || user?._id || user?.userId;
      if (userId) {
        formData.append('userId', userId);
        console.log('📝 Including userId in reservation:', userId);
      } else {
        console.log('⚠️ No userId available - reservation will be guest');
      }
      
      if (reservationForm.paymentScreenshot) {
        formData.append('proof_of_payment', reservationForm.paymentScreenshot);
      }

      const response = await api.post('/api/transactions', formData);
      const result = response.data;
      
      console.log('📤 Reservation submission result:', result);

      if (result.success) {
        alert("Reservation submitted successfully!");
        
        // ✅ Clear form and cart - ALL fields set to empty
        setReservationForm({
          fullName: "",        // ✅ Empty string
          address: "",         // ✅ Empty string
          contactNumber: "",   // ✅ Empty string
          checkInDate: "",
          checkOutDate: "",
          paymentScreenshot: null,
          userId: user?.id || user?._id || "" // Keep userId for reference if needed
        });
        
        setCart([]);
        localStorage.removeItem("cart");
        setImagePreview(null);
        
        const fileInput = document.querySelector('input[name="paymentScreenshot"]');
        if (fileInput) fileInput.value = '';
        
        setFormErrors({});
        
        // ✅ AUTO-RELOAD reservations after successful submission
        if (user && isAuthenticated) {
          setTimeout(() => {
            loadReservationsOnPageLoad();
          }, 1000); // Wait 1 second for backend to process
        }
        
      } else {
        alert("Failed to submit reservation: " + (result.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Reservation submission error:', error);
      alert("Failed to submit reservation. Please try again.");
    }
  };

  // Cart functions
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
    cart.reduce((total, item) => total + item.amenity_price * item.quantity, 0);

  const calculateDownpayment = () => calculateTotal() * 0.2;

  // Auto-add selected amenity
  useEffect(() => {
    if (selectedAmenity) handleAddToCart(selectedAmenity);
  }, [selectedAmenity]);

  // Logout
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Fetch reservations based on USER ID - UPDATED with reservation count (for button click)
  const fetchReservations = async () => {
    try {
      console.log('🔄 Fetching reservations...');
      console.log('👤 Current user:', user);
      console.log('🔑 User ID:', user?.id || user?._id);
      console.log('🔑 User ID type:', typeof (user?.id || user?._id));

      // Check if user is logged in
      if (!user) {
        alert("Please log in to view your reservations.");
        setReservationCount(0);
        return;
      }

      // Get user ID from various possible properties
      const userId = user.id || user._id || user.userId;
      
      if (!userId) {
        console.error('❌ No user ID found in user object:', user);
        alert("User ID not found. Please log in again.");
        setReservationCount(0);
        return;
      }

      console.log('📡 Calling API with user ID:', userId);
      
      // Try the user-specific endpoint first
      try {
        const response = await api.get(
          `/api/transactions/user/${userId}`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        
        console.log('📡 API Response status:', response.status);
        
        const result = response.data;
        console.log('📊 API Result:', result);
        
        if (result.success) {
          if (result.data && result.data.length > 0) {
            console.log(`✅ Found ${result.data.length} reservations`);
            
            // ✅ Set reservation count
            setReservationCount(result.data.length);
            
            // Transform the data to match your frontend structure
            const transformedReservations = result.data.map(transaction => {
              console.log('📋 Transaction data:', transaction);
              
              return {
                id: transaction.id || transaction.transaction_id,
                transactionId: transaction.id || transaction.transaction_id,
                reservationNumber: transaction.transaction_ref || `TXN-${transaction.id}`,
                amenities: transaction.reservations?.map(r => r.amenity_name) || [],
                checkInDate: transaction.reservations?.[0]?.check_in_date || transaction.check_in_date,
                checkOutDate: transaction.reservations?.[0]?.check_out_date || transaction.check_out_date,
                totalAmount: parseFloat(transaction.total_amount) || 0,
                downpayment: parseFloat(transaction.downpayment) || 0,
                balance: parseFloat(transaction.balance) || 0,
                status: transaction.booking_status || 'Pending',
                paymentStatus: transaction.payment_status || 'Partial',
                dateBooked: transaction.created_at ? transaction.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
                reservations: transaction.reservations || [],
                rawTransaction: transaction
              };
            });
            
            console.log('🎯 Transformed reservations:', transformedReservations);
            setCurrentReservations(transformedReservations);
            setShowReservationsModal(true);
          } else {
            console.log('ℹ️ No reservations found for user');
            setReservationCount(0);
            alert("You don't have any reservations yet. Make your first reservation!");
          }
        } else {
          console.error('❌ API returned error:', result.message);
          setReservationCount(0);
          alert("Failed to load reservations: " + (result.message || 'Unknown error'));
        }
        
      } catch (apiError) {
        console.error('❌ API call failed:', apiError);
        setReservationCount(0);
        
        // Fallback to customer search by name and contact number
        console.log('🔄 Trying fallback method...');
        await fetchReservationsFallback();
      }
      
    } catch (error) {
      console.error('💥 Fetch reservations error:', error);
      setReservationCount(0);
      alert("Cannot load reservations. Please try again later.");
    }
  };

  // Fallback method using name and contact number - UPDATED with reservation count
  const fetchReservationsFallback = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('userReservations') || '{}');
      
      // Try to get user info from various sources
      const customerName = user?.fullName || user?.name || user?.username || userData.fullName;
      const contactNumber = user?.contactNumber || user?.phone || userData.contactNumber;
      
      if (!customerName || !contactNumber) {
        alert("Unable to find your reservation details. Please make sure your profile is complete.");
        setReservationCount(0);
        return;
      }
      
      console.log('🔄 Fallback search with:', { customerName, contactNumber });
      
      const response = await api.get(
        `/api/transactions/customer`,
        {
          params: {
            customer_name: customerName,
            contact_number: contactNumber
          }
        }
      );
      
      const result = response.data;
      console.log('📊 Fallback result:', result);
      
      if (result.success && result.data.length > 0) {
        const transformed = result.data.map(transaction => ({
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
        
        setReservationCount(result.data.length);
        setCurrentReservations(transformed);
        setShowReservationsModal(true);
        
        localStorage.setItem('userReservations', JSON.stringify({
          fullName: customerName,
          contactNumber: contactNumber
        }));
      } else {
        setReservationCount(0);
        alert("No reservations found. Make your first reservation!");
      }
    } catch (fallbackError) {
      console.error('Fallback error:', fallbackError);
      setReservationCount(0);
      alert("Cannot load reservations. Please try again later.");
    }
  };

  const handleCancelReservation = async (reservation) => {
    setReservationToCancel(reservation);
  };

  const confirmCancelReservation = async () => {
    if (reservationToCancel) {
      try {
        const response = await api.put(`/api/transactions/${reservationToCancel.transactionId}/cancel`);
        const result = response.data;

        if (result.success) {
          setCurrentReservations(prev => prev.filter(r => r.id !== reservationToCancel.id));
          alert(`Reservation ${reservationToCancel.reservationNumber} has been cancelled.`);
          // ✅ Update count after cancellation
          setReservationCount(prev => prev - 1);
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

  const cancelCancelReservation = () => {
    setReservationToCancel(null);
  };

  const removeImagePreview = () => {
    setImagePreview(null);
    setReservationForm(prev => ({
      ...prev,
      paymentScreenshot: null
    }));
    const fileInput = document.querySelector('input[name="paymentScreenshot"]');
    if (fileInput) fileInput.value = '';
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

      {/* Action Buttons - UPDATED with reservationCount prop */}
      <ActionButtons
        onViewReservations={fetchReservations}
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
          />
        </div>
      </main>

      {/* MODALS */}
      <ReservationsModal
        isOpen={showReservationsModal}
        onClose={() => setShowReservationsModal(false)}
        reservations={currentReservations}
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