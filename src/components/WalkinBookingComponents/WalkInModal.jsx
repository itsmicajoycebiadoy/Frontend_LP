import React, { useEffect } from 'react';
import { X, CheckCircle, Clock, Info, Layers, AlertCircle, HelpCircle, Ban, LogIn, LogOut, Users } from 'lucide-react'; // Added Users

/* ==========================================
   TOAST ALERT (With Guest Name)
   ========================================== */
const ToastAlert = ({ title, message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`fixed top-5 right-5 z-[2000] flex items-start gap-3 px-4 py-3 rounded-xl shadow-2xl border animate-slideIn bg-white max-w-sm 
            ${type === 'success' 
                ? 'border-orange-500 text-orange-900' 
                : 'border-red-500 text-red-900'}`}>
            
            <div className={`mt-0.5 ${type === 'success' ? 'text-orange-500' : 'text-red-500'}`}>
                {type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            </div>
            
            <div className="flex-1">
                {/* DITO LALABAS ANG NAME NG GUEST */}
                {title && <h4 className="font-bold text-sm mb-0.5">{title}</h4>}
                <p className={`text-xs ${type === 'success' ? 'text-orange-700' : 'text-red-700'}`}>{message}</p>
            </div>

            <button onClick={onClose} className="opacity-50 hover:opacity-100 mt-0.5"><X size={16}/></button>
        </div>
    );
};

/* ==========================================
   1. SAFETY CONFIRMATION MODAL
   ========================================== */
const ConfirmationModal = ({ isOpen, onClose, onConfirm, action, guestName, loading }) => {
    if (!isOpen) return null;

    let color = 'text-blue-600 bg-blue-50';
    let btnColor = 'bg-blue-600 hover:bg-blue-700';
    let icon = <HelpCircle size={32} />;
    let title = 'Confirm Action';

    if (action === 'Cancelled') {
        color = 'text-red-600 bg-red-50';
        btnColor = 'bg-red-600 hover:bg-red-700';
        icon = <Ban size={32} />;
        title = 'Cancel Booking?';
    } else if (action === 'Checked-In') {
        color = 'text-green-600 bg-green-50';
        btnColor = 'bg-green-600 hover:bg-green-700';
        icon = <LogIn size={32} />;
        title = 'Check In Guest?';
    } else if (action === 'Completed') {
        color = 'text-orange-600 bg-orange-50';
        btnColor = 'bg-orange-600 hover:bg-orange-700';
        icon = <LogOut size={32} />;
        title = 'Check Out Guest?';
    }

    return (
        <div className="fixed inset-0 z-[2100] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-sm w-full transform scale-100 transition-all">
                <div className={`mx-auto mb-4 w-16 h-16 rounded-full flex items-center justify-center ${color}`}>
                    {icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 text-center mb-2">{title}</h3>
                <p className="text-gray-500 text-center text-sm mb-6">
                    Are you sure you want to proceed with <b>{guestName}</b>?
                    {action === 'Cancelled' && <span className="block mt-1 text-red-500 text-xs">This action cannot be undone.</span>}
                </p>
                <div className="flex gap-3">
                    <button onClick={onClose} disabled={loading} className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors">Cancel</button>
                    <button onClick={onConfirm} disabled={loading} className={`flex-1 py-3 text-white rounded-xl font-bold shadow-lg transition-colors ${btnColor}`}>
                        {loading ? 'Processing...' : 'Yes, Confirm'}
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ==========================================
   2. CHECKOUT CONFIRM MODAL
   ========================================== */
const ConfirmModal = ({ show, onClose, onConfirm, formData, cart, total, loading }) => {
    if (!show) return null;
    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                        <CheckCircle size={20} className="text-orange-600"/> Confirm Booking
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full"><X size={20}/></button>
                </div>
                <div className="p-6">
                    <div className="text-center mb-6">
                        <p className="text-xs text-gray-400 uppercase tracking-wide font-bold mb-1">Total Amount Payable</p>
                        <p className="text-4xl font-extrabold text-orange-600">₱{total.toLocaleString()}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-100 mb-4">
                        <div className="flex justify-between text-sm"><span className="text-gray-500">Customer:</span><span className="font-bold text-gray-800">{formData.fullName}</span></div>
                        <div className="flex justify-between text-sm"><span className="text-gray-500">Contact:</span><span className="font-bold text-gray-800">{formData.contactNumber}</span></div>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase mb-2">Amenities</p>
                        <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar">
                            {/* GUEST COUNT INSIDE AMENITIES LIST */}
                            <div className="flex justify-between text-sm p-2 bg-orange-50 rounded border border-orange-100">
                                <span className="font-bold text-gray-700 flex items-center gap-1"><Users size={12}/> Guest Entrance</span>
                                <span className="font-bold text-gray-900">{formData.guestCount} Pax</span>
                            </div>

                            {cart.map((item, idx) => (
                                <div key={idx} className="flex justify-between text-sm p-2 bg-gray-50 rounded border border-gray-100">
                                    <span className="font-medium text-gray-700">{item.quantity}x {item.amenity_name}</span>
                                    <span className="font-bold text-gray-900">₱{(item.amenity_price * item.quantity).toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="p-5 border-t border-gray-100 bg-gray-50 flex gap-3">
                    <button onClick={onClose} className="flex-1 py-3 border border-gray-300 rounded-xl font-bold text-gray-600 hover:bg-white transition-colors">Cancel</button>
                    <button onClick={onConfirm} disabled={loading} className="flex-1 py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 shadow-lg shadow-orange-200 transition-colors disabled:opacity-70">
                        {loading ? 'Processing...' : 'Confirm Payment'}
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ==========================================
   3. SUCCESS MODAL
   ========================================== */
const SuccessModal = ({ show, onClose, transactionRef }) => {
    if (!show) return null;
    return (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/40 backdrop-blur-md p-4 animate-fadeIn" onClick={(e) => e.stopPropagation()}>
            <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center transform transition-all scale-100">
                <div className="mx-auto mb-6 w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-bounce-slow">
                    <CheckCircle className="text-green-600" size={48} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
                <div className="bg-gray-50 p-4 rounded-2xl border-2 border-dashed border-gray-300 mb-8">
                    <p className="text-xs text-gray-400 uppercase font-bold mb-1">Reference Number</p>
                    <p className="text-2xl font-mono font-bold text-gray-800 tracking-wider select-all">{transactionRef}</p>
                </div>
                <button onClick={onClose} className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-transform active:scale-95">Close & New Booking</button>
            </div>
        </div>
    );
};

/* ==========================================
   4. EXTEND MODAL
   ========================================== */
const ExtendModal = ({ show, onClose, onConfirm, transaction, extendValue, setExtendValue, additionalAmount, loading, newCheckoutDateTime }) => {
    if (!show || !transaction) return null;
    const handleValueChange = (e) => {
        const val = parseInt(e.target.value);
        if (!isNaN(val) && val > 0) setExtendValue(val);
    };

    return (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
                <div className="bg-gradient-to-r from-orange-600 to-amber-600 p-6 text-white flex justify-between items-center">
                    <div><h3 className="text-xl font-bold flex items-center gap-2"><Clock size={24} /> Extend Stay</h3><p className="text-orange-100 text-sm mt-1">{transaction.customer_name}</p></div>
                    <button onClick={onClose} className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition"><X size={20}/></button>
                </div>
                <div className="p-6 overflow-y-auto space-y-6">
                    <div className="flex items-center justify-between border-2 border-gray-100 rounded-2xl p-4 bg-gray-50/50">
                        <div className="flex flex-col"><span className="text-gray-700 font-bold text-base">Add Hours</span><span className="text-[10px] text-gray-500 uppercase tracking-wide">Late Checkout</span></div>
                        <div className="flex items-center gap-2 bg-white p-1 rounded-xl shadow-sm border border-gray-200">
                            <button onClick={() => setExtendValue(Math.max(1, extendValue - 1))} className="w-10 h-10 rounded-lg hover:bg-gray-100 flex items-center justify-center font-bold text-lg text-gray-600 transition-colors">-</button>
                            <input type="number" min="1" value={extendValue} onChange={handleValueChange} className="w-14 h-10 text-center text-2xl font-bold text-orange-600 bg-transparent outline-none"/>
                            <button onClick={() => setExtendValue(extendValue + 1)} className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 hover:bg-orange-200 flex items-center justify-center font-bold text-lg transition-colors">+</button>
                        </div>
                    </div>
                    <div className="bg-orange-50/50 p-5 rounded-2xl border border-orange-100 space-y-3">
                        <div className="flex justify-between text-sm"><span className="text-gray-500">Current Check-out</span><span className="font-medium text-gray-800">{transaction.reservations?.[0]?.check_out_date ? new Date(transaction.reservations[0].check_out_date).toLocaleString('en-US', { hour: 'numeric', minute:'2-digit', month: 'short', day: 'numeric'}) : ''}</span></div>
                        <div className="flex justify-between text-sm"><span className="text-orange-600 font-bold">New Check-out</span><span className="font-bold text-orange-600">{new Date(newCheckoutDateTime).toLocaleString('en-US', { hour: 'numeric', minute:'2-digit', month: 'short', day: 'numeric'})}</span></div>
                        <div className="border-t border-orange-200 pt-3 mt-2 flex justify-between items-center"><span className="font-bold text-gray-800 text-lg">Additional Fee</span><span className="text-3xl font-bold text-green-600">₱{additionalAmount.toLocaleString()}</span></div>
                    </div>
                </div>
                <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-3">
                    <button onClick={onClose} disabled={loading} className="flex-1 py-3 font-bold text-gray-600 bg-white border border-gray-300 rounded-xl hover:bg-gray-100">Cancel</button>
                    <button onClick={onConfirm} disabled={loading || additionalAmount <= 0} className="flex-1 py-3 font-bold text-white bg-gradient-to-r from-orange-600 to-amber-600 rounded-xl hover:shadow-lg disabled:opacity-50 transition-all">{loading ? 'Processing...' : `Confirm (+₱${additionalAmount.toLocaleString()})`}</button>
                </div>
            </div>
        </div>
    );
};

/* ==========================================
   5. DETAILS MODAL
   ========================================== */
const DetailsModal = ({ show, onClose, transaction, viewType }) => {
    if (!show || !transaction) return null;
    const reservations = transaction.reservations || [];
    const extensions = transaction.extensions || [];
    const extensionTotal = extensions.reduce((sum, ext) => sum + parseFloat(ext.additional_cost || 0), 0);
    const totalAmount = parseFloat(transaction.total_amount || 0);
    const baseTotal = totalAmount - extensionTotal;
    const isAmenityView = viewType === 'amenities';
    
    // GUEST COUNT
    const guestCount = transaction.guest_count || reservations[0]?.guest_count || 0;

    return (
        <div className="fixed inset-0 z-[1300] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[85vh]">
                <div className={`p-5 border-b border-opacity-50 flex justify-between items-center ${isAmenityView ? 'bg-orange-50 border-orange-100' : 'bg-purple-50 border-purple-100'}`}>
                    <h3 className={`font-bold text-lg flex items-center gap-2 ${isAmenityView ? 'text-orange-800' : 'text-purple-800'}`}>
                        {isAmenityView ? <Layers size={20} className="text-orange-600"/> : <Clock size={20} className="text-purple-600"/>}
                        {isAmenityView ? 'Amenity Details' : 'Extension Breakdown'}
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-black/5 rounded-full"><X size={20}/></button>
                </div>
                <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
                    <div>
                        <p className="text-2xl font-bold text-gray-900">{transaction.customer_name}</p>
                        <p className="text-xs text-gray-400 font-mono uppercase">Ref: {transaction.transaction_ref}</p>
                    </div>

                    {isAmenityView && (
                        <div className="space-y-4">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Booked Items</p>
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3">
                                {/* GUEST COUNT INSIDE AMENITIES SECTION */}
                                <div className="flex justify-between text-sm pb-2 border-b border-dashed border-gray-200">
                                    <span className="font-medium text-gray-700 flex items-center gap-1"><Users size={12}/> Guest Count</span>
                                    <span className="font-bold text-gray-900">{guestCount} Pax</span>
                                </div>

                                {reservations.map((res, idx) => (
                                    <div key={idx} className="flex justify-between text-sm pb-2 border-b border-dashed border-gray-200 last:border-0 last:pb-0">
                                        <span className="font-medium text-gray-700">{res.quantity}x {res.amenity_name}</span>
                                        <span className="font-bold text-gray-900">₱{(parseFloat(res.price) * parseInt(res.quantity)).toLocaleString()}</span>
                                    </div>
                                ))}
                                <div className="border-t-2 border-dashed border-gray-300 pt-3 mt-2 flex justify-between items-center">
                                    <span className="text-gray-500 font-bold text-xs uppercase">Base Total</span>
                                    <span className="font-extrabold text-orange-600 text-xl">₱{baseTotal.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {!isAmenityView && (
                        <div className="space-y-4">
                            <p className="text-xs font-bold text-purple-600 uppercase tracking-wider">Extension History</p>
                            {extensions.length === 0 ? <div className="text-center p-6 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-400 text-sm">No extensions recorded.</div> : (
                                <div className="bg-purple-50 rounded-xl p-4 border border-purple-100 space-y-4">
                                    {extensions.map((ext, idx) => (
                                        <div key={idx} className="flex justify-between items-start text-sm pb-3 border-b border-purple-200 last:border-0 last:pb-0">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-purple-900">{ext.description || `Extension #${idx+1}`}</span>
                                                <span className="text-[10px] text-purple-500 uppercase mt-0.5">{new Date(ext.created_at || new Date()).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                                            </div>
                                            <span className="font-bold text-purple-700 bg-white px-2 py-0.5 rounded border border-purple-200">+₱{parseFloat(ext.additional_cost).toLocaleString()}</span>
                                        </div>
                                    ))}
                                    <div className="border-t-2 border-dashed border-purple-300 pt-3 mt-2 flex justify-between items-center">
                                        <span className="font-bold text-purple-800 text-xs uppercase">Total Fees</span>
                                        <span className="font-extrabold text-2xl text-purple-700">₱{extensionTotal.toLocaleString()}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

/* --- MAIN EXPORT --- */
const WalkInModals = ({
    toast, onCloseToast,
    showConfirmModal, setShowConfirmModal, formData, cart, total, handleFinalConfirm, loading,
    showSuccess, setShowSuccess, transactionRef, handleCloseSuccess,
    showExtendModal, setShowExtendModal, transaction, handleExtendSubmit, extendValue, setExtendValue, additionalAmount, newCheckoutDateTime,
    showDetailsModal, setShowDetailsModal, detailsData, detailsViewType,
    confirmModal, setConfirmModal, executeAction, isActionLoading
}) => {
    return (
        <>
            {/* Key added to Toast for reset logic */}
            {toast && <ToastAlert key={toast.id} title={toast.title} message={toast.message} type={toast.type} onClose={onCloseToast} />}

            {confirmModal && (
                <ConfirmationModal isOpen={confirmModal.isOpen} action={confirmModal.action} guestName={confirmModal.guestName} onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })} onConfirm={executeAction} loading={isActionLoading} />
            )}

            <ConfirmModal show={showConfirmModal} onClose={() => setShowConfirmModal(false)} onConfirm={handleFinalConfirm} formData={formData} cart={cart} total={total} loading={loading} />
            <SuccessModal show={showSuccess} onClose={handleCloseSuccess} transactionRef={transactionRef} />
            <ExtendModal show={showExtendModal} onClose={() => setShowExtendModal(false)} onConfirm={handleExtendSubmit} transaction={transaction} extendValue={extendValue} setExtendValue={setExtendValue} additionalAmount={additionalAmount} loading={loading} newCheckoutDateTime={newCheckoutDateTime} />
            <DetailsModal show={showDetailsModal} onClose={() => setShowDetailsModal(false)} transaction={detailsData} viewType={detailsViewType} />
        </>
    );
};

export default WalkInModals;