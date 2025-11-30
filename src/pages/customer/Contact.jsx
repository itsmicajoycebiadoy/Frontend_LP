
import React from "react";
import { useAuth } from "../AuthContext";
import Header from "../../components/Header.jsx";
import Footer from "../../components/Footer.jsx";
import { Mail, Phone, MapPin, Clock, Shield } from 'lucide-react';

const GMAPS_LINK = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3872.2765647011274!2d120.73721077537722!3d13.942131386469889!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x33bda31e1c02a62d%3A0x4b143b1fae749c!2sLa%20Piscina%20Di%20Concepcion%20Resort!5e0!3m2!1sen!2sph!4v1764375702066!5m2!1sen!2sph";
const Contact = () => {
  const { user } = useAuth();
  const backgroundImageUrl = "/images/bg.jpg";

  const contactInfo = [
    {
      icon: <MapPin className="w-5 h-5" />,
      iconColor: "bg-lp-orange",
      title: "Visit Our Resort",
      details: ["Barangay Gumamela, Balayan", "Batangas, Philippines 4213"],
      description: "Nestled in the beautiful countryside of Batangas, easily accessible from Manila"
    },
    {
      icon: <Phone className="w-5 h-5" />,
      iconColor: "bg-lp-orange",
      title: "Call Us",
      details: ["+63 (912) 345-6789", "+63 (918) 765-4321"],
      description: "Available daily from 7:00 AM to 9:00 PM"
    },
    {
      icon: <Mail className="w-5 h-5" />,
      iconColor: "bg-lp-orange",
      title: "Email Us",
      details: ["Lp_resort@gmail.com"],
      description: "We typically respond within 2-4 hours during business hours"
    },
    {
      icon: <Clock className="w-5 h-5" />,
      iconColor: "bg-lp-orange",
      title: "Operating Hours",
      details: [
        "Monday - Sunday: 8:00 AM - 10:00 PM",
        "Holidays: 7:00 AM - 11:00 PM"
      ],
      description: "Extended hours available for private events and bookings"
    }
  ];

  return (
    <div className="min-h-screen bg-lp-light-bg flex flex-col font-body">
      <Header user={user} />

      {/* HERO SECTION */}
      <section
        className="bg-cover bg-center text-white py-12 sm:py-16 lg:py-20 relative"
        style={{
          backgroundImage: `url(${backgroundImageUrl})`,
        }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="container mx-auto px-4 sm:px-6 text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold text-white font-header mb-4 drop-shadow-md">
            Contact Us
          </h2>
          <p className="text-sm md:text-lg text-gray-200 max-w-2xl mx-auto drop-shadow-sm font-light">
            We are here to assist you with your inquiries and reservations.
          </p>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <div className="flex-grow container mx-auto px-4 sm:px-6 py-16">
        
      </div>

      <Footer />
    </div>
  );
};

export default Contact;