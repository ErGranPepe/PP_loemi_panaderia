import React from 'react';
import { StarIcon } from './icons';

const testimonials = [
  {
    quote: 'El mejor pan de todo Móstoles. La hogaza de masa madre es espectacular, crujiente por fuera y tierna por dentro. ¡Ya no compro pan en otro sitio!',
    author: 'Laura G.',
    rating: 5,
  },
  {
    quote: 'Las tartas de cumpleaños son una maravilla. Encargamos una de queso y fue un éxito total. Artesanía y sabor de verdad. Totalmente recomendable.',
    author: 'Carlos S.',
    rating: 5,
  },
  {
    quote: 'Se nota el cariño que le ponen a todo lo que hacen. Los croissants son adictivos y el trato siempre es cercano y familiar. Un tesoro de barrio.',
    author: 'María P.',
    rating: 5,
  },
];

const Testimonials: React.FC = () => {
  return (
    <section id="reseñas" className="py-16 sm:py-24 bg-amber-50/50">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl">Lo que dicen nuestros clientes</h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-stone-600">Vuestra opinión es nuestro mejor ingrediente.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md flex flex-col">
              <div className="flex items-center mb-2">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <StarIcon key={i} className="w-5 h-5 text-amber-500" />
                ))}
              </div>
              <blockquote className="text-stone-700 flex-grow">"{testimonial.quote}"</blockquote>
              <p className="mt-4 font-semibold text-stone-800 text-right">- {testimonial.author}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
