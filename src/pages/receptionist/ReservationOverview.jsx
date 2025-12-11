import React, { useState, useEffect, useMemo, useCallback } from 'react';
import api from '../../config/axios';
import { Clock, CheckCircle, XCircle, Calendar, Users, LogIn, LogOut, AlertCircle, Globe, Briefcase, Loader2 } from 'lucide-react';

// Helpers (nasa labas para hindi mag-recreate kada render)
const getStatusColor = (status) => {
  const statusLower = status?.toLowerCase() || '';
  switch (statusLower) {
    case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
    case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
    case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'checked-in': return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'checked-out': return 'bg-orange-100 text-orange-800 border-orange-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getBookingTypeBadge = (type) => {
  if (type === 'Walk-in') {
    return (
      <span className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-orange-100 text-orange-700 border border-orange-200">
        <Briefcase size={12} /> Walk-in
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-indigo-100 text-indigo-700 border border-indigo-200">
      <Globe size={12} /> Online
    </span>
  );
};

const ReservationOverview = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- FETCH DATA (Stable Function) ---
  const fetchTransactions = useCallback(async (isBackground = false) => {
    // Kung hindi background refresh, mag-loading state (initial load)
    if (!isBackground) setLoading(true);

    try {
      // Siguraduhin na '/api/transactions' ang tamang route mo base sa server.js
      const res = await api.get('/api/transactions');
      
      // FIX: Check kung nasaan ang array. 
      // Minsan nasa res.data lang, minsan nasa res.data.data, o res.data.transactions
      const validData = Array.isArray(res.data) 
        ? res.data 
        : (res.data.data || res.data.transactions || []);

      setTransactions(validData);

    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      // Tapusin ang loading state
      if (!isBackground) setLoading(false);
    }
  }, []);

  // --- AUTO REFRESH (3 Seconds) ---
  useEffect(() => {
    // 1. Initial Load
    fetchTransactions(false);

    // 2. Interval for Silent Refresh
    const intervalId = setInterval(() => {
      fetchTransactions(true);
    }, 3000);

    // 3. Cleanup function
    return () => clearInterval(intervalId);
  }, [fetchTransactions]);

  // --- STATS CALCULATION (Memoized) ---
  const { stats, recentTransactions } = useMemo(() => {
    const todayDate = new Date().toDateString();
    const isToday = (dateString) => new Date(dateString).toDateString() === todayDate;

    // Default values
    const defaultStats = {
      checkInsToday: 0, checkOutsToday: 0, pendingCount: 0,
      confirmedToday: 0, rejectedToday: 0, newBookingsCount: 0,
      onlineCountToday: 0, walkInCountToday: 0
    };

    if (!transactions || transactions.length === 0) {
      return { stats: defaultStats, recentTransactions: [] };
    }

    // 1. Calculations
    const checkInsToday = transactions.filter(t =>
      t.reservations?.some(r => new Date(r.check_in_date).toDateString() === todayDate && t.booking_status !== 'Cancelled')
    ).length;

    const checkOutsToday = transactions.filter(t =>
      t.reservations?.some(r => new Date(r.check_out_date).toDateString() === todayDate && t.booking_status !== 'Cancelled')
    ).length;

    const pendingCount = transactions.filter(t => t.booking_status === 'Pending').length;
    const confirmedToday = transactions.filter(t => isToday(t.created_at) && t.booking_status === 'Confirmed').length;
    const rejectedToday = transactions.filter(t => isToday(t.created_at) && t.booking_status === 'Cancelled').length;

    const newBookingsTodayList = transactions.filter(t => isToday(t.created_at));
    const newBookingsCount = newBookingsTodayList.length;
    const onlineCountToday = newBookingsTodayList.filter(t => t.booking_type !== 'Walk-in').length;
    const walkInCountToday = newBookingsTodayList.filter(t => t.booking_type === 'Walk-in').length;

    // 2. Recent List
    const recent = transactions
      .filter(t => isToday(t.created_at) || t.booking_status === 'Pending')
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);

    return {
      stats: {
        checkInsToday, checkOutsToday, pendingCount, confirmedToday,
        rejectedToday, newBookingsCount, onlineCountToday, walkInCountToday
      },
      recentTransactions: recent
    };
  }, [transactions]);

  // --- LOADING STATE ---
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-slate-400" size={32} />
      </div>
    );
  }

  // --- MAIN UI ---
  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
          <div><h1 className="text-2xl font-bold text-gray-900">Reservation Overview</h1><p className="text-sm text-gray-500">Real time Dashboard.</p></div>
        </div>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Check-ins Today */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Check-ins Today</p>
              <p className="text-3xl font-bold text-blue-600">{stats.checkInsToday}</p>
              <p className="text-xs text-gray-500 mt-1">Arriving guests</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <LogIn className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        {/* Check-outs Today */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Check-outs Today</p>
              <p className="text-3xl font-bold text-orange-600">{stats.checkOutsToday}</p>
              <p className="text-xs text-gray-500 mt-1">Departing guests</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <LogOut className="text-orange-600" size={24} />
            </div>
          </div>
        </div>

        {/* Pending (ALL TIME) */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pending (Action Required)</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.pendingCount}</p>
              <p className="text-xs text-gray-500 mt-1">Awaiting approval</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <Clock className="text-yellow-600" size={24} />
            </div>
          </div>
        </div>
        
        {/* Confirmed (TODAY ONLY) */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Confirmed Today</p>
              <p className="text-3xl font-bold text-green-600">{stats.confirmedToday}</p>
              <p className="text-xs text-gray-500 mt-1">New active bookings</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="text-green-600" size={24} />
            </div>
          </div>
        </div>
        
        {/* Cancelled/Rejected (TODAY ONLY) */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Cancelled Today</p>
              <p className="text-3xl font-bold text-red-600">{stats.rejectedToday}</p>
              <p className="text-xs text-gray-500 mt-1">Declined/Cancelled today</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="text-red-600" size={24} />
            </div>
          </div>
        </div>
        
        {/* New Bookings (TODAY ONLY) */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm text-gray-600 mb-1">New Bookings Today</p>
              <p className="text-3xl font-bold text-indigo-600">{stats.newBookingsCount}</p>
            </div>
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
              <Calendar className="text-indigo-600" size={24} />
            </div>
          </div>
          {/* Breakdown of Online vs Walk-in */}
          <div className="flex items-center gap-2 text-xs pt-2 border-t border-gray-50">
             <span className="flex items-center gap-1 text-indigo-700 bg-indigo-50 px-2 py-1 rounded">
                <Globe size={10} /> {stats.onlineCountToday} Online
             </span>
             <span className="flex items-center gap-1 text-orange-700 bg-orange-50 px-2 py-1 rounded">
                <Briefcase size={10} /> {stats.walkInCountToday} Walk-in
             </span>
          </div>
        </div>
        
        {/* Total Reservations (TODAY ONLY) */}
        <div className="col-span-1 sm:col-span-2 lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition">
          <div className="flex items-center justify-between h-full">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Transactions Today</p>
              <p className="text-3xl font-bold text-gray-900">{stats.newBookingsCount}</p>
              <p className="text-xs text-gray-500 mt-1">Processed today</p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <Users className="text-gray-900" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Reservations */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
          <p className="text-sm text-gray-600 mt-1">Pending requests & Today's bookings</p>
        </div>
        
        <div className="divide-y divide-gray-100">
          {recentTransactions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <AlertCircle className="mx-auto mb-2" size={48} />
              <p>No activity for today</p>
            </div>
          ) : (
            recentTransactions.map(transaction => (
              <div key={transaction.id} className="p-4 hover:bg-gray-50 transition">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-gray-900">{transaction.customer_name}</p>
                      
                      {/* Status Badge */}
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(transaction.booking_status)}`}>
                        {transaction.booking_status}
                      </span>

                      {/* Booking Type Badge */}
                      {getBookingTypeBadge(transaction.booking_type)}
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:gap-4">
                        <p className="text-sm text-gray-600">
                        Ref: {transaction.transaction_ref}
                        </p>
                        <p className="text-sm text-gray-600">
                        {transaction.contact_number}
                        </p>
                    </div>
                    
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(transaction.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-gray-900">₱{transaction.total_amount.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
    </div>
  );
};

export default ReservationOverview;