import React, { useRef, useState, useEffect } from "react";
import { Loader2, Star, MessageSquareQuote } from "lucide-react";
import { useAuth } from "../../pages/AuthContext"; // Ensure path is correct based on your folder structure
import api from "../../config/axios"; // Ensure path is correct
import { useNavigate } from "react-router-dom";

const FeedbackSection = ({ reviews, isLoading, onOpenModal }) => {
    const reviewsRef = useRef(null);
    const { user } = useAuth();
    const navigate = useNavigate();

    // --- ELIGIBILITY STATE ---
    const [eligibility, setEligibility] = useState({
        canReview: false,
        message: "Login to write a review",
        bookingId: null
    });

    const categories = [
        { id: 'service', label: 'Service' },
        { id: 'cleanliness', label: 'Cleanliness' },
        { id: 'amenities', label: 'Amenities' }
    ];

    const getCategoryAverage = (category) => {
        if (reviews.length === 0) return 0;
        const total = reviews.reduce((acc, review) => acc + review.ratings[category], 0);
        return (total / reviews.length).toFixed(1);
    };

    const getOverallAverage = () => {
        if (reviews.length === 0) return 0;
        const total = reviews.reduce((acc, review) => acc + parseFloat(review.average), 0);
        return (total / reviews.length).toFixed(1);
    };

    // --- CHECK ELIGIBILITY LOGIC (Same as Feedback Page) ---
    const checkEligibility = async () => {
        if (!user || !user.id) {
            setEligibility({ canReview: false, message: "Please login to leave a review.", bookingId: null });
            return;
        }
    
        try {
            // Using /api/reservations based on your backend controller
            const res = await api.get(`/api/reservations/user/${user.id}`); 
            
            let bookingsList = [];
            if (Array.isArray(res.data)) {
                bookingsList = res.data;
            } else if (res.data.reservations) {
                bookingsList = res.data.reservations;
            } else if (res.data.data) {
                bookingsList = res.data.data;
            }
    
            if (bookingsList.length > 0) {
                // Find valid booking: Checked-In/Completed AND No Feedback
                const validBooking = bookingsList.find(booking => {
                    const status = booking.status ? booking.status.toLowerCase() : '';
                    const isStatusValid = status === 'checked-in' || status === 'completed';
                    const noFeedback = !booking.has_feedback || booking.has_feedback == 0;
                    return isStatusValid && noFeedback;
                });
                
                if (validBooking) {
                    setEligibility({ canReview: true, message: "", bookingId: validBooking.id });
                } else {
                    // Specific error messages
                    const hasPending = bookingsList.some(b => ['pending', 'confirmed'].includes(b.status?.toLowerCase()));
                    if (hasPending) {
                        setEligibility({ canReview: false, message: "You can write a review once you have Checked-In." });
                    } else {
                        setEligibility({ canReview: false, message: "No eligible stay found for review." });
                    }
                }
            } else {
                setEligibility({ canReview: false, message: "No bookings found." });
            }
        } catch (error) {
            console.error("Eligibility check error:", error);
            setEligibility({ canReview: false, message: "Unable to verify booking status." });
        }
    };

    useEffect(() => {
        if(user) {
            checkEligibility();
        }
    }, [user]);

    // --- HANDLE BUTTON CLICK ---
    const handleWriteReviewClick = () => {
        if (!user) {
            // If not logged in, go to login
            navigate('/login');
            return;
        }

        if (eligibility.canReview) {
            // If eligible, open the modal (pass bookingId if needed by parent)
            onOpenModal(eligibility.bookingId);
        } else {
            // If logged in but not eligible, show alert
            alert(eligibility.message);
        }
    };

    return (
        <section className="py-16 md:py-24 bg-white relative overflow-x-hidden">
            <div className="container mx-auto px-4 sm:px-6">
                <div className="flex flex-col md:flex-row justify-between items-center mb-10 md:mb-16 gap-6 max-w-7xl mx-auto">
                    <div className="text-center md:text-left">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 font-header mb-2">Guest Experiences</h2>
                        <p className="text-gray-500 max-w-2xl text-base md:text-lg font-light">See what others are saying about their stay.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        {/* MODIFIED BUTTON with onClick handler */}
                        <button 
                            onClick={handleWriteReviewClick} 
                            className={`px-6 py-3 font-bold uppercase tracking-wider text-xs transition-all shadow-md rounded-none ${
                                !user || eligibility.canReview 
                                ? "bg-[#ea580c] text-white hover:bg-[#c2410c]" 
                                : "bg-gray-400 text-white cursor-not-allowed"
                            }`}
                        >
                            Write a Review
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 max-w-8xl mx-auto">
                    {/* LEFT: DASHBOARD SUMMARY */}
                    <div className="lg:col-span-4 bg-white p-6 border border-gray-100 shadow-sm rounded-xl h-fit sticky top-24">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-header font-bold text-xl text-gray-900">Overall Rating</h3>
                        </div>
                        <div className="flex items-center justify-center mb-8">
                            <div className="relative flex items-center justify-center w-32 h-32">
                                <svg className="w-full h-full transform -rotate-90"><circle cx="50%" cy="50%" r="45%" stroke="#fff7ed" strokeWidth="8" fill="transparent" /><circle cx="50%" cy="50%" r="45%" stroke="#ea580c" strokeWidth="8" fill="transparent" strokeDasharray={351} strokeDashoffset={351 - (351 * getOverallAverage()) / 5} className="transition-all duration-1000 ease-out" /></svg>
                                <div className="absolute flex flex-col items-center">
                                    <span className="text-4xl font-header font-bold text-[#ea580c]">{getOverallAverage()}</span>
                                    <span className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">out of 5</span>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            {categories.map((cat) => (
                                <div key={cat.id}>
                                    <div className="flex justify-between text-xs mb-1 uppercase tracking-wide text-gray-500"><span>{cat.label}</span><span className="font-bold text-gray-900">{getCategoryAverage(cat.id)}</span></div>
                                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-[#ea580c]" style={{ width: `${(getCategoryAverage(cat.id) / 5) * 100}%` }}></div></div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT: REVIEWS CAROUSEL */}
                    <div className="lg:col-span-8 relative">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center h-64 text-gray-400"><Loader2 size={32} className="animate-spin text-[#ea580c] mb-2" /><p>Loading reviews...</p></div>
                        ) : (
                            <div ref={reviewsRef} className="grid grid-rows-2 grid-flow-col gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth auto-cols-[260px] md:auto-cols-[300px]">
                                {reviews.length > 0 ? (
                                    reviews.map((review) => (
                                        <div key={review.id} className="bg-gray-50 border border-gray-100 p-4 rounded-lg shadow-sm hover:shadow-md transition-all h-full flex flex-col justify-between snap-start">
                                            <div>
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 bg-[#ea580c] rounded-full flex items-center justify-center text-white font-bold text-xs">{review.name.charAt(0)}</div>
                                                        <div><h4 className="font-bold text-gray-900 text-xs">{review.name}</h4><span className="text-[10px] text-gray-400 block">{review.date}</span></div>
                                                    </div>
                                                    <div className="flex items-center bg-white px-1.5 py-0.5 rounded shadow-sm border border-gray-100"><Star size={10} className="text-[#ea580c] fill-[#ea580c] mr-1" /><span className="font-bold text-gray-900 text-xs">{review.average}</span></div>
                                                </div>
                                                <div className="relative"><MessageSquareQuote size={16} className="absolute -top-1 -left-1 text-gray-300 opacity-50" /><p className="text-gray-600 text-xs leading-relaxed relative z-10 pt-3 italic line-clamp-3">"{review.comment}"</p></div>
                                            </div>
                                            <div className="mt-3 pt-3 border-t border-gray-200 flex gap-1 flex-wrap">
                                                <span className="text-[9px] px-2 py-0.5 bg-white rounded border border-gray-200 text-gray-500">Service: <b>{review.ratings.service}</b></span>
                                                <span className="text-[9px] px-2 py-0.5 bg-white rounded border border-gray-200 text-gray-500">Cleanliness: <b>{review.ratings.cleanliness}</b></span>
                                                <span className="text-[9px] px-2 py-0.5 bg-white rounded border border-gray-200 text-gray-500">Amenities: <b>{review.ratings.amenities}</b></span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="w-full text-center text-gray-400 py-10 col-span-2">No reviews with 4.0+ rating yet.</div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};
export default FeedbackSection;