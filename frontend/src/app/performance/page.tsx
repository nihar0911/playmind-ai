'use client';

import { useAnalysis } from '@/context/AnalysisContext';
import { motion } from 'framer-motion';
import { BarChart2, Zap, Target, Lightbulb } from 'lucide-react';

export default function PerformancePage() {
  const { results } = useAnalysis();

  if (!results) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
        <BarChart2 className="w-16 h-16 mb-4 opacity-50" />
        <h2 className="text-2xl font-bold mb-2 text-white">No Performance Data Available</h2>
        <p>Please return to the Overview page, upload a video, and run the AI Analysis first.</p>
      </div>
    );
  }

  const { scores } = results;

  const MetricBar = ({ label, score, color }: { label: string, score: number, color: string }) => (
    <div className="mb-6">
      <div className="flex justify-between items-end mb-2">
        <span className="text-gray-300 font-medium">{label}</span>
        <span className={`text-xl font-bold ${color.replace('bg-', 'text-')}`}>{score}%</span>
      </div>
      <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }} 
          animate={{ width: `${score}%` }} 
          transition={{ duration: 1, ease: 'easeOut' }} 
          className={`h-full ${color}`} 
        />
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto pb-24">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
        <h1 className="text-4xl font-bold mb-4 flex items-center gap-3">
          <BarChart2 className="text-neon-cyan" /> Performance Metrics
        </h1>
        <p className="text-gray-400">Detailed breakdown of player execution and decision making.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel p-8 rounded-3xl neon-border-cyan mb-8">
        <h2 className="text-2xl font-bold text-white mb-8 border-b border-white/10 pb-4">Overall Execution</h2>
        <MetricBar label="Decision Quality" score={scores.decision} color="bg-neon-purple" />
        <MetricBar label="Technical Performance" score={scores.performance} color="bg-blue-500" />
        <MetricBar label="Tactical Awareness" score={scores.tactical} color="bg-neon-cyan" />
        <MetricBar label="Future Potential" score={scores.prediction} color="bg-emerald-500" />
      </motion.div>
      
    </div>
  );
}
