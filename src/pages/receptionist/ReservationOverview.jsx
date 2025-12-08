import React from 'react';
import { Clock, CheckCircle, XCircle, Calendar, Users, LogIn, LogOut, AlertCircle, Globe, Briefcase } from 'lucide-react';

const ReservationOverview = ({ transactions }) => {
  // --- DATE HELPERS ---
  const todayDate = new Date().toDateString();
  const isToday = (dateString) => new Date(dateString).toDateString() === todayDate;

  // --- STATS CALCULATIONS ---

  // 1. Check-ins Today (Arriving Today)
  const checkInsToday = transactions.filter(t =>
    t.reservations?.some(r => new Date(r.check_in_date).toDateString() === todayDate && t.booking_status !== 'Cancelled')
  ).length;

  // 2. Check-outs Today (Departing Today)
  const checkOutsToday = transactions.filter(t =>
    t.reservations?.some(r => new Date(r.check_out_date).toDateString() === todayDate && t.booking_status !== 'Cancelled')
  ).length;

  // 3. PENDING (ALL TIME) - Para makita mo lahat ng kailangan i-approve kahit kagabi pa nag-book
  const pendingCount = transactions.filter(t => t.booking_status === 'Pending').length;

  // 4. Confirmed (TODAY ONLY) - Mga na-confirm na pumasok ngayong araw
  const confirmedToday = transactions.filter(t => isToday(t.created_at) && t.booking_status === 'Confirmed').length;

  // 5. Cancelled/Rejected (TODAY ONLY)
  // ✅ FIX: Ginamit ang 'Cancelled' dahil ito ang status sa database mo
  const rejectedToday = transactions.filter(t => isToday(t.created_at) && t.booking_status === 'Cancelled').length;

  // 6. New Bookings Breakdown (TODAY ONLY)
  const newBookingsTodayList = transactions.filter(t => isToday(t.created_at));
  const newBookingsCount = newBookingsTodayList.length;
  const onlineCountToday = newBookingsTodayList.filter(t => t.booking_type !== 'Walk-in').length;
  const walkInCountToday = newBookingsTodayList.filter(t => t.booking_type === 'Walk-in').length;

  // --- RECENT LIST LOGIC ---
  const filteredTransactions = transactions
    .filter(t => isToday(t.created_at) || t.booking_status === 'Pending')
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); // Sort newest first

  const recentTransactions = filteredTransactions.slice(0, 5);


  // --- HELPER FUNCTIONS FOR UI ---
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

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Check-ins Today */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Check-ins Today</p>
              <p className="text-3xl font-bold text-blue-600">{checkInsToday}</p>
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
              <p className="text-3xl font-bold text-orange-600">{checkOutsToday}</p>
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
              <p className="text-3xl font-bold text-yellow-600">{pendingCount}</p>
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
              <p className="text-3xl font-bold text-green-600">{confirmedToday}</p>
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
              {/* Updated Title to match Data */}
              <p className="text-sm text-gray-600 mb-1">Cancelled Today</p>
              <p className="text-3xl font-bold text-red-600">{rejectedToday}</p>
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
              <p className="text-3xl font-bold text-indigo-600">{newBookingsCount}</p>
            </div>
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
              <Calendar className="text-indigo-600" size={24} />
            </div>
          </div>
          {/* Breakdown of Online vs Walk-in */}
          <div className="flex items-center gap-2 text-xs pt-2 border-t border-gray-50">
             <span className="flex items-center gap-1 text-indigo-700 bg-indigo-50 px-2 py-1 rounded">
                <Globe size={10} /> {onlineCountToday} Online
             </span>
             <span className="flex items-center gap-1 text-orange-700 bg-orange-50 px-2 py-1 rounded">
                <Briefcase size={10} /> {walkInCountToday} Walk-in
             </span>
          </div>
        </div>
        
        {/* Total Reservations (TODAY ONLY) */}
        <div className="col-span-1 sm:col-span-2 lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition">
          <div className="flex items-center justify-between h-full">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Transactions Today</p>
              <p className="text-3xl font-bold text-gray-900">{newBookingsCount}</p>
              <p className="text-xs text-gray-500 mt-1">Processed today</p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <Users className="text-gray-900" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Reservations (Pending + Today's Only) */}
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