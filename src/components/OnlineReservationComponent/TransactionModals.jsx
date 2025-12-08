import React, { useState, useEffect } from 'react';
import { 
  X, CheckCircle, XCircle, AlertCircle, RefreshCw, User, 
  FileText, ZoomIn, ZoomOut, Clock, Layers, Info, RotateCcw, Maximize
} from 'lucide-react';

const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:7777';

const getImageUrl = (imagePath) => {
  if (!imagePath) return 'https://via.placeholder.com/400x300?text=No+Image';
  if (imagePath.startsWith('http')) return imagePath;
  return `${backendUrl}/uploads/${imagePath}`;
};

// --- ACTION MODAL (APPROVE/REJECT) ---
export const ActionModal = ({ isOpen, type, transaction, onClose, onConfirm, loading }) => {
  if (!isOpen || !transaction) return null;
  const isConfirm = type === 'Confirmed';
  return (
    <div className="fixed inset-0 z-[1300] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full transform transition-all scale-100">
        <div className={`mx-auto mb-4 w-16 h-16 rounded-full flex items-center justify-center ${isConfirm ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
            {isConfirm ? <CheckCircle size={32}/> : <XCircle size={32}/>}
        </div>
        <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
          {isConfirm ? 'Approve Payment?' : 'Reject Payment?'}
        </h3>
        <p className="text-gray-500 text-center text-sm mb-6">
          {isConfirm ? `Confirm reservation for ${transaction.customer_name}.` : `Reject proof of payment for ${transaction.customer_name}.`}
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} disabled={loading} className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50">Cancel</button>
          <button onClick={onConfirm} disabled={loading} className={`flex-1 py-3 text-white rounded-xl font-semibold shadow-lg ${isConfirm ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>{loading ? 'Processing...' : 'Confirm'}</button>
        </div>
      </div>
    </div>
  );
};

// --- UPDATED PROOF MODAL WITH ACTIONS ---
export const ProofModal = ({ isOpen, transaction, onClose, imageErrors, onRetryLoad, onError, onAction, loading }) => {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (isOpen) { setScale(1); setRotation(0); setPosition({ x: 0, y: 0 }); }
  }, [isOpen]);

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
      
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-black/40 absolute top-0 w-full z-50">
        <div className="text-white">
            <h3 className="font-bold text-lg flex items-center gap-2"><FileText size={20} className="text-blue-400"/> Proof of Payment</h3>
            <p className="text-xs text-gray-400 font-mono">{transaction.transaction_ref}</p>
        </div>
        <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"><X size={24} /></button>
      </div>

      {/* Image Viewer */}
      <div className="flex-1 flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing p-4"
        onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
        onWheel={(e) => { if(e.deltaY < 0) handleZoomIn(); else handleZoomOut(); }}>
        {imageErrors[transaction.id] ? (
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

      {/* Footer Controls & Actions */}
      <div className="bg-black/80 backdrop-blur-md p-4 absolute bottom-0 w-full flex flex-col md:flex-row items-center justify-between gap-4 border-t border-white/10">
        <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
            <button onClick={handleZoomOut} className="text-white hover:text-blue-400 p-1"><ZoomOut size={20}/></button>
            <span className="text-xs text-gray-300 w-12 text-center">{Math.round(scale * 100)}%</span>
            <button onClick={handleZoomIn} className="text-white hover:text-blue-400 p-1"><ZoomIn size={20}/></button>
            <div className="w-px h-4 bg-gray-600 mx-2"></div>
            <button onClick={handleRotate} className="text-white hover:text-green-400 p-1" title="Rotate"><RotateCcw size={18}/></button>
            <button onClick={handleReset} className="text-white hover:text-red-400 p-1" title="Reset View"><Maximize size={18}/></button>
        </div>

        {/* 👇 ACTION BUTTONS INSIDE PROOF MODAL */}
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

// --- CHECK-IN MODAL ---
export const CheckInModal = ({ isOpen, transaction, onClose, onConfirm, loading }) => {
  if (!isOpen || !transaction) return null;
  const hasBalance = Number(transaction.balance) > 0;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Check-In Confirmation</h3>
        
        <div className="bg-blue-50 border border-blue-100 p-5 rounded-xl mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-100 rounded-full text-blue-600"><User size={20} /></div>
            <span className="font-bold text-gray-900 text-lg">{transaction.customer_name}</span>
          </div>
          
          {hasBalance ? (
            <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg mt-3">
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
          <button onClick={onConfirm} disabled={loading} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-colors">
            {loading ? 'Processing...' : 'Confirm Check-In'}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- DETAILS MODAL (AMENITIES OR EXTENSIONS) ---
export const DetailModal = ({ isOpen, transaction, onClose, viewType }) => {
  if (!isOpen || !transaction) return null;

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

// --- EXTEND MODAL (HOURLY ONLY) ---
export const ExtendModal = ({ isOpen, transaction, onClose, onExtend, loading }) => {
  const [extendHours, setExtendHours] = useState(1);
  const [newCheckoutDate, setNewCheckoutDate] = useState('');
  const [additionalAmount, setAdditionalAmount] = useState(0);

  useEffect(() => {
    if (isOpen && transaction) setExtendHours(1);
  }, [isOpen, transaction]);

  useEffect(() => {
    if (!transaction) return;
    const totalAmount = parseFloat(transaction.total_amount || 0);
    const hourlyRate = totalAmount / 22;
    const computedAmount = hourlyRate * extendHours;
    setAdditionalAmount(Math.ceil(computedAmount / 10) * 10);

    const currentOut = transaction.reservations?.[0]?.check_out_date ? new Date(transaction.reservations[0].check_out_date) : new Date();
    const newOut = new Date(currentOut);
    newOut.setHours(newOut.getHours() + extendHours);
    setNewCheckoutDate(newOut.toISOString());
  }, [extendHours, transaction]);

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

  if (!isOpen || !transaction) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6 text-white flex justify-between items-center">
          <div><h3 className="text-xl font-bold flex items-center gap-2"><Clock size={24} /> Extend Stay</h3><p className="text-blue-100 text-sm mt-1">{transaction.customer_name}</p></div>
          <button onClick={onClose} className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition"><X size={20} /></button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          <div className="flex items-center justify-between border-2 border-gray-100 rounded-2xl p-4 bg-gray-50/50">
            <div className="flex flex-col"><span className="text-gray-700 font-bold text-base">Add Hours</span><span className="text-[10px] text-gray-500 uppercase tracking-wide">Late Checkout</span></div>
            <div className="flex items-center gap-2 bg-white p-1 rounded-xl shadow-sm border border-gray-200">
              <button onClick={() => setExtendHours(Math.max(1, extendHours - 1))} className="w-10 h-10 rounded-lg hover:bg-gray-100 flex items-center justify-center font-bold text-lg text-gray-600 transition-colors">-</button>
              <input type="number" min="1" value={extendHours} onChange={handleValueChange} className="w-14 h-10 text-center text-2xl font-bold text-blue-600 bg-transparent outline-none"/>
              <button onClick={() => setExtendHours(extendHours + 1)} className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 flex items-center justify-center font-bold text-lg transition-colors">+</button>
            </div>
          </div>

          <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100 space-y-3">
            <div className="flex justify-between text-sm"><span className="text-gray-500">Current Check-out</span><span className="font-medium text-gray-800">{transaction.reservations?.[0]?.check_out_date ? new Date(transaction.reservations[0].check_out_date).toLocaleString('en-US', { hour: 'numeric', minute:'2-digit', month: 'short', day: 'numeric'}) : ''}</span></div>
            <div className="flex justify-between text-sm"><span className="text-blue-600 font-bold">New Check-out</span><span className="font-bold text-blue-600">{new Date(newCheckoutDate).toLocaleString('en-US', { hour: 'numeric', minute:'2-digit', month: 'short', day: 'numeric'})}</span></div>
            <div className="border-t border-blue-200 pt-3 mt-2 flex justify-between items-center"><span className="font-bold text-gray-800 text-lg">Additional Fee</span><span className="text-3xl font-bold text-green-600">₱{additionalAmount.toLocaleString()}</span></div>
            <div className="text-[10px] text-center text-blue-400 italic mt-2">Computed as: (Total Booking Price ÷ 22) × {extendHours} Hours</div>
          </div>
        </div>

        <div className="p-4 border-t bg-gray-50 flex gap-3">
          <button onClick={onClose} disabled={loading} className="flex-1 py-3 font-bold text-gray-600 bg-white border border-gray-300 rounded-xl hover:bg-gray-100">Cancel</button>
          <button onClick={handleSubmit} disabled={loading || additionalAmount <= 0} className="flex-1 py-3 font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl hover:shadow-lg disabled:opacity-50 transition-all">{loading ? 'Processing...' : `Confirm (+₱${additionalAmount.toLocaleString()})`}</button>
        </div>
      </div>
    </div>
  );
};