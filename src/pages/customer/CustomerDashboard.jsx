import React, { useState, useEffect } from "react";
import axios from "axios";
import { Loader2, CheckCircle2 } from "lucide-react";
import { useAuth } from "../AuthContext";

// Components
import Header from "../../components/Header"; // Updated Header
import Footer from "../../components/Footer";

// Customer Sections
import HeroSection from "../../components/customerdashboardcomponents/HeroSection";
import WelcomeSection from "../../components/customerdashboardcomponents/WelcomeSection";
import FeaturedAmenities from "../../components/customerdashboardcomponents/FeaturedAmenities";
import GallerySection from "../../components/customerdashboardcomponents/GallerySection";
import FeedbackSection from "../../components/customerdashboardcomponents/FeedbackSection";
import ContactSection from "../../components/customerdashboardcomponents/ContactSection";
import MapSection from "../../components/customerdashboardcomponents/MapSection";
import ReviewModal from "../../components/customerdashboardcomponents/ReviewModal";

const API_URL = "http://localhost:5000";

const CustomerDashboard = () => {
    const { user, logout } = useAuth(); // Kailangan natin ang logout function dito

    // State
    const [reviews, setReviews] = useState([]);
    const [featuredAmenities, setFeaturedAmenities] = useState([]);
    const [isLoadingReviews, setIsLoadingReviews] = useState(true);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showFeedbackSuccess, setShowFeedbackSuccess] = useState(false);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

    // Fetch Data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoadingReviews(true);
                setIsLoadingData(true);

                // Fetch Featured Amenities
                try {
                    const response = await axios.get(`${API_URL}/api/amenities/featured`);
                    if (response.data && response.data.length > 0) {
                        setFeaturedAmenities(response.data);
                    } else { throw new Error("No data"); }
                } catch (err) {
                    // Fallback
                    setFeaturedAmenities([
                        { id: 1, name: "Refreshing Pool", description: "Dive into relaxation.", image: "pool.png" },
                        { id: 2, name: "Grand Event Hall", description: "Perfect venue for celebrations.", image: "eventhall.png" },
                        { id: 3, name: "Relaxing Cottage", description: "Comfort in native style.", image: "cottage.png" },
                    ]);
                }

                // Fetch Reviews
                try {
                    const reviewsRes = await axios.get(`${API_URL}/api/feedbacks`);
                    const formattedReviews = reviewsRes.data.map(review => ({
                        id: review.id,
                        name: review.customer_name || review.name || "Guest",
                        average: review.average,
                        comment: review.comment,
                        date: review.date ? new Date(review.date).toLocaleDateString() : new Date().toLocaleDateString(),
                        ratings: {
                            service: review.service || 5,
                            cleanliness: review.cleanliness || 5,
                            amenities: review.amenities || 5
                        }
                    }));
                    setReviews(formattedReviews.filter(r => parseFloat(r.average) >= 4.0));
                } catch (error) { 
                    setReviews([]); 
                }

            } catch (error) { console.error(error); }
            finally { setIsLoadingReviews(false); setIsLoadingData(false); }
        };
        fetchData();
    }, []);

    // Review Submit
    const handleReviewSubmit = async (payload) => {
        setIsSubmitting(true);
        try {
            const response = await axios.post(`${API_URL}/api/feedbacks`, payload);
            if (response.data.success) {
                if (payload.rating >= 4) {
                    const newReview = {
                        id: Date.now(),
                        name: payload.name,
                        average: payload.rating,
                        comment: payload.comment,
                        date: new Date().toLocaleDateString(),
                        ratings: payload.ratings
                    };
                    setReviews(prev => [newReview, ...prev]);
                }
                setIsReviewModalOpen(false);
                setShowFeedbackSuccess(true);
                setTimeout(() => setShowFeedbackSuccess(false), 3000);
            }
        } catch (error) {
            console.error(error);
            alert("Failed to submit review.");
        } finally { setIsSubmitting(false); }
    };

    return (
        <div className="min-h-screen flex flex-col font-sans bg-white w-full overflow-x-hidden relative">
            
            {/* --- UPDATED HEADER USAGE ---
               Note: Sa Customer, hindi kailangan ng activeTab/setActiveTab 
               dahil URL/Router ang gamit nila.
            */}
            <div className="sticky top-0 z-50 bg-white w-full">
                <Header user={user} onLogout={logout} />
            </div>

            {/* Main Content Sections */}
            <main className="flex-1 w-full">
                <HeroSection />
                <WelcomeSection />
                <FeaturedAmenities 
                    isLoading={isLoadingData} 
                    amenities={featuredAmenities} 
                    apiUrl={API_URL} 
                />
                <GallerySection apiUrl={API_URL} />
                <FeedbackSection 
                    reviews={reviews} 
                    isLoading={isLoadingReviews} 
                    onOpenModal={() => setIsReviewModalOpen(true)} 
                />
                <ContactSection />
                <MapSection />
            </main>

            <Footer />

            {/* Modals & Toasts */}
            {isReviewModalOpen && (
                <ReviewModal 
                    onClose={() => setIsReviewModalOpen(false)} 
                    onSubmit={handleReviewSubmit}
                    isSubmitting={isSubmitting}
                />
            )}

            {showFeedbackSuccess && (
                <div className="fixed bottom-8 right-8 z-[60] bg-green-600 text-white px-6 py-4 rounded-lg shadow-xl flex items-center gap-3 animate-in slide-in-from-right duration-300">
                    <CheckCircle2 size={24} />
                    <div>
                        <h4 className="font-bold text-sm">Thank You!</h4>
                        <p className="text-xs text-green-100">Review submitted successfully.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerDashboard;