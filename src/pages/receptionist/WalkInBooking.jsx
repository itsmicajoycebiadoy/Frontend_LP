import React, { useState, useEffect } from 'react';
import api from '../../config/axios';
import WalkInModals from '../../components/walkin/WalkInModals';
import WalkInForm from '../../components/walkin/WalkInForm';
import WalkInCart from '../../components/walkin/WalkInCart';
import WalkInAmenities from '../../components/walkin/WalkInAmenities';
import WalkInTable from '../../components/walkin/WalkInTable';

const WalkInBooking = ({ fetchData }) => {
  const [amenities, setAmenities] = useState([]);
  const [recentWalkIns, setRecentWalkIns] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', contactNumber: '', address: '', checkInDate: '', checkOutDate: '' });
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [transactionRef, setTransactionRef] = useState('');
  
  // EXTEND STATES (Hourly Only)
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [extendLoading, setExtendLoading] = useState(false);
  const [extendHours, setExtendHours] = useState(1);
  const [newCheckoutDateTime, setNewCheckoutDateTime] = useState('');
  const [additionalAmount, setAdditionalAmount] = useState(0);
  const [dateError, setDateError] = useState('');

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsData, setDetailsData] = useState(null);
  const [detailsViewType, setDetailsViewType] = useState('amenities');

  useEffect(() => { fetchAmenities(); fetchRecentWalkIns(); }, []);
  
  useEffect(() => {
    if (formData.checkInDate && formData.checkOutDate) {
      if (new Date(formData.checkOutDate) <= new Date(formData.checkInDate)) setDateError('Check-out must be after Check-in.');
      else setDateError('');
    }
  }, [formData.checkInDate, formData.checkOutDate]);

  const fetchAmenities = async () => { try { const res = await api.get('/api/amenities'); setAmenities(Array.isArray(res.data) ? res.data : (res.data.amenities || [])); } catch (e) { console.error(e); } };
  
  const fetchRecentWalkIns = async () => {
    try {
      const res = await api.get('/api/transactions');
      const data = Array.isArray(res.data) ? res.data : (res.data.data || []);
      const today = new Date().toLocaleDateString('en-PH', { timeZone: 'Asia/Manila' });
      let walkIns = data.filter(t => t.booking_type === 'Walk-in' && new Date(t.created_at).toLocaleDateString('en-PH', { timeZone: 'Asia/Manila' }) === today && t.reservations && t.reservations.length > 0);
      setRecentWalkIns(walkIns.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
    } catch (e) { console.error(e); }
  };

  const calculateTotal = () => cart.reduce((sum, i) => sum + (i.amenity_price * i.quantity), 0);

  const handleFinalConfirm = async () => {
    setLoading(true);
    try {
      const fd = new FormData();
      Object.keys(formData).forEach(k => fd.append(k, formData[k]));
      fd.append('booking_type', 'Walk-in'); fd.append('bookingStatus', 'Confirmed'); fd.append('paymentStatus', 'Fully Paid');
      fd.append('totalAmount', calculateTotal()); fd.append('downpayment', calculateTotal()); fd.append('balance', 0);
      fd.append('cart', JSON.stringify(cart));
      const res = await api.post('/api/transactions', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (res.data.success) { setTransactionRef(res.data.transaction_ref); setShowConfirmModal(false); setShowSuccess(true); }
    } catch (error) { alert("Failed to create booking."); } finally { setLoading(false); }
  };

  const handleCloseSuccess = async () => { setShowSuccess(false); setFormData({ fullName: '', contactNumber: '', address: '', checkInDate: '', checkOutDate: '' }); setCart([]); await fetchRecentWalkIns(); if (fetchData) await fetchData(); };
  
  const handleStatusUpdate = async (id, status) => { if(!window.confirm(`Mark as ${status}?`)) return; try { await api.put(`/api/transactions/${id}/status`, { booking_status: status }); await fetchRecentWalkIns(); if (fetchData) fetchData(); } catch (e) { alert("Error updating status."); } };

  const handleOpenDetails = (transaction, type) => { setDetailsData(transaction); setDetailsViewType(type); setShowDetailsModal(true); };

  // --- EXTEND LOGIC (HOURLY ONLY) ---
  const openExtendModal = (transaction) => {
    if (!transaction.reservations || transaction.reservations.length === 0) return alert('No reservation found');
    const newCheckout = new Date(transaction.reservations[0].check_out_date); newCheckout.setHours(newCheckout.getHours() + 1);
    const formatForInput = (d) => { const pad = (n) => String(n).padStart(2, '0'); return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`; };
    
    setSelectedTransaction(transaction); 
    setExtendHours(1); // Default 1 hour
    setNewCheckoutDateTime(formatForInput(newCheckout)); 
    // Initial Calc: Total / 22 * 1
    const initialRate = parseFloat(transaction.total_amount) / 22;
    setAdditionalAmount(Math.ceil(initialRate / 10) * 10);
    setShowExtendModal(true);
  };

  useEffect(() => {
    if (!selectedTransaction) return;
    
    // FORMULA: (Total Transaction Amount / 22 Hours) * Extend Hours
    const totalAmount = parseFloat(selectedTransaction.total_amount || 0);
    const hourlyRate = totalAmount / 22;
    const computedAmount = hourlyRate * extendHours;
    
    // Round up to nearest 10 pesos
    setAdditionalAmount(Math.ceil(computedAmount / 10) * 10);

    const newCheckout = new Date(selectedTransaction.reservations[0].check_out_date);
    newCheckout.setHours(newCheckout.getHours() + extendHours);
    
    const pad = (n) => String(n).padStart(2, '0');
    setNewCheckoutDateTime(`${newCheckout.getFullYear()}-${pad(newCheckout.getMonth()+1)}-${pad(newCheckout.getDate())}T${pad(newCheckout.getHours())}:${pad(newCheckout.getMinutes())}`);
  }, [extendHours, selectedTransaction]);

  const handleExtendSubmit = async () => {
    if (!selectedTransaction || !newCheckoutDateTime) return alert('Please select date');
    const resId = selectedTransaction.reservations[0].id;
    if (!window.confirm(`Extend for ${extendHours} hour(s)?\nAdditional Fee: ₱${additionalAmount}`)) return;
    
    setExtendLoading(true);
    try {
      await api.put(`/api/reservations/${resId}/extend`, {
        new_check_out_date: newCheckoutDateTime.replace('T', ' ') + ':00',
        additional_cost: additionalAmount,
        additional_hours: extendHours,
        extension_type: 'Hourly' // Always hourly now
      });
      alert('Extended successfully!');
      setShowExtendModal(false); setSelectedTransaction(null);
      await fetchRecentWalkIns(); if (fetchData) fetchData();
    } catch (e) { alert('Failed to extend: ' + e.message); } finally { setExtendLoading(false); }
  };

  return (
    <div className="space-y-8 max-w-9xl mx-auto pb-12">
        <WalkInModals 
            showConfirmModal={showConfirmModal} setShowConfirmModal={setShowConfirmModal} formData={formData} cart={cart} total={calculateTotal()} handleFinalConfirm={handleFinalConfirm} loading={loading}
            showSuccess={showSuccess} setShowSuccess={setShowSuccess} transactionRef={transactionRef} handleCloseSuccess={handleCloseSuccess}
            
            showExtendModal={showExtendModal} setShowExtendModal={setShowExtendModal} transaction={selectedTransaction} handleExtendSubmit={handleExtendSubmit}
            extendValue={extendHours} setExtendValue={setExtendHours} // Force "Hours" values
            additionalAmount={additionalAmount} newCheckoutDateTime={newCheckoutDateTime}
            
            showDetailsModal={showDetailsModal} setShowDetailsModal={setShowDetailsModal} detailsData={detailsData} detailsViewType={detailsViewType}
        />

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Walk-in Reservation</h1>
            <p className="text-sm text-gray-500">Create instant booking.</p>
          </div>
        </div>
        
        {/* MOBILE LAYOUT: Form → Amenities → Cart */}
        <div className="flex flex-col xl:hidden space-y-6">
          {/* 1. Customer Details Form */}
          <WalkInForm formData={formData} setFormData={setFormData} dateError={dateError} />
          
          {/* 2. Amenities List */}
          <WalkInAmenities 
            amenities={amenities} 
            cart={cart} 
            setCart={setCart} 
            searchTerm={searchTerm} 
            setSearchTerm={setSearchTerm} 
            selectedCategory={selectedCategory} 
            setSelectedCategory={setSelectedCategory} 
          />
          
          {/* 3. Cart Summary */}
          <WalkInCart 
            cart={cart} 
            setCart={setCart} 
            total={calculateTotal()} 
            dateError={dateError} 
            setShowConfirmModal={setShowConfirmModal} 
            formData={formData} 
          />
        </div>
        
        {/* DESKTOP LAYOUT: Original Grid Layout */}
        <div className="hidden xl:grid xl:grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-1 space-y-6">
            <WalkInForm formData={formData} setFormData={setFormData} dateError={dateError} />
            <WalkInCart 
              cart={cart} 
              setCart={setCart} 
              total={calculateTotal()} 
              dateError={dateError} 
              setShowConfirmModal={setShowConfirmModal} 
              formData={formData} 
            />
          </div>
          
          <div className="xl:col-span-2 space-y-6">
            <WalkInAmenities 
              amenities={amenities} 
              cart={cart} 
              setCart={setCart} 
              searchTerm={searchTerm} 
              setSearchTerm={setSearchTerm} 
              selectedCategory={selectedCategory} 
              setSelectedCategory={setSelectedCategory} 
            />
          </div>
        </div>
        
        <WalkInTable 
          recentWalkIns={recentWalkIns} 
          handleStatusUpdate={handleStatusUpdate} 
          openExtendModal={openExtendModal} 
          openDetailsModal={handleOpenDetails} 
          refreshData={fetchRecentWalkIns} 
        />
    </div>
  );
};

export default WalkInBooking;