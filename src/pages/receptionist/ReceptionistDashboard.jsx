import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../config/axios';
import { LogOut, Menu, X, Bell } from 'lucide-react';
import { useAuth } from '../AuthContext';
import ReservationOverview from './ReservationOverview';
import ReservationManagement from './ReservationManagement';
import WalkInBooking from './WalkInBooking';

const ReceptionistDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Data states
  const [transactions, setTransactions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({
    pending: 0,
    confirmed: 0,
    rejected: 0,
    total: 0,
    today: 0
  });

  useEffect(() => {
    if (!user) {
      navigate('/', { replace: true });
    } else if (user.role !== 'receptionist') {
      navigate(`/${user.role}`, { replace: true });
    }
    
    if (user && user.role === 'receptionist') {
      fetchDashboardData();
      const cleanup = setupNotificationPolling();
      return cleanup;
    }
  }, [user, navigate]);

  const setupNotificationPolling = () => {
    const interval = setInterval(() => {
      checkForNewReservations();
    }, 10000);
    return () => clearInterval(interval);
  };

  const checkForNewReservations = async () => {
    try {
      const response = await api.get('/api/transactions');
      const data = Array.isArray(response.data) 
        ? response.data 
        : (response.data.transactions || response.data.data || []);

      const newPending = data.filter(t => t.booking_status === 'Pending');
      
      if (newPending.length > stats.pending) {
        const newNotif = {
          id: Date.now(),
          message: 'New reservation received',
          time: new Date().toLocaleTimeString(),
          read: false
        };
        setNotifications(prev => [newNotif, ...prev]);
        // playNotificationSound(); // Uncomment if sound file exists
      }
    } catch (error) {
      console.error('Error checking notifications:', error);
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/transactions');
      const data = Array.isArray(response.data) 
        ? response.data 
        : (response.data.transactions || response.data.data || []);
      
      setTransactions(data);
      
      const today = new Date().toDateString();
      setStats({
        pending: data.filter(t => t.booking_status === 'Pending').length,
        confirmed: data.filter(t => t.booking_status === 'Confirmed').length,
        rejected: data.filter(t => t.booking_status === 'Rejected').length,
        total: data.length,
        today: data.filter(t => new Date(t.created_at).toDateString() === today).length
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutClick = () => setShowLogoutConfirm(true);
  const handleCancelLogout = () => setShowLogoutConfirm(false);
  
  const handleConfirmLogout = () => {
    logout();
    setShowLogoutConfirm(false);
    navigate('/');
  };

  const markNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-700">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden"> 
      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-xl shadow-2xl max-w-sm mx-4">
            <div className="text-center">
              <LogOut className="w-12 h-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Logout</h3>
              <p className="text-gray-600 mb-6">Are you sure you want to log out?</p>
              <div className="flex gap-3 justify-center">
                <button onClick={handleCancelLogout} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
                <button onClick={handleConfirmLogout} className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">Logout</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Dropdown */}
      {showNotifications && (
        <div className="fixed top-16 right-4 w-80 bg-white rounded-lg shadow-xl border z-50 max-h-96 overflow-y-auto">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-semibold">Notifications</h3>
            <button onClick={() => setShowNotifications(false)} className="text-gray-500 hover:text-gray-700"><X size={20} /></button>
          </div>
          <div className="divide-y">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No notifications</div>
            ) : (
              notifications.map(notif => (
                <div key={notif.id} className={`p-3 hover:bg-gray-50 ${!notif.read ? 'bg-blue-50' : ''}`}>
                  <p className="text-sm text-gray-900">{notif.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                </div>
              ))
            )}
          </div>
          {notifications.length > 0 && (
            <div className="p-3 border-t">
              <button onClick={markNotificationsAsRead} className="text-sm text-orange-500 hover:text-orange-600 w-full text-center">Mark all as read</button>
            </div>
          )}
        </div>
      )}

      {/* Header */}
      <header className="bg-white relative z-20 shadow-sm">
        {/* 👇 CHANGED: w-full px-6 (Full width, minimal padding) */}
        <div className="w-full px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <button className="lg:hidden text-gray-700 hover:text-orange-500" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-lg">LP</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg md:text-xl font-bold text-gray-900">La Piscina Resort</h1>
                <p className="text-xs md:text-sm text-gray-600">Receptionist Dashboard</p>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
              <button onClick={() => { setShowNotifications(!showNotifications); if (!showNotifications) markNotificationsAsRead(); }} className="relative p-2 text-gray-600 hover:text-orange-500 transition">
                <Bell size={20} />
                {notifications.filter(n => !n.read).length > 0 && <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>}
              </button>
              <div className="flex items-center space-x-2 text-gray-900">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">{user?.username?.charAt(0).toUpperCase()}</span>
                </div>
                <div className="hidden sm:flex flex-col">
                  <span className="font-semibold text-sm">{user?.username}</span>
                  <span className="text-xs text-gray-500">Receptionist</span>
                </div>
              </div>
              <button onClick={handleLogoutClick} className="flex items-center gap-2 px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition text-sm">
                <LogOut size={16} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-gray-100 relative z-10">
        {/* 👇 CHANGED: w-full px-6 */}
        <div className="w-full px-6">
          <div className="hidden lg:flex space-x-8">
            {['overview', 'reservations', 'walk-in'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize transition ${
                  activeTab === tab ? 'border-orange-500 text-orange-500' : 'border-transparent text-gray-700 hover:text-orange-500 hover:border-gray-300'
                }`}
              >
                {tab === 'walk-in' ? 'Walk-in Booking' : tab}
              </button>
            ))}
          </div>
          {isMobileMenuOpen && (
            <div className="lg:hidden absolute top-full left-0 w-full bg-white border-t border-gray-100 shadow-lg z-50">
              {['overview', 'reservations', 'walk-in'].map(tab => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); setIsMobileMenuOpen(false); }}
                  className={`py-3 px-6 text-left w-full text-sm font-medium capitalize transition ${
                    activeTab === tab ? 'text-orange-500 bg-orange-50 border-l-4 border-orange-500' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {tab === 'walk-in' ? 'Walk-in Booking' : tab}
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Main Content - Edge to Edge */}
      {/* 👇 CHANGED: w-full px-6 py-6 (Removed max-w-7xl) */}
      <main className="w-full px-6 py-6">
        {activeTab === 'overview' && <ReservationOverview stats={stats} transactions={transactions} fetchData={fetchDashboardData} />}
        {activeTab === 'reservations' && <ReservationManagement transactions={transactions} fetchData={fetchDashboardData} />}
        {activeTab === 'walk-in' && <WalkInBooking fetchData={fetchDashboardData} />}
      </main>
    </div>
  );
};

export default ReceptionistDashboard;