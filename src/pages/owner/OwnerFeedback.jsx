import React, { useState, useEffect, useMemo } from 'react';
import api from '../../config/axios';
import { 
  PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  RefreshCw, Filter, Star, MessageSquare, TrendingUp, TrendingDown, 
  CheckCircle2, Grid, User, ArrowUpRight, ArrowDownRight, Minus 
} from 'lucide-react';

// --- SUB-COMPONENTS ---

const StarRating = ({ rating, max = 5, size = 14 }) => (
  <div className="flex items-center gap-0.5">
    {[...Array(max)].map((_, i) => (
      <Star 
        key={i} 
        size={size} 
        className={i < Math.floor(rating) ? "text-amber-400 fill-amber-400" : "text-slate-200"} 
      />
    ))}
    <span className="text-xs text-slate-500 ml-1 font-medium">({rating.toFixed(1)})</span>
  </div>
);

// Stat Card with Trend Indicator
const CategoryStatCard = ({ label, score, prevScore, color, Icon }) => {
  const diff = Number(score) - Number(prevScore);
  const isPositive = diff > 0;
  const isNeutral = diff === 0;
  
  // Logic: Positive diff is Good (Green), Negative is Bad (Red)
  const trendColor = isNeutral ? 'text-slate-400' : (isPositive ? 'text-emerald-600' : 'text-rose-500');
  const TrendIcon = isNeutral ? Minus : (isPositive ? ArrowUpRight : ArrowDownRight);
  const trendBg = isNeutral ? 'bg-slate-100' : (isPositive ? 'bg-emerald-50' : 'bg-rose-50');

  // Only show trend if there is a previous score to compare against
  const showTrend = prevScore > 0;

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between h-full hover:shadow-md transition-all">
      <div className="flex justify-between items-center mb-3">
        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{label}</p>
        <div className={`p-2 rounded-lg bg-opacity-10`} style={{ backgroundColor: `${color}20` }}>
          <Icon size={18} style={{ color: color }} />
        </div>
      </div>
      <div>
          <div className="flex items-end gap-2 mb-1">
            <h3 className="text-3xl font-extrabold text-slate-800">{score}</h3>
            {showTrend && (
                <div className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold ${trendBg} ${trendColor} mb-1.5`}>
                    <TrendIcon size={10} strokeWidth={3} />
                    <span>{Math.abs(diff).toFixed(1)}</span>
                </div>
            )}
          </div>
          
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mt-3">
            <div 
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${(score / 5) * 100}%`, backgroundColor: color }}
            ></div>
          </div>
          {showTrend && (
             <p className="text-[10px] text-slate-400 mt-2">vs {prevScore} prev. period</p>
          )}
      </div>
    </div>
  );
};

const FeedbackItem = ({ feedback }) => {
  const sentiment = useMemo(() => {
    if (feedback.average >= 4) return { label: 'Positive', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
    if (feedback.average >= 3) return { label: 'Neutral', color: 'bg-amber-100 text-amber-700 border-amber-200' };
    return { label: 'Negative', color: 'bg-rose-100 text-rose-700 border-rose-200' };
  }, [feedback.average]);

  return (
    <div className="p-4 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0">
      <div className="flex gap-3">
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0 bg-gradient-to-br from-slate-600 to-slate-800">
          {feedback.customerName ? feedback.customerName.charAt(0).toUpperCase() : <User size={16} />}
        </div>
        
        <div className="flex-grow min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 overflow-hidden">
               <h4 className="font-bold text-slate-800 text-sm truncate">{feedback.customerName || "Anonymous Guest"}</h4>
               <span className="text-slate-300 text-[10px]">•</span>
               <p className="text-xs text-slate-400 flex items-center gap-1 shrink-0">
                 {new Date(feedback.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
               </p>
            </div>
            
            <div className="flex items-center gap-2 self-start sm:self-auto">
               <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${sentiment.color}`}>
                  {sentiment.label}
               </span>
               <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                  <Star size={10} className="text-amber-500 fill-amber-500"/>
                  <span className="text-xs font-bold text-amber-700">{feedback.average.toFixed(1)}</span>
               </div>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <p className="text-slate-700 text-sm leading-relaxed italic mb-3">"{feedback.comment}"</p>
            
            {(feedback.service !== undefined && feedback.service !== null) && (
              <div className="flex flex-wrap gap-x-4 gap-y-2 pt-2 border-t border-slate-200/60">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-white px-2 py-1 rounded border border-slate-100 shadow-sm">
                    <MessageSquare size={10} className="text-blue-500"/> 
                    <span>Service</span>
                    <span className="font-bold text-slate-700 ml-1">{feedback.service.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-white px-2 py-1 rounded border border-slate-100 shadow-sm">
                    <CheckCircle2 size={10} className="text-emerald-500"/> 
                    <span>Cleanliness</span>
                    <span className="font-bold text-slate-700 ml-1">{feedback.cleanliness.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-white px-2 py-1 rounded border border-slate-100 shadow-sm">
                    <Grid size={10} className="text-orange-500"/> 
                    <span>Amenities</span>
                    <span className="font-bold text-slate-700 ml-1">{feedback.amenities.toFixed(1)}</span>
                  </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---

const OwnerFeedback = () => {
  const [feedbackData, setFeedbackData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [activeFilter, setActiveFilter] = useState('month');
  
  const [dateRange, setDateRange] = useState(() => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    return {
        startDate: firstDay.toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0]
    };
  });
  
  const [filterType, setFilterType] = useState('all');
  const [timePeriod, setTimePeriod] = useState('month');

  const COLORS = {
    positive: '#10B981', // Emerald
    neutral: '#F59E0B',  // Amber
    negative: '#F43F5E', // Rose
    service: '#3B82F6',  // Blue
    cleanliness: '#10B981',
    amenities: '#F97316' // Orange
  };

  const TIME_OPTIONS = [
    { value: 'day', label: 'Daily' },
    { value: 'month', label: 'Monthly' },
    { value: 'year', label: 'Yearly' }
  ];

  // --- UPDATED: FETCH WITH SILENT AUTO REFRESH ---
  useEffect(() => {
    // 1. Initial Load (Show Spinner)
    fetchFeedback(false);

    // 2. Set Interval (Silent Background Refresh every 3s)
    const intervalId = setInterval(() => {
        fetchFeedback(true);
    }, 3000);

    // 3. Cleanup
    return () => clearInterval(intervalId);
  }, []); // Depend on empty array if API returns ALL data and we filter locally

  // Separate function to handle background check
  const fetchFeedback = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    
    try {
        const res = await api.get('/api/feedbacks');
        setFeedbackData(res.data || []);
    } catch (error) {
        console.error("Error fetching feedback:", error);
        setFeedbackData([]);
    } finally {
        if (!isBackground) setLoading(false);
    }
  };

  // Quick Date Handler
  const handleQuickDate = (type) => {
    const today = new Date();
    let start = new Date();
    const end = new Date(); 

    setActiveFilter(type); 

    if (type === 'today') {
        start = today;
    } else if (type === 'week') {
        const day = today.getDay();
        const diff = today.getDate() - day + (day === 0 ? -6 : 1); 
        start.setDate(diff);
    } else if (type === 'month') {
        start = new Date(today.getFullYear(), today.getMonth(), 1);
    } else if (type === 'year') {
        start = new Date(today.getFullYear(), 0, 1);
    }
    
    setDateRange({
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0]
    });
  };

  const handleManualDateChange = (key, value) => {
      setDateRange(prev => ({ ...prev, [key]: value }));
      setActiveFilter('custom'); 
  };

  // Apply Filtering Logic (Current Period)
  useEffect(() => {
    if (!feedbackData.length) {
      setFilteredData([]);
      return;
    }

    let tempData = [...feedbackData];
    
    if (dateRange.startDate && dateRange.endDate) {
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      endDate.setHours(23, 59, 59, 999); 

      tempData = tempData.filter(feedback => {
        const feedbackDate = new Date(feedback.date);
        return feedbackDate >= startDate && feedbackDate <= endDate;
      });
    }

    setFilteredData(tempData);
  }, [feedbackData, dateRange]);

  // CALCULATE STATS
  const stats = useMemo(() => {
    const calcAvg = (data, key) => {
        if (!data.length) return "0.0";
        let sum = 0;
        let count = 0;
        data.forEach(item => {
            const val = key === 'average' ? item.average : item[key];
            if (val !== undefined && val !== null) {
                sum += val;
                count++;
            }
        });
        return count === 0 ? "0.0" : (sum / count).toFixed(1);
    };

    const total = filteredData.length;
    const current = {
        average: calcAvg(filteredData, 'average'),
        service: calcAvg(filteredData, 'service'),
        cleanliness: calcAvg(filteredData, 'cleanliness'),
        amenities: calcAvg(filteredData, 'amenities'),
        positive: filteredData.filter(f => f.average >= 4).length,
        neutral: filteredData.filter(f => f.average >= 3 && f.average < 4).length,
        negative: filteredData.filter(f => f.average < 3).length,
        total
    };

    let previous = { average: 0, service: 0, cleanliness: 0, amenities: 0 };
    
    if (dateRange.startDate && dateRange.endDate && feedbackData.length > 0) {
        const currentStart = new Date(dateRange.startDate);
        const currentEnd = new Date(dateRange.endDate);
        const duration = currentEnd - currentStart; 

        const prevEnd = new Date(currentStart.getTime() - 86400000); 
        const prevStart = new Date(prevEnd.getTime() - duration);
        prevEnd.setHours(23, 59, 59, 999);

        const prevData = feedbackData.filter(feedback => {
            const d = new Date(feedback.date);
            return d >= prevStart && d <= prevEnd;
        });

        if (prevData.length > 0) {
            previous = {
                average: calcAvg(prevData, 'average'),
                service: calcAvg(prevData, 'service'),
                cleanliness: calcAvg(prevData, 'cleanliness'),
                amenities: calcAvg(prevData, 'amenities'),
            };
        }
    }

    return { current, previous };
  }, [filteredData, feedbackData, dateRange]);

  // Apply Sentiment Filter for List Display
  const displayedData = useMemo(() => {
    if (filterType === 'all') return filteredData;
    return filteredData.filter(feedback => {
      if (filterType === 'positive') return feedback.average >= 4;
      if (filterType === 'neutral') return feedback.average >= 3 && feedback.average < 4;
      if (filterType === 'negative') return feedback.average < 3;
      return true;
    });
  }, [filteredData, filterType]);

  // Line Chart Data
  const lineChartData = useMemo(() => {
    if (!filteredData.length) return [];
    
    const aggregated = {};
    filteredData.forEach(fb => {
        const date = new Date(fb.date);
        let key = '';
        if (timePeriod === 'day') key = date.toISOString().split('T')[0];
        else if (timePeriod === 'month') key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        else key = String(date.getFullYear());

        if (!aggregated[key]) {
            aggregated[key] = { 
                service: { sum: 0, count: 0 }, cleanliness: { sum: 0, count: 0 }, amenities: { sum: 0, count: 0 },
                dateKey: key
            };
        }
        
        aggregated[key].service.sum += (fb.service || 0); aggregated[key].service.count++;
        aggregated[key].cleanliness.sum += (fb.cleanliness || 0); aggregated[key].cleanliness.count++;
        aggregated[key].amenities.sum += (fb.amenities || 0); aggregated[key].amenities.count++;
    });

    return Object.values(aggregated).map(data => ({
        date: data.dateKey,
        Service: (data.service.sum / data.service.count).toFixed(2),
        Cleanliness: (data.cleanliness.sum / data.cleanliness.count).toFixed(2),
        Amenities: (data.amenities.sum / data.amenities.count).toFixed(2),
    })).sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredData, timePeriod]);

  const pieChartData = [
    { name: 'Positive', value: stats.current.positive },
    { name: 'Neutral', value: stats.current.neutral },
    { name: 'Negative', value: stats.current.negative },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-100 shadow-xl rounded-lg text-xs">
          {label && <p className="font-bold text-slate-700 mb-1">{label}</p>}
          {payload.map((item, index) => (
             <div key={index} className="flex items-center gap-2 mb-0.5">
                <div className="w-2 h-2 rounded-full" style={{backgroundColor: item.color}}></div>
                <span className="text-slate-500">{item.name}:</span>
                <span className="font-bold text-slate-700">{item.value}</span>
             </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 space-y-6 pb-12 font-sans text-slate-700">
      
      {/* --- HEADER WITH CONTROLS --- */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="w-full xl:w-auto">
            <h2 className="text-2xl font-bold text-slate-800">Feedback Analytics</h2>
            <p className="text-sm text-slate-500 mt-1">Monitor guest satisfaction & reviews</p>
        </div>

        {/* CONTROLS SECTION */}
        <div className="flex flex-col xl:flex-row gap-4 w-full xl:w-auto bg-slate-50 p-4 rounded-xl border border-slate-100 items-start xl:items-end">
            
            {/* Quick Date Buttons */}
            <div className="w-full xl:w-auto">
               <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block xl:hidden">Quick Select</label>
               <div className="grid grid-cols-4 xl:flex gap-1 xl:gap-2 w-full xl:w-auto bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                  {['Today', 'Week', 'Month', 'Year'].map((label) => {
                      const isSelected = activeFilter === label.toLowerCase();
                      return (
                          <button 
                              key={label} 
                              type="button" 
                              onClick={() => handleQuickDate(label.toLowerCase())}
                              className={`px-3 py-2 text-xs font-semibold rounded-md transition-all flex items-center justify-center xl:min-w-[60px] 
                                  ${isSelected 
                                      ? 'bg-orange-50 text-orange-600 border border-orange-200 shadow-sm' 
                                      : 'text-slate-600 hover:bg-slate-50 hover:text-orange-600 border border-transparent'
                                  }`}
                          >
                              {label}
                          </button>
                      );
                  })}
               </div>
            </div>

            {/* Date Inputs */}
            <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto items-end">
                <div className="w-full sm:w-auto flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">From</label>
                    <input 
                        type="date" 
                        value={dateRange.startDate}
                        onChange={(e) => handleManualDateChange('startDate', e.target.value)}
                        className="w-full sm:w-36 lg:w-40 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-200 transition-all cursor-pointer shadow-sm uppercase"
                    />
                </div>
                <div className="w-full sm:w-auto flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">To</label>
                    <input 
                        type="date" 
                        value={dateRange.endDate}
                        onChange={(e) => handleManualDateChange('endDate', e.target.value)}
                        className="w-full sm:w-36 lg:w-40 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-200 transition-all cursor-pointer shadow-sm uppercase"
                    />
                </div>
            </div>
        </div>
      </div>

      {/* --- STATS CARDS GRID --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Overall Rating Card */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center h-full hover:shadow-md transition-all">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Overall Rating</span>
            <div className="flex items-center gap-2">
                <h3 className="text-4xl font-extrabold text-slate-800">{stats.current.average}</h3>
                <Star className="text-amber-400 fill-amber-400" size={28} />
            </div>
            {/* Comparison Logic for Overall */}
            {Number(stats.previous.average) > 0 ? (
                <div className={`flex items-center gap-1 text-xs font-bold mt-2 ${
                    Number(stats.current.average) >= Number(stats.previous.average) ? 'text-emerald-600' : 'text-rose-500'
                }`}>
                    {Number(stats.current.average) >= Number(stats.previous.average) ? <TrendingUp size={14}/> : <TrendingDown size={14}/>}
                    <span>{Math.abs(Number(stats.current.average) - Number(stats.previous.average)).toFixed(1)}</span>
                    <span className="text-slate-400 font-medium ml-1">vs prev. period</span>
                </div>
            ) : (
                <p className="text-[10px] text-slate-300 mt-2 font-medium">No previous data for comparison</p>
            )}
            <p className="text-[10px] text-slate-400 mt-1">Based on {stats.current.total} reviews</p>
        </div>

        {/* Category Cards with Trends */}
        <CategoryStatCard 
            label="Service" 
            score={stats.current.service} 
            prevScore={stats.previous.service}
            color={COLORS.service} 
            Icon={MessageSquare} 
        />
        <CategoryStatCard 
            label="Cleanliness" 
            score={stats.current.cleanliness} 
            prevScore={stats.previous.cleanliness}
            color={COLORS.cleanliness} 
            Icon={CheckCircle2} 
        />
        <CategoryStatCard 
            label="Amenities" 
            score={stats.current.amenities} 
            prevScore={stats.previous.amenities}
            color={COLORS.amenities} 
            Icon={Grid} 
        />
      </div>

      {/* --- CHARTS SECTION --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Line Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 lg:col-span-2">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <TrendingUp size={18} className="text-orange-500"/> Improvement Trend
                </h3>
                <div className="relative w-full sm:w-auto">
                    <select
                        value={timePeriod}
                        onChange={(e) => setTimePeriod(e.target.value)}
                        className="w-full sm:w-auto pl-3 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 appearance-none cursor-pointer outline-none focus:ring-2 focus:ring-orange-100"
                    >
                        {TIME_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                    <Filter size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"/>
                </div>
            </div>

            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={lineChartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                        <XAxis dataKey="date" stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis type="number" domain={[0, 5]} stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} tickCount={6} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ paddingTop: "20px", fontSize: "12px" }}/>
                        <Line type="monotone" dataKey="Service" stroke={COLORS.service} strokeWidth={2} dot={false} activeDot={{r: 6}} />
                        <Line type="monotone" dataKey="Cleanliness" stroke={COLORS.cleanliness} strokeWidth={2} dot={false} activeDot={{r: 6}} />
                        <Line type="monotone" dataKey="Amenities" stroke={COLORS.amenities} strokeWidth={2} dot={false} activeDot={{r: 6}} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
        
        {/* Pie Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Sentiment Split</h3>
            <p className="text-xs text-slate-400 mb-6">Distribution by rating category</p>
            <div className="flex-1 min-h-[250px] relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={pieChartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none"
                        >
                            <Cell fill={COLORS.positive} />
                            <Cell fill={COLORS.neutral} />
                            <Cell fill={COLORS.negative} />
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: "12px" }}/>
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-extrabold text-slate-800 whitespace-nowrap">
                        {stats.current.total.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Reviews</span>
                </div>
            </div>
        </div>
      </div>

      {/* --- REVIEWS LIST --- */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
            <h3 className="font-bold text-slate-800">Recent Feedback ({displayedData.length})</h3>
            
            {/* Filter Buttons */}
            <div className="flex p-1 bg-slate-100 rounded-lg overflow-x-auto w-full sm:w-auto">
                {[
                    { id: 'all', label: 'All' },
                    { id: 'positive', label: 'Positive' },
                    { id: 'neutral', label: 'Neutral' },
                    { id: 'negative', label: 'Negative' }
                ].map(tab => (
                    <button 
                        key={tab.id} 
                        type="button" 
                        onClick={() => setFilterType(tab.id)} 
                        className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all whitespace-nowrap flex-1 sm:flex-none ${
                            filterType === tab.id ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>
        
        {loading ? (
            <div className="p-12 text-center flex flex-col items-center justify-center">
                <RefreshCw className="animate-spin text-orange-500 mb-3" size={24}/>
                <p className="text-slate-400 text-sm">Loading reviews...</p>
            </div>
        ) : displayedData.length > 0 ? (
            <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto custom-scrollbar">
                {displayedData.map((feedback, index) => (
                    <FeedbackItem key={index} feedback={feedback} />
                ))}
            </div>
        ) : (
            <div className="py-16 text-center">
                <div className="inline-flex justify-center items-center w-16 h-16 bg-slate-50 rounded-full mb-4">
                    <MessageSquare size={32} className="text-slate-300" />
                </div>
                <h3 className="text-slate-800 font-bold">No feedback found</h3>
                <p className="text-slate-400 text-sm mt-1">Try adjusting your filters.</p>
            </div>
        )}
      </div>

    </div>
  );
};

export default OwnerFeedback;