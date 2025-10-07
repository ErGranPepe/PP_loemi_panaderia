import React from 'react';
import { MapPinIcon, PhoneIcon } from './icons';

interface LocationProps {
  title: string;
}

const Location: React.FC<LocationProps> = ({ title }) => {
  return (
    <section id="contacto" className="py-16 sm:py-24">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl">{title}</h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-stone-600">
            Te esperamos en nuestro obrador para que disfrutes del sabor del pan de verdad.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden shadow-xl">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12163.69395254884!2d-3.874495546215797!3d40.32099873426839!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd418c3545c7b395%3A0x34a8736349603d61!2sM%C3%B3stoles%2C%20Madrid%2C%20Spain!5e0!3m2!1sen!2sus!4v1689269912345!5m2!1sen!2sus"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-semibold text-stone-800">Dirección</h3>
              <p className="mt-2 text-lg text-stone-600 flex items-start">
                <MapPinIcon className="w-6 h-6 mr-3 mt-1 text-amber-800 flex-shrink-0" />
                <span>Calle Falsa, 123<br/>28931 Móstoles, Madrid</span>
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-stone-800">Contacto</h3>
              <p className="mt-2 text-lg text-stone-600 flex items-center">
                <PhoneIcon className="w-6 h-6 mr-3 text-amber-800" />
                <span>912 345 678</span>
              </p>
            </div>
             <div>
              <h3 className="text-2xl font-semibold text-stone-800">Horario</h3>
              <div className="mt-2 text-lg text-stone-600 space-y-1">
                <p><strong>Lunes a Viernes:</strong> 07:00 - 20:00</p>
                <p><strong>Sábados y Domingos:</strong> 08:00 - 15:00</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Location;
