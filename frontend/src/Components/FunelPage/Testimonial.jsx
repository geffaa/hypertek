import React, { useState, useEffect, useMemo } from "react";

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Jenny Wilson",
      role: "Project Manager at Microsoft",
      quote: "This platform has completely transformed how our team manages game distribution. The intuitive interface and powerful analytics have increased our efficiency by 40%.",
      image: "https://cdn.rareblocks.xyz/collection/celebration/images/testimonials/1/avatar-1.jpg",
      company: "Microsoft"
    },
    {
      name: "Robert Fox",
      role: "Founder at Brain.co",
      quote: "As a startup, we needed a reliable gaming marketplace that could scale with us. This platform delivered beyond our expectations with its robust features and excellent support.",
      image: "https://cdn.rareblocks.xyz/collection/celebration/images/testimonials/1/avatar-2.jpg",
      company: "Brain.co"
    },
    {
      name: "Kristin Watson",
      role: "UX Designer at Google",
      quote: "The user experience is exceptional. From seamless transactions to clear analytics, every aspect is thoughtfully designed. Our users love the intuitive interface.",
      image: "https://cdn.rareblocks.xyz/collection/celebration/images/testimonials/1/avatar-3.jpg",
      company: "Google"
    },
    {
      name: "Sarah Johnson",
      role: "CTO at TechVision",
      quote: "The API integration was flawless and the performance metrics speak for themselves. We've seen a 60% reduction in transaction processing time.",
      image: "https://i.pravatar.cc/150?img=4",
      company: "TechVision"
    },
    {
      name: "Michael Chen",
      role: "Lead Developer at GameSphere",
      quote: "Outstanding platform with incredible scalability. Our user base grew 300% and the system handled it without any issues.",
      image: "https://i.pravatar.cc/150?img=5",
      company: "GameSphere"
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, testimonials.length]);

  const goToSlide = (index) => setCurrentIndex(index);

  // Show 1 card on mobile, 3 cards on desktop
  const visibleTestimonials = useMemo(() => {
    const cardsToShow = window.innerWidth >= 768 ? 3 : 1;
    return Array.from({ length: cardsToShow }).map((_, i) => 
      testimonials[(currentIndex + i) % testimonials.length]
    );
  }, [currentIndex, testimonials]);

  const metrics = [
    { number: "30K+", label: "Global Companies" },
    { number: "4.9/5", label: "Average Rating" },
    { number: "98%", label: "Client Satisfaction" },
    { number: "24/7", label: "Premium Support" }
  ];

  return (
    <section className="py-8 px-6 bg-transparent">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-start mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Trusted by{" "}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              10,000+
            </span>{" "}
            Industry Leaders
          </h2>
          
          <p className="text-xl text-gray-300 max-w-3xl leading-relaxed">
            Discover why Fortune 500 companies and innovative startups choose our platform 
            to drive digital transformation and achieve measurable business outcomes.
          </p>
        </div>

        {/* Testimonials Carousel */}
        <div 
          className="max-w-6xl mx-auto mt-16"
          onMouseEnter={() => setIsAutoPlaying(false)} 
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          {/* Responsive Grid - 1 card on mobile, 3 on desktop */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {visibleTestimonials.map((testimonial, index) => (
              <div 
                key={index} 
                className="group relative bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-blue-500/30 transition-all duration-500 hover:scale-105"
              >
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative z-10 text-center">
                  {/* Company Badge */}
                  <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-4">
                    <span className="text-xs font-semibold text-white">{testimonial.company}</span>
                  </div>

                  {/* Avatar - Smaller */}
                  <div className="relative mb-6">
                    <img
                      className="w-16 h-16 rounded-full border-4 border-white/20 shadow-2xl mx-auto"
                      src={testimonial.image}
                      alt={`${testimonial.name} avatar`}
                    />
                  </div>

                  {/* Quote */}
                  <blockquote className="mb-6">
                    <p className="text-gray-200 text-base leading-relaxed font-light italic">
                      "{testimonial.quote}"
                    </p>
                  </blockquote>

                  {/* Client Info */}
                  <div className="border-t border-white/10 pt-4">
                    <p className="text-white font-bold text-lg mb-1">
                      {testimonial.name}
                    </p>
                    <p className="text-blue-300 font-semibold text-xs mb-2">
                      {testimonial.role}
                    </p>
                    
                    {/* Star Rating */}
                    <div className="flex items-center justify-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className="w-3 h-3 text-yellow-400 fill-current"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Dots - Always visible */}
          <div className="flex justify-center gap-3 mt-8">
            {testimonials.map((_, index) => (
              <button 
                key={index} 
                onClick={() => goToSlide(index)} 
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 w-6 shadow-lg shadow-blue-500/25' 
                    : 'bg-white/30 hover:bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Trust Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto mt-20 pt-16 border-t border-white/10">
          {metrics.map((metric, index) => (
            <div key={index} className="text-center group">
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-3 group-hover:scale-110 transition-transform duration-300">
                {metric.number}
              </div>
              <div className="text-gray-400 text-sm font-medium uppercase tracking-wider group-hover:text-gray-300 transition-colors">
                {metric.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;