'use client';

import { useAnalysis } from '@/context/AnalysisContext';
import { motion } from 'framer-motion';
import { Bot, Target, AlertCircle } from 'lucide-react';

export default function AnalysisPage() {
  const { results, config } = useAnalysis();

  if (!results) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
        <Bot className="w-16 h-16 mb-4 opacity-50" />
        <h2 className="text-2xl font-bold mb-2 text-white">No Analysis Data Available</h2>
        <p>Please return to the Overview page, upload a video, and run the AI Analysis first.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-24">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
        <h1 className="text-4xl font-bold mb-4 flex items-center gap-3">
          <Target className="text-neon-cyan" /> Match Analysis
        </h1>
        <p className="text-gray-400">Deep dive into tactical intelligence and positional data.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="glass-panel p-8 rounded-2xl">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-white">
            <span className="w-2 h-6 bg-neon-cyan rounded-full" /> Configuration Data
          </h2>
          <ul className="space-y-4">
            <li className="flex justify-between items-center pb-2 border-b border-white/10">
              <span className="text-gray-400">Sport</span>
              <span className="font-bold text-white uppercase">{config.sport}</span>
            </li>
            <li className="flex justify-between items-center pb-2 border-b border-white/10">
              <span className="text-gray-400">Scenario</span>
              <span className="font-bold text-white uppercase">{config.scenario.replace('_', ' ')}</span>
            </li>
            <li className="flex justify-between items-center pb-2 border-b border-white/10">
              <span className="text-gray-400">Action Taken</span>
              <span className="font-bold text-white uppercase">{config.action}</span>
            </li>
            <li className="flex justify-between items-center pb-2 border-b border-white/10">
              <span className="text-gray-400">Optimal Action (AI)</span>
              <span className="font-bold text-neon-cyan uppercase">{results.bestAction}</span>
            </li>
          </ul>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="glass-panel p-8 rounded-2xl neon-border-cyan">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-white">
            <span className="w-2 h-6 bg-neon-purple rounded-full" /> Tactical Insight
          </h2>
          <p className="text-lg leading-relaxed text-gray-300">
            {results.insight}
          </p>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-panel p-8 rounded-2xl">
         <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-white">
            <AlertCircle className="text-yellow-500" /> Actionable Suggestions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.suggestions.map((suggestion, i) => (
              <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/10 text-gray-300">
                {suggestion}
              </div>
            ))}
          </div>
      </motion.div>
    </div>
  );
}
