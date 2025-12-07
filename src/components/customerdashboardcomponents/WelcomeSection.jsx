import React, { useState, useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
import hero1 from "../../../assets/hero1.png";
import hero2 from "../../../assets/hero2.png";
import hero3 from "../../../assets/hero3.png";
import hero4 from "../../../assets/hero4.png";

const WelcomeSection = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [sectionVisible, setSectionVisible] = useState(false);
    
    // Animation trigger on scroll
    useEffect(() => {
        const handleScroll = () => {
            setIsVisible(true);
            
            const section = document.querySelector('.welcome-section');
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

    const whyChooseUs = [
        "We offer an affordable 50 pesos entrance fee",
        "We maintain clean and well-kept facilities",
        "Our staff is friendly and always ready to help",
        "We're perfect for your family and group outings",
        "We provide various amenities for your relaxation",
        "We're always improving for your better experience"
    ];

    return (
        <section className={`welcome-section py-16 md:py-24 bg-slate-300 border-b border-gray-100 transition-all duration-700 ${
            sectionVisible ? 'opacity-100' : 'opacity-0'
        }`}>
            <div className="container mx-auto px-4 sm:px-6">
                <div className="max-w-7xl mx-auto">
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                        
                        {/* LEFT COLUMN: Text Content */}
                        <div className={`text-center lg:text-left transition-all duration-700 ${
                            sectionVisible ? 'animate-slide-in-left' : 'opacity-0'
                        }`}>
                            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 font-header mb-6">
                                Welcome to <span className="text-[#ea580c]">La Piscina</span>
                            </h2>
                            
                            <div className="text-gray-600 text-base md:text-lg leading-relaxed space-y-4 font-light mb-8">
                                <p>One of the most affordable resorts located in <span className="font-semibold text-gray-800">Balayan, Batangas</span> with an entrance fee of only <span className="font-bold text-[#ea580c]">50 pesos</span>.</p>
                                <p>Relaxed and friendly atmosphere favorite spot for families, friends, and travelers.</p>
                            </div>

                            {/* Why Choose Us Box */}
                            <div className={`bg-orange-50/50 p-6 rounded-2xl border border-orange-100 text-left transition-all duration-700 ${
                                sectionVisible ? 'animate-fade-in' : 'opacity-0'
                            }`} style={{ animationDelay: '0.2s' }}>
                                <h3 className="font-bold text-lg text-gray-900 font-header mb-4 text-center lg:text-left">Why Guests Choose Us</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {whyChooseUs.map((text, index) => (
                                        <div 
                                            key={index} 
                                            className={`flex items-start gap-3 transition-all duration-700 ${
                                                sectionVisible ? 'animate-fade-in' : 'opacity-0'
                                            }`} 
                                            style={{ animationDelay: `${0.1 * (index + 1)}s` }}
                                        >
                                            <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <CheckCircle2 className="w-3.5 h-3.5 text-[#ea580c]" />
                                            </div>
                                            <span className="text-gray-700 text-sm leading-snug">{text}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Images */}
                        <div className={`relative mt-8 lg:mt-0 transition-all duration-700 ${
                            sectionVisible ? 'animate-slide-in-right' : 'opacity-0'
                        }`}>
                            
                            {/* Desktop View (Collage) */}
                            <div className="hidden lg:grid grid-cols-2 gap-2 h-[500px]">
                                {[
                                    { img: hero1, delay: '0.1s' },
                                    { img: hero2, delay: '0.2s' },
                                    { img: hero3, delay: '0.3s' },
                                    { img: hero4, delay: '0.4s' }
                                ].map((item, index) => (
                                    <div 
                                        key={index} 
                                        className={`h-60 overflow-hidden shadow-md transition-all duration-700 ${
                                            sectionVisible ? 'animate-fade-in' : 'opacity-0'
                                        }`} 
                                        style={{ animationDelay: item.delay }}
                                    >
                                        <img src={item.img} className="w-full h-full object-cover" alt={`Resort ${index + 1}`} />
                                    </div>
                                ))}
                            </div>

                            {/* Mobile/Tablet View (Single Image) */}
                            <div className={`lg:hidden w-full h-64 sm:h-80 overflow-hidden rounded-xl shadow-lg transition-all duration-700 ${
                                sectionVisible ? 'animate-fade-in' : 'opacity-0'
                            }`} style={{ animationDelay: '0.5s' }}>
                                <img src={hero1} className="w-full h-full object-cover" alt="Resort View" />
                            </div>

                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
};

export default WelcomeSection;