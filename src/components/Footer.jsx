import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Facebook, Instagram, Twitter } from 'lucide-react';
import InfoModal from './InfoModal'; // Import the modal

const Footer = () => {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');

  const handleNavigation = (section) => {
    switch(section) {
      case 'home':
        navigate('/');
        break;
      case 'amenities':
        navigate('/amenities');
        break;
      case 'reservations':
        navigate('/reservations');
        break;
      case 'feedback':
        navigate('/feedback');
        break;
      case 'contact':
        navigate('/contact');
        break;
      default:
        navigate('/');
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
      <footer className="bg-lp-dark text-white py-8 sm:py-10 lg:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
            
            {/* Location & Contact Information */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-lg sm:text-xl font-bold font-header text-lp-orange">Visit Us Today</h3>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-start space-x-2 sm:space-x-3">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-lp-orange mt-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm sm:text-base">Location</p>
                    <p className="text-gray-300 text-xs sm:text-sm">Barangay Gumamela, Balayan</p>
                    <p className="text-gray-300 text-xs sm:text-sm">Batangas, Philippines</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-lp-orange shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-gray-300 text-xs sm:text-sm">+63 (912) 345-6789</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-lp-orange shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-300 text-xs sm:text-sm wrap-break-words">Lp_resort@gmail.com</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links & Navigation */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-lg sm:text-xl font-bold font-header text-lp-orange">Quick Links</h3>
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1 sm:space-y-2">
                  <button 
                    onClick={() => handleNavigation('home')}
                    className="block text-gray-300 hover:text-lp-orange transition-colors text-start text-xs sm:text-sm w-full"
                  >
                    Home
                  </button>
                  <button 
                    onClick={() => handleNavigation('amenities')}
                    className="block text-gray-300 hover:text-lp-orange transition-colors text-start text-xs sm:text-sm w-full"
                  >
                    Amenities
                  </button>
                  <button 
                    onClick={() => handleNavigation('reservations')}
                    className="block text-gray-300 hover:text-lp-orange transition-colors text-start text-xs sm:text-sm w-full text-start"
                  >
                    Reservation
                  </button>
                  <button 
                    onClick={() => handleNavigation('feedback')}
                    className="block text-gray-300 hover:text-lp-orange transition-colors text-left text-xs sm:text-sm w-full text-start"
                  >
                    Feedback
                  </button>
                  <button 
                    onClick={() => handleNavigation('contact')}
                    className="block text-gray-300 hover:text-lp-orange transition-colors text-left text-xs sm:text-sm w-full text-start"
                  >
                    Contact
                  </button>
                </div>
                <div className="space-y-1 sm:space-y-2">
                  <button 
                    onClick={() => openModal('about')}
                    className="block text-gray-300 hover:text-lp-orange transition-colors text-left text-xs sm:text-sm w-full text-start"
                  >
                    About Us
                  </button>
                  <button 
                    onClick={() => openModal('faq')}
                    className="block text-gray-300 hover:text-lp-orange transition-colors text-left text-xs sm:text-sm w-full text-start"
                  >
                    FAQ
                  </button>
                  <button 
                    onClick={() => openModal('policy')}
                    className="block text-gray-300 hover:text-lp-orange transition-colors text-left text-xs sm:text-sm w-full text-start"
                  >
                    Resort's Policy
                  </button>
                </div>
              </div>
            </div>

            {/* Operating Hours & Social Media */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-lg sm:text-xl font-bold font-header text-lp-orange">Resort Hours</h3>
              <div className="space-y-1 sm:space-y-2 text-gray-300 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span className="pr-2">Mon - Thu:</span>
                  <span className="text-right">8:00 AM - 10:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="pr-2">Fri - Sat:</span>
                  <span className="text-right">8:00 AM - 11:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="pr-2">Sunday:</span>
                  <span className="text-right">8:00 AM - 9:00 PM</span>
                </div>
              </div>
              
              <div className="pt-2 sm:pt-4">
                <h4 className="font-semibold mb-2 sm:mb-3 text-lp-orange text-sm sm:text-base">Follow Us:</h4>
                <div className="flex space-x-3 sm:space-x-4">
                  <a href="https://www.facebook.com/profile.php?id=100005213862415" className="text-gray-300 hover:text-lp-orange transition-colors">
                    <Facebook className="w-5 h-5 sm:w-6 sm:h-6" />
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bottom Copyright Bar */}
          <div className="border-t border-gray-700 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center">
            <p className="text-gray-400 text-xs sm:text-sm">
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