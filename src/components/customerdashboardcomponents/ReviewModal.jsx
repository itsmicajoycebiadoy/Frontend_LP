import React, { useState } from "react";
import { X, Loader2, Star } from "lucide-react";

const ReviewModal = ({ onClose, onSubmit, isSubmitting }) => {
    const [form, setForm] = useState({ 
        name: '', 
        ratings: { service: 0, cleanliness: 0, amenities: 0 }, 
        comment: '' 
    });

    const categories = [
        { id: 'service', label: 'Service' },
        { id: 'cleanliness', label: 'Cleanliness' },
        { id: 'amenities', label: 'Amenities' }
    ];

    const handleRatingChange = (category, value) => {
        setForm(prev => ({ ...prev, ratings: { ...prev.ratings, [category]: value } }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const unrated = Object.values(form.ratings).some(r => r === 0);
        if (unrated) { alert("Please rate all categories first."); return; }
        
        const values = Object.values(form.ratings);
        const avgRating = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1);

        onSubmit({
            name: form.name || "Anonymous Guest",
            rating: avgRating,
            comment: form.comment,
            ratings: form.ratings
        });
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-lg shadow-2xl relative animate-in zoom-in-95 duration-200 overflow-hidden rounded-lg">
                <div className="bg-[#ea580c] p-6 text-white flex justify-between items-center">
                    <h3 className="font-header font-bold text-xl">Rate Your Experience</h3>
                    <button onClick={onClose} className="text-white/80 hover:text-white transition-colors"><X size={24} /></button>
                </div>
                <div className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 block">Tap stars to rate</label>
                            <div className="space-y-4">
                                {categories.map((cat) => (
                                    <div key={cat.id} className="flex justify-between items-center border-b border-gray-50 pb-2 last:border-0">
                                        <span className="text-sm font-medium text-gray-700">{cat.label}</span>
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button key={star} type="button" onClick={() => handleRatingChange(cat.id, star)} className="focus:outline-none hover:scale-110 transition-transform">
                                                    <Star size={22} fill={star <= form.ratings[cat.id] ? "#f59e0b" : "#e2e8f0"} className={star <= form.ratings[cat.id] ? "text-[#f59e0b]" : "text-gray-200"} strokeWidth={0} />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-4 pt-4">
                            <input type="text" placeholder="Your Name (Optional)" className="w-full p-3 bg-gray-50 border border-gray-200 focus:border-[#ea580c] outline-none text-sm transition-colors" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} />
                            <textarea rows="3" placeholder="Tell us more..." className="w-full p-3 bg-gray-50 border border-gray-200 focus:border-[#ea580c] outline-none text-sm resize-none transition-colors" value={form.comment} onChange={(e) => setForm({...form, comment: e.target.value})} required></textarea>
                        </div>
                        <button type="submit" disabled={isSubmitting} className="w-full bg-[#ea580c] hover:bg-[#c2410c] text-white font-bold py-4 uppercase tracking-wider text-sm transition-all disabled:opacity-70 flex justify-center items-center gap-2">
                            {isSubmitting ? <><Loader2 size={18} className="animate-spin" /> Submitting...</> : "Submit Feedback"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
export default ReviewModal;