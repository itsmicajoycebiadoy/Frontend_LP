import React from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Grid } from "lucide-react";
import herovideo from "../../../assets/videoplayback.mp4";

const HeroSection = () => {
    const navigate = useNavigate();
    return (
        <section className="relative w-full h-screen overflow-hidden flex items-center justify-center bg-black">
            <div className="absolute inset-0 w-full h-full overflow-hidden">
                <video className="w-full h-full object-cover" autoPlay loop muted playsInline>
                    <source src={herovideo} type="video/mp4" />
                </video>
            </div>
            <div className="absolute inset-0 bg-black/40 z-10"></div>
            <div className="relative z-20 w-full flex flex-col items-center justify-center text-center px-4 md:px-6 animate-in fade-in zoom-in duration-700">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white font-header drop-shadow-md leading-tight mb-4 md:mb-6 max-w-4xl">
                    La Piscina De Conception Resort
                </h1>
                <p className="flex flex-col sm:flex-row items-center gap-2 text-gray-200 text-xs sm:text-sm md:text-lg drop-shadow-sm font-light tracking-wide mb-8">
                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4 md:w-5 md:h-5 text-white" /> Barangay Gumamela,</span> 
                    <span>Balayan, Batangas, Philippines</span>
                </p>
                <button onClick={() => navigate("/amenities")} className="flex items-center gap-2 font-semibold px-6 py-2 md:px-8 md:py-3 border border-white text-white bg-transparent backdrop-blur-sm hover:bg-white hover:text-black transition-all duration-300 uppercase tracking-widest text-xs md:text-sm">
                    <Grid className="w-4 h-4" /> Browse Amenities
                </button>
            </div>
        </section>
    );
};
export default HeroSection;