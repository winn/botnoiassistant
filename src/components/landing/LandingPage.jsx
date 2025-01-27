import React from 'react';
import TopNav from './TopNav';
import HeroSection from './sections/HeroSection';
import AIImportanceSection from './sections/AIImportanceSection';
import TechnologySection from './sections/TechnologySection';
import IndustrySolutionsSection from './sections/IndustrySolutionsSection';
import CTASection from './sections/CTASection';
import FooterSection from './sections/FooterSection';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#ffffff]">
      <TopNav />
      <section id="home">
        <HeroSection />
      </section>
      <section id="benefits">
        <AIImportanceSection />
      </section>
      <section id="technology">
        <TechnologySection />
      </section>
      <section id="usecases">
        <IndustrySolutionsSection />
      </section>
      <section id="contact">
        <CTASection />
      </section>
      <FooterSection />
    </div>
  );
}