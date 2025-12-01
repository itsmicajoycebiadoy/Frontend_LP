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
<<<<<<< HEAD
        className="bg-cover bg-center text-white py-12 sm:py-16 lg:py-20"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(${backgroundImageUrl})`,
        }}
      >
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl md:text-6xl font-bold text-white font-header mb-4">
            Contact Us
          </h2>
          <p className="text-sm md:text-lg text-gray-200 max-w-2xl mx-auto mb-8">
=======
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
>>>>>>> 42251b38d3904704c454d8fb241cf1e5a7ca316d
            We are here to assist you with your inquiries and reservations.
          </p>
        </div>
      </section>

<<<<<<< HEAD

=======
>>>>>>> 42251b38d3904704c454d8fb241cf1e5a7ca316d
      {/* MAIN CONTENT */}
      <div className="flex-grow container mx-auto px-4 sm:px-6 py-16">
        <div className="max-w-5xl mx-auto">
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Contact Cards */}
            {contactInfo.map((item, index) => (
              <div key={index} className="bg-white p-8 rounded-none shadow-sm hover:shadow-md transition-shadow border border-gray-100 flex items-start gap-6">
                <div className={`w-12 h-12 ${item.iconColor} flex items-center justify-center text-white flex-shrink-0`}>
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 font-header">{item.title}</h3>
                  {item.details.map((d, i) => (
                    <p key={i} className="text-gray-600 font-medium">{d}</p>
                  ))}
                  <p className="text-xs text-gray-400 mt-2 font-light italic">{item.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Emergency Contact Box */}
          <div className="bg-orange-50 border border-orange-100 p-6 rounded-none text-center max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-2 text-lp-orange">
              <Shield size={20} />
              <h3 className="font-bold text-lg font-header">Emergency Contact</h3>
            </div>
            <p className="text-gray-600 text-sm mb-1">For urgent matters after hours, please call:</p>
            <p className="text-2xl font-bold text-gray-800 tracking-wide">+63 (920) 123-4567</p>
          </div>

        </div>
      </div>

      {/* GOOGLE MAPS SECTION */}
      <section className="w-full h-[450px] bg-slate-200">
        <iframe 
          title="Resort Location"
          src={GMAPS_LINK}
          width="100%" 
          height="100%" 
          style={{ border: 0 }} 
          allowFullScreen="" 
          loading="lazy" 
          referrerPolicy="no-referrer-when-downgrade"
          className="filter grayscale hover:grayscale-0 transition-all duration-700"
        ></iframe>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;