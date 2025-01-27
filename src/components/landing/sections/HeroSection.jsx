import React from 'react';
import { useModal } from '../../../contexts/ModalContext';
import { motion } from 'framer-motion';

export default function HeroSection() {
  const { openAuthModal } = useModal();

  return (
    <header className="relative min-h-screen bg-[#0D1117] text-[#ffffff] pt-32 pb-20 overflow-hidden">
      {/* Animated Background Effects */}
      <div className="absolute inset-0">
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#01BFFB]/10 via-purple-500/5 to-[#0D1117]" />
        
        {/* Animated Glowing Orbs */}
        <motion.div
          initial={{ opacity: 0.2 }}
          animate={{ 
            opacity: [0.2, 0.4, 0.2],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#01BFFB]/20 rounded-full blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0.2 }}
          animate={{ 
            opacity: [0.2, 0.4, 0.2],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
        />
      </div>

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Text Content */}
          <div className="flex-1 text-center lg:text-left">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-5xl lg:text-7xl font-bold mb-8 leading-tight"
            >
              Build and Share Your
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#01BFFB] to-purple-500">
                AI Agents with Simplicity
              </span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="text-xl lg:text-2xl mb-6 text-[#ffffff]/70 max-w-2xl mx-auto lg:mx-0 leading-relaxed"
            >
              Create intelligent agents to support your customers, students, patients, team, and more—effortlessly.
            </motion.p>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
              className="text-lg lg:text-xl mb-12 text-[#ffffff]/70 max-w-2xl mx-auto lg:mx-0 leading-relaxed"
            >
              Design, share, and deploy AI agents that integrate seamlessly with top LLMs, voice capabilities, and your favorite channels. Whether for education, healthcare, business, or beyond, build agents that make a difference.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
              className="flex justify-center lg:justify-start"
            >
              <motion.button
                onClick={openAuthModal}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative px-8 py-4 bg-[#01BFFB] rounded-lg overflow-hidden"
              >
                {/* Button Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#01BFFB] to-purple-500 opacity-0 
                              group-hover:opacity-100 transition-opacity duration-500" />
                <span className="relative text-lg font-medium">
                  Get Started Now
                </span>
                {/* Animated Border */}
                <div className="absolute inset-0 border border-[#01BFFB] rounded-lg">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#01BFFB] to-transparent 
                                opacity-50 blur-sm group-hover:animate-border-glow" />
                </div>
              </motion.button>
            </motion.div>
          </div>

          {/* Hero Image */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
            className="flex-1 relative"
          >
            <div className="relative max-w-lg mx-auto">
              {/* Main Image with Enhanced Glow Effects */}
              <div className="relative rounded-lg overflow-hidden w-full">
                {/* Base Glow Layer */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#01BFFB]/30 to-purple-500/30 blur-2xl" />
                
                {/* Animated Glow Layers */}
                <motion.div 
                  className="absolute inset-0"
                  animate={{
                    boxShadow: [
                      '0 0 60px 30px rgba(1,191,251,0.3), 0 0 100px 60px rgba(168,85,247,0.3), 0 0 140px 90px rgba(1,191,251,0.2)',
                      '0 0 80px 40px rgba(1,191,251,0.4), 0 0 120px 80px rgba(168,85,247,0.4), 0 0 160px 100px rgba(1,191,251,0.3)',
                      '0 0 60px 30px rgba(1,191,251,0.3), 0 0 100px 60px rgba(168,85,247,0.3), 0 0 140px 90px rgba(1,191,251,0.2)'
                    ]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />

                {/* Image */}
                <img
                  src="/images/ai-agent.webp"
                  alt="Advanced AI Assistant"
                  className="relative z-10 w-full h-auto rounded-lg"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-[#01BFFB]/20 to-purple-500/20 mix-blend-overlay z-20" />

                {/* Animated Border with Enhanced Glow */}
                <motion.div 
                  className="absolute inset-0 rounded-lg z-30"
                  animate={{
                    boxShadow: [
                      'inset 0 0 0 2px rgba(1,191,251,0.3)',
                      'inset 0 0 0 3px rgba(1,191,251,0.6)',
                      'inset 0 0 0 2px rgba(1,191,251,0.3)'
                    ]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />

                {/* Corner Accent Glows */}
                {[
                  'top-0 left-0',
                  'top-0 right-0',
                  'bottom-0 left-0',
                  'bottom-0 right-0'
                ].map((position, index) => (
                  <motion.div
                    key={position}
                    className={`absolute w-16 h-16 ${position} z-40`}
                    animate={{
                      opacity: [0.4, 0.8, 0.4],
                      scale: [1, 1.2, 1]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: index * 0.75
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-[#01BFFB] to-purple-500 rounded-full blur-xl" />
                  </motion.div>
                ))}

                {/* Radial Pulse Effect */}
                <motion.div
                  className="absolute inset-0 z-30"
                  animate={{
                    background: [
                      'radial-gradient(circle at center, rgba(1,191,251,0.2) 0%, transparent 50%)',
                      'radial-gradient(circle at center, rgba(1,191,251,0.3) 0%, transparent 60%)',
                      'radial-gradient(circle at center, rgba(1,191,251,0.2) 0%, transparent 50%)'
                    ]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </header>
  );
}