import React, { useState, useEffect } from "react";
import { Star, X, Loader2, Send, CheckCircle2, ShieldCheck } from "lucide-react";
import { useAuth } from "../pages/AuthContext"; 
import api from "../config/axios"; 

const FeedbackModal = () => {
    const { user, loading } = useAuth(); 
    
    const [isOpen, setIsOpen] = useState(false);
    const [bookingId, setBookingId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Form State
    const [name, setName] = useState("");
    const [comment, setComment] = useState("");
    const [ratings, setRatings] = useState({ service: 0, cleanliness: 0, amenities: 0 });

    const categories = [
        { id: 'service', label: 'Service' },
        { id: 'cleanliness', label: 'Cleanliness' },
        { id: 'amenities', label: 'Amenities' }
    ];

    useEffect(() => {
        setIsOpen(false); 

        const checkEligibility = async () => {
            if (loading) return;
            // Only Check for CUSTOMERS
            if (!user || !user.id || user.role !== 'customer') return; 

            setName(user.name || ""); 

            try {
                const res = await api.get(`/api/reservations/user/${user.id}`);
                let bookingsList = [];
                if (Array.isArray(res.data)) bookingsList = res.data;
                else if (res.data.reservations) bookingsList = res.data.reservations;
                else if (res.data.data) bookingsList = res.data.data;

                if (bookingsList.length > 0) {
                    const validBooking = bookingsList.find(booking => {
                        const status = booking.status ? booking.status.toLowerCase() : '';
                        const isStatusValid = status === 'checked-in' || status === 'completed';
                        const noFeedback = !booking.has_feedback || booking.has_feedback == 0;
                        return isStatusValid && noFeedback;
                    });

                    if (validBooking) {
                        setBookingId(validBooking.id);
                        setIsOpen(true);
                    }
                }
            } catch (error) {
                console.error("Auto-feedback check error:", error);
                setIsOpen(false);
            }
        };

        checkEligibility();
    }, [user, loading]);

    const handleRatingChange = (category, value) => {
        setRatings(prev => ({ ...prev, [category]: value }));
    };

    const getCurrentAverage = () => {
        const values = Object.values(ratings);
        const ratedValues = values.filter(r => r > 0);
        const total = ratedValues.reduce((acc, curr) => acc + curr, 0);
        return ratedValues.length > 0 ? (total / ratedValues.length).toFixed(1) : 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const unrated = categories.some(cat => ratings[cat.id] === 0);
        if (unrated) { alert("Please rate all categories first."); return; }

        setIsSubmitting(true);
        try {
            const avgRating = getCurrentAverage();
            const payload = {
                name: name || (user?.name ?? "Anonymous Guest"),
                rating: avgRating,
                comment: comment,
                ratings: ratings,
                booking_id: bookingId
            };

            const response = await api.post('/api/feedbacks', payload);

            if (response.data.success) {
                setShowSuccess(true);
                setRatings({ service: 0, cleanliness: 0, amenities: 0 });
                setComment(""); 
                setTimeout(() => {
                    setIsOpen(false);
                    setShowSuccess(false);
                    setBookingId(null);
                }, 2000);
            }
        } catch (error) {
            console.error(error);
            alert("Failed to submit feedback.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen || loading) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden relative border border-gray-100">
                <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors z-10"><X size={24} /></button>
                <div className="bg-[#ea580c] p-5 lg:p-6 text-white relative">
                    <h3 className="font-bold text-xl">Share Your Experience</h3>
                    <p className="text-white/80 text-xs mt-1">We value your feedback</p>
                </div>
                <div className="p-5 lg:p-6 relative">
                    {showSuccess ? (
                        <div className="flex flex-col items-center justify-center text-center p-6"><CheckCircle2 size={48} className="text-green-500 mb-4" /><h4 className="text-2xl font-bold text-gray-800">Thank You!</h4></div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 block">Rate Your Experience</label>
                                <div className="space-y-4">
                                    {categories.map((cat) => (
                                        <div key={cat.id} className="flex flex-col sm:flex-row sm:items-center justify-between">
                                            <span className="text-sm font-medium text-gray-700">{cat.label}</span>
                                            <div className="flex gap-1">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button key={star} type="button" onClick={() => handleRatingChange(cat.id, star)} className="focus:outline-none hover:scale-110 transition-transform">
                                                        <Star size={22} fill={star <= ratings[cat.id] ? "#f59e0b" : "#e5e7eb"} className={star <= ratings[cat.id] ? "text-[#f59e0b]" : "text-gray-200"} strokeWidth={0} />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <hr className="border-gray-100" />
                            <div className="space-y-4">
                                <input type="text" placeholder="Your Name" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none text-sm" value={name} onChange={(e) => setName(e.target.value)} />
                                <textarea rows="4" placeholder="How can we improve?" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none text-sm resize-none" value={comment} onChange={(e) => setComment(e.target.value)} required />
                            </div>
                            <button type="submit" disabled={isSubmitting} className="w-full bg-[#ea580c] text-white font-bold py-3 px-6 rounded-lg shadow-lg flex items-center justify-center gap-3">
                                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <><span>Submit Review</span><Send size={18} /></>}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FeedbackModal;