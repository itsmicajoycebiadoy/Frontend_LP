import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import pool from "../../../assets/pool.png";
import eventhall from "../../../assets/eventhall.png";
import cottage from "../../../assets/cottage.png";

const FeaturedAmenities = ({ isLoading, amenities, apiUrl }) => {
    const navigate = useNavigate();
    const [isVisible, setIsVisible] = useState(false);
    const [sectionVisible, setSectionVisible] = useState(false);

    // Animation trigger on scroll
    useEffect(() => {
        const handleScroll = () => {
            setIsVisible(true);
            
            const section = document.querySelector('.amenities-section');
            if (section) {
                const rect = section.getBoundingClientRect();
                const isSectionVisible = rect.top < window.innerHeight * 0.8;
                
                if (isSectionVisible && !sectionVisible) {
                    setSectionVisible(true);
                }
            }
        };

        // Initial check
        handleScroll();
        
        // Add scroll listener
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [sectionVisible]);

    const getImageUrl = (img) => {
        if (!img) return pool;
        if (img.includes('pool.png')) return pool;
        if (img.includes('eventhall.png')) return eventhall;
        if (img.includes('cottage.png')) return cottage;
        if (img.startsWith('http')) return img;
        return `${apiUrl}/uploads/am_images/${img}`;
    };

    return (
        <section className={`amenities-section py-16 md:py-24 bg-white border-b border-gray-100 transition-all duration-700 ${
            sectionVisible ? 'opacity-100' : 'opacity-0'
        }`}>
            <div className="container mx-auto px-4 sm:px-6">
                <div className="text-center mb-12 max-w-3xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 font-header mb-3">
                        Our Featured Amenities
                    </h2>
                    <p className="text-gray-500 text-base font-light">
                        Discover our top-rated facilities designed for your comfort.
                    </p>
                </div>
                
                <div className="max-w-7xl mx-auto">
                    {isLoading ? (
                        <div className={`flex justify-center py-12 transition-all duration-700 ${
                            sectionVisible ? 'animate-fade-in' : 'opacity-0'
                        }`}>
                            <Loader2 className="animate-spin text-[#ea580c]" size={40} />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10">
                            {amenities.map((item, index) => (
                                <div 
                                    key={item.id} 
                                    className={`shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group relative h-[300px] md:h-[380px] lg:h-[450px] ${
                                        sectionVisible ? 'animate-slide-in-up' : 'opacity-0'
                                    }`}
                                    style={{ animationDelay: `${0.1 * index}s` }}
                                >
                                    <div className="absolute inset-0 w-full h-full">
                                        <img 
                                            src={getImageUrl(item.image)} 
                                            alt={item.name} 
                                            className="w-full h-full object-cover object-center" 
                                        />
                                        <div className="absolute inset-0 bg-black/10"></div>
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 bg-white m-4 p-5 rounded-xl shadow-lg">
                                        <h3 className="text-lg sm:text-xl font-bold text-[#ea580c] mb-1">
                                            {item.name}
                                        </h3>
                                        <p className="text-gray-600 text-xs sm:text-sm leading-relaxed line-clamp-2">
                                            {item.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    <div className={`text-center mt-12 md:mt-16 transition-all duration-700 ${
                        sectionVisible ? 'animate-fade-in' : 'opacity-0'
                    }`} style={{ animationDelay: '0.5s' }}>
                        <button 
                            onClick={() => navigate("/amenities")} 
                            className="px-8 sm:px-10 md:px-12 py-3 sm:py-4 bg-[#ea580c] hover:bg-[#c2410c] text-white font-bold uppercase tracking-widest text-xs sm:text-sm shadow-lg transition-all transform hover:-translate-y-1 hover:shadow-xl"
                        >
                            View All Amenities
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FeaturedAmenities;