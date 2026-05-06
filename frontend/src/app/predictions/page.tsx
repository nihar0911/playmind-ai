'use client';

import { useAnalysis } from '@/context/AnalysisContext';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, Compass } from 'lucide-react';

export default function PredictionsPage() {
  const { results } = useAnalysis();

  if (!results) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
        <Brain className="w-16 h-16 mb-4 opacity-50" />
        <h2 className="text-2xl font-bold mb-2 text-white">No Prediction Data Available</h2>
        <p>Please return to the Overview page, upload a video, and run the AI Analysis first.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-24">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
        <h1 className="text-4xl font-bold mb-4 flex items-center gap-3">
          <Brain className="text-neon-purple" /> AI Predictions
        </h1>
        <p className="text-gray-400">Long-term player development forecasting based on current decisions.</p>
      </motion.div>

      <div className="grid grid-cols-1 gap-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-panel p-8 rounded-3xl border border-neon-purple/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <TrendingUp className="w-32 h-32 text-neon-purple" />
          </div>
          <h2 className="text-2xl font-bold text-neon-purple mb-6 flex items-center gap-2">
            <TrendingUp /> Trajectory Forecast
          </h2>
          <p className="text-xl text-white leading-relaxed relative z-10">
            "{results.prediction}"
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-panel p-8 rounded-3xl border border-white/10">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Compass className="text-emerald-500" /> Development Focus
          </h2>
          <ul className="space-y-4">
            {results.suggestions.map((suggestion, i) => (
              <li key={i} className="flex items-start gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold">
                  {i + 1}
                </span>
                <span className="text-gray-300 mt-1">{suggestion}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
