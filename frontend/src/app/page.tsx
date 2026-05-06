'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Loader2, Sparkles } from 'lucide-react';
import VideoUpload from '@/components/VideoUpload';
import VideoAnalyzer from '@/components/VideoAnalyzer';
import AnalysisConfig from '@/components/AnalysisConfig';
import AnalysisResults from '@/components/AnalysisResults';
import { useAnalysis } from '@/context/AnalysisContext';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  
  const { config, setConfig, results, setResults } = useAnalysis();
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCVRunning, setIsCVRunning] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  const loadingMessages = [
    "Analyzing player decisions...",
    "Evaluating tactical intelligence...",
    "Calculating performance metrics...",
    "Generating AI insights...",
    "Finalizing report..."
  ];

  const handleStartAnalysis = () => {
    if (!file || !config.sport || !config.action) {
      alert("Please upload a video and configure the Sport and Action.");
      return;
    }
    setResults(null);
    setIsCVRunning(true);
    setLoadingMessage("Running Computer Vision Analysis (TensorFlow.js)...");
  };

  const handleCVComplete = async (detectedScenario: string, detectedSport: string) => {
    setIsCVRunning(false);
    setIsAnalyzing(true);
    
    // Update config with auto-detected scenario only
    setConfig(prev => ({
      ...prev,
      scenario: detectedScenario
    }));

    // Cycle loading messages
    let msgIndex = 0;
    setLoadingMessage(loadingMessages[0]);
    const interval = setInterval(() => {
      msgIndex = (msgIndex + 1) % loadingMessages.length;
      setLoadingMessage(loadingMessages[msgIndex]);
    }, 800);

    try {
      const response = await fetch('http://localhost:5000/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sport: config.sport,
          scenario: detectedScenario,
          action: config.action
        })
      });
      
      const data = await response.json();
      
      clearInterval(interval);
      setResults(data);
    } catch (error) {
      console.error("Analysis failed:", error);
      alert("Failed to connect to the AI engine. Ensure backend is running.");
      clearInterval(interval);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-24">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 text-center mt-8"
      >
        <div className="inline-flex items-center justify-center p-3 rounded-full bg-neon-cyan/10 mb-6 neon-border-cyan">
          <Bot className="w-8 h-8 text-neon-cyan" />
        </div>
        <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tight">
          AI Match <span className="gradient-text">Intelligence</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
          Analyze player decisions, performance, and future potential using our advanced AI-powered sports analytics engine.
        </p>
      </motion.div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {!file ? (
          <VideoUpload onUpload={(f) => setFile(f)} />
        ) : (
          <VideoAnalyzer 
            file={file} 
            isAnalyzing={isCVRunning} 
            onAnalysisComplete={handleCVComplete}
            onClearFile={() => setFile(null)}
          />
        )}
        <AnalysisConfig config={config} setConfig={setConfig} />
      </div>

      {/* Action Button */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="flex justify-center"
      >
        <button
          onClick={handleStartAnalysis}
          disabled={isAnalyzing || isCVRunning || !file || !config.sport || !config.action}
          className={`
            relative overflow-hidden group px-12 py-5 rounded-full font-bold text-lg transition-all duration-300
            ${isAnalyzing || isCVRunning || !file || !config.sport || !config.action 
              ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
              : 'bg-gradient-to-r from-neon-cyan to-neon-purple text-white shadow-[0_0_30px_rgba(0,243,255,0.3)] hover:shadow-[0_0_50px_rgba(157,0,255,0.5)] hover:scale-105'
            }
          `}
        >
          <div className="flex items-center gap-3 relative z-10">
            {isAnalyzing || isCVRunning ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>Running AI Engine...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6" />
                <span>Run AI Analysis</span>
              </>
            )}
          </div>
          {!(isAnalyzing || isCVRunning) && file && config.sport && config.action && (
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
          )}
        </button>
      </motion.div>

      {/* Loading State Overlay */}
      <AnimatePresence>
        {(isAnalyzing || isCVRunning) && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-12 flex flex-col items-center justify-center p-12 glass-panel rounded-3xl neon-border-cyan"
          >
            {isCVRunning ? (
              <div className="relative w-24 h-24 mb-8">
                <div className="absolute inset-0 border-4 border-t-neon-cyan border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
                <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-neon-cyan animate-pulse" />
              </div>
            ) : (
              <div className="relative w-24 h-24 mb-8">
                <div className="absolute inset-0 border-4 border-t-neon-cyan border-r-neon-purple border-b-transparent border-l-transparent rounded-full animate-spin" />
                <div className="absolute inset-2 border-4 border-t-transparent border-r-transparent border-b-neon-cyan border-l-neon-purple rounded-full animate-[spin_2s_linear_infinite_reverse]" />
                <Bot className="absolute inset-0 m-auto w-8 h-8 text-white animate-pulse" />
              </div>
            )}
            <motion.h3 
              key={loadingMessage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-2xl font-bold gradient-text text-center"
            >
              {loadingMessage}
            </motion.h3>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Section */}
      <AnalysisResults data={results} file={file} />

    </div>
  );
}
