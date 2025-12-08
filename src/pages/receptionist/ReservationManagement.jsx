import React, { useState, useEffect } from 'react';
import api from '../../config/axios';
import TransactionFilters from '../../components/reservationmanagementcomponents/TransactionFilters';
import TransactionTable from '../../components/reservationmanagementcomponents/TransactionTable';
import { ActionModal, ProofModal, DetailModal, CheckInModal, ExtendModal } from '../../components/reservationmanagementcomponents/TransactionModals';
import { Calendar, Archive, RefreshCw } from 'lucide-react';

const ReservationManagement = ({ transactions, fetchData }) => {
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [viewMode, setViewMode] = useState('active'); 
  
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [modalState, setModalState] = useState({ detail: false, action: false, proof: false, checkIn: false, extend: false, viewType: 'amenities' });
  const [actionType, setActionType] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageErrors, setImageErrors] = useState({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  // REMOVED AUTO-REFRESH useEffect
  
  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  useEffect(() => {
    let filtered = [...transactions].filter(t => t.booking_type?.toLowerCase() === 'online');

    if (viewMode === 'active') {
      filtered = filtered.filter(t => ['Pending', 'Confirmed', 'Checked-In'].includes(t.booking_status));
    } else {
      filtered = filtered.filter(t => ['Completed', 'Cancelled', 'Rejected'].includes(t.booking_status));
    }

    if (statusFilter !== 'All') {
      filtered = filtered.filter(t => t.booking_status.toLowerCase() === statusFilter.toLowerCase());
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(t => 
        t.transaction_ref.toLowerCase().includes(q) || 
        t.customer_name.toLowerCase().includes(q) || 
        t.contact_number.includes(q)
      );
    }

    // SMART SORTING
    filtered.sort((a, b) => {
      const createdA = new Date(a.created_at);
      const createdB = new Date(b.created_at);
      const checkInA = new Date(a.reservations?.[0]?.check_in_date || a.created_at);
      const checkInB = new Date(b.reservations?.[0]?.check_in_date || b.created_at);

      if (statusFilter === 'Confirmed') return checkInA - checkInB; 
      if (statusFilter === 'Pending') return createdB - createdA; 
      return createdB - createdA;
    });

    setFilteredTransactions(filtered);
  }, [transactions, searchQuery, statusFilter, viewMode]);

  // --- HANDLERS ---
  const handleAction = async (action, transactionToUpdate = null) => {
    // Gamitin ang transactionToUpdate kung meron (galing ProofModal),
    // kung wala, gamitin ang selectedTransaction (galing ActionModal/Table).
    const targetTransaction = transactionToUpdate || selectedTransaction;

    if (!targetTransaction) {
        console.error("No transaction selected for action");
        return;
    }

    setLoading(true);
    try {
      await api.put(`/api/transactions/${targetTransaction.id}/status`, { booking_status: action });
      await fetchData();
      
      // Close ALL modals properly
      setModalState({ detail: false, action: false, proof: false, checkIn: false, extend: false });
      setSelectedTransaction(null);
      
      // Optional: Add success alert/toast here
    } catch (error) { 
      console.error(error); 
      alert('Failed to update status.'); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    if (newStatus === 'Checked-In') {
      setSelectedTransaction(transactions.find(t => t.id === id));
      setModalState(prev => ({ ...prev, checkIn: true }));
      return;
    }
    if(!window.confirm(`Update status to ${newStatus}?`)) return;
    try { await api.put(`/api/transactions/${id}/status`, { booking_status: newStatus }); await fetchData(); } catch (error) { alert("Failed to update status."); }
  };

  const handleCheckIn = async () => {
    if (!selectedTransaction) return;
    setLoading(true);
    try {
      await api.put(`/api/transactions/${selectedTransaction.id}/status`, { booking_status: 'Checked-In', balance: 0, payment_status: 'Fully Paid' });
      await fetchData();
      setModalState(prev => ({ ...prev, checkIn: false }));
      setSelectedTransaction(null);
    } catch (error) { alert('Failed to check in customer.'); } finally { setLoading(false); }
  };

  const handleExtendClick = (transaction) => {
    setSelectedTransaction(transaction);
    setModalState(prev => ({ ...prev, extend: true }));
  };

  const handleViewDetails = (transaction, type = 'amenities') => {
    setSelectedTransaction(transaction);
    setModalState(prev => ({ ...prev, detail: true, viewType: type }));
  };

  const handleExtendBooking = async (extensionData) => {
    if (!selectedTransaction) return;
    const reservations = selectedTransaction.reservations;
    if (!reservations || reservations.length === 0) { alert("No reservation found."); return; }
    const targetReservationId = reservations[0].id;

    if (!window.confirm(`Extend booking by ${extensionData.extensionValue} hours?\nAdditional Fee: ₱${extensionData.additionalAmount}`)) return;

    setLoading(true);
    try {
      const formattedDate = extensionData.newCheckoutDate.replace('T', ' ').slice(0, 19); 
      await api.put(`/api/reservations/${targetReservationId}/extend`, {
        new_check_out_date: formattedDate,
        additional_cost: extensionData.additionalAmount,
        additional_hours: extensionData.extensionValue, 
        extension_type: 'Hourly',
        extended_items: extensionData.extended_items
      });
      alert(`Extended successfully! Added charge: ₱${extensionData.additionalAmount.toLocaleString()}`);
      await fetchData();
      setModalState(prev => ({ ...prev, extend: false }));
      setSelectedTransaction(null);
    } catch (error) { 
      console.error(error); 
      alert('Error extending booking: ' + (error.response?.data?.message || error.message)); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleImageError = (id) => setImageErrors(prev => ({ ...prev, [id]: true }));
  const retryImageLoad = (id) => setImageErrors(prev => { const n = { ...prev }; delete n[id]; return n; });

  return (
    <div className="space-y-6 w-full mx-auto pb-20 px-4 sm:px-6">
      
      {/* HEADER & TABS */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Online Reservations</h1>
            <p className="text-gray-500 text-sm">
              Manage website bookings & proof of payments.
            </p>
          </div>
          
          <div className="flex gap-2 w-full md:w-auto">
            <button 
              onClick={handleManualRefresh}
              className={`p-2.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-600 transition-all ${isRefreshing ? 'animate-spin text-blue-600 border-blue-300' : ''}`}
              title="Refresh Data"
              disabled={isRefreshing}
            >
              <RefreshCw size={20}/>
            </button>

            <div className="flex bg-gray-100 p-1 rounded-xl flex-1 md:flex-none">
              <button 
                onClick={() => { setViewMode('active'); setStatusFilter('All'); }} 
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${viewMode === 'active' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <Calendar size={16}/> Active
              </button>
              <button 
                onClick={() => { setViewMode('history'); setStatusFilter('All'); }} 
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${viewMode === 'history' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <Archive size={16}/> History
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <TransactionFilters 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        statusFilter={statusFilter} 
        setStatusFilter={setStatusFilter} 
        viewMode={viewMode} 
      />
      
      <TransactionTable 
        transactions={filteredTransactions}
        onViewProof={(t) => { setSelectedTransaction(t); retryImageLoad(t.id); setModalState(prev => ({ ...prev, proof: true })); }}
        onViewDetails={handleViewDetails}
        onAction={(type, t) => { setSelectedTransaction(t); setActionType(type); setModalState(prev => ({ ...prev, action: true })); }}
        onStatusUpdate={handleStatusUpdate}
        onExtendBooking={handleExtendClick}
      />
      
      <ActionModal 
        isOpen={modalState.action} 
        type={actionType} 
        transaction={selectedTransaction} 
        loading={loading} 
        onClose={() => setModalState(prev => ({ ...prev, action: false }))} 
        onConfirm={() => handleAction(actionType)} 
      />
      
      <ProofModal 
        isOpen={modalState.proof} 
        transaction={selectedTransaction} 
        imageErrors={imageErrors} 
        loading={loading} 
        onClose={() => setModalState(prev => ({ ...prev, proof: false }))} 
        onRetryLoad={retryImageLoad} 
        onError={handleImageError} 
        onAction={handleAction} 
      />
      
      <DetailModal 
        isOpen={modalState.detail} 
        transaction={selectedTransaction} 
        viewType={modalState.viewType} 
        onClose={() => setModalState(prev => ({ ...prev, detail: false }))} 
        onAction={(type) => { setActionType(type); setModalState(prev => ({ detail: false, action: true, proof: false })); }} 
      />
      
      <CheckInModal 
        isOpen={modalState.checkIn} 
        transaction={selectedTransaction} 
        loading={loading} 
        onClose={() => setModalState(prev => ({ ...prev, checkIn: false }))} 
        onConfirm={handleCheckIn} 
      />
      
      <ExtendModal 
        isOpen={modalState.extend} 
        transaction={selectedTransaction} 
        loading={loading} 
        onClose={() => setModalState(prev => ({ ...prev, extend: false }))} 
        onExtend={handleExtendBooking} 
      />
    </div>
  );
};

export default ReservationManagement;