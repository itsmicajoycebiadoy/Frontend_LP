import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../config/axios';
import Header from '../../components/Header';
import OwnerSales from './OwnerSales';
import OwnerFeedback from './OwnerFeedback'; 
import OwnerAmenities from './OwnerAmenities';
import { useAuth } from '../AuthContext';

const OwnerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('sales');
  const [loading, setLoading] = useState(false); 
  const [salesData, setSalesData] = useState([]);
  const [salesByService, setSalesByService] = useState([]);
  const [feedbackData, setFeedbackData] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const [chartType, setChartType] = useState('bar');

  useEffect(() => {
    if (!user) {
      navigate('/', { replace: true });
    } else if (user.role !== 'owner') {
      navigate(`/${user.role}`, { replace: true });
    }
  }, [user, navigate]);


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
  }, [activeTab, dateRange, user]); 


  const fetchSalesData = async () => {
    try {
      const response = await api.get("/api/owner/sales", {
        params: { startDate: dateRange.startDate, endDate: dateRange.endDate }
      });
      const sales = response.data.sales || [];
      setSalesData(sales);
      
      const grouped = sales.reduce((a, s) => { 
        a[s.serviceType] = (a[s.serviceType] || 0) + Number(s.amount || 0); 
        return a; 
      }, {});
      setSalesByService(Object.keys(grouped).map(key => ({ name: key, value: grouped[key] })));
    } catch (error) {
      console.error("Sales fetch error:", error);
    }
  };

  const fetchFeedbackData = async () => {
    try {
      const response = await api.get('/api/owner/feedback', {
        params: { startDate: dateRange.startDate, endDate: dateRange.endDate }
      });
      
      const data = response.data.feedback || response.data || [];
      setFeedbackData(Array.isArray(data) ? data : []);
      
    } catch (error) {
      console.error('Feedback fetch error:', error);
      setFeedbackData([]);
    }
  };

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
      
      <Header 
        user={user} 
        onLogout={handleLogout} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />

      <main className="w-full px-4 sm:px-6 lg:px-8 py-8">
        
        {loading && (
           <div className="flex justify-center py-10">
             <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
           </div>
        )}

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