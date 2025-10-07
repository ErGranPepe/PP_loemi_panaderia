import React, { useEffect, useRef } from "react";

const Hero: React.FC = () => {
  const bgRef = useRef<HTMLVideoElement | null>(null);
  const midRef = useRef<HTMLDivElement | null>(null);
  const fgRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY || 0;
      // Parallax ratios — tuned for subtle, premium feel
      const bgRatio = 0.15; // background (slowest)
      const midRatio = 0.30; // mid decorations
      const fgRatio = 0.06; // foreground content (slow)

      if (bgRef.current) {
        bgRef.current.style.transform = `translateY(${y * bgRatio}px) scale(1.2)`;
      }
      if (midRef.current) {
        midRef.current.style.transform = `translateY(${y * midRatio}px)`;
      }
      if (fgRef.current) {
        fgRef.current.style.transform = `translateY(${y * fgRatio}px)`;
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Helper to render multiple floating steam particles with varying delays
  const renderSteam = () => {
    const items = Array.from({ length: 4 });
    return items.map((_, i) => {
      const left = 10 + i * (80 / items.length);
      const delay = (i % 4) * 0.9;
      const size = 60 + (i % 3) * 24;
      return (
        <span
          key={i}
          className="absolute bottom-10 rounded-full blur-xl opacity-20 animate-steam"
          style={{
            left: `${left}%`,
            width: `${size}px`,
            height: `${size}px`,
            background: "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.35), rgba(255,255,255,0.08) 60%, rgba(255,255,255,0))",
            animationDelay: `${delay}s`,
            filter: "blur(4px)",
          }}
        />
      );
    });
  };

  return (
    <section className="relative flex flex-col items-center justify-center w-full min-h-[75vh] sm:min-h-[85vh] text-center overflow-hidden bg-black">
      {/* Video Background */}
      <video
        ref={bgRef}
        src="/media/video_pan.mp4"
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover object-center z-0 will-change-transform"
        style={{ transform: 'scale(1.04)' }}
      />

      {/* Vignette + Deep Soft Dark Layer for better contrast */}
      <div className="absolute inset-0 z-10 pointer-events-none fade-overlay">
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-transparent" />
      </div>

      {/* Mid-layer steam/flour particles (parallax) */}
      <div ref={midRef} className="absolute inset-0 z-10 pointer-events-none will-change-transform">
        {renderSteam()}
      </div>

      {/* Foreground content minimal (left-aligned on larger screens) */}
      <div ref={fgRef} className="relative z-20 px-6 sm:px-8 w-full max-w-4xl text-center sm:text-left will-change-transform">
        <p className="uppercase tracking-[0.2em] text-amber-100/70 mb-3 slide-up" style={{ animationDelay: '0.05s' }}>
          Loemi artesanos · Móstoles
        </p>
        <h1 className="font-extrabold text-5xl sm:text-7xl lg:text-8xl text-amber-50 leading-[0.95] slide-up" style={{ animationDelay: '0.05s' }}>
          El sabor
          <span className="block">de la tradición</span>
        </h1>
        <p className="text-base sm:text-xl text-amber-50/90 mt-4 sm:mt-5 mb-6 sm:mb-10 drop-shadow-md leading-relaxed slide-up" style={{ animationDelay: '0.15s' }}>
          Migas tibias, corteza crujiente y aroma recién horneado.
        </p>
        <div className="flex items-center justify-center sm:justify-start gap-3 sm:gap-4 slide-up" style={{ animationDelay: '0.25s' }}>
          <a
            href="#productos"
            aria-label="Ver nuestros productos artesanales"
            className="inline-flex items-center justify-center rounded-full bg-amber-700 hover:bg-amber-600 text-white font-semibold py-3 px-7 shadow-lg shadow-amber-900/20 ring-1 ring-amber-900/30 transition-transform duration-300 ease-out hover:-translate-y-0.5"
          >
            Ver productos
          </a>
          <a
            href="#reseñas"
            aria-label="Leer las reseñas de nuestros clientes"
            className="inline-flex items-center justify-center rounded-full bg-transparent text-amber-50 font-medium py-3 px-7 border border-white/30 hover:bg-white/10 transition-colors"
          >
            Reseñas
          </a>
        </div>
      </div>

      
      {/* Flour/crumbs fade to white at bottom */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-28 sm:h-40 z-[12]">
        {/* base white fade */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white" />
        {/* bigger soft crumbs */}
        <div className="absolute inset-x-0 bottom-2 h-full">
          {[...Array(24)].map((_, i) => (
            <span
              key={`crumb-lg-${i}`}
              className="absolute rounded-full bg-white/80 blur-[2px]"
              style={{
                left: `${(i * 7) % 100}%`,
                bottom: `${2 + (i % 5)}px`,
                width: `${3 + (i % 3)}px`,
                height: `${3 + (i % 2)}px`,
                opacity: 0.6,
                transform: `translateY(${(i % 3) * -1}px)`,
              }}
            />
          ))}
        </div>
        {/* fine flour dust */}
        <div className="absolute inset-x-0 bottom-0 h-full">
          {[...Array(60)].map((_, i) => (
            <span
              key={`crumb-sm-${i}`}
              className="absolute rounded-full bg-white/90"
              style={{
                left: `${(i * 11) % 100}%`,
                bottom: `${(i % 8)}px`,
                width: `1px`,
                height: `1px`,
                opacity: 0.4,
              }}
            />
          ))}
        </div>
      </div>

      {/* Down arrow */}
      <div className="absolute bottom-6 z-20 bounce-strong">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-6 h-6 text-amber-100"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </section>
  );
};

export default Hero;
