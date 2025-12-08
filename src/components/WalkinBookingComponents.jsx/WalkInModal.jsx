import React from 'react';
import { X, CheckCircle, Clock, Info, Calendar, DollarSign, FileText, Layers } from 'lucide-react';

/* --- CONFIRM MODAL (NO CHANGE) --- */
const ConfirmModal = ({ show, onClose, onConfirm, formData, cart, total, loading }) => {
    if (!show) return null;
    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                <div className="p-5 border-b flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2"><CheckCircle size={20} className="text-orange-600"/> Confirm Booking</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full"><X size={20}/></button>
                </div>
                <div className="p-6">
                    <div className="text-center mb-6">
                        <p className="text-sm text-gray-500 uppercase tracking-wide font-bold mb-1">Total Amount Payable</p>
                        <p className="text-4xl font-bold text-orange-600">₱{total.toLocaleString()}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-100">
                        <div className="flex justify-between text-sm"><span className="text-gray-500">Customer:</span><span className="font-bold text-gray-800">{formData.fullName}</span></div>
                        <div className="flex justify-between text-sm"><span className="text-gray-500">Contact:</span><span className="font-bold text-gray-800">{formData.contactNumber}</span></div>
                        <div className="flex justify-between text-sm"><span className="text-gray-500">Date:</span><span className="font-bold text-gray-800">{new Date(formData.checkInDate).toLocaleDateString()}</span></div>
                    </div>
                    <div className="mt-4">
                        <p className="text-xs font-bold text-gray-400 uppercase mb-2">Amenities</p>
                        <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar">
                            {cart.map((item, idx) => (
                                <div key={idx} className="flex justify-between text-sm p-2 bg-gray-50 rounded border border-gray-100">
                                    <span className="font-medium text-gray-700">{item.quantity}x {item.amenity_name}</span>
                                    <span className="font-bold text-gray-900">₱{(item.amenity_price * item.quantity).toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="p-5 border-t bg-gray-50 flex gap-3">
                    <button onClick={onClose} className="flex-1 py-3 border border-gray-300 rounded-xl font-bold text-gray-600 hover:bg-white transition-colors">Cancel</button>
                    <button onClick={onConfirm} disabled={loading} className="flex-1 py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 shadow-lg shadow-orange-200 transition-colors disabled:opacity-70">
                        {loading ? 'Processing...' : 'Confirm Payment'}
                    </button>
                </div>
            </div>
        </div>
    );
};

/* --- SUCCESS MODAL (NO CHANGE) --- */
const SuccessModal = ({ show, onClose, transactionRef }) => {
    if (!show) return null;
    return (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn" onClick={(e) => e.stopPropagation()}>
            <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center transform transition-all scale-100">
                <div className="mx-auto mb-6 w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-bounce-slow">
                    <CheckCircle className="text-green-600" size={48} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
                <p className="text-gray-500 mb-6 text-sm">Transaction recorded successfully.</p>
                <div className="bg-gray-50 p-4 rounded-2xl border-2 border-dashed border-gray-300 mb-8">
                    <p className="text-xs text-gray-400 uppercase font-bold mb-1">Reference Number</p>
                    <p className="text-2xl font-mono font-bold text-gray-800 tracking-wider select-all">{transactionRef}</p>
                </div>
                <button onClick={onClose} className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-transform active:scale-95">
                    Close & New Booking
                </button>
            </div>
        </div>
    );
};

/* --- EXTEND MODAL (HOURLY ONLY) --- */
const ExtendModal = ({ show, onClose, onConfirm, transaction, extendValue, setExtendValue, additionalAmount, loading, newCheckoutDateTime }) => {
    if (!show || !transaction) return null;
    
    const handleValueChange = (e) => {
        const val = parseInt(e.target.value);
        if (!isNaN(val) && val > 0) setExtendValue(val);
    };

    return (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
                
                <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6 text-white flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold flex items-center gap-2"><Clock size={24} /> Extend Stay</h3>
                        <p className="text-blue-100 text-sm mt-1">{transaction.customer_name}</p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition"><X size={20}/></button>
                </div>
                
                <div className="p-6 overflow-y-auto space-y-6">
                    
                    {/* Input Duration */}
                    <div className="flex items-center justify-between border-2 border-gray-100 rounded-2xl p-4 bg-gray-50/50">
                        <div className="flex flex-col">
                            <span className="text-gray-700 font-bold text-base">Add Hours</span>
                            <span className="text-[10px] text-gray-500 uppercase tracking-wide">Late Checkout</span>
                        </div>
                        
                        <div className="flex items-center gap-2 bg-white p-1 rounded-xl shadow-sm border border-gray-200">
                            <button 
                                onClick={() => setExtendValue(Math.max(1, extendValue - 1))} 
                                className="w-10 h-10 rounded-lg hover:bg-gray-100 flex items-center justify-center font-bold text-lg text-gray-600 transition-colors"
                            >
                                -
                            </button>
                            
                            <input 
                                type="number" 
                                min="1" 
                                value={extendValue} 
                                onChange={handleValueChange}
                                className="w-14 h-10 text-center text-2xl font-bold text-blue-600 bg-transparent outline-none"
                            />
                            
                            <button 
                                onClick={() => setExtendValue(extendValue + 1)} 
                                className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 flex items-center justify-center font-bold text-lg transition-colors"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100 space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Current Check-out</span>
                            <span className="font-medium text-gray-800">
                                {new Date(transaction.reservations[0].check_out_date).toLocaleString('en-US', { hour: 'numeric', minute:'2-digit', month: 'short', day: 'numeric'})}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-blue-600 font-bold">New Check-out</span>
                            <span className="font-bold text-blue-600">
                                {new Date(newCheckoutDateTime).toLocaleString('en-US', { hour: 'numeric', minute:'2-digit', month: 'short', day: 'numeric'})}
                            </span>
                        </div>
                        
                        <div className="border-t border-blue-200 pt-3 mt-2 flex justify-between items-center">
                            <span className="font-bold text-gray-800 text-lg">Additional Fee</span>
                            <span className="text-3xl font-bold text-green-600">₱{additionalAmount.toLocaleString()}</span>
                        </div>

                        <div className="text-[10px] text-center text-blue-400 italic mt-2">
                            Computed as: (Total Booking Price ÷ 22) × {extendValue} Hours
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t bg-gray-50 flex gap-3">
                    <button onClick={onClose} disabled={loading} className="flex-1 py-3 font-bold text-gray-600 bg-white border border-gray-300 rounded-xl hover:bg-gray-100">Cancel</button>
                    <button 
                        onClick={onConfirm} 
                        disabled={loading || additionalAmount <= 0} 
                        className="flex-1 py-3 font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl hover:shadow-lg disabled:opacity-50 transition-all"
                    >
                        {loading ? 'Processing...' : `Confirm (+₱${additionalAmount.toLocaleString()})`}
                    </button>
                </div>
            </div>
        </div>
    );
};

/* --- DETAILS MODAL (NO CHANGE) --- */
const DetailsModal = ({ show, onClose, transaction, viewType }) => {
    if (!show || !transaction) return null;

    const reservations = transaction.reservations || [];
    const extensions = transaction.extensions || [];
    
    const extensionTotal = extensions.reduce((sum, ext) => sum + parseFloat(ext.additional_cost || 0), 0);
    const totalAmount = parseFloat(transaction.total_amount || 0);
    const baseTotal = totalAmount - extensionTotal;

    const isAmenityView = viewType === 'amenities';

    return (
        <div className="fixed inset-0 z-[1300] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[85vh]">
                <div className={`p-5 border-b flex justify-between items-center ${isAmenityView ? 'bg-gray-50' : 'bg-purple-50'}`}>
                    <h3 className={`font-bold text-lg flex items-center gap-2 ${isAmenityView ? 'text-gray-800' : 'text-purple-800'}`}>
                        {isAmenityView ? <Layers size={20} className="text-blue-600"/> : <Clock size={20} className="text-purple-600"/>}
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
                                {reservations.map((res, idx) => (
                                    <div key={idx} className="flex justify-between text-sm">
                                        <span className="font-medium text-gray-700">{res.quantity}x {res.amenity_name}</span>
                                        <span className="font-bold text-gray-900">₱{(parseFloat(res.price) * parseInt(res.quantity)).toLocaleString()}</span>
                                    </div>
                                ))}
                                <div className="border-t border-gray-200 pt-3 mt-1 flex justify-between text-sm">
                                    <span className="text-gray-500">Base Amount</span>
                                    <span className="font-bold text-gray-800">₱{baseTotal.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {!isAmenityView && (
                        <div className="space-y-4">
                            <p className="text-xs font-bold text-purple-600 uppercase tracking-wider">Extension History</p>
                            {extensions.length === 0 ? (
                                <div className="text-center p-6 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-400 text-sm">No extensions recorded.</div>
                            ) : (
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
                                    <div className="pt-2 flex justify-between items-center text-sm"><span className="font-bold text-purple-800">Total Extension Fees</span><span className="font-bold text-xl text-purple-700">₱{extensionTotal.toLocaleString()}</span></div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

/* --- MAIN COMPONENT EXPORT --- */
const WalkInModals = ({
    showConfirmModal, setShowConfirmModal, formData, cart, total, handleFinalConfirm, loading,
    showSuccess, setShowSuccess, transactionRef, handleCloseSuccess,
    showExtendModal, setShowExtendModal, transaction, handleExtendSubmit, 
    extendValue, setExtendValue, additionalAmount, newCheckoutDateTime,
    showDetailsModal, setShowDetailsModal, detailsData, detailsViewType
}) => {
    return (
        <>
            <ConfirmModal show={showConfirmModal} onClose={() => setShowConfirmModal(false)} onConfirm={handleFinalConfirm} formData={formData} cart={cart} total={total} loading={loading} />
            <SuccessModal show={showSuccess} onClose={handleCloseSuccess} transactionRef={transactionRef} />
            <ExtendModal show={showExtendModal} onClose={() => setShowExtendModal(false)} onConfirm={handleExtendSubmit} transaction={transaction} extendValue={extendValue} setExtendValue={setExtendValue} additionalAmount={additionalAmount} loading={loading} newCheckoutDateTime={newCheckoutDateTime} />
            <DetailsModal show={showDetailsModal} onClose={() => setShowDetailsModal(false)} transaction={detailsData} viewType={detailsViewType} />
        </>
    );
};

export default WalkInModals;