'use client';

import { Sparkles, Play, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import SolarSystem from '@/components/SolarSystem';
// import router from 'next/navigation';

export default function HeroSection() {
  const router = useRouter();
  return (
    <div className="container mx-auto px-6 pt-12 pb-20">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-gray-300">Turn Days of Work into Minutes</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
              AI Chat with Anything
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-500 bg-clip-text text-transparent">
                On Your AI Visual Board
              </span>
            </h1>

            <p className="text-lg text-gray-300 leading-relaxed">
              Effortlessly <span className="text-white font-semibold">chat with your documents, TikToks, IG Reels, YouTube videos, LinkedIn, X, Audio, Looms, PDFs, websites</span>, and more—summarize, search, and interact with your content.
            </p>

            <p className="text-lg text-gray-300 leading-relaxed">
              <span className="text-white font-semibold">Save anything to your Second Brain</span>—then{' '}
              <span className="text-white font-semibold">AI chat with your auto-organized knowledge base</span>{' '}
              <span className="text-gray-400">using state-of-the-art models like Gemini 2.5 Pro.</span>
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <Button 
            onClick={() => router.push('/dashboard')}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-6 rounded-lg font-semibold text-lg transition-all flex items-center gap-2 group">
              Start Now
              <svg
                className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Button>

            {/* <Button
              variant="ghost"
              className="border-gray/20 hover:bg-gray/5 text-white px-8 py-6 rounded-lg font-semibold text-lg flex items-center gap-2 transition-all"
            >
              <Play className="w-5 h-5" />
              Watch Demo
            </Button> */}
          </div>

          {/* <div className="flex items-center gap-2 text-sm text-gray-400">
            <Users className="w-4 h-4" />
            <span>13,421 users built their Second Brain</span>
          </div> */}
        </div>

        <div className="relative h-[600px] lg:h-[700px]">
          <SolarSystem />
        </div>
      </div>
    </div>
  );
}
