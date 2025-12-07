import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Facebook } from 'lucide-react';
import InfoModal from './InfoModal';

const Footer = () => {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');

  const handleNavigation = (section) => {
    navigate(section);
    window.scrollTo(0, 0);
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
      <footer className="bg-lp-dark text-gray-300 py-10 md:py-12 border-t border-gray-800 font-body w-full">
        <div className="w-full px-6 md:px-12 lg:px-16">
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10 items-start">
            
            {/* 1. VISIT US */}
            <div className="space-y-4">
              <h3 className="text-base md:text-lg font-bold text-lp-orange font-header uppercase tracking-wider">
                Visit Us
              </h3>
              {/* Updated text size to text-sm (14px) */}
              <div className="text-sm md:text-base space-y-3">
                <div>
                  <p className="text-white font-semibold">Location</p>
                  <p className="leading-relaxed">Brgy. Gumamela,<br />Balayan, Batangas</p>
                </div>
                
                <div className="pt-1">
                  <p className="text-white font-semibold">Contact</p>
                  <p>+63 (912) 345-6789</p>
                  <p className="break-words">Lp_resort@gmail.com</p>
                </div>
              </div>
            </div>

            {/* 2. EXPLORE */}
            <div className="space-y-4">
              <h3 className="text-base md:text-lg font-bold text-lp-orange font-header uppercase tracking-wider">
                Explore
              </h3>
              {/* Updated text size to text-sm */}
              <ul className="space-y-3 text-sm md:text-base">
                <li><button onClick={() => handleNavigation('/customer')} className="hover:text-lp-orange text-left transition-colors">Home</button></li>
                <li><button onClick={() => handleNavigation('/amenities')} className="hover:text-lp-orange text-left transition-colors">Amenities</button></li>
                <li><button onClick={() => handleNavigation('/reservations')} className="hover:text-lp-orange text-left transition-colors">Reservation</button></li>
                <li><button onClick={() => handleNavigation('/feedback')} className="hover:text-lp-orange text-left transition-colors">Guest Feedback</button></li>
                <li><button onClick={() => handleNavigation('/contact')} className="hover:text-lp-orange text-left transition-colors">Contact Us</button></li>
              </ul>
            </div>

            {/* 3. INFORMATION */}
            <div className="space-y-4">
              <h3 className="text-base md:text-lg font-bold text-lp-orange font-header uppercase tracking-wider">
                Info
              </h3>
              {/* Updated text size to text-sm */}
              <ul className="space-y-3 text-sm md:text-base">
                <li><button onClick={() => openModal('about')} className="hover:text-lp-orange text-left transition-colors">About Us</button></li>
                <li><button onClick={() => openModal('faq')} className="hover:text-lp-orange text-left transition-colors">FAQs</button></li>
                <li><button onClick={() => openModal('policy')} className="hover:text-lp-orange text-left transition-colors">Resort Policies</button></li>
              </ul>
            </div>

            {/* 4. HOURS & SOCIALS */}
            <div className="space-y-4">
              <h3 className="text-base md:text-lg font-bold text-lp-orange font-header uppercase tracking-wider">
                Hours
              </h3>
              {/* Updated text size to text-sm */}
              <div className="space-y-2 text-sm md:text-base">
                <div className="flex justify-between max-w-[180px]">
                  <span>Mon-Thu</span>
                  <span className="text-white font-medium">8am-10pm</span>
                </div>
                <div className="flex justify-between max-w-[180px]">
                  <span>Fri-Sat</span>
                  <span className="text-white font-medium">8am-11pm</span>
                </div>
                <div className="flex justify-between max-w-[180px]">
                  <span>Sun</span>
                  <span className="text-white font-medium">8am-9pm</span>
                </div>
              </div>

              <div className="pt-4">
                <a 
                  href="https://www.facebook.com/profile.php?id=100005213862415" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-800 hover:bg-[#1877F2] hover:text-white transition-all duration-300"
                >
                  <Facebook size={20} />
                </a>
              </div>
            </div>

          </div>

          {/* Copyright Section */}
          <div className="border-t border-gray-800 mt-10 pt-6 text-center">
            {/* Updated copyright to text-xs (minimum readable size) or sm */}
            <p className="text-gray-500 text-xs sm:text-sm">
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