'use client';

import { useEffect, useRef, useState } from 'react';
import {
  FileText,
  Video,
  Music,
  Image,
  Globe,
  Mail,
  Youtube,
  Instagram,
  Share2,
  MessageCircle,
  BarChart3,
  Brain
} from 'lucide-react';

interface Planet {
  id: number;
  icon: React.ElementType;
  color: string;
  size: number;
  orbitRadius: number;
  speed: number;
  angle: number;
}

export default function SolarSystem() {
  const [time, setTime] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const planets: Planet[] = [
    { id: 1, icon: FileText, color: 'bg-yellow-500', size: 40, orbitRadius: 120, speed: 0.5, angle: 0 },
    { id: 2, icon: Video, color: 'bg-red-500', size: 45, orbitRadius: 120, speed: 0.5, angle: 60 },
    { id: 3, icon: Music, color: 'bg-blue-500', size: 38, orbitRadius: 180, speed: 0.35, angle: 120 },
    { id: 4, icon: Image, color: 'bg-pink-500', size: 42, orbitRadius: 180, speed: 0.35, angle: 180 },
    { id: 5, icon: Globe, color: 'bg-cyan-500', size: 40, orbitRadius: 240, speed: 0.25, angle: 240 },
    { id: 6, icon: Mail, color: 'bg-purple-500', size: 38, orbitRadius: 240, speed: 0.25, angle: 300 },
    { id: 7, icon: Youtube, color: 'bg-red-600', size: 44, orbitRadius: 120, speed: 0.5, angle: 180 },
    { id: 8, icon: Instagram, color: 'bg-pink-600', size: 42, orbitRadius: 240, speed: 0.25, angle: 60 },
    { id: 9, icon: Share2, color: 'bg-green-500', size: 36, orbitRadius: 180, speed: 0.35, angle: 300 },
    { id: 10, icon: MessageCircle, color: 'bg-blue-600', size: 40, orbitRadius: 240, speed: 0.25, angle: 140 },
    { id: 11, icon: BarChart3, color: 'bg-teal-500', size: 38, orbitRadius: 180, speed: 0.35, angle: 20 },
  ];

  useEffect(() => {
    let animationFrame: number;
    const animate = () => {
      setTime(prev => prev + 0.01);
      animationFrame = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  const calculatePosition = (planet: Planet) => {
    const angle = planet.angle + (time * planet.speed);
    const x = Math.cos(angle) * planet.orbitRadius;
    const y = Math.sin(angle) * planet.orbitRadius;
    return { x, y };
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center"
    >
      <div className="absolute inset-0 bg-gradient-radial from-purple-900/20 via-transparent to-transparent" />

      <svg
        className="absolute inset-0 w-full h-full"
        style={{ filter: 'blur(0.5px)' }}
      >
        <defs>
          <linearGradient id="orbitGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(168, 85, 247, 0.4)" />
            <stop offset="50%" stopColor="rgba(236, 72, 153, 0.3)" />
            <stop offset="100%" stopColor="rgba(168, 85, 247, 0.4)" />
          </linearGradient>
        </defs>

        {[120, 180, 240].map((radius) => (
          <circle
            key={radius}
            cx="50%"
            cy="50%"
            r={radius}
            fill="none"
            stroke="url(#orbitGradient)"
            strokeWidth="1.5"
            opacity="0.9"
            strokeDasharray="4 4"
          />
        ))}
      </svg>

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-32 h-32 rounded-3xl bg-gradient-to-br from-purple-600 via-pink-600 to-purple-700 shadow-2xl shadow-purple-500/50 flex items-center justify-center animate-pulse-slow">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-400 to-pink-400 opacity-50 blur-xl" />
          <Brain className="w-16 h-16 text-white relative z-10" />
        </div>
      </div>

      {planets.map((planet) => {
        const { x, y } = calculatePosition(planet);
        const Icon = planet.icon;

        return (
          <div
            key={planet.id}
            className="absolute transition-transform duration-100"
            style={{
              left: '50%',
              top: '50%',
              transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
            }}
          >
            <div
              className={`${planet.color} rounded-2xl shadow-lg flex items-center justify-center transition-all hover:scale-110 hover:shadow-2xl cursor-pointer backdrop-blur-sm border border-white/10`}
              style={{
                width: `${planet.size}px`,
                height: `${planet.size}px`,
              }}
            >
              <Icon className="w-5 h-5 text-white" />
            </div>
          </div>
        );
      })}

      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-purple-400/30 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
