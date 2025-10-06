import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-stone-100 py-8 mt-12 border-t border-stone-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between">
        <img
          src="/logo_loemi.png"
          alt="Loemi Artesanos Logo"
          className="h-20 w-auto mb-4 md:mb-0"
        />
        <div className="text-stone-700 text-center md:text-left space-y-1">
          <p>Dirección: Calle Falsa 123, Móstoles</p>
          <p>Horario: Lunes a Sábado, 8:00 - 20:00</p>
          <p>Contacto: info@loemi.com | +34 123 456 789</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
