import React from "react";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

const ContactSection = () => {
    const contactInfo = [
        { icon: <MapPin className="w-5 h-5 md:w-6 md:h-6" />, title: "Visit Our Resort", details: ["Barangay Gumamela, Balayan", "Batangas, Philippines 4213"], desc: "Easily accessible from Manila" },
        { icon: <Phone className="w-5 h-5 md:w-6 md:h-6" />, title: "Call Us", details: ["+63 (912) 345-6789", "+63 (918) 765-4321"], desc: "Daily 7:00 AM - 9:00 PM" },
        { icon: <Mail className="w-5 h-5 md:w-6 md:h-6" />, title: "Email Us", details: ["Lp_resort@gmail.com"], desc: "Response within 2-4 hours" },
        { icon: <Clock className="w-5 h-5 md:w-6 md:h-6" />, title: "Operating Hours", details: ["Mon - Sun: 8:00 AM - 10:00 PM"], desc: "Open on Holidays" }
    ];

    return (
        <section className="py-10 md:py-15 bg-slate-200 border-t border-gray-100">
            <div className="container mx-auto px-4 sm:px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12 md:mb-20">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 font-header mb-4 md:mb-6">Contact Us</h2>
                        <p className="text-gray-500 text-base md:text-lg max-w-2xl mx-auto font-light">We are always ready to assist you with your inquiries.</p>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-12 text-center">
                        {contactInfo.map((item, index) => (
                            <div key={index} className="flex flex-col items-center p-4 bg-gray-50 md:bg-transparent rounded-lg md:rounded-none">
                                <div className="w-10 h-10 md:w-16 md:h-16 rounded-full bg-orange-50 flex items-center justify-center text-[#ea580c] mb-3 md:mb-6">{item.icon}</div>
                                <h3 className="text-sm md:text-xl font-bold text-gray-900 mb-1 md:mb-3 font-header">{item.title}</h3>
                                <div className="space-y-1 hidden sm:block">{item.details.map((d, i) => (<p key={i} className="text-gray-600 font-medium text-sm">{d}</p>))}</div>
                                <p className="text-[9px] md:text-xs text-[#ea580c] mt-2 font-bold tracking-widest uppercase opacity-80">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};
export default ContactSection;