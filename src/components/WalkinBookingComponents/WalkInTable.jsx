import React, { useState } from 'react';
import { Search, Info, CheckCircle, Plus, RefreshCw, Clock, LogIn, LogOut } from 'lucide-react';

const WalkInTable = ({ 
  recentWalkIns, 
  handleStatusUpdate, 
  openExtendModal,
  openDetailsModal, 
  refreshData
}) => {
    const [tableSearch, setTableSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    const formatDateTime = (d) => {
        if (!d) return { date: '-', time: '' };
        const dateObj = new Date(d);
        return {
            date: dateObj.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' }),
            time: dateObj.toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit', hour12: true })
        };
    };

    const getAmenitySummary = (transaction) => {
        if (!transaction.reservations || transaction.reservations.length === 0) return 'No amenities';
        const amenities = transaction.reservations.map(res => `${res.amenity_name} x${res.quantity}`);
        if (amenities.length <= 2) return amenities.join(', ');
        return `${amenities.slice(0, 2).join(', ')} +${amenities.length - 2} more`;
    };

    const getExtensionSummary = (transaction) => {
        const extensions = transaction.extensions || [];
        if (extensions.length === 0) {
            return { count: 0, cost: 0, base: parseFloat(transaction.total_amount || 0) };
        }
        const totalExtensionCost = extensions.reduce((sum, ext) => sum + parseFloat(ext.additional_cost || 0), 0);
        return {
            count: extensions.length,
            cost: totalExtensionCost,
            base: parseFloat(transaction.total_amount || 0) - totalExtensionCost
        };
    };

    const filteredWalkIns = recentWalkIns.filter(t => {
        const q = tableSearch.toLowerCase();
        const matchesSearch = (t.customer_name || '').toLowerCase().includes(q) || (t.transaction_ref || '').toLowerCase().includes(q);
        const matchesStatus = statusFilter === 'All' 
            ? true 
            : t.booking_status === (statusFilter === 'Checked In' ? 'Checked-In' : statusFilter);
        return matchesSearch && matchesStatus;
    });

    const FilterTab = ({ label }) => (
        <button 
            onClick={() => setStatusFilter(label)}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all border whitespace-nowrap
                ${statusFilter === label 
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
        >
            {label}
        </button>
    );

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mt-8">
            
            <div className="p-5 border-b border-gray-200 bg-gray-50 flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    
                    {/* SEARCH BAR FIX */}
                    <div className="relative w-full sm:w-72">
                        {/* Input Field with Left Padding */}
                        <input 
                            type="text" 
                            placeholder="Search Name or Ref..." 
                            value={tableSearch} 
                            onChange={(e) => setTableSearch(e.target.value)} 
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                        />
                        {/* Icon Positioned Absolute Left */}
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                            <Search size={18} />
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button onClick={refreshData} className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-lg text-sm hover:bg-gray-50 transition-all font-medium">
                            <RefreshCw size={14} /> Refresh
                        </button>
                        <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium border border-blue-100">
                            <Clock size={16}/> 
                            Total: {filteredWalkIns.length}
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {['All', 'Confirmed', 'Checked In', 'Completed', 'Cancelled'].map(status => (
                        <FilterTab key={status} label={status} />
                    ))}
                </div>
            </div>
            
            <div className=""> 
                <table className="w-full text-left text-sm border-collapse">
                    <thead className="text-xs text-gray-600 uppercase font-bold sticky top-0 z-30 shadow-md">
                        <tr>
                            <th className="px-4 py-4 bg-gray-100 border-b border-gray-200 sticky top-0">Ref ID</th>
                            <th className="px-4 py-4 bg-gray-100 border-b border-gray-200 sticky top-0">Customer</th>
                            <th className="px-4 py-4 bg-gray-100 border-b border-gray-200 sticky top-0">Amenities</th>
                            <th className="px-4 py-4 bg-gray-100 border-b border-gray-200 sticky top-0">Extensions</th>
                            <th className="px-4 py-4 bg-gray-100 border-b border-gray-200 sticky top-0 text-center">Time In/Out</th>
                            <th className="px-4 py-4 bg-gray-100 border-b border-gray-200 sticky top-0 text-center">Payment</th>
                            <th className="px-4 py-4 bg-gray-100 border-b border-gray-200 sticky top-0 text-center">Status</th>
                            <th className="px-4 py-4 bg-gray-100 border-b border-gray-200 sticky top-0 text-center">Actions</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100 bg-white">
                        {filteredWalkIns.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="px-6 py-12 text-center text-gray-400">
                                    <div className="flex flex-col items-center">
                                        <Search size={40} className="text-gray-300 mb-3"/>
                                        <p className="font-medium">No walk-in transactions found.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredWalkIns.map(t => {
                                const sched = t.reservations?.[0];
                                const extInfo = getExtensionSummary(t);
                                const isExtended = extInfo.cost > 0;
                                const checkIn = formatDateTime(sched?.check_in_date);
                                const checkOut = formatDateTime(sched?.check_out_date);

                                return (
                                    <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 font-mono text-xs font-bold text-gray-600">{t.transaction_ref}</td>
                                        <td className="px-4 py-3"><div className="font-bold text-gray-800">{t.customer_name}</div><div className="text-xs text-gray-500">{t.contact_number}</div></td>
                                        <td className="px-4 py-3"><div className="text-gray-700 font-medium text-xs truncate max-w-[150px]" title={getAmenitySummary(t)}>{getAmenitySummary(t)}</div><button onClick={() => openDetailsModal(t, 'amenities')} className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 mt-1 font-semibold"><Info size={12} /> View details</button></td>
                                        <td className="px-4 py-3">{isExtended ? (<div className="flex flex-col items-start"><span className="text-xs font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-100">{extInfo.count} added</span><button onClick={() => openDetailsModal(t, 'extensions')} className="text-[10px] text-purple-500 hover:text-purple-700 flex items-center gap-1 mt-1 font-semibold"><Plus size={10} /> See breakdown</button></div>) : <span className="text-gray-300 text-xs">-</span>}</td>
                                        <td className="px-4 py-3 text-center"><div className="flex flex-col items-center gap-1"><div className="flex flex-col text-xs"><span className="text-gray-500">{checkIn.date}</span><span className="font-bold text-green-700">{checkIn.time}</span></div><span className="text-gray-300 rotate-90 sm:rotate-0">↓</span><div className="flex flex-col text-xs"><span className="text-gray-500">{checkOut.date}</span><span className={`font-bold ${isExtended ? 'text-purple-600' : 'text-orange-700'}`}>{checkOut.time}</span></div></div></td>
                                        <td className="px-4 py-3 text-center"><div className="flex flex-col items-center"><div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700 border border-green-200 mb-1"><CheckCircle size={10}/> Paid</div>{isExtended ? (<div className="flex flex-col text-xs"><span className="line-through text-gray-400 decoration-gray-400 decoration-2">₱{extInfo.base.toLocaleString()}</span><span className="font-bold text-gray-900 text-sm">₱{parseFloat(t.total_amount).toLocaleString()}</span></div>) : (<span className="font-bold text-gray-900 text-sm">₱{parseFloat(t.total_amount).toLocaleString()}</span>)}</div></td>
                                        <td className="px-4 py-3 text-center"><span className={`px-2 py-1 rounded text-xs font-bold border ${t.booking_status === 'Checked-In' ? 'bg-blue-50 text-blue-700 border-blue-200' : t.booking_status === 'Completed' ? 'bg-gray-50 text-gray-600 border-gray-200' : t.booking_status === 'Confirmed' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}>{t.booking_status}</span></td>
                                        <td className="px-4 py-3"><div className="flex justify-center gap-1">{t.booking_status === 'Confirmed' && (<><button onClick={() => handleStatusUpdate(t.id, 'Checked-In')} className="p-1.5 bg-blue-600 text-white rounded hover:bg-blue-700" title="Check In"><LogIn size={14}/></button><button onClick={() => handleStatusUpdate(t.id, 'Cancelled')} className="p-1.5 bg-gray-100 text-gray-500 rounded hover:bg-red-100 hover:text-red-600" title="Cancel"><LogOut size={14} className="rotate-180"/></button></>)}{t.booking_status === 'Checked-In' && (<><button onClick={() => openExtendModal(t)} className="p-1.5 bg-purple-600 text-white rounded hover:bg-purple-700" title="Extend"><Clock size={14}/></button><button onClick={() => handleStatusUpdate(t.id, 'Completed')} className="p-1.5 bg-orange-600 text-white rounded hover:bg-orange-700" title="Check Out"><LogOut size={14}/></button></>)}</div></td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default WalkInTable;