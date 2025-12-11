import { useState } from 'react';
// ✅ FIXED: Added 'Calendar' to imports
import { 
  X, CheckCircle, AlertCircle, RefreshCw, User, 
  FileText, ZoomIn, ZoomOut, Clock, Layers, RotateCcw, Maximize,
  Plus, CreditCard, LogIn, Ban, LogOut, Eye, HelpCircle, ChevronRight, Users, Calendar
} from 'lucide-react';

const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:7777';

const getImageUrl = (imagePath) => {
  if (!imagePath) return 'https://via.placeholder.com/400x300?text=No+Image';
  if (imagePath.startsWith('http')) return imagePath;
  return `${backendUrl}/uploads/${imagePath}`;
};

// ==========================================
// 1. MOBILE TRANSACTION MODAL
// ==========================================
export const MobileTransactionModal = ({ transaction, isOpen, onClose, onViewProof, onViewDetails, onStatusUpdate, onExtendBooking }) => {
  if (!isOpen || !transaction) return null;

  const formatDateTime = (dateStr) => {
    if (!dateStr) return { date: '-', time: '' };
    const date = new Date(dateStr);
    return {
      date: date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: date.toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit', hour12: true })
    };
  };

  const getAmenitySummary = (transaction) => {
    if (!transaction.reservations || transaction.reservations.length === 0) return 'No amenities';
    return transaction.reservations.map(res => `${res.amenity_name} x${res.quantity}`).join(', ');
  };

  const getExtensionSummary = (transaction) => {
    const extensions = transaction.extensions || [];
    if (extensions.length === 0) {
      return { count: 0, cost: 0, base: parseFloat(transaction.total_amount || 0) };
    }
    const totalCost = extensions.reduce((sum, ext) => sum + parseFloat(ext.additional_cost || 0), 0);
    return {
      count: extensions.length,
      cost: totalCost,
      base: parseFloat(transaction.total_amount || 0) - totalCost
    };
  };

  const sched = transaction.reservations?.[0];
  const inDT = formatDateTime(sched?.check_in_date);
  const outDT = formatDateTime(sched?.check_out_date);
  const extInfo = getExtensionSummary(transaction);
  const isExtended = extInfo.cost > 0;
  const isFullyPaid = ['Checked-In', 'Completed'].includes(transaction.booking_status) || transaction.payment_status === 'Fully Paid';
  const paymentLabel = isFullyPaid ? 'Fully Paid' : 'Partial';
  const downpayment = parseFloat(transaction.downpayment || 0);
  const amenities = getAmenitySummary(transaction);

  return (
    <div className="fixed inset-0 z-[1000] overflow-y-auto">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative min-h-screen flex items-start justify-center p-4 pt-20">
        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col animate-slideIn">
          
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-orange-600 to-amber-600 px-6 py-4 border-b border-white/10 rounded-t-2xl flex items-center justify-between text-white z-10">
            <div>
              <h3 className="text-lg font-bold flex items-center gap-2"><FileText size={20}/> Reservation Details</h3>
              <p className="text-xs text-orange-100 font-mono mt-0.5">{transaction.transaction_ref}</p>
            </div>
            <button onClick={onClose} className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors text-white">
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-6 space-y-5 bg-gray-50/50">
            
            {/* Customer Info */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="bg-orange-50 p-2.5 rounded-full border border-orange-100">
                  <User size={20} className="text-orange-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 text-lg">{transaction.customer_name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-gray-600 font-medium">{transaction.contact_number}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Date & Time */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
                <Calendar size={16} className="text-gray-500" />
                <h4 className="font-bold text-gray-700 text-sm uppercase tracking-wide">Schedule</h4>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Check In</p>
                    <p className="font-bold text-green-600 text-sm bg-green-50 px-2 py-1 rounded border border-green-100 inline-block">{inDT.date} • {inDT.time}</p>
                  </div>
                  <ChevronRight size={20} className="text-gray-300" />
                  <div className="text-right">
                    <p className="text-xs text-gray-500 mb-1">Check Out</p>
                    <p className={`font-bold text-sm px-2 py-1 rounded border inline-block ${isExtended ? 'text-purple-600 bg-purple-50 border-purple-100' : 'text-orange-600 bg-orange-50 border-orange-100'}`}>
                      {outDT.date} • {outDT.time}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-gray-700 text-sm uppercase tracking-wide flex items-center gap-2"><Layers size={14}/> Amenities</h4>
                <button 
                  onClick={() => onViewDetails(transaction, 'amenities')}
                  className="text-orange-600 text-xs font-bold hover:text-orange-800 flex items-center gap-1 bg-orange-50 px-2 py-1 rounded-full transition-colors"
                >
                  View <ChevronRight size={12} />
                </button>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed font-medium">{amenities}</p>
            </div>

            {/* Extensions */}
            {isExtended && (
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="bg-white p-1 rounded text-purple-600"><Plus size={14} /></div>
                    <h4 className="font-bold text-purple-800 text-sm uppercase tracking-wide">Extensions</h4>
                  </div>
                  <button 
                    onClick={() => onViewDetails(transaction, 'extensions')}
                    className="text-purple-700 text-xs font-bold hover:text-purple-900 flex items-center gap-1 bg-white/50 px-2 py-1 rounded-full transition-colors"
                  >
                    Details <ChevronRight size={12} />
                  </button>
                </div>
                <p className="text-sm text-purple-700 font-medium">
                  {extInfo.count} extension(s) added • Additional: <span className="font-bold">₱{extInfo.cost.toLocaleString()}</span>
                </p>
              </div>
            )}

            {/* Payment */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
                <CreditCard size={16} className="text-gray-500" />
                <h4 className="font-bold text-gray-700 text-sm uppercase tracking-wide">Payment</h4>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Status</span>
                  <span className={`font-bold text-xs px-2 py-1 rounded border uppercase tracking-wider ${isFullyPaid ? 'bg-green-100 text-green-700 border-green-200' : 'bg-orange-100 text-orange-700 border-orange-200'}`}>
                    {paymentLabel}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-dashed border-gray-200 mt-2">
                  <span className="font-bold text-gray-700">Total Amount</span>
                  <span className="font-extrabold text-xl text-orange-600">
                    ₱{parseFloat(transaction.total_amount).toLocaleString()}
                  </span>
                </div>
                {!isFullyPaid && downpayment > 0 && (
                  <div className="pt-1 flex justify-between text-xs text-gray-500">
                    <span>Downpayment Paid</span>
                    <span className="font-medium">₱{downpayment.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Status & Proof */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex justify-between items-center">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-1">Booking Status</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    transaction.booking_status === 'Checked-In' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                    transaction.booking_status === 'Completed' ? 'bg-gray-100 text-gray-600 border-gray-200' :
                    transaction.booking_status === 'Confirmed' ? 'bg-green-100 text-green-700 border-green-200' :
                    transaction.booking_status === 'Pending' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                    'bg-red-100 text-red-600 border-red-200'
                  }`}>
                    {transaction.booking_status}
                  </span>
                </div>
                {transaction.proof_of_payment && (
                  <button 
                    onClick={() => onViewProof(transaction)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-50 to-amber-50 text-orange-700 border border-orange-200 rounded-lg hover:shadow-md transition-all active:scale-95"
                  >
                    <Eye size={16} />
                    <span className="text-xs font-bold uppercase tracking-wide">See Proof</span>
                  </button>
                )}
            </div>
          </div>

          {/* Actions Footer */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 pb-6 rounded-b-2xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <div className="flex flex-wrap gap-3">
              {transaction.booking_status === 'Pending' && !transaction.proof_of_payment ? (
                <button 
                  onClick={() => onViewDetails(transaction, 'amenities')}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-xl font-bold hover:shadow-lg transition-all active:scale-95 text-center shadow-orange-200"
                >
                  Review Reservation
                </button>
              ) : transaction.booking_status === 'Confirmed' ? (
                <>
                  <button 
                    onClick={() => onStatusUpdate(transaction.id, 'Checked-In')}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-xl font-bold hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 shadow-orange-200"
                  >
                    <LogIn size={18} />
                    Check In
                  </button>
                  <button 
                    onClick={() => onStatusUpdate(transaction.id, 'Cancelled')}
                    className="px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all flex items-center justify-center gap-2"
                  >
                    <Ban size={18} />
                  </button>
                </>
              ) : transaction.booking_status === 'Checked-In' ? (
                <>
                  <button 
                    onClick={() => onExtendBooking(transaction)}
                    className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 hover:shadow-lg shadow-purple-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Clock size={18} />
                    Extend
                  </button>
                  <button 
                    onClick={() => onStatusUpdate(transaction.id, 'Completed')}
                    className="flex-1 px-4 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 hover:shadow-lg shadow-orange-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <LogOut size={18} />
                    Check Out
                  </button>
                </>
              ) : (
                <button 
                  onClick={onClose}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-600 border border-gray-300 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 2. ACTION MODAL
// ==========================================
export const ActionModal = ({ isOpen, type, transaction, onClose, onConfirm, loading }) => {
  if (!isOpen || !transaction) return null;

  const isConfirm = type === 'Confirmed';
  const isCancel = type === 'Cancelled';
  const isComplete = type === 'Completed';

  let title = 'Confirmation';
  let message = 'Are you sure you want to proceed?';
  let colorClass = 'bg-blue-600 hover:bg-blue-700';
  let Icon = HelpCircle;
  let iconBg = 'bg-blue-100 text-blue-600';

  if (isConfirm) {
    title = 'Approve Payment?';
    message = `Confirm reservation for ${transaction.customer_name}.`;
    colorClass = 'bg-green-600 hover:bg-green-700';
    Icon = CheckCircle;
    iconBg = 'bg-green-100 text-green-600';
  } else if (isCancel) {
    title = 'Cancel Booking?';
    message = `Are you sure you want to cancel the booking for ${transaction.customer_name}? This cannot be undone.`;
    colorClass = 'bg-red-600 hover:bg-red-700';
    Icon = Ban;
    iconBg = 'bg-red-100 text-red-600';
  } else if (isComplete) {
    title = 'Check Out Guest?';
    message = `Complete booking for ${transaction.customer_name}? Ensure all keys are returned.`;
    colorClass = 'bg-orange-600 hover:bg-orange-700';
    Icon = LogOut;
    iconBg = 'bg-orange-100 text-orange-600';
  }

  return (
    <div className="fixed inset-0 z-[1300] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full transform transition-all scale-100">
        <div className={`mx-auto mb-4 w-16 h-16 rounded-full flex items-center justify-center ${iconBg}`}>
            <Icon size={32}/>
        </div>
        <h3 className="text-xl font-bold text-gray-900 text-center mb-2">{title}</h3>
        <p className="text-gray-500 text-center text-sm mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onClose} disabled={loading} className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50">Cancel</button>
          <button onClick={onConfirm} disabled={loading} className={`flex-1 py-3 text-white rounded-xl font-semibold shadow-lg ${colorClass}`}>
            {loading ? 'Processing...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 3. PROOF MODAL
// ==========================================
export const ProofModal = ({ isOpen, transaction, onClose, imageErrors, onRetryLoad, onError, onAction, loading }) => {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  if (!isOpen || !transaction) return null;

  const handleZoomIn = () => setScale(s => Math.min(s + 0.5, 4));
  const handleZoomOut = () => setScale(s => Math.max(s - 0.5, 0.5));
  const handleRotate = () => setRotation(r => r + 90);
  const handleReset = () => { setScale(1); setRotation(0); setPosition({ x: 0, y: 0 }); };

  const handleMouseDown = (e) => { if (scale > 1) { setIsDragging(true); setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y }); } };
  const handleMouseMove = (e) => { if (isDragging && scale > 1) { setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y }); } };
  const handleMouseUp = () => setIsDragging(false);

  return (
    <div className="fixed inset-0 z-[1400] bg-black/95 flex flex-col animate-fadeIn backdrop-blur-sm">
      <div className="flex justify-between items-center p-4 bg-black/40 absolute top-0 w-full z-50">
        <div className="text-white">
            <h3 className="font-bold text-lg flex items-center gap-2"><FileText size={20} className="text-orange-400"/> Proof of Payment</h3>
            <p className="text-xs text-gray-400 font-mono">{transaction.transaction_ref}</p>
        </div>
        <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"><X size={24} /></button>
      </div>

      <div className="flex-1 flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing p-4"
        onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
        onWheel={(e) => { if(e.deltaY < 0) handleZoomIn(); else handleZoomOut(); }}>
        {imageErrors && imageErrors[transaction.id] ? (
          <div className="text-center">
            <AlertCircle className="mx-auto text-red-500 mb-2" size={48} />
            <p className="text-gray-300 mb-4">Image failed to load</p>
            <button onClick={() => onRetryLoad(transaction.id)} className="px-4 py-2 bg-white/10 text-white rounded hover:bg-white/20 flex items-center gap-2 mx-auto"><RefreshCw size={16}/> Retry</button>
          </div>
        ) : (
          <img src={getImageUrl(transaction.proof_of_payment)} alt="Proof" 
            className="transition-transform duration-200 ease-out max-h-[80vh] max-w-full object-contain shadow-2xl"
            style={{ transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)` }}
            onError={() => onError(transaction.id)} draggable={false}
          />
        )}
      </div>

      <div className="bg-black/80 backdrop-blur-md p-4 absolute bottom-0 w-full flex flex-col md:flex-row items-center justify-between gap-4 border-t border-white/10">
        <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
            <button onClick={handleZoomOut} className="text-white hover:text-orange-400 p-1"><ZoomOut size={20}/></button>
            <span className="text-xs text-gray-300 w-12 text-center">{Math.round(scale * 100)}%</span>
            <button onClick={handleZoomIn} className="text-white hover:text-orange-400 p-1"><ZoomIn size={20}/></button>
            <div className="w-px h-4 bg-gray-600 mx-2"></div>
            <button onClick={handleRotate} className="text-white hover:text-green-400 p-1" title="Rotate"><RotateCcw size={18}/></button>
            <button onClick={handleReset} className="text-white hover:text-red-400 p-1" title="Reset View"><Maximize size={18}/></button>
        </div>

        {transaction.booking_status === 'Pending' && (
            <div className="flex gap-3 w-full md:w-auto">
                <button 
                    onClick={() => { onClose(); onAction('Cancelled', transaction); }} 
                    disabled={loading} 
                    className="flex-1 md:flex-none px-6 py-2.5 rounded-lg bg-red-600/20 text-red-400 border border-red-600/50 hover:bg-red-600 hover:text-white font-semibold transition-all"
                >
                    Reject
                </button>
                <button 
                    onClick={() => { onClose(); onAction('Confirmed', transaction); }} 
                    disabled={loading} 
                    className="flex-1 md:flex-none px-6 py-2.5 rounded-lg bg-green-600 text-white hover:bg-green-500 font-semibold shadow-lg shadow-green-900/50 transition-all"
                >
                    Approve Payment
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 4. CHECK-IN MODAL
// ==========================================
export const CheckInModal = ({ isOpen, transaction, onClose, onConfirm, loading }) => {
  if (!isOpen || !transaction) return null;
  const hasBalance = Number(transaction.balance) > 0;
  
  return (
    <div className="fixed inset-0 z-[1300] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Check-In Confirmation</h3>
        
        <div className="bg-orange-50 border border-orange-100 p-5 rounded-xl mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-orange-100 rounded-full text-orange-600"><User size={20} /></div>
            <span className="font-bold text-gray-900 text-lg">{transaction.customer_name}</span>
          </div>
          
          {hasBalance ? (
            <div className="bg-white border border-orange-200 p-4 rounded-lg mt-3 shadow-sm">
              <p className="text-orange-800 font-bold text-sm uppercase tracking-wide mb-1">Payment Required</p>
              <p className="text-gray-700 text-sm">Balance to pay:</p>
              <p className="text-2xl font-bold text-orange-600">₱{Number(transaction.balance).toLocaleString()}</p>
              <p className="text-xs text-orange-600 mt-2 italic">*Balance will be marked as paid upon check-in.</p>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg mt-3 flex items-center gap-2">
              <CheckCircle size={18} className="text-green-600"/>
              <p className="text-green-800 font-bold">Fully Paid</p>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} disabled={loading} className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors">Cancel</button>
          <button onClick={onConfirm} disabled={loading} className="flex-1 py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 shadow-lg shadow-orange-200 transition-colors">
            {loading ? 'Processing...' : 'Confirm Check-In'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 5. DETAIL MODAL (AMENITIES OR EXTENSIONS)
// ==========================================
export const DetailModal = ({ isOpen, transaction, onClose, viewType }) => {
  if (!isOpen || !transaction) return null;

  const reservations = transaction.reservations || [];
  const extensions = transaction.extensions || [];
  
  const extensionTotal = extensions.reduce((sum, ext) => sum + parseFloat(ext.additional_cost || 0), 0);
  const totalAmount = parseFloat(transaction.total_amount || 0);
  const baseTotal = totalAmount - extensionTotal;

  // --- LOGIC: Calculate Entrance Fee (Guest Count * 50) ---
  const guestCount = parseInt(transaction.num_guest) || 0;
  const entranceFee = guestCount * 50;

  const isAmenityView = viewType === 'amenities';

  return (
    <div className="fixed inset-0 z-[1300] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[85vh]">
        <div className={`p-5 border-b flex justify-between items-center ${isAmenityView ? 'bg-gray-50' : 'bg-purple-50'}`}>
          <h3 className={`font-bold text-lg flex items-center gap-2 ${isAmenityView ? 'text-gray-800' : 'text-purple-800'}`}>
            {isAmenityView ? <Layers size={20} className="text-orange-600"/> : <Clock size={20} className="text-purple-600"/>}
            {isAmenityView ? 'Amenity Details' : 'Extension Breakdown'}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-black/5 rounded-full"><X size={20}/></button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
          <div>
            <p className="text-2xl font-bold text-gray-900">{transaction.customer_name}</p>
            <p className="text-xs text-gray-400 font-mono uppercase">Ref: {transaction.transaction_ref}</p>
            
            {/* GUEST COUNT DISPLAY */}
            {transaction.num_guest && (
               <div className="flex items-center gap-2 mt-2 text-sm text-gray-600 font-medium bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 inline-flex">
                  <Users size={16} className="text-orange-500" />
                  <span>{transaction.num_guest} Guests</span>
               </div>
            )}
          </div>

          {isAmenityView && (
            <div className="space-y-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Booked Items</p>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3">
                {/* 1. Amenities List */}
                {reservations.map((res, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700">{res.quantity}x {res.amenity_name}</span>
                    <span className="font-bold text-gray-900">₱{(parseFloat(res.price) * parseInt(res.quantity)).toLocaleString()}</span>
                  </div>
                ))}

                {/* 2. ENTRANCE FEE ROW (No border-t or dashed lines as requested) */}
                {guestCount > 0 && (
                  <div className="flex justify-between text-sm pt-2 mt-2">
                    <div className="flex items-center gap-2">
                       <span className="bg-blue-50 text-blue-600 w-5 h-5 flex items-center justify-center rounded text-xs font-bold">{guestCount}</span>
                       <span className="font-medium text-gray-700">Entrance Fee (₱50)</span>
                    </div>
                    <span className="font-bold text-gray-900">₱{entranceFee.toLocaleString()}</span>
                  </div>
                )}

                {/* 3. Base Amount (HIGHLIGHTED ORANGE BOX, BOTTOM RIGHT) */}
                {/* Updated to use bg-orange-50 and standard padding/margins for box effect */}
                <div className="flex justify-between items-center bg-orange-50 p-3 rounded-lg border border-orange-100 mt-4">
                  <span className="text-orange-900 font-bold">Base Amount</span>
                  <span className="font-extrabold text-xl text-orange-600">₱{baseTotal.toLocaleString()}</span>
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
                  <div className="pt-2 flex justify-between items-center text-sm"><span className="font-bold text-purple-800">Total Fees</span><span className="font-bold text-xl text-purple-700">₱{extensionTotal.toLocaleString()}</span></div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 6. EXTEND MODAL
// ==========================================
export const ExtendModal = ({ isOpen, transaction, onClose, onExtend, loading }) => {
  const [extendHours, setExtendHours] = useState(1);

  if (!isOpen || !transaction) return null;

  // CALCULATIONS
  const oldTotalAmount = parseFloat(transaction.total_amount || 0); // Current Total
  const hourlyRate = oldTotalAmount / 22; 
  const rawAmount = hourlyRate * extendHours;
  const additionalAmount = Math.ceil(rawAmount / 10) * 10;
  const newTotalAmount = oldTotalAmount + additionalAmount; // NEW Grand Total

  const currentOut = transaction.reservations?.[0]?.check_out_date 
    ? new Date(transaction.reservations[0].check_out_date) 
    : new Date();
  
  const newOutDateObj = new Date(currentOut);
  newOutDateObj.setHours(newOutDateObj.getHours() + extendHours);
  const newCheckoutDate = newOutDateObj.toISOString();

  const handleValueChange = (e) => {
    const val = parseInt(e.target.value);
    if (!isNaN(val) && val > 0) setExtendHours(val);
  };

  const handleSubmit = () => {
    onExtend({
      newCheckoutDate,
      additionalAmount,
      extensionType: 'Hourly',
      extensionValue: extendHours,
      extended_items: [{ name: 'Room/Amenity Extension', qty: extendHours, cost: additionalAmount }]
    });
  };

  return (
    <div className="fixed inset-0 z-[1300] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-gradient-to-r from-orange-600 to-amber-600 p-6 text-white flex justify-between items-center">
          <div><h3 className="text-xl font-bold flex items-center gap-2"><Clock size={24} /> Extend Stay</h3><p className="text-orange-100 text-sm mt-1">{transaction.customer_name}</p></div>
          <button onClick={onClose} className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition"><X size={20} /></button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          <div className="flex items-center justify-between border-2 border-gray-100 rounded-2xl p-4 bg-gray-50/50">
            <div className="flex flex-col"><span className="text-gray-700 font-bold text-base">Add Hours</span><span className="text-[10px] text-gray-500 uppercase tracking-wide">Late Checkout</span></div>
            <div className="flex items-center gap-2 bg-white p-1 rounded-xl shadow-sm border border-gray-200">
              <button onClick={() => setExtendHours(Math.max(1, extendHours - 1))} className="w-10 h-10 rounded-lg hover:bg-gray-100 flex items-center justify-center font-bold text-lg text-gray-600 transition-colors">-</button>
              <input type="number" min="1" value={extendHours} onChange={handleValueChange} className="w-14 h-10 text-center text-2xl font-bold text-orange-600 bg-transparent outline-none"/>
              <button onClick={() => setExtendHours(extendHours + 1)} className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 hover:bg-orange-200 flex items-center justify-center font-bold text-lg transition-colors">+</button>
            </div>
          </div>

          <div className="bg-orange-50/50 p-5 rounded-2xl border border-orange-100 space-y-3">
            <div className="flex justify-between text-sm"><span className="text-gray-500">Current Check-out</span><span className="font-medium text-gray-800">{transaction.reservations?.[0]?.check_out_date ? new Date(transaction.reservations[0].check_out_date).toLocaleString('en-US', { hour: 'numeric', minute:'2-digit', month: 'short', day: 'numeric'}) : ''}</span></div>
            <div className="flex justify-between text-sm"><span className="text-blue-600 font-bold">New Check-out</span><span className="font-bold text-blue-600">{new Date(newCheckoutDate).toLocaleString('en-US', { hour: 'numeric', minute:'2-digit', month: 'short', day: 'numeric'})}</span></div>
            
            <div className="border-t border-blue-200 pt-3 mt-2 space-y-2">
                {/* OLD Payment with Strikethrough */}
                <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>Previous Total</span>
                    <span className="line-through decoration-red-500 decoration-2">₱{oldTotalAmount.toLocaleString()}</span>
                </div>

                {/* Additional Fee */}
                <div className="flex justify-between items-center text-sm">
                    <span className="font-medium text-gray-700">Extension Fee</span>
                    <span className="font-bold text-green-600">+₱{additionalAmount.toLocaleString()}</span>
                </div>

                {/* New GRAND TOTAL */}
                <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-orange-200 mt-2">
                    <span className="font-bold text-orange-800">New Total Amount</span>
                    <span className="text-2xl font-extrabold text-orange-600">₱{newTotalAmount.toLocaleString()}</span>
                </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t bg-gray-50 flex gap-3">
          <button onClick={onClose} disabled={loading} className="flex-1 py-3 font-bold text-gray-600 bg-white border border-gray-300 rounded-xl hover:bg-gray-100">Cancel</button>
          <button onClick={handleSubmit} disabled={loading || additionalAmount <= 0} className="flex-1 py-3 font-bold text-white bg-gradient-to-r from-orange-600 to-amber-600 rounded-xl hover:shadow-lg disabled:opacity-50 transition-all">{loading ? 'Processing...' : `Pay & Extend`}</button>
        </div>
      </div>
    </div>
  );
};