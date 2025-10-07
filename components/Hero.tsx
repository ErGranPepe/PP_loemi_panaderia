import React from "react";

const Hero: React.FC = () => {
  return (
    <section
      className="relative flex flex-col items-center justify-center w-full min-h-[90vh] text-center overflow-hidden"
    >
      {/* Video Background */}
      <video
        src="/media/video_pan.mp4"
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover object-center z-0"
      />

      {/* Capa oscura suave */}
      <div className="absolute inset-0 bg-black/40 z-10"></div>

      {/* Contenido */}
      <div className="relative z-20 px-6 max-w-md">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-amber-100 mb-3 leading-snug drop-shadow-md">
          El Sabor de la Tradición
        </h1>
        <p className="text-base sm:text-lg text-amber-50 mb-6 drop-shadow-md">
          Pan artesanal hecho con pasión y los mejores ingredientes.
        </p>
        <a
          href="#productos"
          className="bg-amber-900 hover:bg-amber-800 text-white font-semibold py-3 px-6 rounded-full shadow-md transition-all"
        >
          Ver productos
        </a>
      </div>

      {/* Flecha hacia abajo */}
      <div className="absolute bottom-6 z-20 animate-bounce">
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