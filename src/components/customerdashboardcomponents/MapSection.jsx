import React from "react";
const GMAPS_LINK = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3872.2765647011274!2d120.73721077537722!3d13.942131386469889!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x33bda31e1c02a62d%3A0x4b143b1fae749c!2sLa%20Piscina%20Di%20Concepcion%20Resort!5e0!3m2!1sen!2sph!4v1764375702066!5m2!1sen!2sph";

const MapSection = () => {
    return (
        <section className="w-full h-[300px] md:h-[500px] bg-slate-200">
            <iframe title="Resort Location" src={GMAPS_LINK} width="100%" height="100%" style={{ border: 0 }} allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="filter grayscale hover:grayscale-0 transition-all duration-700"></iframe>
        </section>
    );
};
export default MapSection;