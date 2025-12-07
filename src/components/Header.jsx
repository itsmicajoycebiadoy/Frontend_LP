import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, Bell, CheckCircle, XCircle, Clock, Calendar, AlertCircle } from 'lucide-react';

const Header = ({ user, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Extract active section from current path
  const getActiveSection = () => {
    const path = location.pathname;
    if (path === '/customer') return 'home';
    if (path.includes('/amenities')) return 'amenities';
    if (path.includes('/reservations')) return 'reservations';
    if (path.includes('/feedback')) return 'feedback';
    if (path.includes('/contact')) return 'contact';
    return 'home';
  };

  const activeSection = getActiveSection();

  // Fetch notifications - works anywhere in the app
  const fetchNotifications = async () => {
    if (!user) return;
    
    try {
      setLoadingNotifications(true);
      const userId = user?.id || user?._id;
      if (!userId) {
        console.log('No user ID found for notifications');
        return;
      }

      // Get user's reservations through transactions
      const response = await fetch(
        `http://localhost:5000/api/transactions/user/${userId}/reservations`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.reservations) {
          
          // Get saved reservation states from localStorage
          const savedReservations = JSON.parse(localStorage.getItem(`saved_reservations_${userId}`) || '[]');
          const existingNotifs = JSON.parse(localStorage.getItem(`user_notifications_${userId}`) || '[]');
          
          // Check for status changes
          const newNotifs = [];
          result.reservations.forEach(reservation => {
            const savedRes = savedReservations.find(r => 
              r.id === reservation.id && r.transaction_id === reservation.transaction_id
            );
            
            // If status changed (and not first time seeing it)
            if (savedRes && savedRes.status !== reservation.status) {
              let message = '';
              let type = 'reservation_update';
              
              switch(reservation.status) {
                case 'Pending':
                  message = `Reservation for "${reservation.amenity_name}" is pending`;
                  type = 'reservation_pending';
                  break;
                case 'Approved':
                  message = `✓ Reservation for "${reservation.amenity_name}" approved!`;
                  type = 'reservation_approved';
                  break;
                case 'Cancelled':
                  message = `✗ Reservation for "${reservation.amenity_name}" cancelled`;
                  type = 'reservation_cancelled';
                  break;
                case 'Completed':
                  message = `✓ Stay at "${reservation.amenity_name}" completed`;
                  type = 'reservation_completed';
                  break;
                default:
                  message = `Update for "${reservation.amenity_name}"`;
              }
              
              newNotifs.push({
                id: `notif_${reservation.id}_${Date.now()}`,
                type: type,
                message: message,
                amenity_name: reservation.amenity_name,
                status: reservation.status,
                check_in_date: reservation.check_in_date,
                transaction_id: reservation.transaction_id,
                created_at: new Date().toISOString(),
                isNew: true
              });
            }
          });
          
          // Save current states
          localStorage.setItem(`saved_reservations_${userId}`, JSON.stringify(
            result.reservations.map(r => ({ 
              id: r.id, 
              transaction_id: r.transaction_id, 
              status: r.status 
            }))
          ));
          
          // Combine with existing notifications
          const allNotifs = [...newNotifs, ...existingNotifs];
          const uniqueNotifs = Array.from(new Map(allNotifs.map(n => [n.id, n])).values())
            .slice(0, 20); // Keep only last 20
          
          setNotifications(uniqueNotifs);
          localStorage.setItem(`user_notifications_${userId}`, JSON.stringify(uniqueNotifs));
        }
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  // Initial fetch and setup polling
  useEffect(() => {
    if (user) {
      fetchNotifications(); // Initial fetch
      
      // Set up polling every 60 seconds
      const interval = setInterval(fetchNotifications, 60000);
      
      // Cleanup
      return () => {
        clearInterval(interval);
      };
    } else {
      setNotifications([]);
    }
  }, [user]);

  // Function to get icon based on notification type
  const getNotificationIcon = (type) => {
    switch(type) {
      case 'reservation_pending':
        return { icon: Clock, color: 'text-blue-500', bgColor: 'bg-blue-50' };
      case 'reservation_approved':
        return { icon: CheckCircle, color: 'text-green-500', bgColor: 'bg-green-50' };
      case 'reservation_cancelled':
        return { icon: XCircle, color: 'text-red-500', bgColor: 'bg-red-50' };
      case 'reservation_completed':
        return { icon: Calendar, color: 'text-purple-500', bgColor: 'bg-purple-50' };
      default:
        return { icon: AlertCircle, color: 'text-orange-500', bgColor: 'bg-orange-50' };
    }
  };

  // Format time ago
  const formatTimeAgo = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInSeconds = Math.floor((now - date) / 1000);

      if (diffInSeconds < 60) return 'just now';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
      if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
      
      // Format date if older than week
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (e) {
      return 'recently';
    }
  };

  // Mark notification as read
  const markAsRead = (notificationId) => {
    const updatedNotifications = notifications.map(n => 
      n.id === notificationId ? { ...n, isNew: false } : n
    );
    setNotifications(updatedNotifications);
    
    const userId = user?.id || user?._id;
    if (userId) {
      localStorage.setItem(`user_notifications_${userId}`, JSON.stringify(updatedNotifications));
    }
  };

  // Mark all as read
  const markAllAsRead = () => {
    const updatedNotifications = notifications.map(n => ({ ...n, isNew: false }));
    setNotifications(updatedNotifications);
    
    const userId = user?.id || user?._id;
    if (userId) {
      localStorage.setItem(`user_notifications_${userId}`, JSON.stringify(updatedNotifications));
    }
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
    
    const userId = user?.id || user?._id;
    if (userId) {
      localStorage.removeItem(`user_notifications_${userId}`);
    }
  };

  // Count unread notifications
  const unreadCount = notifications.filter(n => n.isNew).length;
  const totalCount = notifications.length;

  const handleNavigation = (section) => {
    setIsMobileMenuOpen(false);
    
    const currentPath = location.pathname;
    const targetPaths = {
      home: ['/customer'],
      amenities: ['/amenities'],
      reservations: ['/reservations'],
      feedback: ['/feedback'],
      contact: ['/contact']
    };

    if (targetPaths[section]?.includes(currentPath)) {
      return;
    }
    
    switch(section) {
      case 'home':
        if (currentPath !== '/customer') {
          navigate('/customer');
        }
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
        if (currentPath !== '/customer') {
          navigate('/customer');
        }
    }
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    setIsMobileMenuOpen(false);
    setShowNotifications(false);
    
    // Check if user has unsaved cart items
    const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (currentCart.length > 0 && user) {
      const userId = user.id || user._id || user.userId || user.user_id;
      if (userId) {
        const userCartKey = `cart_${userId}`;
        localStorage.setItem(userCartKey, JSON.stringify(currentCart));
      }
    }
    
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem('cart');
      navigate('/');
    }
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const navItems = ['Home', 'Amenities', 'Reservations', 'Feedback', 'Contact'];

  return (
    <>
      <nav className="bg-white shadow-sm relative z-20 flex-shrink-0 w-full">
        <div className="mx-auto px-3 sm:px-4 lg:px-8 flex justify-between items-center w-full">
          
          {/* LEFT: Hamburger, Logo & Resort Name (Visible on all sizes) */}
          <div className="flex items-center gap-2">
            {/* Hamburger Menu Button (Left side, next to logo) */}
            <button 
              className="lg:hidden text-gray-600 hover:text-lp-orange transition-colors mr-1"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Logo - Visible on all sizes */}
            <div className="flex items-center justify-center">
              <img 
                src="/images/Lp.png" 
                alt="La Piscina IRMS Logo"
                className="w-17 h-17 md:w-25 md:h-20 object-contain"
              />
            </div>
            
            {/* Resort Name - Visible on all sizes, full text always */}
            <span className="text-base md:text-lg lg:text-xl text-lp-dark font-bold font-family-header tracking-tight">
              La Piscina De Conception Resort
            </span>
          </div>

          {/* CENTER: Desktop Navigation Links */}
          <div className="hidden lg:flex space-x-8">
            {navItems.map((item) => (
              <button
                key={item}
                onClick={() => handleNavigation(item.toLowerCase())}
                className={`text-sm font-sm transition-colors ${
                  activeSection === item.toLowerCase() ? 'text-lp-orange border-b-2 border-lp-orange pb-1' : 'text-gray-600 hover:text-lp-orange'
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          {/* RIGHT: User Info, Notifications, and Desktop Logout */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* User Name - Visible only on desktop (lg and up) */}
            {user && (
              <div className="hidden lg:block text-right mr-3">
                <p className="text-sm font-bold text-gray-800 truncate max-w-[100px]">
                  Hello, {user?.username || user?.name || 'User'}!
                </p>
              </div>
            )}

            {/* Notification Bell - Always on right side */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-gray-600 hover:text-lp-orange transition-colors relative"
              >
                <Bell size={20} />
                {/* Show badge for unread notifications */}
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[500px] overflow-hidden">
                  <div className="p-4 border-b border-gray-100 bg-gray-50">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-bold text-gray-800 text-lg">Notifications</h3>
                        <p className="text-xs text-gray-500 mt-1">
                          {unreadCount} unread • {totalCount} total
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-xs text-lp-orange hover:text-lp-orange-hover font-medium px-3 py-1 hover:bg-orange-50 rounded"
                          >
                            Mark all read
                          </button>
                        )}
                        {totalCount > 0 && (
                          <button
                            onClick={clearAllNotifications}
                            className="text-xs text-gray-500 hover:text-red-500 font-medium px-3 py-1 hover:bg-gray-100 rounded"
                          >
                            Clear all
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="max-h-72 overflow-y-auto">
                    {loadingNotifications ? (
                      <div className="p-6 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-lp-orange mb-2"></div>
                        <p className="text-sm text-gray-500">Checking for updates...</p>
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <Bell size={32} className="mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-500 font-medium">No notifications yet</p>
                        <p className="text-xs text-gray-400 mt-1">Reservation updates will appear here</p>
                      </div>
                    ) : (
                      notifications.map((notification) => {
                        const { icon: Icon, color, bgColor } = getNotificationIcon(notification.type);
                        return (
                          <div 
                            key={notification.id} 
                            className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${notification.isNew ? 'bg-blue-50' : ''}`}
                            onClick={() => markAsRead(notification.id)}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${bgColor}`}>
                                <Icon size={18} className={color} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-800 font-medium leading-tight">
                                  {notification.message}
                                </p>
                                <div className="flex items-center justify-between mt-2">
                                  <span className={`text-xs px-2 py-1 rounded-full ${
                                    notification.type.includes('approved') ? 'bg-green-100 text-green-800' :
                                    notification.type.includes('pending') ? 'bg-blue-100 text-blue-800' :
                                    notification.type.includes('cancelled') ? 'bg-red-100 text-red-800' :
                                    'bg-purple-100 text-purple-800'
                                  }`}>
                                    {notification.type.replace('reservation_', '')}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    {notification.isNew && (
                                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                    )}
                                    <p className="text-xs text-gray-500">
                                      {formatTimeAgo(notification.created_at)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                  
                  {totalCount > 0 && (
                    <div className="p-3 border-t border-gray-100 text-center bg-gray-50">
                      <button 
                        onClick={() => {
                          setShowNotifications(false);
                          navigate('/reservations');
                        }}
                        className="text-sm text-lp-orange hover:text-lp-orange-hover font-medium flex items-center justify-center gap-1 mx-auto"
                      >
                        <Calendar size={14} />
                        <span>View All Reservations</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Desktop Logout Button (Hidden on Mobile) */}
            <button 
              onClick={handleLogoutClick} 
              className="hidden lg:flex items-center gap-2 px-3 py-2 bg-lp-orange text-white rounded-lg hover:bg-lp-orange-hover transition text-sm font-medium ml-2"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* MOBILE MENU DROPDOWN - Shows only when hamburger is clicked */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 w-full bg-white border-t border-gray-100 shadow-lg z-50">
            <div className="flex flex-col py-1">
              {/* User Info Section in Mobile Menu - Text only, no icon */}
              {user && (
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                  <p className="font-bold text-gray-800 text-sm">
                    Hello, {user?.username || user?.name || 'User'}!
                  </p>
                </div>
              )}

              {/* Navigation Items */}
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
              
              {/* Logout in Mobile Menu */}
              <button
                onClick={handleLogoutClick}
                className="px-6 py-3 text-left w-full text-sm font-medium text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100 mt-1 flex items-center gap-2"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Notification Backdrop (when open) */}
      {showNotifications && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowNotifications(false)}
        />
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogOut size={24} className="text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Confirm Logout</h3>
              <p className="text-gray-600 text-sm mb-1">
                Are you sure you want to logout?
              </p>
              {user && (
                <p className="text-xs text-gray-500">
                  Your cart will be saved for next time.
                </p>
              )}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={cancelLogout}
                className="flex-1 py-2.5 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 py-2.5 px-4 bg-lp-orange text-white rounded-lg hover:bg-lp-orange-hover transition-colors font-medium"
              >
                Yes, Logout
              </button>
              
            </div>
          </div>
        </div>
      )}
      
    </>
  );
};

export default Header;