

const testimonialsData = [
  {
    id: 1,
    name: 'Aditi Menon',
    role: 'IT Professional at INFOPARK',
    quote: "The best health decision I've made this year. I no longer skip breakfast or reach for fried food.",
    image: '/aditi_menon.png',
  },
  {
    id: 2,
    name: 'Rohan Pillai',
    role: 'Fitness Coach',
    quote: "The high-protein plan is spot on. And it arrives warm, right before breakfast.",
    image: '/rohan_pillai.png',
  },
  {
    id: 3,
    name: 'Dr. Ananya S.',
    role: 'Clinical Nutritionist',
    quote: "I recommend NutriFlow to my patients who struggle with portion control and morning blood sugar spikes. Clean, balanced nutrition.",
    image: '/dr_ananya.png',
  },
];

const Testimonials = () => {
  return (
    <section className="bg-primary-light py-16 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2
            className="text-4xl md:text-5xl font-bold font-serif text-gray-900 tracking-tight"
            style={{ fontFamily: "'Newsreader', Georgia, serif" }}
          >
            Mornings, transformed.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {testimonialsData.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col justify-between border border-gray-100/80"
            >
              <div>
                {/* 5 filled gold/yellow star icons */}
                <div className="flex items-center space-x-1 mb-6" aria-label="5 out of 5 stars">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5 fill-amber-400 text-amber-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                {/* Testimonial Quote */}
                <p className="text-gray-600 text-base leading-relaxed font-normal mb-8">
                  "{item.quote}"
                </p>
              </div>

              {/* Author Information */}
              <div className="pt-4 border-t border-gray-50 flex items-center space-x-3">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-15 h-15 rounded-full object-cover shrink-0"
                />
                <div>
                  <h3 className="font-bold text-gray-900 text-base mb-0.5 leading-tight">
                    {item.name}
                  </h3>
                  <p className="text-xs text-gray-500 font-normal">
                    {item.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
