'use client';

import { Activity, BarChart2, Brain, Compass, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Overview', icon: Compass, path: '/' },
    { name: 'Match Analysis', icon: Activity, path: '/analysis' },
    { name: 'Performance', icon: BarChart2, path: '/performance' },
    { name: 'Predictions', icon: Brain, path: '/predictions' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <div className="w-64 h-screen fixed left-0 top-0 glass-panel border-r border-white/5 flex flex-col z-50">
      <div className="p-6 flex items-center gap-3 border-b border-white/5">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center shadow-[0_0_15px_rgba(0,243,255,0.5)]">
          <Brain className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-xl font-bold tracking-wider gradient-text">PlayMind AI</h1>
      </div>

      <nav className="flex-1 py-6 flex flex-col gap-2 px-4">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.name}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative group ${
                isActive ? 'text-white bg-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-neon-cyan rounded-r-md shadow-[0_0_10px_rgba(0,243,255,0.8)]" />
              )}
              <item.icon className={`w-5 h-5 ${isActive ? 'text-neon-cyan' : 'group-hover:text-neon-cyan transition-colors'}`} />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-white/5">
        <div className="flex items-center gap-3 text-sm text-gray-400">
          <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)] animate-pulse" />
          <span>Engine Online</span>
        </div>
      </div>
    </div>
  );
}
