import React from 'react';
import { Search } from 'lucide-react';

const TransactionFilters = ({ searchQuery, setSearchQuery, statusFilter, setStatusFilter, viewMode }) => {
  
  const FilterTab = ({ label, value }) => (
    <button 
        onClick={() => setStatusFilter(value)}
        className={`px-4 py-2 text-sm font-medium rounded-xl transition-all whitespace-nowrap border
            ${statusFilter === value 
                ? 'bg-orange-600 text-white border-orange-600 shadow-sm' 
                : 'bg-white text-gray-600 hover:bg-gray-50 border-gray-400'}`}
    >
        {label}
    </button>
  );

  const activeFilters = ['All', 'Pending', 'Confirmed', 'Checked-In'];
  const historyFilters = ['All', 'Completed', 'Cancelled', 'Rejected'];

  const currentFilters = viewMode === 'history' ? historyFilters : activeFilters;

  return (
    <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between bg-white p-2 rounded-lg">
        
        <div className="relative w-full md:w-72 shrink-0">
            <input 
                type="text" 
                placeholder="Search Ref, Name..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '45px' }}
                className="w-full pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none shadow-sm text-sm transition-all"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none flex items-center">
                <Search size={18} />
            </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide w-full md:w-auto md:flex-1 md:justify-start">
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