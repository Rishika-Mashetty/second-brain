'use client';

import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <Header />
      <HeroSection />
    </div>
  );
}
