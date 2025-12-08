import React, { useState } from 'react';
import { Eye, Search, Clock, Plus, Info, LogIn, Ban, LogOut, X, ChevronRight, Calendar, Phone, CreditCard, Tag } from 'lucide-react';

// Mobile Modal Component - SIMPLIFIED VERSION
// Mobile Modal Component - FIXED VERSION
const MobileTransactionModal = ({ transaction, isOpen, onClose, onAction, onViewProof, onViewDetails, onStatusUpdate, onExtendBooking }) => {
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
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop - lighter background */}
      <div 
        className="fixed inset-0 bg-gray-500/50"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative min-h-screen flex items-start justify-center p-4 pt-20">
        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md">
          
          {/* Header */}
          <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 rounded-t-2xl flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-800">Reservation Details</h3>
              <p className="text-sm text-gray-500">{transaction.transaction_ref}</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4 space-y-4">
            
            {/* Customer Info */}
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Tag size={20} className="text-blue-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">{transaction.customer_name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Phone size={14} className="text-gray-400" />
                    <span className="text-sm text-gray-600">{transaction.contact_number}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Date & Time */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Calendar size={16} className="text-gray-500" />
                <h4 className="font-bold text-gray-700">Schedule</h4>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-gray-500">Check In</p>
                    <p className="font-bold text-green-700">{inDT.date} • {inDT.time}</p>
                  </div>
                  <ChevronRight size={20} className="text-gray-300" />
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Check Out</p>
                    <p className={`font-bold ${isExtended ? 'text-purple-600' : 'text-orange-700'}`}>
                      {outDT.date} • {outDT.time}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Amenities - CHANGED: Removed onClose() */}
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-gray-700">Amenities</h4>
                <button 
                  onClick={() => onViewDetails(transaction, 'amenities')}
                  className="text-blue-600 text-sm font-semibold flex items-center gap-1"
                >
                  Details <ChevronRight size={16} />
                </button>
              </div>
              <p className="text-sm text-gray-600">{amenities}</p>
            </div>

            {/* Extensions - CHANGED: Removed onClose() */}
            {isExtended && (
              <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Plus size={16} className="text-purple-600" />
                    <h4 className="font-bold text-purple-700">Extensions</h4>
                  </div>
                  <button 
                    onClick={() => onViewDetails(transaction, 'extensions')}
                    className="text-purple-600 text-sm font-semibold flex items-center gap-1"
                  >
                    Breakdown <ChevronRight size={16} />
                  </button>
                </div>
                <p className="text-sm text-purple-600">
                  {extInfo.count} extension(s) added • Additional: ₱{extInfo.cost.toLocaleString()}
                </p>
              </div>
            )}

            {/* Payment */}
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <CreditCard size={16} className="text-gray-500" />
                <h4 className="font-bold text-gray-700">Payment</h4>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className={`font-bold ${isFullyPaid ? 'text-green-600' : 'text-orange-600'}`}>
                    {paymentLabel}
                  </span>
                </div>
                {isExtended ? (
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Base Amount</span>
                      <span className="line-through text-gray-400">₱{extInfo.base.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Extensions</span>
                      <span className="text-purple-600">+₱{extInfo.cost.toLocaleString()}</span>
                    </div>
                  </div>
                ) : null}
                <div className="flex justify-between pt-2 border-t border-gray-100">
                  <span className="font-bold text-gray-700">Total Amount</span>
                  <span className="font-bold text-lg text-gray-900">
                    ₱{parseFloat(transaction.total_amount).toLocaleString()}
                  </span>
                </div>
                {!isFullyPaid && downpayment > 0 && (
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-sm text-gray-500">
                      Downpayment: ₱{downpayment.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Status */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-500">Booking Status</p>
                  <p className={`font-bold ${
                    transaction.booking_status === 'Checked-In' ? 'text-blue-600' :
                    transaction.booking_status === 'Completed' ? 'text-gray-600' :
                    transaction.booking_status === 'Confirmed' ? 'text-green-600' :
                    transaction.booking_status === 'Pending' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {transaction.booking_status}
                  </p>
                </div>
                {transaction.proof_of_payment && (
                  <button 
                    onClick={() => onViewProof(transaction)}
                    className="flex items-center gap-2 px-3 py-2 bg-cyan-50 text-cyan-700 border border-cyan-200 rounded-lg hover:bg-cyan-100 transition-colors"
                  >
                    <Eye size={16} />
                    <span className="text-sm font-bold">View Proof</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Actions Footer - CHANGED: Removed onClose() */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 rounded-b-2xl">
            <div className="flex flex-wrap gap-2">
              {transaction.booking_status === 'Pending' && !transaction.proof_of_payment ? (
                <button 
                  onClick={() => onViewDetails(transaction, 'amenities')}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors text-center"
                >
                  Review Reservation
                </button>
              ) : transaction.booking_status === 'Confirmed' ? (
                <>
                  <button 
                    onClick={() => onStatusUpdate(transaction.id, 'Checked-In')}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <LogIn size={18} />
                    Check In
                  </button>
                  <button 
                    onClick={() => onStatusUpdate(transaction.id, 'Cancelled')}
                    className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-red-50 hover:text-red-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Ban size={18} />
                    Cancel
                  </button>
                </>
              ) : transaction.booking_status === 'Checked-In' ? (
                <>
                  <button 
                    onClick={() => onExtendBooking(transaction)}
                    className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Clock size={18} />
                    Extend
                  </button>
                  <button 
                    onClick={() => onStatusUpdate(transaction.id, 'Completed')}
                    className="flex-1 px-4 py-3 bg-orange-600 text-white rounded-lg font-bold hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <LogOut size={18} />
                    Check Out
                  </button>
                </>
              ) : (
                <button 
                  onClick={onClose}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-gray-200 transition-colors"
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

// Main Component - SAME AS BEFORE (walang useEffect for scroll prevention)
const TransactionTable = ({ 
  transactions, 
  onViewProof, 
  onViewDetails, 
  onAction,
  onStatusUpdate, 
  onExtendBooking 
}) => {
  const [tableSearch, setTableSearch] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formatDateTime = (dateStr) => {
    if (!dateStr) return { date: '-', time: '' };
    const date = new Date(dateStr);
    return {
      date: date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' }),
      time: date.toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit', hour12: true })
    };
  };

  const getAmenitySummary = (transaction) => {
    if (!transaction.reservations || transaction.reservations.length === 0) return 'No amenities';
    const amenities = transaction.reservations.map(res => `${res.amenity_name} x${res.quantity}`);
    if (amenities.length <= 2) return amenities.join(', ');
    return `${amenities.slice(0, 2).join(', ')} +${amenities.length - 2} more`;
  };

  const filteredTransactions = transactions.filter(t => {
    const q = tableSearch.toLowerCase();
    return (t.customer_name || '').toLowerCase().includes(q) || (t.transaction_ref || '').toLowerCase().includes(q);
  });

  const handleRowClick = (transaction) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  return (
    <>
      {/* Desktop View - Original Table */}
      <div className="hidden lg:block bg-white border border-gray-200 rounded-xl shadow-sm mt-6 overflow-hidden">
        <div className="p-5 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <div className="relative w-72">

            <input 
              type="text" 
              placeholder="Search Reference or Name..." 
              value={tableSearch} 
              onChange={(e) => setTableSearch(e.target.value)} 
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium border border-blue-100">
              <Clock size={16}/> 
              Total: {filteredTransactions.length}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-4 py-4 border-b border-gray-200">Ref ID</th>
                <th className="px-4 py-4 border-b border-gray-200">Customer</th>
                <th className="px-4 py-4 border-b border-gray-200">Amenities</th>
                <th className="px-4 py-4 border-b border-gray-200">Extensions</th>
                <th className="px-4 py-4 border-b border-gray-200 text-center">Time In/Out</th>
                <th className="px-4 py-4 border-b border-gray-200 text-center">Payment</th>
                <th className="px-4 py-4 border-b border-gray-200 text-center">Status</th>
                <th className="px-4 py-4 border-b border-gray-200 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 bg-white">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-gray-400 italic">
                    No online reservations found.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map(t => {
                  const sched = t.reservations?.[0];
                  const inDT = formatDateTime(sched?.check_in_date);
                  const outDT = formatDateTime(sched?.check_out_date);
                  const amenities = getAmenitySummary(t);

                  return (
                    <tr key={t.id} className="hover:bg-orange-50/50 transition-colors">
                      <td className="px-4 py-4 font-mono text-xs font-bold text-gray-600">{t.transaction_ref}</td>
                      <td className="px-4 py-4">
                        <div className="font-bold text-gray-800">{t.customer_name}</div>
                        <div className="text-xs text-gray-500">{t.contact_number}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-gray-700 font-medium text-xs truncate max-w-[150px]" title={amenities}>
                          {amenities}
                        </div>
                        <button 
                          onClick={() => onViewDetails(t, 'amenities')}
                          className="text-[11px] text-blue-600 hover:text-blue-800 flex items-center gap-1 mt-1 font-semibold"
                        >
                          <Info size={12} /> View details
                        </button>
                      </td>
                      <td className="px-4 py-4">
                        {(t.extensions || []).length > 0 ? (
                          <div className="flex flex-col items-start">
                            <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-100">
                              {t.extensions.length} added
                            </span>
                            <button 
                              onClick={() => onViewDetails(t, 'extensions')}
                              className="text-[11px] text-purple-500 hover:text-purple-700 flex items-center gap-1 mt-1 font-semibold"
                            >
                              <Plus size={10} /> See breakdown
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-300 text-xs">-</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex flex-col items-center text-xs">
                          <div className="flex flex-col">
                            <span className="text-gray-500">{inDT.date}</span>
                            <span className="font-bold text-green-700">{inDT.time}</span>
                          </div>
                          <span className="text-gray-300 my-0.5">↓</span>
                          <div className="flex flex-col">
                            <span className="text-gray-500">{outDT.date}</span>
                            <span className="font-bold text-orange-700">{outDT.time}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex flex-col items-center">
                          <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border mb-1 ${
                            ['Checked-In', 'Completed'].includes(t.booking_status) ? 'bg-green-100 text-green-700 border-green-200' : 'bg-orange-100 text-orange-700 border-orange-200'
                          }`}>
                            {['Checked-In', 'Completed'].includes(t.booking_status) ? 'Fully Paid' : 'Partial'}
                          </div>
                          <span className="font-bold text-gray-900 text-sm">₱{parseFloat(t.total_amount).toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-[11px] font-bold border ${
                          t.booking_status === 'Checked-In' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          t.booking_status === 'Completed' ? 'bg-gray-50 text-gray-600 border-gray-200' :
                          t.booking_status === 'Confirmed' ? 'bg-green-50 text-green-700 border-green-200' :
                          t.booking_status === 'Pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                          'bg-red-50 text-red-600 border-red-200'
                        }`}>
                          {t.booking_status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {t.proof_of_payment && (
                            <button 
                              onClick={() => onViewProof(t)}
                              className="flex items-center gap-1 pl-1.5 pr-2 py-1.5 bg-cyan-50 text-cyan-700 border border-cyan-200 rounded-lg hover:bg-cyan-100 transition-colors shadow-sm"
                              title="Check Payment"
                            >
                              <Eye size={14}/>
                              <span className="text-[11px] font-bold uppercase">Proof</span>
                            </button>
                          )}
                          {t.booking_status === 'Confirmed' && (
                            <>
                              <button 
                                onClick={() => onStatusUpdate(t.id, 'Checked-In')}
                                className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                                title="Check In"
                              >
                                <LogIn size={16}/>
                              </button>
                              <button 
                                onClick={() => onStatusUpdate(t.id, 'Cancelled')}
                                className="p-2 bg-gray-100 text-gray-500 rounded-lg hover:bg-red-100 hover:text-red-600"
                                title="Cancel"
                              >
                                <Ban size={16}/>
                              </button>
                            </>
                          )}
                          {t.booking_status === 'Checked-In' && (
                            <>
                              <button 
                                onClick={() => onExtendBooking(t)}
                                className="p-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
                                title="Extend"
                              >
                                <Clock size={16}/>
                              </button>
                              <button 
                                onClick={() => onStatusUpdate(t.id, 'Completed')}
                                className="p-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200"
                                title="Check Out"
                              >
                                <LogOut size={16}/>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile View - Card List */}
      <div className="lg:hidden bg-white border border-gray-200 rounded-xl shadow-sm mt-6 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="relative">

            <input 
              type="text" 
              placeholder="Search Reference or Name..." 
              value={tableSearch} 
              onChange={(e) => setTableSearch(e.target.value)} 
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
          <div className="flex items-center justify-between mt-3">
            <div className="text-sm text-gray-600">
              Showing {filteredTransactions.length} reservation{filteredTransactions.length !== 1 ? 's' : ''}
            </div>
            <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium border border-blue-100">
              <Clock size={16}/> 
              Total: {filteredTransactions.length}
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {filteredTransactions.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-400 italic">
              No online reservations found.
            </div>
          ) : (
            filteredTransactions.map(t => {
              const sched = t.reservations?.[0];
              const inDT = formatDateTime(sched?.check_in_date);
              const outDT = formatDateTime(sched?.check_out_date);
              const amenities = getAmenitySummary(t);
              const isFullyPaid = ['Checked-In', 'Completed'].includes(t.booking_status);
              const hasExtensions = (t.extensions || []).length > 0;

              return (
                <div 
                  key={t.id}
                  onClick={() => handleRowClick(t)}
                  className="p-4 hover:bg-orange-50/50 transition-colors active:bg-orange-50 cursor-pointer"
                >
                  {/* Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-mono text-xs font-bold text-gray-600 mb-1">
                        {t.transaction_ref}
                      </div>
                      <h3 className="font-bold text-gray-800 text-lg">{t.customer_name}</h3>
                      <p className="text-sm text-gray-600">{t.contact_number}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[11px] font-bold border ${
                      t.booking_status === 'Checked-In' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      t.booking_status === 'Completed' ? 'bg-gray-50 text-gray-600 border-gray-200' :
                      t.booking_status === 'Confirmed' ? 'bg-green-50 text-green-700 border-green-200' :
                      t.booking_status === 'Pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                      'bg-red-50 text-red-600 border-red-200'
                    }`}>
                      {t.booking_status}
                    </span>
                  </div>

                  {/* Quick Info */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Check In</p>
                      <p className="font-bold text-green-700 text-sm">{inDT.date} • {inDT.time}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Check Out</p>
                      <p className="font-bold text-orange-700 text-sm">{outDT.date} • {outDT.time}</p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                    <div>
                      <p className="text-xs text-gray-500">Total Amount</p>
                      <p className="font-bold text-gray-900">₱{parseFloat(t.total_amount).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {hasExtensions && (
                        <span className="px-2 py-1 bg-purple-50 text-purple-700 text-[10px] font-bold rounded border border-purple-100">
                          +{(t.extensions || []).length} extensions
                        </span>
                      )}
                      {t.proof_of_payment && (
                        <span className="px-2 py-1 bg-cyan-50 text-cyan-700 text-[10px] font-bold rounded border border-cyan-100">
                          Has Proof
                        </span>
                      )}
                      <ChevronRight size={16} className="text-gray-400" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Mobile Modal */}
      <MobileTransactionModal
        transaction={selectedTransaction}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onViewProof={onViewProof}
        onViewDetails={onViewDetails}
        onStatusUpdate={onStatusUpdate}
        onExtendBooking={onExtendBooking}
      />
    </>
  );
};

export default TransactionTable;