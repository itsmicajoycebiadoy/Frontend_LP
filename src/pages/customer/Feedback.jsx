import React, { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import Header from "../../components/Header.jsx";
import Footer from "../../components/Footer.jsx";
import { Star, Send, CheckCircle2, BarChart3, Quote, Loader2, ShieldCheck } from "lucide-react";

// IMPORT YOUR AXIOS INSTANCE (Centralized URL management)
import api from "../../config/axios.js"; 

const Feedback = () => {
  const { user } = useAuth();
  const backgroundImageUrl = "/images/bg.jpg"; 

  // --- STATE MANAGEMENT ---
  const [reviews, setReviews] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Form State (3 Categories)
  const [formData, setFormData] = useState({ 
    name: '', 
    ratings: { service: 0, cleanliness: 0, amenities: 0 }, 
    comment: '' 
  });

  // --- FETCH REVIEWS FROM BACKEND ---
  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      // GET request gamit ang centralized 'api' instance
      const response = await api.get('/api/feedbacks');
      
      // Transform Backend Data to UI Format
      const formattedReviews = response.data.map(review => ({
        id: review.id,
        name: review.customer_name || "Anonymous",
        // Basahin ang breakdown columns
        ratings: { 
          service: review.service, 
          cleanliness: review.cleanliness, 
          amenities: review.amenities 
        }, 
        average: review.average, // Overall Average
        comment: review.comment,
        date: new Date(review.date).toLocaleDateString()
      }));

      // FINAL FILTER LOGIC: Show only reviews with 4.0 or higher
      const highRatedReviews = formattedReviews.filter(review => review.average >= 4);

      setReviews(highRatedReviews);
      } catch (error) {
        console.error("Error fetching feedbacks:", error);
      } finally {
        setIsLoading(false);
      }
    };

  useEffect(() => {
    fetchReviews();
  }, []);

  // --- HELPERS ---
  const getCurrentFormAverage = () => {
    const values = Object.values(formData.ratings);
    const total = values.reduce((acc, curr) => acc + curr, 0);
    return values.length > 0 ? (total / values.length).toFixed(1) : 0;
  };

  const getOverallAverage = () => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((acc, review) => acc + parseFloat(review.average), 0);
    return (total / reviews.length).toFixed(1);
  };

  const getCategoryAverage = (category) => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((acc, review) => acc + review.ratings[category], 0);
    return (total / reviews.length).toFixed(1);
  };


  const handleRatingChange = (category, value) => {
    setFormData(prev => ({
      ...prev,
      ratings: { ...prev.ratings, [category]: value }
    }));
  };

  // --- SUBMIT TO BACKEND (Sends breakdown) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const unrated = Object.values(formData.ratings).some(r => r === 0);
    if (unrated) { alert("Please rate all categories first."); return; }

    setIsSubmitting(true);

    try {
      // 1. Calculate Average
      const values = Object.values(formData.ratings);
      const avgRating = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1);

      // 2. Prepare Payload (Sends the breakdown object for DB insertion)
      const payload = {
        name: formData.name || "Anonymous Guest",
        rating: avgRating, 
        comment: formData.comment,
        ratings: formData.ratings
      };

      // 3. API Post using centralized config
      const response = await api.post('/api/feedbacks', payload);

      if (response.data.success) {
        
        // Only show in UI immediately IF it's a high rating (4.0+)
        if (payload.rating >= 4) {
            const newReviewUI = {
                id: Date.now(),
                name: payload.name,
                ratings: formData.ratings,
                average: payload.rating,
                comment: payload.comment,
                date: new Date().toLocaleDateString()
            };
            setReviews([newReviewUI, ...reviews]);
        }

        // Reset Form & Show Success Message
        setFormData({ name: '', ratings: { service: 0, cleanliness: 0, amenities: 0 }, comment: '' });
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }

    } catch (error) {
      console.error("Submission error:", error);
      alert("Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
    { id: 'service', label: 'Service' },
    { id: 'cleanliness', label: 'Cleanliness' },
    { id: 'amenities', label: 'Amenities' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header user={user} />

      {/* HERO SECTION */}
      <section
        className="bg-cover bg-center text-white py-12 sm:py-16 lg:py-20"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(${backgroundImageUrl})`,
        }}
      >
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl md:text-6xl font-bold text-white font-header mb-4">
            Feedback
          </h2>
          <p className="text-sm md:text-lg text-gray-200 max-w-2xl mx-auto mb-8">
             Your opinion matters. Help us improve your experience at La Piscina Resort.
          </p>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <div className="flex-grow container mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 max-w-7xl mx-auto">
          
          {/* LEFT COLUMN: SUBMISSION FORM */}
          <div className="lg:col-span-5 order-2 lg:order-1">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 sticky top-24">
              
              {/* Form Header */}
              <div className="bg-[#ea580c] p-6 text-white flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-xl">Write a Review</h3>
                  <p className="text-white/80 text-xs mt-1">Share your story</p>
                </div>
                {getCurrentFormAverage() > 0 && (
                  <div className="bg-white text-[#ea580c] px-3 py-1 rounded-full font-bold shadow-sm">
                    {getCurrentFormAverage()}
                  </div>
                )}
              </div>

              <div className="p-6 md:p-8 relative">
                
                {/* Success Message Overlay */}
                {showSuccess && (
                  <div className="absolute inset-0 bg-white z-50 flex flex-col items-center justify-center text-center p-6 animate-in fade-in">
                    <CheckCircle2 size={48} className="text-green-500 mb-4" />
                    <h4 className="text-2xl font-bold text-gray-800">Thank You!</h4>
                    <p className="text-gray-500 mt-2">Your feedback has been submitted.</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Rating Sliders */}
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 block">1. Rate Categories</label>
                    <div className="space-y-4">
                      {categories.map((cat) => (
                        <div key={cat.id} className="flex flex-col sm:flex-row sm:items-center justify-between">
                          <span className="text-sm font-medium text-gray-700 mb-1 sm:mb-0">{cat.label}</span>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => handleRatingChange(cat.id, star)}
                                className="focus:outline-none hover:scale-110 transition-transform"
                              >
                                <Star
                                  size={24}
                                  fill={star <= formData.ratings[cat.id] ? "#f59e0b" : "#e5e7eb"}
                                  className={star <= formData.ratings[cat.id] ? "text-[#f59e0b]" : "text-gray-200"}
                                  strokeWidth={0}
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <hr className="border-gray-100" />

                  {/* Details Input */}
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 block">2. Your Details</label>
                    <div className="space-y-4">
                      <input
                        type="text"
                        placeholder="Your Name (Optional)"
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded focus:border-[#ea580c] outline-none text-sm transition-colors"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                      <textarea
                        rows="4"
                        placeholder="What did you love about your stay? How can we improve?"
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded focus:border-[#ea580c] outline-none text-sm resize-none transition-colors"
                        value={formData.comment}
                        onChange={(e) => setFormData({...formData, comment: e.target.value})}
                        required
                      ></textarea>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-[#ea580c] hover:bg-[#c2410c] text-white font-bold py-4 px-6 rounded-lg shadow-lg hover:shadow-xl hover:shadow-orange-200 transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <span className="animate-pulse">Processing...</span>
                      ) : (
                        <>
                          Submit Review <Send size={18} />
                        </>
                      )}
                    </button>
                    
                    <div className="flex items-center justify-center gap-2 mt-4 text-xs text-slate-400 opacity-80">
                      <ShieldCheck size={12} />
                      <span>Encrypted & Secure Submission</span>
                    </div>
                  </div>
                </form>
              </div>
              
            </div>
          </div>

          {/* RIGHT COLUMN: ANALYTICS & REVIEWS */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* ANALYTICS CARD */}
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-orange-100">
              <h3 className="text-xl font-bold text-[#c2410c] mb-6 flex items-center gap-2">
                <BarChart3 size={24} className="text-[#ea580c]" />
                Overall Performance
              </h3>
              
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="relative flex items-center justify-center w-40 h-40">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="80" cy="80" r="70" stroke="#fff7ed" strokeWidth="8" fill="transparent" />
                    <circle 
                      cx="80" cy="80" r="70" 
                      stroke="#ea580c" strokeWidth="8" fill="transparent" 
                      strokeDasharray={440}
                      strokeDashoffset={440 - (440 * getOverallAverage()) / 5}
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-4xl font-bold text-[#c2410c]">{getOverallAverage()}</span>
                    <div className="flex text-[#f59e0b] text-[10px]">
                      {[1, 2, 3, 4, 5].map(i => (
                        <Star key={i} size={10} fill={i <= Math.round(getOverallAverage()) ? "currentColor" : "none"} />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex-1 w-full space-y-3">
                  {categories.map((cat) => (
                    <div key={cat.id} className="group">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-semibold text-slate-600">{cat.label}</span>
                        <span className="font-bold text-[#c2410c]">{getCategoryAverage(cat.id)}</span>
                      </div>
                      <div className="h-2 w-full bg-orange-50 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#ea580c] rounded-full transition-all duration-1000 group-hover:bg-[#f97316]"
                          style={{ width: `${(getCategoryAverage(cat.id) / 5) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <h3 className="text-xl font-bold text-[#c2410c]">
                Recent Guest Reviews
              </h3>
              <span className="text-sm text-slate-500">{reviews.length} Verified Reviews</span>
            </div>

            {/* Reviews List (COMPACT SCROLLABLE CONTAINER) */}
            <div 
              className="space-y-4 lg:max-h-[75vh] overflow-y-auto hide-scrollbar" 
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {isLoading ? (
                  <div className="text-center py-12 text-gray-400 flex flex-col items-center">
                      <Loader2 size={32} className="animate-spin text-[#ea580c] mb-2" />
                      Loading reviews...
                  </div>
              ) : reviews.length > 0 ? (
                  reviews.map((review) => (
                    <div key={review.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative">
                      <Quote className="absolute top-4 right-4 text-gray-100 w-8 h-8 transform rotate-180" />
                      
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-orange-100 text-[#ea580c] rounded-full flex items-center justify-center font-bold">
                          {review.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 text-sm">{review.name}</p>
                          <p className="text-xs text-gray-400">{review.date}</p>
                        </div>
                      </div>

                      {/* Display Stars */}
                      <div className="flex mb-3">
                         {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} size={14} fill={star <= Math.round(review.average) ? "#f59e0b" : "#e5e7eb"} strokeWidth={0} />
                         ))}
                      </div>

                      <p className="text-gray-600 text-sm italic leading-relaxed">"{review.comment}"</p>
                    </div>
                  ))
              ) : (
                  <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                      <p className="text-gray-400">No high-rated reviews yet. Be the first!</p>
                  </div>
              )}
            </div>

          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Feedback;