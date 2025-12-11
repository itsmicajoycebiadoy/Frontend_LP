import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../../config/axios';
import { Search, Info, CheckCircle, Plus, RefreshCw, Clock, LogIn, LogOut, Ban, Loader2 } from 'lucide-react';
import WalkInModals from './WalkInModal'; 

const WalkInTable = ({ refreshTrigger }) => { 
    const [recentWalkIns, setRecentWalkIns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    
    // Toast state
    const [toast, setToast] = useState(null);

    const [tableSearch, setTableSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    // Modals
    const [showExtendModal, setShowExtendModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [detailsData, setDetailsData] = useState(null);
    const [detailsViewType, setDetailsViewType] = useState('amenities');
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, action: null, id: null, guestName: '' });

    // Extend
    const [extendHours, setExtendHours] = useState(1);
    const [newCheckoutDateTime, setNewCheckoutDateTime] = useState('');
    const [additionalAmount, setAdditionalAmount] = useState(0);

    // ✅ FIXED: Pass 'title' (Guest Name)
    const showToast = useCallback((title, message, type = 'success') => {
        setToast({ title, message, type, id: Date.now() }); 
    }, []);

    const closeToast = useCallback(() => {
        setToast(null);
    }, []);

    // FETCH (Strict Rules)
    const fetchRecentWalkIns = useCallback(async (isBackground = false) => {
        if (!isBackground) setLoading(true);
        else setIsRefreshing(true);

        try {
            const res = await api.get('/api/transactions');
            const data = Array.isArray(res.data) ? res.data : (res.data.data || []);
            const today = new Date().toLocaleDateString('en-PH', { timeZone: 'Asia/Manila' });

            let walkIns = data.filter(t => {
                const isWalkIn = t.booking_type === 'Walk-in';
                if (!isWalkIn) return false;
                const createdDate = new Date(t.created_at).toLocaleDateString('en-PH', { timeZone: 'Asia/Manila' });
                const updatedDate = new Date(t.updated_at).toLocaleDateString('en-PH', { timeZone: 'Asia/Manila' }); 
                const checkoutDate = t.reservations?.[0]?.check_out_date 
                    ? new Date(t.reservations[0].check_out_date).toLocaleDateString('en-PH', { timeZone: 'Asia/Manila' }) 
                    : null;

                if (['Confirmed', 'Checked-In'].includes(t.booking_status)) return true;
                if (t.booking_status === 'Completed' && checkoutDate === today) return true;
                if (t.booking_status === 'Cancelled' && updatedDate === today) return true;
                if (createdDate === today) return true;

                return false;
            });

            walkIns.sort((a, b) => {
                if (a.booking_status === 'Checked-In' && b.booking_status !== 'Checked-In') return -1;
                if (b.booking_status === 'Checked-In' && a.booking_status !== 'Checked-In') return 1;
                if (a.booking_status === 'Confirmed' && b.booking_status !== 'Confirmed') return -1;
                if (b.booking_status === 'Confirmed' && a.booking_status !== 'Confirmed') return 1;
                return new Date(b.updated_at) - new Date(a.updated_at);
            });
            setRecentWalkIns(walkIns);
        } catch (e) { console.error(e); } 
        finally { setLoading(false); setIsRefreshing(false); }
    }, []);

    useEffect(() => {
        fetchRecentWalkIns(false);
        const interval = setInterval(() => fetchRecentWalkIns(true), 5000);
        return () => clearInterval(interval);
    }, [fetchRecentWalkIns]);

    useEffect(() => { if (refreshTrigger > 0) fetchRecentWalkIns(true); }, [refreshTrigger, fetchRecentWalkIns]);

    // ACTIONS
    const initiateAction = (id, action, guestName) => { setConfirmModal({ isOpen: true, action, id, guestName }); };
    
    const executeAction = async () => {
        const { id, action, guestName } = confirmModal; // Added guestName here
        if (!id || !action) return;
        const previousState = [...recentWalkIns];
        setRecentWalkIns(prev => prev.map(t => t.id === id ? { ...t, booking_status: action } : t));
        setConfirmModal({ isOpen: false, action: null, id: null, guestName: '' }); 
        try {
            await api.put(`/api/transactions/${id}/status`, { booking_status: action });
            // ✅ PASS GUEST NAME AS TITLE
            showToast(guestName, `Status updated to ${action}`, 'success');
            fetchRecentWalkIns(true);
        } catch (e) {
            setRecentWalkIns(previousState);
            showToast(guestName, "Failed to update status.", 'error');
        }
    };

    const openExtend = (transaction) => {
        if (!transaction.reservations || transaction.reservations.length === 0) return showToast('Error', 'No reservation found', 'error');
        setSelectedTransaction(transaction); setExtendHours(1);
        const currentOut = new Date(transaction.reservations[0].check_out_date);
        const newCheckout = new Date(currentOut.getTime() + (60 * 60 * 1000));
        const pad = (n) => String(n).padStart(2, '0');
        setNewCheckoutDateTime(`${newCheckout.getFullYear()}-${pad(newCheckout.getMonth()+1)}-${pad(newCheckout.getDate())}T${pad(newCheckout.getHours())}:${pad(newCheckout.getMinutes())}`);
        const initialRate = parseFloat(transaction.total_amount) / 22;
        setAdditionalAmount(Math.ceil(initialRate / 10) * 10);
        setShowExtendModal(true);
    };

    const handleExtendSubmit = async () => {
        if (!selectedTransaction || !newCheckoutDateTime) return;
        try {
            await api.put(`/api/reservations/${selectedTransaction.reservations[0].id}/extend`, {
                new_check_out_date: newCheckoutDateTime.replace('T', ' ') + ':00',
                additional_cost: additionalAmount, additional_hours: extendHours, extension_type: 'Hourly'
            });
            // ✅ PASS GUEST NAME
            showToast(selectedTransaction.customer_name, 'Extended successfully!', 'success');
            setShowExtendModal(false); setSelectedTransaction(null);
            fetchRecentWalkIns(true);
        } catch (e) { showToast('Error', 'Failed to extend: ' + e.message, 'error'); }
    };

    const openDetails = (transaction, type) => { setDetailsData(transaction); setDetailsViewType(type); setShowDetailsModal(true); };

    // HELPERS
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
        if (extensions.length === 0) return { count: 0, cost: 0 };
        const totalExtensionCost = extensions.reduce((sum, ext) => sum + parseFloat(ext.additional_cost || 0), 0);
        return { count: extensions.length, cost: totalExtensionCost };
    };

    const filteredWalkIns = useMemo(() => {
        if (!recentWalkIns) return [];
        return recentWalkIns.filter(t => {
            const q = tableSearch.toLowerCase();
            const matchesSearch = (t.customer_name || '').toLowerCase().includes(q) || (t.transaction_ref || '').toLowerCase().includes(q);
            const matchesStatus = statusFilter === 'All' ? true : t.booking_status === (statusFilter === 'Checked In' ? 'Checked-In' : statusFilter);
            return matchesSearch && matchesStatus;
        });
    }, [recentWalkIns, tableSearch, statusFilter]);

    // HIDE ACTIONS IF COMPLETED OR CANCELLED
    const shouldShowActions = !['Completed', 'Cancelled'].includes(statusFilter);

    if (loading && recentWalkIns.length === 0) {
        return <div className="bg-white rounded-xl shadow-sm border border-gray-200 mt-8 h-64 flex justify-center items-center"><Loader2 className="animate-spin text-orange-500" size={32} /></div>;
    }

    return (
        <>
            <WalkInModals 
                toast={toast} onCloseToast={closeToast}
                confirmModal={confirmModal} setConfirmModal={setConfirmModal} executeAction={executeAction} isActionLoading={loading || isRefreshing}
                showExtendModal={showExtendModal} setShowExtendModal={setShowExtendModal} transaction={selectedTransaction} handleExtendSubmit={handleExtendSubmit} extendValue={extendHours} setExtendValue={setExtendHours} additionalAmount={additionalAmount} newCheckoutDateTime={newCheckoutDateTime}
                showDetailsModal={showDetailsModal} setShowDetailsModal={setShowDetailsModal} detailsData={detailsData} detailsViewType={detailsViewType}
                showConfirmModal={false} showSuccess={false} 
            />

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 relative">
                <div className="p-5 border-b border-gray-200 bg-gray-50 flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="relative w-full sm:w-72">
                            <input type="text" placeholder="Search Name or Ref..." value={tableSearch} onChange={(e) => setTableSearch(e.target.value)} className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all shadow-sm"/>
                        </div>
                        <div className="flex items-center gap-3">
                            <button onClick={() => fetchRecentWalkIns(false)} disabled={loading || isRefreshing} className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-lg text-sm hover:bg-gray-50 transition-all font-medium disabled:opacity-50">
                                <RefreshCw size={14} className={loading || isRefreshing ? "animate-spin" : ""} /> {loading || isRefreshing ? 'Updating...' : 'Refresh'}
                            </button>
                            <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium border border-blue-100">
                                <Clock size={16}/> Total: {filteredWalkIns.length}
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {['All', 'Confirmed', 'Checked In', 'Completed', 'Cancelled'].map(status => (
                            <button key={status} onClick={() => setStatusFilter(status)} className={`px-4 py-2 text-xs font-bold rounded-lg transition-all border whitespace-nowrap ${statusFilter === status ? 'bg-orange-600 text-white border-orange-600 shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>{status}</button>
                        ))}
                    </div>
                </div>
                
                <div className="overflow-x-auto"> 
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
                                {shouldShowActions && <th className="px-4 py-4 bg-gray-100 border-b border-gray-200 sticky top-0 text-center">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {filteredWalkIns.length === 0 ? (
                                <tr><td colSpan={shouldShowActions ? 8 : 7} className="px-6 py-12 text-center text-gray-400">No transactions found.</td></tr>
                            ) : (
                                filteredWalkIns.map(t => {
                                    const sched = t.reservations?.[0];
                                    const extInfo = getExtensionSummary(t);
                                    const isExtended = extInfo.cost > 0;
                                    const checkIn = formatDateTime(sched?.check_in_date);
                                    const checkOut = formatDateTime(sched?.check_out_date);
                                    return (
                                        <tr key={t.id} className="hover:bg-orange-50/20 transition-colors">
                                            <td className="px-4 py-3 font-mono text-xs font-bold text-gray-600">{t.transaction_ref}</td>
                                            <td className="px-4 py-3"><div className="font-bold text-gray-800">{t.customer_name}</div><div className="text-xs text-gray-500">{t.contact_number}</div></td>
                                            <td className="px-4 py-3">
                                                <div className="text-gray-700 font-medium text-xs truncate max-w-[150px]" title={getAmenitySummary(t)}>{getAmenitySummary(t)}</div>
                                                <button onClick={() => openDetails(t, 'amenities')} className="text-xs text-orange-600 hover:text-orange-800 flex items-center gap-1 mt-1 font-semibold"><Info size={12} /> View</button>
                                            </td>
                                            <td className="px-4 py-3">
                                                {isExtended ? (
                                                    <div className="flex flex-col items-start">
                                                        <span className="text-xs font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-100">{extInfo.count} added</span>
                                                        <button onClick={() => openDetails(t, 'extensions')} className="text-[10px] text-purple-500 hover:text-purple-700 flex items-center gap-1 mt-1 font-semibold"><Plus size={10} /> View</button>
                                                    </div>
                                                ) : <span className="text-gray-300 text-xs">-</span>}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <div className="flex flex-col items-center gap-1">
                                                    <div className="flex flex-col text-xs"><span className="text-gray-500">{checkIn.date}</span><span className="font-bold text-green-700">{checkIn.time}</span></div>
                                                    <span className="text-gray-300 rotate-90 sm:rotate-0">↓</span>
                                                    <div className="flex flex-col text-xs"><span className="text-gray-500">{checkOut.date}</span><span className={`font-bold ${isExtended ? 'text-purple-600' : 'text-orange-700'}`}>{checkOut.time}</span></div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <div className="flex flex-col items-center">
                                                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700 border border-green-200 mb-1"><CheckCircle size={10}/> Paid</div>
                                                    <span className="font-bold text-gray-900 text-sm">₱{parseFloat(t.total_amount).toLocaleString()}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`px-2 py-1 rounded text-xs font-bold border ${t.booking_status === 'Checked-In' ? 'bg-blue-50 text-blue-700 border-blue-200' : t.booking_status === 'Completed' ? 'bg-gray-50 text-gray-600 border-gray-200' : t.booking_status === 'Confirmed' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}>{t.booking_status}</span>
                                            </td>
                                            {shouldShowActions && (
                                                <td className="px-4 py-3">
                                                    <div className="flex justify-center gap-1">
                                                        {t.booking_status === 'Confirmed' && (
                                                            <>
                                                                <button onClick={() => initiateAction(t.id, 'Checked-In', t.customer_name)} className="p-1.5 bg-blue-600 text-white rounded hover:bg-blue-700" title="Check In"><LogIn size={14}/></button>
                                                                <button onClick={() => initiateAction(t.id, 'Cancelled', t.customer_name)} className="p-1.5 bg-gray-100 text-gray-500 rounded hover:bg-red-100 hover:text-red-600" title="Cancel Booking"><Ban size={14}/></button>
                                                            </>
                                                        )}
                                                        {t.booking_status === 'Checked-In' && (
                                                            <>
                                                                <button onClick={() => openExtend(t)} className="p-1.5 bg-purple-600 text-white rounded hover:bg-purple-700" title="Extend"><Clock size={14}/></button>
                                                                <button onClick={() => initiateAction(t.id, 'Completed', t.customer_name)} className="p-1.5 bg-orange-600 text-white rounded hover:bg-orange-700" title="Check Out"><LogOut size={14}/></button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default WalkInTable;