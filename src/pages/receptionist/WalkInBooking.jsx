import React, { useState, useEffect } from 'react';
import api from '../../config/axios';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

// Components
import WalkInModals from '../../components/WalkinBookingComponents/WalkInModal.jsx';
import WalkInForm from '../../components/WalkinBookingComponents/WalkInForm.jsx';
import WalkInCart from '../../components/WalkinBookingComponents/WalkInCart.jsx';
import WalkInAmenities from '../../components/WalkinBookingComponents/WalkInAmenities.jsx';
import WalkInTable from '../../components/WalkinBookingComponents/WalkInTable.jsx';

const ToastNotification = ({ message, type, onClose }) => {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`fixed top-6 right-6 z-[2000] flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border-l-4 animate-slideIn bg-white ${type === 'success' ? 'border-green-500' : 'border-red-500'}`}>
      <div className={`p-2 rounded-full ${type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
        {type === 'success' ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
      </div>
      <div><h4 className={`font-bold ${type === 'success' ? 'text-green-800' : 'text-red-800'}`}>{type === 'success' ? 'Success!' : 'Error'}</h4><p className="text-sm text-gray-600 font-medium">{message}</p></div>
      <button onClick={onClose} className="ml-4 p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600"><X size={18} /></button>
    </div>
  );
};

const WalkInBooking = () => {
  // --- STATE FOR CREATION ONLY ---
  const [amenities, setAmenities] = useState([]);
  const [loading, setLoading] = useState(false); 
  const [formData, setFormData] = useState({ fullName: '', contactNumber: '', address: '', checkInDate: '', checkOutDate: '', numGuest: '' }); // Ensure numGuest is initialized
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Toasts & Success Modals
  const [toast, setToast] = useState(null); 
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [transactionRef, setTransactionRef] = useState('');
  const [dateError, setDateError] = useState('');

  // TRIGGER FOR TABLE REFRESH
  const [tableRefreshTrigger, setTableRefreshTrigger] = useState(0);

  const showToast = (message, type = 'success') => setToast({ message, type });

  const fetchAmenities = async () => { try { const res = await api.get('/api/amenities'); setAmenities(Array.isArray(res.data) ? res.data : (res.data.amenities || [])); } catch (e) { console.error(e); } };
  
  useEffect(() => { fetchAmenities(); }, []);

  useEffect(() => {
    if (formData.checkInDate && formData.checkOutDate) {
      if (new Date(formData.checkOutDate) <= new Date(formData.checkInDate)) setDateError('Check-out must be after Check-in.');
      else setDateError('');
    }
  }, [formData.checkInDate, formData.checkOutDate]);

  const calculateTotal = () => cart.reduce((sum, i) => sum + (i.amenity_price * i.quantity), 0);

  const handleFinalConfirm = async () => {
    setLoading(true); 
    try {
      const fd = new FormData();
      
      // 👇 IMPORTANT FIX: Explicit mapping for DB compatibility
      fd.append('num_guest', formData.numGuest || 0); 
      
      Object.keys(formData).forEach(k => {
          if (k !== 'numGuest') fd.append(k, formData[k]); // Skip duplicate numGuest
      });

      fd.append('booking_type', 'Walk-in'); fd.append('bookingStatus', 'Confirmed'); fd.append('paymentStatus', 'Fully Paid');
      fd.append('totalAmount', calculateTotal()); fd.append('downpayment', calculateTotal()); fd.append('balance', 0);
      fd.append('cart', JSON.stringify(cart));
      
      const res = await api.post('/api/transactions', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      
      if (res.data.success) { 
          setTransactionRef(res.data.transaction_ref); 
          setShowConfirmModal(false); 
          setShowSuccess(true); 
          showToast("Booking created successfully!", 'success');
      }
    } catch (error) {
      console.error(error);
      showToast("Failed to create booking.", 'error'); } 
    finally { setLoading(false); }
  };

  const handleCloseSuccess = () => { 
      setShowSuccess(false); 
      setFormData({ fullName: '', contactNumber: '', address: '', checkInDate: '', checkOutDate: '', numGuest: '' }); 
      setCart([]); 
      setTableRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="space-y-6 max-w-9xl mx-auto pb-12 relative">
        {toast && <ToastNotification message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        
        {/* MODALS */}
        <WalkInModals 
            showConfirmModal={showConfirmModal} setShowConfirmModal={setShowConfirmModal} formData={formData} cart={cart} total={calculateTotal()} handleFinalConfirm={handleFinalConfirm} loading={loading}
            showSuccess={showSuccess} setShowSuccess={setShowSuccess} transactionRef={transactionRef} handleCloseSuccess={handleCloseSuccess}
            showExtendModal={false} showDetailsModal={false}
        />

        <div className="flex justify-between items-center mb-2">
          <div><h1 className="text-2xl font-bold text-gray-900">Walk-in Booking</h1><p className="text-sm text-gray-500">Create instant bookings.</p></div>
        </div>
        
        {/* NEW LAYOUT ARRANGEMENT */}
        <div className="flex flex-col gap-6">
            
            {/* ROW 1: Form (Cust Details Left | Schedule Right) */}
            <WalkInForm formData={formData} setFormData={setFormData} dateError={dateError} />

            {/* ROW 2: Cart (Left) | Amenities (Right) */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
                
                {/* LEFT: Cart (Matches width of Customer Details roughly) */}
                <div className="xl:col-span-1">
                    <WalkInCart cart={cart} setCart={setCart} total={calculateTotal()} dateError={dateError} setShowConfirmModal={setShowConfirmModal} formData={formData} />
                </div>

                {/* RIGHT: Amenities (Matches width of Schedule roughly, spans wider) */}
                <div className="xl:col-span-2">
                    <WalkInAmenities amenities={amenities} cart={cart} setCart={setCart} searchTerm={searchTerm} setSearchTerm={setSearchTerm} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />
                </div>
            </div>
        </div>
        
        {/* TABLE (Unchanged position) */}
        <div className="pt-4">
            <WalkInTable refreshTrigger={tableRefreshTrigger} />
        </div>
    </div>
  );
};

export default WalkInBooking;
