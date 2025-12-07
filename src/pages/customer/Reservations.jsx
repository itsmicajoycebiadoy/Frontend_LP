import React, { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import Header from "../../components/Header.jsx";
import Footer from "../../components/Footer.jsx";
import HeroSection from "../../components/ReservationComponents/HeroSection.jsx";
import ReservationForm from "../../components/ReservationComponents/ReservationForm.jsx";

const ReservationsP2 = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const backgroundImageUrl = "/images/bg.jpg";

  const [cart, setCart] = useState([]);
  const [reservationForm, setReservationForm] = useState({
    fullName: "",
    address: "",
    contactNumber: "",
    checkInDate: "",
    checkOutDate: "",
    paymentScreenshot: null,
    userId: user?.id || ""
  });
  const [formErrors, setFormErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (user) {
      setReservationForm(prev => ({ ...prev, userId: user.id || "" }));
    }
  }, [user]);

  const handleReservationInputChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "paymentScreenshot") {
      const file = files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => setImagePreview(e.target.result);
        reader.readAsDataURL(file);

        setReservationForm(prev => ({ ...prev, paymentScreenshot: file }));
        setFormErrors(prev => ({ ...prev, paymentScreenshot: "" }));
      }
    } else if (name === "contactNumber") {
      const numbersOnly = value.replace(/\D/g, '').slice(0, 11);
      setReservationForm(prev => ({ ...prev, [name]: numbersOnly }));
      setFormErrors(prev => ({ ...prev, contactNumber: "" }));
    } else {
      setReservationForm(prev => ({ ...prev, [name]: value }));
      if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen flex flex-col font-body">
      <Header user={user} onLogout={handleLogout} />

      <HeroSection
        title="Your Reservations"
        description="Manage your bookings and create new reservations at La Piscina Resort."
        backgroundImageUrl={backgroundImageUrl}
      />

      <main className="flex-1 w-full bg-lp-light-bg">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
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
            handleReservationInputChange={handleReservationInputChange}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ReservationsP2;
