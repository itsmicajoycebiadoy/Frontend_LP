import React, { useState, useEffect, useMemo } from 'react';
import api from '../../config/axios';
import { 
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, LineChart, Line 
} from 'recharts';
import { RefreshCw, Filter, Star, MessageSquare, ThumbsUp, ThumbsDown, Minus, BarChart3, Clock, TrendingUp, CheckCircle2, Grid, Calendar } from 'lucide-react';

// --- SUB-COMPONENTS ---

const StarRating = ({ rating, max = 5 }) => (
  <div className="flex items-center gap-0.5">
    {[...Array(max)].map((_, i) => (
      <Star 
        key={i} 
        size={14} 
        className={i < Math.floor(rating) ? "text-amber-400 fill-amber-400" : "text-slate-200"} 
      />
    ))}
    <span className="text-xs text-slate-500 ml-1 font-medium">({rating.toFixed(1)})</span>
  </div>
);

const CategoryStatCard = ({ label, score, color, Icon }) => (
  <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between h-full hover:shadow-md transition-all">
    <div className="flex justify-between items-center mb-3">
      <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{label}</p>
      <div className={`p-2 rounded-lg bg-opacity-10`} style={{ backgroundColor: `${color}20` }}>
        <Icon size={18} style={{ color: color }} />
      </div>
    </div>
    <div>
        <h3 className="text-3xl font-extrabold text-slate-800">{score}</h3>
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mt-3">
        <div 
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${(score / 5) * 100}%`, backgroundColor: color }}
        ></div>
        </div>
    </div>
  </div>
);

const FeedbackItem = ({ feedback }) => {
  const sentiment = useMemo(() => {
    if (feedback.average >= 4) return { label: 'Positive', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
    if (feedback.average >= 3) return { label: 'Neutral', color: 'bg-amber-100 text-amber-700 border-amber-200' };
    return { label: 'Negative', color: 'bg-rose-100 text-rose-700 border-rose-200' };
  }, [feedback.average]);

  return (
    <div className="p-4 sm:p-6 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0">
      <div className="flex gap-4">
        {/* Avatar */}
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm shrink-0 bg-gradient-to-br from-blue-500 to-indigo-600">
          {feedback.customerName ? feedback.customerName.charAt(0).toUpperCase() : <MessageSquare size={20} className="text-white/80" />}
        </div>
        
        <div className="flex-grow min-w-0">
          {/* Header Row: Name/Date & Badges */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
            <div>
              <h4 className="font-bold text-slate-800 text-sm sm:text-base truncate">{feedback.customerName || "Anonymous Guest"}</h4>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <Clock size={10} />
                {new Date(feedback.date).toLocaleDateString('en-US', { 
                  year: 'numeric', month: 'short', day: 'numeric' 
                })}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${sentiment.color}`}>
                {sentiment.label}
              </span>
              <div className="hidden sm:block">
                  <StarRating rating={feedback.average} />
              </div>
            </div>
          </div>

          {/* Mobile Star Rating (Visible only on small screens) */}
          <div className="sm:hidden mb-2">
             <StarRating rating={feedback.average} />
          </div>

          {/* Comment Bubble */}
          <div className="bg-white p-3 sm:p-4 rounded-xl rounded-tl-none border border-slate-200 shadow-sm">
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed italic">"{feedback.comment}"</p>
            
            {/* Detailed Ratings Breakdown */}
            {(feedback.service !== undefined && feedback.service !== null) && (
              <div className="mt-3 pt-3 border-t border-slate-100">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 text-xs">
                  <div className="flex items-center justify-between sm:justify-start gap-2">
                    <div className="flex items-center gap-1 text-slate-500"><MessageSquare size={12}/> Service</div>
                    <StarRating rating={feedback.service} max={5} />
                  </div>
                  <div className="flex items-center justify-between sm:justify-start gap-2">
                    <div className="flex items-center gap-1 text-slate-500"><CheckCircle2 size={12}/> Cleanliness</div>
                    <StarRating rating={feedback.cleanliness} max={5} />
                  </div>
                  <div className="flex items-center justify-between sm:justify-start gap-2">
                    <div className="flex items-center gap-1 text-slate-500"><Grid size={12}/> Amenities</div>
                    <StarRating rating={feedback.amenities} max={5} />
                  </div>
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
  
  // Date State
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  
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

  // Fetch all feedback data
  useEffect(() => {
    const fetchFeedback = async () => {
      setLoading(true);
      try {
        const res = await api.get('/api/feedbacks');
        setFeedbackData(res.data || []);
      } catch (error) {
        console.error("Error fetching feedback:", error);
        setFeedbackData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFeedback();
  }, []);

  // Apply Filtering Logic
  useEffect(() => {
    if (!feedbackData.length) {
      setFilteredData([]);
      return;
    }

    let tempData = [...feedbackData];
    
    if (dateRange.startDate && dateRange.endDate) {
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      tempData = tempData.filter(feedback => {
        const feedbackDate = new Date(feedback.date);
        return feedbackDate >= startDate && feedbackDate <= endDate;
      });
    }

    setFilteredData(tempData);
  }, [feedbackData, dateRange]);

  // Apply Sentiment Filter for Display
  const displayedData = useMemo(() => {
    if (filterType === 'all') return filteredData;
    return filteredData.filter(feedback => {
      if (filterType === 'positive') return feedback.average >= 4;
      if (filterType === 'neutral') return feedback.average >= 3 && feedback.average < 4;
      if (filterType === 'negative') return feedback.average < 3;
      return true;
    });
  }, [filteredData, filterType]);

  // Calculate Stats
  const stats = useMemo(() => {
    const total = filteredData.length;
    if (total === 0) return { positive: 0, neutral: 0, negative: 0, total: 0, average: 0 };

    const positive = filteredData.filter(f => f.average >= 4).length;
    const neutral = filteredData.filter(f => f.average >= 3 && f.average < 4).length;
    const negative = filteredData.filter(f => f.average < 3).length;
    
    const sumRating = filteredData.reduce((acc, curr) => acc + curr.average, 0);
    const average = (sumRating / total).toFixed(1);

    return { positive, neutral, negative, total, average };
  }, [filteredData]);

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
    { name: 'Positive', value: stats.positive },
    { name: 'Neutral', value: stats.neutral },
    { name: 'Negative', value: stats.negative },
  ];

  const getCategoryAverage = (key) => {
    if (filteredData.length === 0) return 0;
    const valid = filteredData.filter(f => f[key] != null);
    if (valid.length === 0) return 0;
    return (valid.reduce((acc, r) => acc + r[key], 0) / valid.length).toFixed(1);
  };

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
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6 pb-12 font-sans text-slate-700">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
            <h2 className="text-2xl font-bold text-slate-800">Feedback Analytics</h2>
            <p className="text-sm text-slate-500 mt-1">Monitor guest satisfaction & reviews</p>
        </div>

        {/* Date Filter Controls */}
        <div className="w-full xl:w-auto flex flex-col sm:flex-row gap-3">
            <div className="grid grid-cols-2 gap-2 w-full sm:w-auto">
                <input 
                    type="date" 
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                    className="w-full sm:w-40 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all cursor-pointer shadow-sm uppercase"
                />
                <input 
                    type="date" 
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                    className="w-full sm:w-40 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all cursor-pointer shadow-sm uppercase"
                />
            </div>
            
            {(dateRange.startDate || dateRange.endDate) && (
                <button
                onClick={() => setDateRange({ startDate: '', endDate: '' })}
                className="px-4 py-2.5 text-xs font-bold bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center gap-1 w-full sm:w-auto"
                >
                Clear
                </button>
            )}
        </div>
      </div>

      {/* --- STATS CARDS GRID --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center h-full hover:shadow-md transition-all">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Overall Rating</span>
            <div className="flex items-center gap-2">
                <h3 className="text-4xl font-extrabold text-slate-800">{stats.average}</h3>
                <Star className="text-amber-400 fill-amber-400" size={28} />
            </div>
            <p className="text-xs text-slate-400 mt-2 font-medium">Based on {stats.total} reviews</p>
        </div>

        <CategoryStatCard label="Service" score={getCategoryAverage('service')} color={COLORS.service} Icon={MessageSquare} />
        <CategoryStatCard label="Cleanliness" score={getCategoryAverage('cleanliness')} color={COLORS.cleanliness} Icon={CheckCircle2} />
        <CategoryStatCard label="Amenities" score={getCategoryAverage('amenities')} color={COLORS.amenities} Icon={Grid} />
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
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                    <span className="text-3xl font-extrabold text-slate-800">{stats.total}</span>
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Reviews</span>
                </div>
            </div>
        </div>
      </div>

      {/* --- REVIEWS LIST --- */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
            <h3 className="font-bold text-slate-800">Recent Feedback ({displayedData.length})</h3>
            
            <div className="relative w-full sm:w-auto">
                <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full sm:w-auto pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-orange-100 outline-none text-slate-600 cursor-pointer appearance-none shadow-sm"
                >
                    <option value="all">All Ratings</option>
                    <option value="positive">Positive (4-5 ★)</option>
                    <option value="neutral">Neutral (3 ★)</option>
                    <option value="negative">Negative (1-2 ★)</option>
                </select>
                <Filter size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"/>
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