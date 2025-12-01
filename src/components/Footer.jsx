import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Facebook } from 'lucide-react';
import InfoModal from './InfoModal';

const Footer = () => {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');

  const handleNavigation = (section) => {
    switch(section) {
      case 'home': navigate('/'); break;
      case 'amenities': navigate('/amenities'); break;
      case 'reservations': navigate('/reservations'); break;
      case 'feedback': navigate('/feedback'); break;
      case 'contact': navigate('/contact'); break;
      default: navigate('/');
    }
  };

  const openModal = (type) => {
    setModalType(type);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalType('');
  };

  return (
    <>
      <footer className="bg-lp-dark text-gray-300 py-8 md:py-12 border-t border-gray-800 font-body">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          
          {/* FIXED GRID:
              - grid-cols-2: Dalawang column agad sa mobile (2x2 layout).
              - gap-x-4 gap-y-8: Tamang spacing para hindi magdikit pero hindi rin sabog.
              - Tinanggal ko na ang col-span classes para pantay lahat ng boxes.
          */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-8 items-start">
            
            {/* 1. VISIT US (Top Left) */}
            <div className="space-y-3">
              <h3 className="text-xs md:text-lg font-bold text-lp-orange font-header uppercase tracking-wider">
                Visit Us
              </h3>
              <div className="text-[10px] md:text-sm space-y-2">
                <p className="text-white font-semibold">Location</p>
                <p>Brgy. Gumamela,<br />Balayan, Batangas</p>
                
                <div className="pt-2">
                  <p className="text-white font-semibold">Contact</p>
                  <p>+63 (912) 345-6789</p>
                  <p className="break-all">Lp_resort@gmail.com</p>
                </div>
              </div>
            </div>

            {/* 2. EXPLORE (Top Right) */}
            <div className="space-y-3">
              <h3 className="text-xs md:text-lg font-bold text-lp-orange font-header uppercase tracking-wider">
                Explore
              </h3>
              <ul className="space-y-2 text-[10px] md:text-sm">
                <li><button onClick={() => handleNavigation('home')} className="hover:text-lp-orange text-left">Home</button></li>
                <li><button onClick={() => handleNavigation('amenities')} className="hover:text-lp-orange text-left">Amenities</button></li>
                <li><button onClick={() => handleNavigation('reservations')} className="hover:text-lp-orange text-left">Reservation</button></li>
                <li><button onClick={() => handleNavigation('feedback')} className="hover:text-lp-orange text-left">Guest Feedback</button></li>
                <li><button onClick={() => handleNavigation('contact')} className="hover:text-lp-orange text-left">Contact Us</button></li>
              </ul>
            </div>

            {/* 3. INFORMATION (Bottom Left) */}
            <div className="space-y-3">
              <h3 className="text-xs md:text-lg font-bold text-lp-orange font-header uppercase tracking-wider">
                Info
              </h3>
              <ul className="space-y-2 text-[10px] md:text-sm">
                <li><button onClick={() => openModal('about')} className="hover:text-lp-orange text-left">About Us</button></li>
                <li><button onClick={() => openModal('faq')} className="hover:text-lp-orange text-left">FAQs</button></li>
                <li><button onClick={() => openModal('policy')} className="hover:text-lp-orange text-left">Resort Policies</button></li>
              </ul>
            </div>

            {/* 4. HOURS & SOCIALS (Bottom Right) */}
            <div className="space-y-3">
              <h3 className="text-xs md:text-lg font-bold text-lp-orange font-header uppercase tracking-wider">
                Hours
              </h3>
              <div className="space-y-1 text-[10px] md:text-sm">
                <div className="flex justify-between">
                  <span>Mon-Thu</span>
                  <span className="text-white">8am-10pm</span>
                </div>
                <div className="flex justify-between">
                  <span>Fri-Sat</span>
                  <span className="text-white">8am-11pm</span>
                </div>
                <div className="flex justify-between">
                  <span>Sun</span>
                  <span className="text-white">8am-9pm</span>
                </div>
              </div>

              <div className="pt-3">
                <a 
                  href="https://www.facebook.com/profile.php?id=100005213862415" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-800 hover:bg-[#1877F2] hover:text-white transition-all"
                >
                  <Facebook size={14} />
                </a>
              </div>
            </div>

          </div>

          {/* Copyright Section */}
          <div className="border-t border-gray-800 mt-8 pt-6 text-center">
            <p className="text-gray-500 text-[10px] sm:text-xs">
              © {new Date().getFullYear()} La Piscina De Conception Resort. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Info Modal */}
      <InfoModal 
        isOpen={modalOpen} 
        onClose={closeModal} 
        type={modalType} 
      />
    </>
  );
};

export default Footer;