import React from "react";
import { useAuth } from "../AuthContext";
import Header from "../../components/Header.jsx";
import Footer from "../../components/Footer.jsx";
import { Star, Send, User, MessageSquare, ShieldCheck, CheckCircle2, BarChart3, Quote } from "lucide-react";

// Fonts injection
const FontStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Lato:wght@300;400;700&display=swap');
    
    .font-serif-display { font-family: 'Playfair Display', serif; }
    
    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #fed7aa; border-radius: 4px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #fdba74; }
  `}</style>
);

const Feedback = () => {
  const { user } = useAuth();
  const backgroundImageUrl = "/images/bg.jpg";

  // --- STATE MANAGEMENT ---
  const [reviews, setReviews] = useState([
    { 
      id: 1, 
      name: "Maria Clara", 
      ratings: { service: 5, cleanliness: 5, amenities: 5, food: 4 }, 
      average: 4.8,
      comment: "Absolutely stunning sunset view! The ambiance matches the premium feel of the cabins.", 
      date: "Nov 01, 2023" 
    },
    { 
      id: 2, 
      name: "Crisostomo Ibarra", 
      ratings: { service: 4, cleanliness: 3, amenities: 5, food: 3 }, 
      average: 3.8,
      comment: "The amenities are top-notch, exactly as advertised. Housekeeping could be faster though.", 
      date: "Oct 28, 2023" 
    },
    { 
      id: 3, 
      name: "Padre Damaso", 
      ratings: { service: 2, cleanliness: 5, amenities: 4, food: 5 }, 
      average: 4.0,
      comment: "Food was exquisite, but the staff needs more training on hospitality.", 
      date: "Oct 25, 2023" 
    },
  ]);

  const [formData, setFormData] = useState({ 
    name: '', 
    ratings: { service: 0, cleanliness: 0, amenities: 0, food: 0 }, 
    comment: '' 
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // --- HELPERS & HANDLERS ---
  const getCurrentFormAverage = () => {
    const values = Object.values(formData.ratings);
    const total = values.reduce((acc, curr) => acc + curr, 0);
    return values.length > 0 ? (total / values.length).toFixed(1) : 0;
  };

  const getCategoryAverage = (category) => {
    const total = reviews.reduce((acc, review) => acc + review.ratings[category], 0);
    return (total / reviews.length).toFixed(1);
  };

  const getOverallAverage = () => {
    const total = reviews.reduce((acc, review) => acc + parseFloat(review.average), 0);
    return (total / reviews.length).toFixed(1);
  };

  const handleRatingChange = (category, value) => {
    setFormData(prev => ({
      ...prev,
      ratings: { ...prev.ratings, [category]: value }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const unrated = Object.values(formData.ratings).some(r => r === 0);
    if (unrated) {
      alert("Please rate all categories first.");
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const values = Object.values(formData.ratings);
      const avg = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1);

      const newReview = {
        id: reviews.length + 1,
        name: formData.name || "Anonymous Guest",
        ratings: formData.ratings,
        average: avg,
        comment: formData.comment,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      };

      setReviews([newReview, ...reviews]);
      setFormData({ 
        name: '', 
        ratings: { service: 0, cleanliness: 0, amenities: 0, food: 0 }, 
        comment: '' 
      });
      setIsSubmitting(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1500);
  };

  const categories = [
    { id: 'service', label: 'Service' },
    { id: 'cleanliness', label: 'Cleanliness' },
    { id: 'amenities', label: 'Amenities' },
    { id: 'food', label: 'Food & Dining' }
  ];

  return (
    <div className="min-h-screen bg-lp-light-bg flex flex-col">
      <FontStyles />
      <Header user={user} />

      {/* HERO SECTION - UNCHANGED */}
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
            Share your experience and help us improve our services at La Piscina Resort.
          </p>
        </div>
      </section>

      {/* MAIN CONTENT - INTEGRATED FEEDBACK SYSTEM */}
      <div className="flex-grow container mx-auto px-4 sm:px-6 py-8">
        <p>FEEDBACK</p>
      </div>

      <Footer />
    </div>
  );
};

export default Feedback;