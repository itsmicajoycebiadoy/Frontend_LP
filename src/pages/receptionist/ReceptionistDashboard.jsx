import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../config/axios';
import Header from '../../components/Header'; // Ang updated na Header
import { useAuth } from '../AuthContext';

// Import Sub-Components
import ReservationOverview from './ReservationOverview';
import ReservationManagement from './ReservationManagement';
import WalkInBooking from './WalkInBooking';

const ReceptionistDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // State for Navigation (Default: 'overview')
  // Ito ang ipapasa natin sa Header
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  
  // Data states
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({
    pending: 0,
    confirmed: 0,
    rejected: 0,
    total: 0,
    today: 0
  });

  // Auth Check
  useEffect(() => {
    if (!user) {
      navigate('/', { replace: true });
    } else if (user.role !== 'receptionist') {
      navigate(`/${user.role}`, { replace: true });
    } else {
      fetchDashboardData();
    }
  }, [user, navigate]);

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

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden font-sans"> 
      
      {/* --- UPDATED HEADER IMPLEMENTATION --- */}
      {/* Ipapasa natin ang activeTab at setActiveTab para gumana ang buttons sa taas */}
      <Header 
        user={user} 
        onLogout={handleLogout} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />

      {/* Main Content Area */}
      <main className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
           <div className="flex justify-center items-center h-64">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
           </div>
        ) : (
          <>
            {/* Conditional Rendering base sa pinindot sa Header */}
            <div className="animate-in fade-in duration-300">
              {activeTab === 'overview' && (
                <ReservationOverview stats={stats} transactions={transactions} fetchData={fetchDashboardData} />
              )}
              
              {activeTab === 'reservations' && (
                <ReservationManagement transactions={transactions} fetchData={fetchDashboardData} />
              )}
              
              {activeTab === 'walk-in' && (
                <WalkInBooking fetchData={fetchDashboardData} />
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default ReceptionistDashboard;