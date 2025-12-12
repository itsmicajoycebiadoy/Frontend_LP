import React, { useState } from 'react';
import api from '../../config/axios';
import TransactionFilters from '../../components/OnlineReservationComponent/TransactionFilters';
import TransactionTable from '../../components/OnlineReservationComponent/TransactionTable';
import { ActionModal, ProofModal, DetailModal, CheckInModal, ExtendModal } from '../../components/OnlineReservationComponent/TransactionModals';

const ReservationManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [viewMode, setViewMode] = useState('active'); 
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [modalState, setModalState] = useState({ 
    detail: false, 
    action: false, 
    proof: false, 
    checkIn: false, 
    extend: false, 
    viewType: 'amenities' 
  });
  const [actionType, setActionType] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageErrors, setImageErrors] = useState({});
  const handleAction = async (action, transactionToUpdate = null) => {
    const targetTransaction = transactionToUpdate || selectedTransaction;
    if (!targetTransaction) return;

    setLoading(true);
    try {
      await api.put(`/api/transactions/${targetTransaction.id}/status`, { booking_status: action });
      

      setModalState({ detail: false, action: false, proof: false, checkIn: false, extend: false });
      setSelectedTransaction(null);
  
    } catch (error) { 
      console.error(error); 
      alert('Failed to update status.'); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleStatusUpdate = (id, newStatus) => {
  
    if (newStatus === 'Checked-In') {

       setModalState(prev => ({ ...prev, checkIn: true }));
    } else {
       if(!window.confirm(`Update status to ${newStatus}?`)) return;
       api.put(`/api/transactions/${id}/status`, { booking_status: newStatus })
          .catch(() => alert("Failed to update status."));
    }
  };

  const onTableStatusUpdate = async (id, newStatus) => {
      if (newStatus === 'Checked-In') {

          try {
            const res = await api.get(`/api/transactions/${id}`); 
            setSelectedTransaction(res.data);
            setModalState(prev => ({ ...prev, checkIn: true }));
          } catch(e) {
             console.error("Error fetching transaction details");
          }
          return;
      }

      // Confirmation for other statuses
      if(!window.confirm(`Update status to ${newStatus}?`)) return;
      try { 
          await api.put(`/api/transactions/${id}/status`, { booking_status: newStatus }); 
      } catch (error) { 
          alert("Failed to update status."); 
      }
  };

  const handleCheckIn = async () => {
    if (!selectedTransaction) return;
    setLoading(true);
    try {
      await api.put(`/api/transactions/${selectedTransaction.id}/status`, { booking_status: 'Checked-In', balance: 0, payment_status: 'Fully Paid' });
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
    
    if (!window.confirm(`Extend booking by ${extensionData.extensionValue} hours?\nAdditional Fee: ₱${extensionData.additionalAmount}`)) return;

    setLoading(true);
    try {
      const targetReservationId = reservations[0].id;
      const formattedDate = extensionData.newCheckoutDate.replace('T', ' ').slice(0, 19); 
      
      await api.put(`/api/reservations/${targetReservationId}/extend`, {
        new_check_out_date: formattedDate,
        additional_cost: extensionData.additionalAmount,
        additional_hours: extensionData.extensionValue, 
        extension_type: 'Hourly',
        extended_items: extensionData.extended_items
      });
      
      alert(`Extended successfully! Added charge: ₱${extensionData.additionalAmount.toLocaleString()}`);
      setModalState(prev => ({ ...prev, extend: false }));
      setSelectedTransaction(null);
    } catch (error) { 
      console.error(error); 
      alert('Error extending booking.'); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleImageError = (id) => setImageErrors(prev => ({ ...prev, [id]: true }));
  const retryImageLoad = (id) => setImageErrors(prev => { const n = { ...prev }; delete n[id]; return n; });

  return (
    <div className="space-y-6">
      
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Online Reservations</h1>
        <p className="text-gray-500 text-sm">Manage website bookings & proof of payments.</p>
      </div>
      
      <TransactionFilters 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        statusFilter={statusFilter} 
        setStatusFilter={setStatusFilter} 
        viewMode={viewMode} 
        setViewMode={setViewMode}
      />
      
      <TransactionTable 

        searchQuery={searchQuery}
        viewMode={viewMode}
        statusFilter={statusFilter}

        // Handlers
        onViewProof={(t) => { setSelectedTransaction(t); retryImageLoad(t.id); setModalState(prev => ({ ...prev, proof: true })); }}
        onViewDetails={handleViewDetails}
        onAction={(type, t) => { setSelectedTransaction(t); setActionType(type); setModalState(prev => ({ ...prev, action: true })); }}
        onStatusUpdate={onTableStatusUpdate}
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