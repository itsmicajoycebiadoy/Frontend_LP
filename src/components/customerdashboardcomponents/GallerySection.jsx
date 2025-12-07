import React, { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Images
import ownerImg from '../../../assets/owner.png'; 
import pool from "../../../assets/pool.png";
import eventhall from "../../../assets/eventhall.png";
import poolarea from "../../../assets/poolarea.png";
import night from "../../../assets/night.png";
import cottage from "../../../assets/cottage.png";

const GallerySection = () => {
    const facilitiesRef = useRef(null);

    const facilities = [
        { id: 1, title: "Mrs. La piscina Di concepcion", image_url: ownerImg },
        { id: 2, title: "Main Pool Area", image_url: poolarea },
        { id: 3, title: "Grand Event Hall", image_url: eventhall },
        { id: 4, title: "Night Ambiance", image_url: night },
        { id: 5, title: "Kiddie Pool", image_url: pool },
        { id: 6, title: "Cottages", image_url: cottage },
    ];

    // ETO YUNG FUNCTION NA NAG-EERROR KANINA
    const slide = (direction) => {
        if (facilitiesRef.current) {
            const { scrollLeft, clientWidth } = facilitiesRef.current;
            const scrollAmount = clientWidth / 2;
            const scrollTo = direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount;
            facilitiesRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
    };

    return (
        <section className="py-16 md:py-24 bg-slate-300 border-b border-gray-200">
            <div className="container mx-auto px-4 sm:px-6">
                <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-8 md:mb-12 max-w-7xl mx-auto px-2">
                    <div className="text-center md:text-left mb-6 md:mb-0">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 font-header mb-2">Our Gallery</h2>
                        <p className="text-gray-500 max-w-2xl text-base md:text-lg font-light">Experience the relaxing atmosphere.</p>
                    </div>
                    
                    {/* DITO MO DAPAT GAMITIN YUNG slide FUNCTION SA onClick */}
                    <div className="flex gap-3">
                        <button 
                            onClick={() => slide('left')} 
                            className="w-12 h-12 bg-white border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-[#ea580c] hover:text-white transition-all shadow-sm"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <button 
                            onClick={() => slide('right')} 
                            className="w-12 h-12 bg-white border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-[#ea580c] hover:text-white transition-all shadow-sm"
                        >
                            <ChevronRight size={24} />
                        </button>
                    </div>

                </div>
                <div className="relative max-w-8xl mx-auto">
                    <div ref={facilitiesRef} className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory scroll-smooth hide-scrollbar px-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                        {facilities.map((item, index) => (
                            <div key={index} className="min-w-[250px] md:min-w-[320px] lg:min-w-[400px] flex-shrink-0 snap-center relative group">
                                <div className="h-[250px] md:h-[300px] w-full overflow-hidden shadow-md">
                                    <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                                </div>
                                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-4 md:p-6 pt-12">
                                    <h3 className="text-xl md:text-2xl font-bold text-white font-header tracking-wide">{item.title}</h3>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default GallerySection;