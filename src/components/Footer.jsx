import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const navigate = useNavigate();

  const handleNavigation = (section) => {
    navigate(section);
    window.scrollTo(0, 0);
  };

  return (
    <footer className="bg-lp-dark text-gray-300 py-10 md:py-12 border-t border-gray-800 font-body w-full">
      <div className="w-full px-6 md:px-12 lg:px-16">
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10 items-start">
          
          {/* 1. VISIT US - KEPT for layout context */}
          <div className="space-y-4">
            <h3 className="text-base md:text-lg font-bold text-lp-orange font-header uppercase tracking-wider">
              Visit Us
            </h3>
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

          {/* 2. EXPLORE - KEPT (This is the main focus - fixing home navigation) */}
          <div className="space-y-4">
            <h3 className="text-base md:text-lg font-bold text-lp-orange font-header uppercase tracking-wider">
              Explore
            </h3>
            <ul className="space-y-3 text-sm md:text-base">
              <li><button onClick={() => handleNavigation('/customer')} className="hover:text-lp-orange text-left transition-colors">Home</button></li>
              <li><button onClick={() => handleNavigation('/amenities')} className="hover:text-lp-orange text-left transition-colors">Amenities</button></li>
              <li><button onClick={() => handleNavigation('/reservations')} className="hover:text-lp-orange text-left transition-colors">Reservation</button></li>
              <li><button onClick={() => handleNavigation('/feedback')} className="hover:text-lp-orange text-left transition-colors">Guest Feedback</button></li>
              <li><button onClick={() => handleNavigation('/contact')} className="hover:text-lp-orange text-left transition-colors">Contact Us</button></li>
            </ul>
          </div>

          {/* 4. HOURS - KEPT (part of overall layout) */}
          <div className="space-y-4">
            <h3 className="text-base md:text-lg font-bold text-lp-orange font-header uppercase tracking-wider">
              Hours
            </h3>
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
          </div>

        </div>

        {/* Copyright Section - KEPT (part of overall layout) */}
        <div className="border-t border-gray-800 mt-10 pt-6 text-center">
          <p className="text-gray-500 text-xs sm:text-sm">
            © {new Date().getFullYear()} La Piscina De Conception Resort. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;