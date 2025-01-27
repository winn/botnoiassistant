import React from 'react';
import { useModal } from '../../contexts/ModalContext';

const BotnoiLogo = () => (
  <svg width="126" height="33" viewBox="0 0 126 33" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M40.0298 17.859C40.0298 17.1742 39.4746 16.6189 38.7898 16.6189C38.1051 16.6189 37.5498 17.1742 37.5498 17.859V21.8887C37.5498 22.5735 38.1051 23.1288 38.7898 23.1288C39.4746 23.1288 40.0298 22.5735 40.0298 21.8887V17.859Z" fill="#01BFFB"/>
    <path d="M3.45073 17.859C3.45073 17.1742 2.89546 16.6189 2.21072 16.6189C1.52597 16.6189 0.970703 17.1742 0.970703 17.859V21.8887C0.970703 22.5735 1.52535 23.1288 2.21072 23.1288C2.89546 23.1288 3.45073 22.5735 3.45073 21.8887V17.859Z" fill="#01BFFB"/>
    <path d="M18.019 2.98069C18.019 4.35028 19.1296 5.46089 20.4991 5.46089C21.8686 5.46089 22.9791 4.35028 22.9791 2.98069C22.9791 1.6111 21.8686 0.500488 20.4991 0.500488C19.1296 0.500488 18.019 1.6111 18.019 2.98069Z" fill="#01BFFB"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M6.86119 16.3094V22.1993C6.86119 25.7944 9.77572 28.7092 13.3706 28.7092H27.6296C31.2245 28.7092 34.139 25.7944 34.139 22.1993V16.3094C34.139 12.7142 31.2245 9.7995 27.6296 9.7995H13.3713C9.77634 9.7995 6.86181 12.7142 6.86181 16.3094H6.86119ZM13.3713 7.00928C8.23566 7.00928 4.07178 11.1728 4.07178 16.3094V22.1993C4.07178 27.3352 8.23504 31.4994 13.3713 31.4994H27.6302C32.7658 31.4994 36.9297 27.3358 36.9297 22.1993V16.3094C36.9297 11.1734 32.7664 7.00928 27.6302 7.00928H13.3713Z" fill="#01BFFB"/>
    <path d="M25.769 19.4106C25.769 20.7802 26.8796 21.8908 28.2491 21.8908C29.6186 21.8908 30.7291 20.7802 30.7291 19.4106C30.7291 18.041 29.6186 16.9304 28.2491 16.9304C26.8796 16.9304 25.769 18.041 25.769 19.4106Z" fill="#01BFFB"/>
    <path d="M10.269 19.4106C10.269 20.7802 11.3796 21.8908 12.7491 21.8908C14.1186 21.8908 15.2291 20.7802 15.2291 19.4106C15.2291 18.041 14.1186 16.9304 12.7491 16.9304C11.3796 16.9304 10.269 18.041 10.269 19.4106Z" fill="#01BFFB"/>
  </svg>
);

export default function TopNav() {
  const { openAuthModal } = useModal();

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="bg-[#ffffff] fixed w-full z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <a href="/" className="flex items-center">
              <BotnoiLogo />
            </a>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => scrollToSection('home')}
              className="text-[#262626] hover:text-[#01BFFB] transition-colors"
            >
              Home
            </button>
            <button 
              onClick={() => scrollToSection('benefits')}
              className="text-[#262626] hover:text-[#01BFFB] transition-colors"
            >
              Benefits
            </button>
            <button 
              onClick={() => scrollToSection('technology')}
              className="text-[#262626] hover:text-[#01BFFB] transition-colors"
            >
              Technology
            </button>
            <button 
              onClick={() => scrollToSection('usecases')}
              className="text-[#262626] hover:text-[#01BFFB] transition-colors"
            >
              Use Cases
            </button>
            <button 
              onClick={() => scrollToSection('contact')}
              className="text-[#262626] hover:text-[#01BFFB] transition-colors"
            >
              Contact
            </button>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            <button
              onClick={openAuthModal}
              className="hidden md:inline-flex text-[#262626] hover:text-[#01BFFB] transition-colors"
            >
              Log in
            </button>
            <button
              onClick={openAuthModal}
              className="bg-[#01BFFB] text-[#ffffff] px-4 py-2 rounded-lg hover:opacity-90 transition-all"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}