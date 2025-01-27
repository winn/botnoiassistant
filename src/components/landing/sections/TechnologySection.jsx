import React from 'react';

export default function TechnologySection() {
  return (
    <section className="relative py-32 bg-[#0D1117] text-white overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-[#01BFFB]/5" />
        <div className="absolute inset-0 bg-[url('https://i.ibb.co/VxkPmRL/grid.png')] opacity-[0.05]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Powered by{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#01BFFB] to-purple-500">
              Advanced Technology
            </span>
          </h2>
          <p className="text-xl text-white/70 max-w-3xl mx-auto">
            Experience the future of AI with our cutting-edge neural processing and voice synthesis technology
          </p>
        </div>

        {/* Technology Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: 'Neural Processing',
              description: 'Advanced neural networks for human-like understanding and natural language processing',
              icon: (
                <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22H15C20 22 22 20 22 15Z" stroke="url(#paint0_linear)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7 8.8C9 8.8 9.8 8 9.8 6C9.8 4 9 3.2 7 3.2C5 3.2 4.2 4 4.2 6C4.2 8 5 8.8 7 8.8Z" stroke="url(#paint1_linear)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M17 8.8C19 8.8 19.8 8 19.8 6C19.8 4 19 3.2 17 3.2C15 3.2 14.2 4 14.2 6C14.2 8 15 8.8 17 8.8Z" stroke="url(#paint2_linear)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7 20.8C9 20.8 9.8 20 9.8 18C9.8 16 9 15.2 7 15.2C5 15.2 4.2 16 4.2 18C4.2 20 5 20.8 7 20.8Z" stroke="url(#paint3_linear)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M17 20.8C19 20.8 19.8 20 19.8 18C19.8 16 19 15.2 17 15.2C15 15.2 14.2 16 14.2 18C14.2 20 15 20.8 17 20.8Z" stroke="url(#paint4_linear)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <defs>
                    <linearGradient id="paint0_linear" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#01BFFB"/>
                      <stop offset="1" stopColor="#A855F7"/>
                    </linearGradient>
                    <linearGradient id="paint1_linear" x1="4.2" y1="3.2" x2="9.8" y2="8.8" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#01BFFB"/>
                      <stop offset="1" stopColor="#A855F7"/>
                    </linearGradient>
                    <linearGradient id="paint2_linear" x1="14.2" y1="3.2" x2="19.8" y2="8.8" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#01BFFB"/>
                      <stop offset="1" stopColor="#A855F7"/>
                    </linearGradient>
                    <linearGradient id="paint3_linear" x1="4.2" y1="15.2" x2="9.8" y2="20.8" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#01BFFB"/>
                      <stop offset="1" stopColor="#A855F7"/>
                    </linearGradient>
                    <linearGradient id="paint4_linear" x1="14.2" y1="15.2" x2="19.8" y2="20.8" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#01BFFB"/>
                      <stop offset="1" stopColor="#A855F7"/>
                    </linearGradient>
                  </defs>
                </svg>
              )
            },
            {
              title: 'Voice Synthesis',
              description: 'State-of-the-art voice technology for natural and emotionally intelligent interactions',
              icon: (
                <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 19C15.866 19 19 15.866 19 12C19 8.13401 15.866 5 12 5C8.13401 5 5 8.13401 5 12C5 15.866 8.13401 19 12 19Z" stroke="url(#paint0_linear)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="url(#paint1_linear)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 2V5" stroke="url(#paint2_linear)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 19V22" stroke="url(#paint3_linear)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12H5" stroke="url(#paint4_linear)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M19 12H22" stroke="url(#paint5_linear)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <defs>
                    <linearGradient id="paint0_linear" x1="5" y1="5" x2="19" y2="19" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#01BFFB"/>
                      <stop offset="1" stopColor="#A855F7"/>
                    </linearGradient>
                    <linearGradient id="paint1_linear" x1="9" y1="9" x2="15" y2="15" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#01BFFB"/>
                      <stop offset="1" stopColor="#A855F7"/>
                    </linearGradient>
                    <linearGradient id="paint2_linear" x1="12" y1="2" x2="12" y2="5" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#01BFFB"/>
                      <stop offset="1" stopColor="#A855F7"/>
                    </linearGradient>
                    <linearGradient id="paint3_linear" x1="12" y1="19" x2="12" y2="22" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#01BFFB"/>
                      <stop offset="1" stopColor="#A855F7"/>
                    </linearGradient>
                    <linearGradient id="paint4_linear" x1="2" y1="12" x2="5" y2="12" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#01BFFB"/>
                      <stop offset="1" stopColor="#A855F7"/>
                    </linearGradient>
                    <linearGradient id="paint5_linear" x1="19" y1="12" x2="22" y2="12" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#01BFFB"/>
                      <stop offset="1" stopColor="#A855F7"/>
                    </linearGradient>
                  </defs>
                </svg>
              )
            },
            {
              title: 'Machine Learning',
              description: 'Continuous learning and adaptation to improve responses over time',
              icon: (
                <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8.5 19H8C4 19 2 18 2 13V8C2 4 4 2 8 2H16C20 2 22 4 22 8V13C22 17 20 19 16 19H15.5C15.19 19 14.89 19.15 14.7 19.4L13.2 21.4C12.54 22.28 11.46 22.28 10.8 21.4L9.3 19.4C9.14 19.18 8.77 19 8.5 19Z" stroke="url(#paint0_linear)" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7 8H17" stroke="url(#paint1_linear)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7 13H13" stroke="url(#paint2_linear)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <defs>
                    <linearGradient id="paint0_linear" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#01BFFB"/>
                      <stop offset="1" stopColor="#A855F7"/>
                    </linearGradient>
                    <linearGradient id="paint1_linear" x1="7" y1="8" x2="17" y2="8" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#01BFFB"/>
                      <stop offset="1" stopColor="#A855F7"/>
                    </linearGradient>
                    <linearGradient id="paint2_linear" x1="7" y1="13" x2="13" y2="13" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#01BFFB"/>
                      <stop offset="1" stopColor="#A855F7"/>
                    </linearGradient>
                  </defs>
                </svg>
              )
            }
          ].map((tech, index) => (
            <div
              key={index}
              className="group relative p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg 
                       hover:bg-white/10 transition-all duration-500"
            >
              {/* Card Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#01BFFB]/20 to-purple-500/20 
                            opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg" />
              
              {/* Icon */}
              <div className="relative mb-6">{tech.icon}</div>
              
              {/* Content */}
              <h3 className="relative text-xl font-semibold mb-4 text-transparent bg-clip-text 
                           bg-gradient-to-r from-[#01BFFB] to-purple-500">
                {tech.title}
              </h3>
              <p className="relative text-white/70">{tech.description}</p>

              {/* Hover Lines */}
              <div className="absolute left-0 bottom-0 w-full h-[2px] bg-gradient-to-r 
                            from-transparent via-[#01BFFB] to-transparent opacity-0 
                            group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          ))}
        </div>

        {/* Features Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-12">
          {[
            {
              title: 'Core Features',
              items: [
                'Multi-language Support',
                'Real-time Voice Processing',
                'Custom Knowledge Base'
              ]
            },
            {
              title: 'Integration',
              items: [
                'RESTful API Access',
                'Webhook Support',
                'SDK Libraries'
              ]
            }
          ].map((section, index) => (
            <div key={index} className="space-y-6">
              <h3 className="text-xl font-semibold text-transparent bg-clip-text 
                           bg-gradient-to-r from-[#01BFFB] to-purple-500">
                {section.title}
              </h3>
              <ul className="space-y-4">
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-center space-x-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#01BFFB]" />
                    <span className="text-white/70">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}