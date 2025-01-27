import React from 'react';

export default function IndustrySolutionsSection() {
  return (
    <section className="relative py-32 bg-[#0D1117] overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#01BFFB]/5 to-purple-500/5" />
        <div className="absolute inset-0 bg-[url('https://i.ibb.co/VxkPmRL/grid.png')] opacity-[0.05]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Industry{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#01BFFB] to-purple-500">
              Solutions
            </span>
          </h2>
          <p className="text-xl text-white/70 max-w-3xl mx-auto">
            Transforming businesses across sectors with intelligent AI solutions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: 'Healthcare',
              description: 'AI agents for patient support and medical assistance',
              image: 'https://images.pexels.com/photos/7088530/pexels-photo-7088530.jpeg'
            },
            {
              title: 'Customer Service',
              description: '24/7 support with multilingual capabilities',
              image: 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg'
            },
            {
              title: 'Education',
              description: 'Interactive learning assistants and student support',
              image: 'https://images.pexels.com/photos/4778611/pexels-photo-4778611.jpeg'
            },
            {
              title: 'Manufacturing',
              description: 'Process automation and quality control',
              image: 'https://images.pexels.com/photos/1624895/pexels-photo-1624895.jpeg'
            },
            {
              title: 'Finance',
              description: 'Financial advisory and transaction support',
              image: 'https://images.pexels.com/photos/7567443/pexels-photo-7567443.jpeg'
            },
            {
              title: 'Retail',
              description: 'Shopping assistance and inventory management',
              image: 'https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg'
            }
          ].map((industry, index) => (
            <div
              key={index}
              className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg 
                       overflow-hidden transition-all duration-500"
            >
              {/* Image Container with Fixed Aspect Ratio */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={industry.image}
                  alt={industry.title}
                  className="w-full h-full object-cover transition-transform duration-500 
                           group-hover:scale-110"
                  loading="lazy"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D1117] to-transparent opacity-60" />
                
                {/* Glowing Border */}
                <div className="absolute inset-0 border border-[#01BFFB]/30 opacity-0 
                              group-hover:opacity-100 transition-opacity duration-500" />
              </div>

              {/* Content */}
              <div className="relative p-6">
                <h3 className="text-xl font-semibold mb-2 text-transparent bg-clip-text 
                             bg-gradient-to-r from-[#01BFFB] to-purple-500">
                  {industry.title}
                </h3>
                <p className="text-white/70">{industry.description}</p>

                {/* Hover Effect */}
                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r 
                              from-transparent via-[#01BFFB] to-transparent opacity-0 
                              group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}