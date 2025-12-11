import React from 'react';
import { Search, History, Activity } from 'lucide-react';

const TransactionFilters = ({ 
    searchQuery, 
    setSearchQuery, 
    statusFilter, 
    setStatusFilter, 
    viewMode, 
    setViewMode 
}) => {

    // --- 1. Helper Component para sa Tabs ---
    const FilterTab = ({ label, value }) => (
        <button 
            type="button" 
            onClick={() => setStatusFilter(value)}
            className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all whitespace-nowrap border
                ${statusFilter === value 
                    ? 'bg-orange-600 text-white border-orange-600 shadow-sm' 
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
        >
            {label}
        </button>
    );

    // --- 2. Handle View Change ---
    const handleViewChange = (mode) => {
        if (viewMode !== mode) {
            setViewMode(mode);
            setStatusFilter('All'); 
        }
    };

    // --- 3. Define Lists ---
    const activeFilters = ['All', 'Pending', 'Confirmed', 'Checked-In'];
    const historyFilters = ['All', 'Completed', 'Cancelled', 'Rejected'];
    const currentFilters = viewMode === 'history' ? historyFilters : activeFilters;

    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-4 p-4">
            
            {/* Top Row: Search (Left) & View Switcher (Right) */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                
                {/* A. Search Bar (Nilipat sa Kaliwa) */}
                <div className="relative w-full md:w-72">
                    {/* Icon */}
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                        <Search size={18} />
                    </div>
                    
                    {/* Input Field */}
                    <input 
                        type="text" 
                        placeholder="Search Ref, Name..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                        style={{ paddingLeft: '40px' }} 
                    />
                </div>

                {/* B. View Mode Toggle (Nilipat sa Kanan) */}
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button
                        type="button"
                        onClick={() => handleViewChange('active')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all ${
                            viewMode === 'active' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <Activity size={16} /> Active
                    </button>
                    <button
                        type="button"
                        onClick={() => handleViewChange('history')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all ${
                            viewMode === 'history' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <History size={16} /> History
                    </button>
                </div>

            </div>

            {/* Bottom Row: Status Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {currentFilters.map(status => (
                    <FilterTab 
                        key={status} 
                        label={status === 'Checked-In' ? 'Checked In' : status} 
                        value={status} 
                    />
                ))}
            </div>
        </div>
    );
};

export default TransactionFilters;