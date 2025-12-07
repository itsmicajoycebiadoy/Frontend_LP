import React, { useState, useEffect, useMemo } from 'react';
import api from '../../config/axios';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, BarChart, Bar 
} from 'recharts';
import { 
  Download, TrendingUp, DollarSign, 
  Wallet, Users, ArrowUpRight, ArrowDownRight, Filter, RefreshCw, BarChart2, CheckCircle, XCircle, Clock
} from 'lucide-react';

// --- UTILS FOR CSV EXPORT ---
const exportToCSV = (transactions, startDate, endDate) => {
    const headers = [
        "Transaction Ref", "Check-In Date", "Check-Out Date", "Customer Name", 
        "Booking Type", "Amenities", "Extensions Details", "Extensions Cost", 
        "Total Amount", "Balance", "Status"
    ];

    const rows = transactions.map(t => {
        const extDetails = t.extensions && t.extensions.length > 0 
            ? t.extensions.map(e => `${e.description} (${e.duration || 0}hrs)`).join('; ') : "None";   
        const extCost = t.extensions && t.extensions.length > 0
            ? t.extensions.reduce((sum, e) => sum + Number(e.additional_cost || 0), 0) : 0;
        const cleanName = (t.customer_name || "").replace(/"/g, '""');
        const checkIn = t.check_in_formatted || t.formatted_date || "N/A";
        const checkOut = t.check_out_formatted || "N/A";

        return [
            `"${t.transaction_ref}"`, `"${checkIn}"`, `"${checkOut}"`, `"${cleanName}"`,
            `"${t.booking_type}"`, `"${t.amenities_summary || ''}"`, `"${extDetails}"`,
            extCost, t.total_amount, t.balance, `"${t.booking_status}"`
        ].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `LP_Report_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

const OwnerAnalytics = () => { 
  const [loading, setLoading] = useState(false);
  
  // Default Date
  const [dateRange, setDateRange] = useState(() => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    return {
        startDate: firstDay.toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0]
    };
  });

  const [data, setData] = useState({
    financials: { gross_sales: 0, cash_collected: 0, receivables: 0 },
    sources: [],
    operations: [], 
    trend: []
  });
  
  const [transactions, setTransactions] = useState([]);
  const [tableFilter, setTableFilter] = useState('All'); 

  // --- THEME ---
  const THEME = {
      primary: '#F97316',   // LP Orange
      secondary: '#3B82F6', // Blue
      success: '#10B981',   // Emerald
      danger: '#F43F5E',    // Rose
      warning: '#F59E0B',   // Amber
      text: '#334155',      // Slate 700
      subtext: '#94a3b8',   // Slate 400
      grid: '#f1f5f9',      // Slate 100
  };

  const STATUS_COLORS = {
      'Confirmed': THEME.success,
      'Completed': THEME.secondary,
      'Pending': THEME.warning,
      'Checked-In': '#8B5CF6', // Purple
      'Cancelled': THEME.danger
  };

  useEffect(() => { fetchDashboardData(); }, [dateRange]); 

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/owner/analytics', { params: dateRange });
      if(res.data.success) {
        setData(res.data.analytics);
        const parsedTransactions = (res.data.transactions || []).map(t => ({
            ...t,
            extensions: t.extension_history ? (typeof t.extension_history === 'string' ? JSON.parse(t.extension_history) : t.extension_history) : []
        }));
        setTransactions(parsedTransactions);
      }
    } catch (error) { console.error("Dashboard Load Error:", error); } 
    finally { setLoading(false); }
  };

  const handleQuickDate = (type) => {
    const today = new Date();
    let start = new Date();
    const end = new Date(); 

    if (type === 'today') start = today;
    else if (type === 'week') {
        const day = today.getDay();
        const diff = today.getDate() - day + (day === 0 ? -6 : 1); 
        start.setDate(diff);
    } else if (type === 'month') start = new Date(today.getFullYear(), today.getMonth(), 1);
    else if (type === 'year') start = new Date(today.getFullYear(), 0, 1);
    
    const newStart = start.toISOString().split('T')[0];
    const newEnd = end.toISOString().split('T')[0];

    if (newStart !== dateRange.startDate || newEnd !== dateRange.endDate) {
        setDateRange({ startDate: newStart, endDate: newEnd });
    }
  };

  const kpiMetrics = useMemo(() => {
    const totalBookings = data.sources.reduce((acc, curr) => acc + curr.count, 0);
    const trendData = data.trend || [];
    const lastDaySales = trendData.length > 0 ? Number(trendData[trendData.length-1].sales) : 0;
    const avgSales = trendData.length > 0 ? trendData.reduce((a,b)=>a+Number(b.sales),0)/trendData.length : 0;
    const isTrendingUp = lastDaySales >= avgSales;
    const statusData = [...data.operations].sort((a,b) => b.count - a.count);
    return { totalBookings, isTrendingUp, statusData };
  }, [data]);

  const filterCounts = useMemo(() => ({
     'All': transactions.length,
     'Online': transactions.filter(t => t.booking_type === 'Online').length,
     'Walk-in': transactions.filter(t => t.booking_type === 'Walk-in').length
  }), [transactions]);

  // --- SORTED TABLE LOGIC ---
  const sortedTableData = useMemo(() => {
    const statusPriority = {
      'Pending': 1,
      'Checked-In': 2,
      'Confirmed': 3,
      'Completed': 4,
      'Cancelled': 5
    };

    const filtered = transactions.filter(t => tableFilter === 'All' ? true : t.booking_type === tableFilter);
    return filtered.sort((a, b) => {
      const priorityA = statusPriority[a.booking_status] || 99;
      const priorityB = statusPriority[b.booking_status] || 99;
      return priorityA - priorityB;
    });
  }, [transactions, tableFilter]);

  const tooltipStyle = {
    backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', padding: '8px 12px', fontSize: '12px', color: THEME.text
  };

  return (
    // FIX: Removed max-w constraints and ensured w-full to prevent "squashing" on mobile
    <div className="w-full px-4 py-6 space-y-6 font-sans text-slate-700">
      
      {/* --- HEADER & CONTROLS --- */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm w-full">
        <div className="w-full lg:w-auto">
          <h2 className="text-2xl font-bold text-slate-800">
            Analytics Dashboard
          </h2>
          <p className="text-sm text-slate-500 mt-1">Real-time financial & operational insights</p>
        </div>
        
        {/* Controls: Stack on Mobile, Row on Desktop */}
        <div className="flex flex-col gap-3 w-full lg:w-auto">
          
          {/* Quick Dates */}
          <div className="grid grid-cols-4 gap-2 bg-slate-100 p-1 rounded-lg w-full">
             {['Today', 'Week', 'Month', 'Year'].map((label) => (
                <button 
                    key={label} type="button" onClick={() => handleQuickDate(label.toLowerCase())}
                    className="py-2 text-xs font-semibold text-slate-600 hover:bg-white hover:text-orange-600 hover:shadow-sm rounded-md transition-all text-center"
                >
                    {label}
                </button>
             ))}
          </div>

          {/* FIX: NO ICONS, SIMPLE INPUTS, STACKED ON MOBILE */}
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full">
             <input 
                type="date" 
                value={dateRange.startDate} 
                onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})} 
                className="w-full sm:w-auto flex-1 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all cursor-pointer shadow-sm"
             />
             
             <span className="text-slate-300 font-bold hidden sm:inline">-</span>
             
             <input 
                type="date" 
                value={dateRange.endDate} 
                onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})} 
                className="w-full sm:w-auto flex-1 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all cursor-pointer shadow-sm"
             />
          </div>

          <button 
            type="button" onClick={() => exportToCSV(transactions, dateRange.startDate, dateRange.endDate)} 
            className="w-full flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 active:scale-95"
          >
            <Download size={16}/> <span>Export</span>
          </button>
        </div>
      </div>

      <div className="relative min-h-[500px]">
        {/* LOADING STATE */}
        {loading && (
            <div className="absolute inset-0 bg-white/60 z-30 flex items-start justify-center pt-32 backdrop-blur-sm rounded-2xl transition-all duration-300">
                <div className="flex items-center gap-3 px-6 py-3 bg-white shadow-xl rounded-full border border-slate-100 animate-in fade-in zoom-in">
                    <RefreshCw className="animate-spin text-orange-500" size={20}/>
                    <span className="text-sm font-semibold text-slate-700">Refreshing data...</span>
                </div>
            </div>
        )}

        {/* 2. REVENUE TREND CHART */}
        <div className={`bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-6 transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
                <div>
                    <h3 className="font-bold text-slate-800">Revenue Trajectory</h3>
                    <p className="text-xs text-slate-400">Daily sales performance</p>
                </div>
                <div className="flex items-center gap-2 text-[10px] bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                    <span className="w-2 h-2 rounded-full bg-orange-500"></span> Total Sales
                </div>
            </div>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.trend}>
                        <defs>
                            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={THEME.primary} stopOpacity={0.2}/>
                                <stop offset="95%" stopColor={THEME.primary} stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={THEME.grid} />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: THEME.subtext}} tickFormatter={(str) => { const d = new Date(str); return `${d.getMonth()+1}/${d.getDate()}`; }} />
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: THEME.subtext}} tickFormatter={(val)=>`₱${val/1000}k`}/>
                        <Tooltip contentStyle={tooltipStyle} itemStyle={{color: THEME.primary, fontWeight: 'bold'}} formatter={(value) => [`₱${Number(value).toLocaleString()}`, "Sales"]} />
                        <Area type="monotone" dataKey="sales" stroke={THEME.primary} strokeWidth={3} fill="url(#colorSales)" animationDuration={1000} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* 3. SPLIT CHARTS */}
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}>
            {/* Booking Status */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                <h3 className="font-bold text-slate-800 mb-1 flex items-center gap-2">
                    <BarChart2 size={18} className="text-purple-500"/> Booking Status
                </h3>
                <p className="text-xs text-slate-400 mb-6">Booking stages distribution</p>
                <div className="flex-1 min-h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={kpiMetrics.statusData} layout="vertical" margin={{ left: 0, right: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke={THEME.grid}/>
                            <XAxis type="number" hide />
                            <YAxis dataKey="booking_status" type="category" width={90} tick={{fontSize: 11, fill: THEME.text, fontWeight: 500}} axisLine={false} tickLine={false} />
                            <Tooltip cursor={{fill: 'transparent'}} contentStyle={tooltipStyle} />
                            <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={28} animationDuration={1000}>
                                {kpiMetrics.statusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.booking_status] || THEME.subtext} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
            {/* Source Distribution */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                <h3 className="font-bold text-slate-800 mb-1">Source Distribution</h3>
                <p className="text-xs text-slate-400 mb-6">Online vs Walk-in</p>
                <div className="flex-1 min-h-[250px] relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={data.sources} dataKey="count" nameKey="booking_type" cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={5}>
                                {data.sources.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.booking_type === 'Online' ? THEME.secondary : THEME.success} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={tooltipStyle} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center">
                            <span className="block text-3xl font-extrabold text-slate-800">{kpiMetrics.totalBookings}</span>
                            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Total</span>
                        </div>
                    </div>
                </div>
                <div className="mt-4 flex flex-wrap justify-center gap-6 sm:gap-8">
                    {data.sources.map((s) => (
                        <div key={s.booking_type} className="flex items-center gap-2">
                            <span className={`w-3 h-3 rounded-full ${s.booking_type === 'Online' ? 'bg-blue-500' : 'bg-emerald-500'}`}></span>
                            <div>
                                <span className="block text-sm font-bold text-slate-700">{s.booking_type}</span>
                                <span className="text-xs text-slate-400">{s.count} bookings</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* 4. TRANSACTION TABLE */}
        <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}>
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <Filter size={18} className="text-orange-500"/> Transaction History
                </h3>
                
                {/* Segmented Control */}
                <div className="flex p-1 bg-slate-200/60 rounded-lg w-full sm:w-auto overflow-x-auto">
                    {['All', 'Online', 'Walk-in'].map(tab => (
                        <button 
                            key={tab} type="button" onClick={() => setTableFilter(tab)} 
                            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-md transition-all flex-1 sm:flex-none justify-center ${
                                tableFilter === tab ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                            }`}
                        >
                            <span>{tab}</span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                                tableFilter === tab ? 'bg-slate-100 text-slate-600 border border-slate-200' : 'bg-slate-300 text-slate-600'
                            }`}>
                                {filterCounts[tab] || 0}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase text-[10px] tracking-wider font-bold">
                    <tr>
                        <th className="px-6 py-4">Reference</th>
                        <th className="px-6 py-4">Customer</th>
                        <th className="px-6 py-4">Details</th>
                        <th className="px-6 py-4 text-right">Amount</th>
                        <th className="px-6 py-4 text-right">Balance</th>
                        <th className="px-6 py-4 text-center">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {sortedTableData.length === 0 ? (
                        <tr><td colSpan="6" className="text-center py-12 text-slate-400 italic">No transactions found.</td></tr>
                    ) : (
                        sortedTableData.map(t => (
                            <tr key={t.id} className="group hover:bg-orange-50/10 transition-colors">
                            <td className="px-6 py-4 align-top">
                                <span className="font-bold text-slate-700 text-xs font-mono bg-slate-100 px-2 py-1 rounded border border-slate-200 whitespace-nowrap">{t.transaction_ref}</span>
                                <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1 whitespace-nowrap"><Clock size={10}/>{t.formatted_date}</p>
                            </td>
                            <td className="px-6 py-4 align-top">
                                <p className="font-bold text-slate-700 text-sm whitespace-nowrap">{t.customer_name}</p>
                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block mt-1 ${
                                    t.booking_type === 'Online' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
                                }`}>{t.booking_type}</span>
                            </td>
                            <td className="px-6 py-4 align-top">
                                <p className="text-xs text-slate-600 font-medium line-clamp-2 max-w-[200px]" title={t.amenities_summary}>{t.amenities_summary || "No amenities"}</p>
                                {t.extensions && t.extensions.length > 0 && (
                                    <div className="mt-2 flex flex-col gap-1">
                                        {t.extensions.map((ext, idx) => (
                                            <span key={idx} className="text-[10px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-100 w-fit flex items-center gap-1 whitespace-nowrap">
                                                <RefreshCw size={8}/> + {ext.description} (₱{Number(ext.additional_cost).toLocaleString()})
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </td>
                            <td className="px-6 py-4 text-right align-top"><p className="font-bold text-slate-900 text-sm whitespace-nowrap">₱{parseFloat(t.total_amount).toLocaleString()}</p></td>
                            <td className="px-6 py-4 text-right align-top">
                                {parseFloat(t.balance) > 0 ? ( <span className="text-xs font-bold text-rose-500 whitespace-nowrap">₱{parseFloat(t.balance).toLocaleString()}</span> ) : ( 
                                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">PAID</span> 
                                )}
                            </td>
                            <td className="px-6 py-4 text-center align-top">
                                <StatusBadge status={t.booking_status} />
                            </td>
                            </tr>
                        ))
                    )}
                </tbody>
                </table>
            </div>
        </div>
      </div>
    </div>
  );
};

// --- SUB-COMPONENTS ---

const StatCard = ({ title, value, icon: Icon, subText, trendIcon: TrendIcon, color, bg, isMoney = true }) => (
   <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 group h-full flex flex-col justify-between relative overflow-hidden">
      <div className="flex justify-between items-start mb-4 relative z-10">
         <div className={`p-3 rounded-xl transition-colors ${bg} ${color}`}><Icon size={24} strokeWidth={2.5} /></div>
         {TrendIcon && (<div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${bg} ${color}`}><TrendIcon size={12} />{subText && <span>{subText}</span>}</div>)}
      </div>
      <div className="relative z-10">
         <h4 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight group-hover:translate-x-1 transition-transform">{isMoney ? '₱' : ''}{value.toLocaleString()}</h4>
         <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">{title}</p>
      </div>
      <div className={`absolute -bottom-4 -right-4 w-24 h-24 rounded-full opacity-10 ${bg}`}></div>
   </div>
);

const StatusBadge = ({ status }) => {
    let styles = "bg-slate-100 text-slate-600 border-slate-200";
    let Icon = Clock;

    switch(status) {
        case 'Confirmed': styles = "bg-emerald-50 text-emerald-700 border-emerald-100"; Icon = CheckCircle; break;
        case 'Completed': styles = "bg-blue-50 text-blue-700 border-blue-100"; Icon = CheckCircle; break;
        case 'Pending': styles = "bg-amber-50 text-amber-700 border-amber-100"; Icon = Clock; break;
        case 'Checked-In': styles = "bg-purple-50 text-purple-700 border-purple-100"; Icon = ArrowDownRight; break;
        case 'Cancelled': styles = "bg-rose-50 text-rose-700 border-rose-100"; Icon = XCircle; break;
        default: break;
    }

    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${styles} whitespace-nowrap`}>
            <Icon size={10} strokeWidth={3}/> {status}
        </span>
    );
};

export default OwnerAnalytics;