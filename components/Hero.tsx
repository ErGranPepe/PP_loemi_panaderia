import React, { useState, useEffect } from 'react';

const Hero: React.FC = () => {
  const [bgOffset, setBgOffset] = useState(0);
  const [textOffset, setTextOffset] = useState(0);
  const [overlayOpacity, setOverlayOpacity] = useState(0.4);
  const [textVisible, setTextVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setBgOffset(scrollTop * 0.8); // Background parallax
      setTextOffset(scrollTop * 0.3); // Text parallax (moves up slower)
      setOverlayOpacity(Math.max(0.3, 0.4 - scrollTop * 0.001)); // Fade overlay
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Trigger text animation after component mounts
    const timer = setTimeout(() => setTextVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative h-[45vh] sm:h-[60vh] lg:h-[80vh] bg-cover bg-center overflow-hidden">
      {/* Background: image on mobile, video on >= sm */}
      <picture className="absolute inset-0 w-full h-full block sm:hidden" style={{ transform: `translateY(${bgOffset * 0.4}px)` }}>
        <img
          src="/media/logo_loemi.png"
          alt="Bakery background"
          className="w-full h-full object-cover"
          loading="eager"
          decoding="async"
        />
      </picture>
      <video
        className="hidden sm:block absolute inset-0 w-full h-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        style={{ transform: `translateY(${bgOffset}px)` }}
      >
        <source src="/media/video_pan.mp4" type="video/mp4" />
      </video>

      {/* Semi-transparent black overlay */}
      <div
        className="absolute inset-0 bg-black transition-opacity duration-300"
        style={{ opacity: Math.min(overlayOpacity, 0.25) }}
      ></div>

      {/* Steam Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-white/10 rounded-full animate-steam"></div>
        <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-white/10 rounded-full animate-steam" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-1/4 left-1/3 w-28 h-28 bg-white/10 rounded-full animate-steam" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Animated Text */}
      <div
        className="relative w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 h-full flex flex-col justify-center items-center text-center text-amber-100"
        style={{ transform: `translateY(${-textOffset * 0.7}px)` }}
      >
        {/* Watermark Logo */}
        {/* Removed as per user request to avoid distraction */}

        <h1
          className={`text-2xl sm:text-4xl lg:text-6xl font-serif font-bold tracking-wide drop-shadow-2xl transition-all duration-1000 px-4 leading-tight text-center ${
            textVisible ? 'animate-flour-write fade-in-letter-spacing' : 'opacity-0'
          }`}
        >
          El Sabor de la Tradición
        </h1>
        <p
          className={`mt-2 sm:mt-3 text-sm sm:text-base lg:text-lg max-w-xs sm:max-w-xl drop-shadow-lg font-serif italic transition-all duration-1000 delay-500 slide-up px-4 text-center ${
            textVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          Pan artesanal hecho con pasión
        </p>

        {/* Breathing CTA Button with Highlight */}
        <a
          href="#productos"
          className="mt-4 sm:mt-8 px-6 sm:px-12 py-3 sm:py-3 bg-amber-900 hover:bg-amber-800 rounded-full text-sm sm:text-lg font-semibold transition-all duration-300 shadow-lg font-serif animate-breath animate-highlight relative overflow-hidden"
        >
          Ver productos
        </a>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-amber-100 animate-pulse-slow">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
};

export default Hero;
