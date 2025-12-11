import React from 'react';

const HeroSection = ({ title, description, backgroundImageUrl }) => {
  return (
    <section
      className="bg-cover bg-center text-white py-12 sm:py-16 lg:py-20"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(${backgroundImageUrl})`,
      }}
    >
      <div className="container mx-auto px-4 sm:px-6 text-center">
        <h2 className="text-3xl md:text-6xl font-bold text-white font-header mb-4">
          {title}
        </h2>
        <p className="text-sm md:text-lg text-gray-200 max-w-2xl mx-auto mb-8">
          {description}
        </p>
      </div>
    </section>
  );
};

export default HeroSection;