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

interface TestimonialsProps {
  title: string;
}

const Testimonials: React.FC<TestimonialsProps> = ({ title }) => {
  return (
    <section id="reseñas" className="py-14 sm:py-24 px-4 sm:px-8 bg-white border-t border-stone-200">
      <div className="w-full max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl">{title}</h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-stone-600">Vuestra opinión es nuestro mejor ingrediente.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md flex flex-col" itemScope itemType="https://schema.org/Review">
              <div itemProp="reviewRating" itemScope itemType="https://schema.org/Rating" className="flex items-center mb-2">
                <meta itemProp="ratingValue" content={testimonial.rating.toString()} />
                <meta itemProp="bestRating" content="5" />
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className={`w-5 h-5 ${i < testimonial.rating ? 'text-amber-500' : 'text-stone-300'}`} />
                ))}
              </div>
              <blockquote itemProp="reviewBody" className="text-stone-700 flex-grow">"{testimonial.quote}"</blockquote>
              <p itemProp="author" itemScope itemType="https://schema.org/Person" className="mt-4 font-semibold text-stone-800 text-right">
                - <span itemProp="name">{testimonial.author}</span>
              </p>
              <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Review",
                "itemReviewed": {
                  "@type": "Bakery",
                  "name": "Panadería Loemi Pastelería",
                  "image": "https://loemipanaderia.duckdns.org/media/hero-panaderia.jpg"
                },
                "author": { "@type": "Person", "name": testimonial.author },
                "reviewRating": { "@type": "Rating", "ratingValue": testimonial.rating.toString(), "bestRating": "5" },
                "reviewBody": testimonial.quote
              })}} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
