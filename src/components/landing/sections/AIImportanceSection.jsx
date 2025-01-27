import React from 'react';

export default function AIImportanceSection() {
  return (
    <section className="relative py-32 bg-[#0D1117] overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#01BFFB]/5 to-purple-500/5" />
        <div className="absolute inset-0 opacity-[0.05]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Content */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-8">
            The Future of Business is{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#01BFFB] to-purple-500">
              AI Agents
            </span>
          </h2>
          <div className="space-y-6">
            <p className="text-xl text-white/70">
              AI agents are revolutionizing how businesses interact with customers, process information, and make decisions. 
              They represent a fundamental shift from passive tools to proactive digital assistants that can understand, learn, and adapt.
            </p>
            <p className="text-xl text-white/70">
              Our platform democratizes AI technology, making it accessible to everyone. Whether you're a developer, business owner, 
              or entrepreneur, you can create and deploy sophisticated AI agents with natural voice capabilities in minutes.
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {[
            { stat: '95%', label: 'Cost Reduction' },
            { stat: '24/7', label: 'Availability' },
            { stat: '10x', label: 'Faster Response' }
          ].map((item, index) => (
            <div 
              key={index}
              className="relative p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg 
                       hover:bg-white/10 transition-all duration-500"
            >
              <div className="text-center">
                <div className="text-3xl font-bold mb-2 text-transparent bg-clip-text 
                              bg-gradient-to-r from-[#01BFFB] to-purple-500">
                  {item.stat}
                </div>
                <div className="text-white/70">{item.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Key Benefits */}
        <div className="max-w-4xl mx-auto">
          <h3 className="text-2xl font-semibold text-white text-center mb-10">Key Benefits</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              'Multilingual voice interactions with emotional intelligence',
              'Advanced neural processing for human-like understanding',
              'Seamless integration with existing systems',
              'Customizable to match your brand and needs'
            ].map((benefit, index) => (
              <div 
                key={index} 
                className="flex items-start space-x-4 p-6 bg-white/5 backdrop-blur-sm 
                         border border-white/10 rounded-lg hover:bg-white/10 transition-all duration-500"
              >
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r from-[#01BFFB] to-purple-500 
                              flex items-center justify-center mt-1">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-white/70">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}