import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, LogOut } from 'lucide-react';

const Header = ({ user, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Extract active section from current path
  const getActiveSection = () => {
    const path = location.pathname;
    if (path === '/') return 'home';
    if (path.includes('/amenities')) return 'amenities';
    if (path.includes('/reservations')) return 'reservations';
    if (path.includes('/feedback')) return 'feedback';
    if (path.includes('/contact')) return 'contact';
    return 'home';
  };

  const activeSection = getActiveSection();

  const handleNavigation = (section) => {
    setIsMobileMenuOpen(false);
    
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

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout();
    }
  };

  const navItems = ['Home', 'Amenities', 'Reservations', 'Feedback', 'Contact'];

  return (
    <nav className="bg-white py-3 md:py-4 shadow-sm relative z-20 flex-shrink-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        
        {/* Logo & Hamburger Container */}
        <div className="flex items-center gap-3">
          {/* Mobile Menu Button (Visible on lg and below) */}
          <button 
              className="lg:hidden text-gray-600 hover:text-lp-orange transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-lp-orange rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">LP</div>
              <span className="text-lg font-bold text-lp-dark font-header tracking-tight truncate">La Piscina IRMS</span>
          </div>
        </div>

        {/* Desktop Links (Hidden on Mobile) */}
        <div className="hidden lg:flex space-x-8">
          {navItems.map((item) => (
            <button
              key={item}
              onClick={() => handleNavigation(item.toLowerCase())}
              className={`text-sm font-medium transition-colors ${
                activeSection === item.toLowerCase() ? 'text-lp-orange border-b-2 border-lp-orange pb-1' : 'text-gray-600 hover:text-lp-orange'
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {/* User & Logout Section */}
        <div className="flex items-center gap-3">
          {user && (
            <div className="flex items-center gap-2 text-right">
               <div className="w-8 h-8 bg-lp-orange rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                 {user?.username?.charAt(0).toUpperCase()}
               </div>
               <div className="hidden lg:block leading-tight">
                  <p className="text-sm font-bold text-gray-800">{user?.username}</p>
                  <p className="text-[10px] text-gray-500">Welcome back!</p>
               </div>
            </div>
          )}
          <button onClick={handleLogoutClick} className="flex items-center gap-2 px-3 py-2 bg-lp-orange text-white rounded-lg hover:bg-lp-orange-hover transition text-sm font-medium">
            <LogOut size={16} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      {/* --- MOBILE MENU DROPDOWN --- */}
      {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 w-full bg-white border-t border-gray-100 shadow-lg z-50">
              <div className="flex flex-col py-2">
                  {navItems.map((item) => (
                  <button
                      key={item}
                      onClick={() => handleNavigation(item.toLowerCase())}
                      className={`px-6 py-3 text-left w-full text-sm font-medium hover:bg-gray-50 transition-colors ${
                      activeSection === item.toLowerCase() ? 'text-lp-orange bg-orange-50 border-l-4 border-lp-orange' : 'text-gray-600'
                      }`}
                  >
                      {item}
                  </button>
                  ))}
              </div>
          </div>
      )}
    </nav>
  );
};

export default Header;