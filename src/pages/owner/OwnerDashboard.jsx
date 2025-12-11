import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../config/axios';
import Header from '../../components/Header';
import OwnerSales from './OwnerSales';
import OwnerFeedback from './OwnerFeedback'; // Sisiguraduhin nating tama ang import
import OwnerAmenities from './OwnerAmenities';
import { useAuth } from '../AuthContext';

const OwnerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // --- STATE MANAGEMENT ---
  const [activeTab, setActiveTab] = useState('sales');
  const [loading, setLoading] = useState(false); // Default to false initially

  // Data Containers
  const [salesData, setSalesData] = useState([]);
  const [salesByService, setSalesByService] = useState([]);
  const [feedbackData, setFeedbackData] = useState([]); // Dito ilalagay ang feedback
  const [amenities, setAmenities] = useState([]);

  // Shared Date Range (Para synchronized ang date sa lahat ng tabs)
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const [chartType, setChartType] = useState('bar');

  // --- AUTH CHECK ---
  useEffect(() => {
    if (!user) {
      navigate('/', { replace: true });
    } else if (user.role !== 'owner') {
      navigate(`/${user.role}`, { replace: true });
    }
  }, [user, navigate]);

  // --- DATA FETCHING ROUTER ---
  // Magfe-fetch lang tayo base sa kung anong Tab ang nakabukas
  useEffect(() => {
    if (user && user.role === 'owner') {
      const loadData = async () => {
        setLoading(true);
        try {
          if (activeTab === 'sales') await fetchSalesData();
          if (activeTab === 'feedback') await fetchFeedbackData();
          if (activeTab === 'amenities') await fetchAmenities();
        } catch (error) {
          console.error("Dashboard Load Error:", error);
        } finally {
          setLoading(false);
        }
      };
      loadData();
    }
  }, [activeTab, dateRange, user]); // Refetch kapag nagpalit ng Tab o Date

  // 1. GET SALES
  const fetchSalesData = async () => {
    try {
      const response = await api.get("/api/owner/sales", {
        params: { startDate: dateRange.startDate, endDate: dateRange.endDate }
      });
      const sales = response.data.sales || [];
      setSalesData(sales);
      
      // Process Data for Charts
      const grouped = sales.reduce((a, s) => { 
        a[s.serviceType] = (a[s.serviceType] || 0) + Number(s.amount || 0); 
        return a; 
      }, {});
      setSalesByService(Object.keys(grouped).map(key => ({ name: key, value: grouped[key] })));
    } catch (error) {
      console.error("Sales fetch error:", error);
    }
  };

  // 2. GET FEEDBACK (Ito ang fix para sa Owner Feedback)
  const fetchFeedbackData = async () => {
    try {
      // Tumatawag sa /api/owner/feedback base sa server.js setup mo
      const response = await api.get('/api/owner/feedback', {
        params: { startDate: dateRange.startDate, endDate: dateRange.endDate }
      });
      
      // Support different backend response structures
      const data = response.data.feedback || response.data || [];
      setFeedbackData(Array.isArray(data) ? data : []);
      
    } catch (error) {
      console.error('Feedback fetch error:', error);
      setFeedbackData([]);
    }
  };

  // 3. GET AMENITIES
  const fetchAmenities = async () => {
    try {
      const response = await api.get('/api/owner/amenities');
      setAmenities(response.data.amenities || []);
    } catch (error) {
      console.error('Amenities fetch error:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      
      {/* HEADER: Pag clinick ang Feedback, mag-uupdate ang activeTab state */}
      <Header 
        user={user} 
        onLogout={handleLogout} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />

      <main className="w-full px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Loading Indicator */}
        {loading && (
           <div className="flex justify-center py-10">
             <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
           </div>
        )}

        {/* Render Active Tab */}
        {!loading && (
          <>
            {activeTab === 'sales' && (
              <OwnerSales 
                salesData={salesData}
                salesByService={salesByService}
                dateRange={dateRange}
                setDateRange={setDateRange}
                chartType={chartType}
                setChartType={setChartType}
              />
            )}
            
            {/* DITO IPAPASA ANG DATA: feedbackData papunta sa Component */}
            {activeTab === 'feedback' && (
              <OwnerFeedback 
                feedbackData={feedbackData} 
                dateRange={dateRange}
                setDateRange={setDateRange}
              />
            )}
            
            {activeTab === 'amenities' && (
              <OwnerAmenities 
                amenities={amenities}
                fetchAmenities={fetchAmenities}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default OwnerDashboard;