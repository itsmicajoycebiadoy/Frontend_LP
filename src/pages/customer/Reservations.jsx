import React, { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../../components/Header.jsx";
import Footer from "../../components/Footer.jsx";
import api from "../../config/axios";

// Reservation Components
import HeroSection from "../../components/ReservationComponents/HeroSection.jsx";
import ActionButtons from "../../components/ReservationComponents/ActionButtons.jsx";
import ReservationForm from "../../components/ReservationComponents/ReservationForm.jsx";
import CartModal from "../../components/ReservationComponents/CartModal.jsx";
import ReservationsModal from "../../components/ReservationComponents/ReservationsModal.jsx";
import CancellationModal from "../../components/ReservationComponents/CancellationModal.jsx";

const Reservations = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const selectedAmenity = location.state?.selectedAmenity;

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

  // Scroll to top on load
  useEffect(() => { window.scrollTo(0, 0); }, []);

  // Load user ID into form
  useEffect(() => {
    if (user) {
      setReservationForm(prev => ({ ...prev, userId: user.id || user._id || "" }));
    }
  }, [user]);

  // Auto-load reservations when logged in
  useEffect(() => {
    if (user && isAuthenticated) loadReservations();
  }, [user, isAuthenticated]);

  const loadReservations = async () => {
    if (!user) return;
    try {
      const userId = user.id || user._id;
      const response = await api.get(`/api/transactions/user/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.data.success && response.data.data.length > 0) {
        const transformed = response.data.data.map(t => ({
          id: t.id || t.transaction_id,
          transactionId: t.id || t.transaction_id,
          reservationNumber: t.transaction_ref || `TXN-${t.id}`,
          amenities: t.reservations?.map(r => r.amenity_name) || [],
          checkInDate: t.reservations?.[0]?.check_in_date || t.check_in_date,
          checkOutDate: t.reservations?.[0]?.check_out_date || t.check_out_date,
          totalAmount: parseFloat(t.total_amount) || 0,
          downpayment: parseFloat(t.downpayment) || 0,
          balance: parseFloat(t.balance) || 0,
          status: t.booking_status || 'Pending',
          paymentStatus: t.payment_status || 'Partial',
          dateBooked: t.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
          reservations: t.reservations || [],
        }));
        setCurrentReservations(transformed);
        setReservationCount(transformed.length);
      } else {
        setReservationCount(0);
      }
    } catch (error) {
      console.error('Failed to load reservations', error);
    }
  };

  // Form validation
  const validatePhoneNumber = (phone) => /^09\d{9}$/.test(phone);
  const validateForm = () => {
    const errors = {};
    if (!reservationForm.fullName.trim()) errors.fullName = "Full name is required";
    if (!reservationForm.address.trim()) errors.address = "Address is required";
    if (!reservationForm.contactNumber) errors.contactNumber = "Contact number is required";
    else if (!validatePhoneNumber(reservationForm.contactNumber)) errors.contactNumber = "Contact number must start with 09 and be 11 digits";
    if (!reservationForm.checkInDate) errors.checkInDate = "Check-in is required";
    if (!reservationForm.checkOutDate) errors.checkOutDate = "Check-out is required";
    else if (new Date(reservationForm.checkOutDate) <= new Date(reservationForm.checkInDate)) errors.checkOutDate = "Check-out must be after check-in";
    if (!reservationForm.paymentScreenshot) errors.paymentScreenshot = "Payment screenshot is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle input changes
  const handleReservationInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "paymentScreenshot" && files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(files[0]);
      setReservationForm(prev => ({ ...prev, paymentScreenshot: files[0] }));
      setFormErrors(prev => ({ ...prev, paymentScreenshot: "" }));
    } else {
      setReservationForm(prev => ({ ...prev, [name]: value }));
      setFormErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  // Handle submission
  const handleReservationSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return alert("Please fix errors before submitting.");
    if (cart.length === 0) return alert("Add at least one amenity to your cart.");

    try {
      const formData = new FormData();
      Object.entries(reservationForm).forEach(([key, val]) => formData.append(key, val));
      formData.append('cart', JSON.stringify(cart));

      const response = await api.post('/api/transactions', formData);
      if (response.data.success) {
        alert("Reservation submitted successfully!");
        setReservationForm({
          fullName: "",
          address: "",
          contactNumber: "",
          checkInDate: "",
          checkOutDate: "",
          paymentScreenshot: null,
          userId: user?.id || user?._id || ""
        });
        setCart([]);
        setImagePreview(null);
        setFormErrors({});
        loadReservations();
      } else alert("Failed to submit reservation: " + (response.data.message || 'Unknown'));
    } catch (error) {
      console.error(error);
      alert("Failed to submit reservation. Try again.");
    }
  };

  // Cart functions
  const handleAddToCart = (amenity) => {
    setCart(prev => {
      if (prev.find(i => i.amenity_id === amenity.id)) return prev;
      if (prev.length >= 10) return prev;
      return [...prev, { ...amenity, quantity: 1, id: Date.now() }];
    });
  };
  const removeFromCart = (index) => setCart(prev => prev.filter((_, i) => i !== index));
  const adjustQuantity = (index, delta) => setCart(prev => {
    const updated = [...prev];
    const newQty = updated[index].quantity + delta;
    if (newQty >= 1) updated[index].quantity = newQty;
    return updated;
  });
  const calculateTotal = () => cart.reduce((t, i) => t + i.amenity_price * i.quantity, 0);
  const calculateDownpayment = () => calculateTotal() * 0.2;

  // Auto-add selected amenity
  useEffect(() => { if (selectedAmenity) handleAddToCart(selectedAmenity); }, [selectedAmenity]);

  const handleLogout = () => { logout(); navigate("/"); };
  const handleCancelReservation = (reservation) => setReservationToCancel(reservation);
  const confirmCancelReservation = async () => {
    if (!reservationToCancel) return;
    try {
      const response = await api.put(`/api/transactions/${reservationToCancel.transactionId}/cancel`);
      if (response.data.success) {
        setCurrentReservations(prev => prev.filter(r => r.id !== reservationToCancel.id));
        setReservationCount(prev => prev - 1);
        alert(`Reservation ${reservationToCancel.reservationNumber} cancelled.`);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to cancel reservation.");
    } finally { setReservationToCancel(null); }
  };
  const cancelCancelReservation = () => setReservationToCancel(null);
  const removeImagePreview = () => { setImagePreview(null); setReservationForm(prev => ({ ...prev, paymentScreenshot: null })); };

  return (
    <div className="min-h-screen flex flex-col font-body">
      <Header user={user} onLogout={handleLogout} />
      <HeroSection title="Your Reservations" description="Manage your bookings and create new reservations." backgroundImageUrl="/images/bg.jpg" />
      <ActionButtons onViewReservations={loadReservations} onOpenCart={() => setShowCartModal(true)} cartCount={cart.length} reservationCount={reservationCount} />
      <main className="flex-1 w-full bg-lp-light-bg">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
          {!isAuthenticated && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800"><strong>Note:</strong> You are not logged in. Log in to save reservation history.</p>
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
      <ReservationsModal isOpen={showReservationsModal} onClose={() => setShowReservationsModal(false)} reservations={currentReservations} onCancelReservation={handleCancelReservation} />
      <CartModal isOpen={showCartModal} onClose={() => setShowCartModal(false)} cart={cart} removeFromCart={removeFromCart} adjustQuantity={adjustQuantity} calculateTotal={calculateTotal} calculateDownpayment={calculateDownpayment} setCart={setCart} />
      <CancellationModal reservation={reservationToCancel} onConfirm={confirmCancelReservation} onCancel={cancelCancelReservation} />
      <Footer />
    </div>
  );
};

export default Reservations;
