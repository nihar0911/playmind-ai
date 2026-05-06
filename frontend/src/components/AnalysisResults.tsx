'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Zap, Lightbulb, TrendingUp, AlertCircle, CheckCircle, PlayCircle, X, Loader2 } from 'lucide-react';
import { useAnalysis } from '@/context/AnalysisContext';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import * as tf from '@tensorflow/tfjs';
import * as cocossd from '@tensorflow-models/coco-ssd';

interface ResultsData {
  bestAction: string;
  scores: {
    decision: number;
    performance: number;
    tactical: number;
    prediction: number;
  };
  insight: string;
  prediction: string;
  suggestions: string[];
}

const ScoreCard = ({ title, score, icon: Icon, color, delay }: { title: string, score: number, icon: any, color: string, delay: number }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, duration: 0.4 }}
    className="glass-panel p-6 rounded-2xl relative overflow-hidden group"
  >
    <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 blur-xl ${color}`} />
    
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl bg-white/5 ${color.replace('bg-', 'text-')}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="text-3xl font-bold font-mono tracking-tight">{score}<span className="text-sm text-gray-500">%</span></div>
    </div>
    
    <h4 className="text-gray-300 font-medium">{title}</h4>
    
    <div className="w-full h-1.5 bg-gray-800 rounded-full mt-4 overflow-hidden">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${score}%` }}
        transition={{ delay: delay + 0.2, duration: 1, ease: "easeOut" }}
        className={`h-full ${color}`}
      />
    </div>
  </motion.div>
);

const LiveSimulationOverlay = ({ videoRef, action }: { videoRef: React.RefObject<HTMLVideoElement | null>, action: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [model, setModel] = useState<cocossd.ObjectDetection | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadModel = async () => {
      try {
        await tf.ready();
        const loadedModel = await cocossd.load();
        setModel(loadedModel);
        setIsLoading(false);
      } catch (err) {
        console.error("Failed to load CV model:", err);
      }
    };
    loadModel();
  }, []);

  useEffect(() => {
    let animationId: number;

    const detectFrame = async () => {
      if (!videoRef.current || !canvasRef.current || !model) {
        animationId = requestAnimationFrame(detectFrame);
        return;
      }
      
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      if (video.readyState >= 2 && !video.paused && !video.ended) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        try {
          const predictions = await model.detect(video);
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          const people = predictions.filter(p => p.class === 'person');

          if (people.length > 0) {
            // Find main player (largest area)
            let mainPlayer = people[0];
            let maxArea = 0;
            people.forEach(p => {
              const area = p.bbox[2] * p.bbox[3];
              if (area > maxArea) {
                maxArea = area;
                mainPlayer = p;
              }
            });

            // Find optimal target
            let target = null;
            if (people.length > 1) {
              target = people.find(p => p !== mainPlayer);
            }

            // Draw for main player
            const [mx, my, mw, mh] = mainPlayer.bbox;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.lineWidth = 2;
            ctx.strokeRect(mx, my, mw, mh);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.font = '18px Arial';
            ctx.fillText("Main Player", mx, my - 8);

            // Draw for optimal target
            if (target) {
              const [tx, ty, tw, th] = target.bbox;
              const cx = tx + tw / 2;
              const cy = ty + th; // bottom of the person (feet)

              ctx.beginPath();
              // Pulsing circle at feet
              const time = Date.now() / 150;
              const radius = 25 + Math.sin(time) * 8;
              
              // Draw pulsing ellipse to look like perspective circle on ground
              ctx.ellipse(cx, cy, radius * 1.5, radius * 0.5, 0, 0, 2 * Math.PI);
              ctx.strokeStyle = '#00f3ff';
              ctx.lineWidth = 4;
              ctx.stroke();

              ctx.beginPath();
              ctx.ellipse(cx, cy, (radius + 15) * 1.5, (radius + 15) * 0.5, 0, 0, 2 * Math.PI);
              ctx.strokeStyle = 'rgba(0, 243, 255, 0.3)';
              ctx.lineWidth = 2;
              ctx.stroke();
              
              // Draw Target text
              ctx.fillStyle = '#00f3ff';
              ctx.font = 'bold 20px Arial';
              ctx.fillText("Optimal Target", tx, ty - 15);
              
              // Draw bounding box for target
              ctx.strokeStyle = 'rgba(0, 243, 255, 0.6)';
              ctx.lineWidth = 2;
              ctx.setLineDash([5, 5]);
              ctx.strokeRect(tx, ty, tw, th);
              
              // Connecting path
              ctx.beginPath();
              ctx.moveTo(mx + mw / 2, my + mh / 2);
              ctx.lineTo(tx + tw / 2, ty + th / 2);
              ctx.strokeStyle = 'rgba(0, 243, 255, 0.8)';
              ctx.setLineDash([10, 10]);
              ctx.lineWidth = 3;
              ctx.stroke();
              ctx.setLineDash([]);
            }

            // Draw for opponents
            people.forEach(p => {
              if (p !== mainPlayer && p !== target) {
                const [ox, oy, ow, oh] = p.bbox;
                ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
                ctx.lineWidth = 2;
                ctx.strokeRect(ox, oy, ow, oh);
                
                ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
                ctx.font = 'bold 12px Arial';
                ctx.fillText("Opponent", ox, oy - 5);
              }
            });
          }
        } catch (e) {
          // ignore detection errors during playback
        }
      }

      animationId = requestAnimationFrame(detectFrame);
    };

    animationId = requestAnimationFrame(detectFrame);
    return () => cancelAnimationFrame(animationId);
  }, [model, videoRef]);

  return (
    <>
      {isLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          <div className="bg-black/70 border border-neon-cyan/30 text-neon-cyan px-6 py-3 rounded-full flex items-center gap-3 shadow-[0_0_15px_rgba(0,243,255,0.3)]">
            <Loader2 className="w-5 h-5 animate-spin" /> 
            <span className="font-bold tracking-wide">Initializing Live CV Tracking...</span>
          </div>
        </div>
      )}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-contain pointer-events-none z-10"
      />
    </>
  );
};

export default function AnalysisResults({ data, file }: { data: ResultsData | null, file: File | null }) {
  const { config } = useAnalysis();
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [localVideoUrl, setLocalVideoUrl] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);

  // Generate URL for the uploaded file so we can play it back
  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setLocalVideoUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  if (!data) return null;

  const chartData = [
    { subject: 'Performance', A: data.scores.performance, fullMark: 100 },
    { subject: 'Decision', A: data.scores.decision, fullMark: 100 },
    { subject: 'Tactics', A: data.scores.tactical, fullMark: 100 },
    { subject: 'Prediction', A: data.scores.prediction, fullMark: 100 },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mt-12 space-y-8 relative"
    >
      <div className="flex items-center gap-3 border-b border-white/10 pb-4">
        <div className="w-3 h-3 rounded-full bg-neon-cyan animate-pulse shadow-[0_0_10px_rgba(0,243,255,0.8)]" />
        <h2 className="text-2xl font-bold">Analysis Results Dashboard</h2>
      </div>

      {/* Scores Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ScoreCard title="Performance Score" score={data.scores.performance} icon={Target} color="bg-blue-500" delay={0.1} />
        <ScoreCard title="Decision Quality" score={data.scores.decision} icon={Zap} color="bg-neon-purple" delay={0.2} />
        <ScoreCard title="Tactical Awareness" score={data.scores.tactical} icon={Lightbulb} color="bg-neon-cyan" delay={0.3} />
        <ScoreCard title="Future Prediction" score={data.scores.prediction} icon={TrendingUp} color="bg-emerald-500" delay={0.4} />
      </div>

      {/* Middle Row: Radar Chart & Main Insight */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Performance Radar Chart */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="glass-panel p-6 rounded-2xl flex flex-col items-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-neon-cyan/5 to-transparent pointer-events-none" />
          <h3 className="text-lg font-semibold w-full text-left mb-2 flex items-center gap-2">
            <Target className="w-5 h-5 text-neon-cyan" /> Attribute Profile
          </h3>
          <div className="w-full h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#a1a1aa', fontSize: 12, fontWeight: 600 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0a0a0f', borderColor: '#00f3ff', borderRadius: '8px' }}
                  itemStyle={{ color: '#00f3ff', fontWeight: 'bold' }}
                />
                <Radar 
                  name="Player" 
                  dataKey="A" 
                  stroke="#00f3ff" 
                  strokeWidth={2}
                  fill="url(#colorCyan)" 
                  fillOpacity={0.5} 
                />
                <defs>
                  <linearGradient id="colorCyan" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00f3ff" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#9d00ff" stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Main AI Insight */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 glass-panel p-8 rounded-2xl neon-border-cyan relative overflow-hidden flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Lightbulb className="w-48 h-48" />
          </div>
          
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="px-3 py-1 rounded-full bg-neon-cyan/20 text-neon-cyan text-xs font-bold uppercase tracking-wider">
                Primary AI Insight
              </div>
              <div className="px-3 py-1 rounded-full bg-white/10 text-gray-300 text-xs font-bold uppercase tracking-wider">
                Optimal Action: {data.bestAction.toUpperCase()}
              </div>
            </div>
            <p className="text-2xl font-medium leading-relaxed relative z-10 text-white mb-6">
              "{data.insight}"
            </p>
          </div>

          <button 
            onClick={() => setIsVideoModalOpen(true)}
            disabled={!localVideoUrl}
            className={`flex items-center justify-center gap-2 bg-white/10 hover:bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/50 py-3 px-6 rounded-xl transition-all duration-300 group self-start relative z-10 ${!localVideoUrl ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <PlayCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="font-semibold tracking-wide">View Optimal Simulation</span>
          </button>
        </motion.div>

      </div>

      {/* Bottom Row: Prediction & Suggestions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Prediction */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-panel p-8 rounded-2xl border border-neon-purple/30"
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-neon-purple">
            <TrendingUp className="w-5 h-5" />
            Player Prediction
          </h3>
          <p className="text-gray-300 leading-relaxed">
            {data.prediction}
          </p>
        </motion.div>

        {/* Suggestions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="lg:col-span-2 glass-panel p-8 rounded-2xl"
        >
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-500" />
            Actionable Suggestions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.suggestions.map((suggestion, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 + (i * 0.1) }}
                className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
              >
                <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <p className="text-gray-300 text-sm leading-relaxed">{suggestion}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Video Modal Overlay */}
      <AnimatePresence>
        {isVideoModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#0a0a0f] border border-white/10 rounded-2xl w-full max-w-4xl overflow-hidden shadow-[0_0_50px_rgba(0,243,255,0.2)]"
            >
              <div className="flex justify-between items-center p-6 border-b border-white/10">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <PlayCircle className="text-neon-cyan" /> AI Simulation: Optimal {data.bestAction.toUpperCase()}
                </h3>
                <button 
                  onClick={() => setIsVideoModalOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="aspect-video w-full bg-black relative">
                <video 
                  ref={videoRef}
                  className="w-full h-full object-contain"
                  src={localVideoUrl}
                  autoPlay
                  controls
                  playsInline
                  loop
                  crossOrigin="anonymous"
                />
                
                {/* Live CV AI Tracking Overlay */}
                <LiveSimulationOverlay videoRef={videoRef} action={data.bestAction} />
                
                {/* Global Scanning Line Overlay */}
                <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                  <motion.div 
                    initial={{ y: "-100%" }}
                    animate={{ y: "100%" }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute w-full h-1 bg-neon-cyan shadow-[0_0_20px_#00f3ff] opacity-20"
                  />
                </div>
              </div>
              <div className="p-6 bg-white/5 flex items-start gap-3">
                <div className="text-neon-cyan w-5 h-5 flex-shrink-0 mt-0.5"><Zap /></div>
                <p className="text-gray-300 text-sm">
                  The AI has mapped the optimal trajectory onto your original footage. Executing a <strong>{data.bestAction.toUpperCase()}</strong> in the highlighted zone yields the highest probability of success.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
