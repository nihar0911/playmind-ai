'use client';

import { useEffect, useRef, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as cocossd from '@tensorflow-models/coco-ssd';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface VideoAnalyzerProps {
  file: File;
  isAnalyzing: boolean;
  onAnalysisComplete: (detectedScenario: string, detectedSport: string) => void;
  onClearFile: () => void;
}

export default function VideoAnalyzer({ file, isAnalyzing, onAnalysisComplete, onClearFile }: VideoAnalyzerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [model, setModel] = useState<cocossd.ObjectDetection | null>(null);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [videoUrl, setVideoUrl] = useState('');

  // Detection statistics for the analysis period
  const detectionsRef = useRef({ personCount: 0, sportsBallCount: 0, framesAnalyzed: 0 });

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    // Load the model
    const loadModel = async () => {
      try {
        await tf.ready();
        const loadedModel = await cocossd.load();
        setModel(loadedModel);
        setIsModelLoading(false);
      } catch (err) {
        console.error("Failed to load coco-ssd model:", err);
      }
    };
    loadModel();
  }, []);

  useEffect(() => {
    let animationId: number;

    const detectFrame = async () => {
      if (!videoRef.current || !canvasRef.current || !model || !isAnalyzing) return;
      
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      if (video.readyState === 4) {
        // Sync canvas size to video size
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Run object detection
        const predictions = await model.detect(video);
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        let currentPersonCount = 0;
        let currentSportsBallCount = 0;

        predictions.forEach(prediction => {
          if (prediction.class === 'person' || prediction.class === 'sports ball') {
            const [x, y, width, height] = prediction.bbox;
            
            if (prediction.class === 'person') currentPersonCount++;
            if (prediction.class === 'sports ball') currentSportsBallCount++;

            // Draw Neon Bounding Box
            ctx.strokeStyle = prediction.class === 'person' ? '#00f3ff' : '#9d00ff';
            ctx.lineWidth = 4;
            ctx.strokeRect(x, y, width, height);

            // Draw Background for Label
            ctx.fillStyle = prediction.class === 'person' ? 'rgba(0, 243, 255, 0.7)' : 'rgba(157, 0, 255, 0.7)';
            const textWidth = ctx.measureText(prediction.class).width;
            ctx.fillRect(x, y - 24, textWidth + 10, 24);

            // Draw Label
            ctx.fillStyle = '#ffffff';
            ctx.font = '16px sans-serif';
            ctx.fillText(`${prediction.class} (${Math.round(prediction.score * 100)}%)`, x + 5, y - 6);
          }
        });

        // Accumulate statistics
        detectionsRef.current.personCount += currentPersonCount;
        detectionsRef.current.sportsBallCount += currentSportsBallCount;
        detectionsRef.current.framesAnalyzed++;
      }

      animationId = requestAnimationFrame(detectFrame);
    };

    if (isAnalyzing && model) {
      detectionsRef.current = { personCount: 0, sportsBallCount: 0, framesAnalyzed: 0 };
      if (videoRef.current) {
        videoRef.current.play();
      }
      detectFrame();

      // Finish analysis after 4 seconds to provide the real-time "demo" effect
      setTimeout(() => {
        if (videoRef.current) videoRef.current.pause();
        cancelAnimationFrame(animationId);
        
        const avgPersons = detectionsRef.current.personCount / (detectionsRef.current.framesAnalyzed || 1);
        const hasBall = detectionsRef.current.sportsBallCount > 0;
        
        // AI Logic: Determine Scenario
        let detectedScenario = 'teammate_open';
        if (avgPersons > 2) {
          detectedScenario = 'high_pressure';
        } else if (avgPersons < 1) {
          detectedScenario = 'clear_path';
        }

        // AI Logic: Determine Sport
        let detectedSport = 'soccer'; // Default
        if (hasBall) {
          // If a generic sports ball is detected, we could infer it's soccer or basketball.
          // For the sake of the demo, we assume soccer unless specified otherwise.
          detectedSport = 'soccer';
        }

        onAnalysisComplete(detectedScenario, detectedSport);

      }, 4000);
    }

    return () => {
      cancelAnimationFrame(animationId);
      if (videoRef.current) videoRef.current.pause();
    };
  }, [isAnalyzing, model, onAnalysisComplete]);


  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative w-full rounded-2xl overflow-hidden glass-panel border border-white/20 aspect-video bg-black flex flex-col"
    >
      {isModelLoading && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
          <Loader2 className="w-10 h-10 text-neon-cyan animate-spin mb-4" />
          <p className="text-neon-cyan font-medium animate-pulse">Loading CV Model (TensorFlow.js)...</p>
        </div>
      )}
      
      {!isAnalyzing && !isModelLoading && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
          <p className="text-white font-medium mb-4">Video Ready for CV Analysis</p>
          <button 
            onClick={onClearFile}
            className="text-xs text-red-400 hover:text-red-300 underline underline-offset-2"
          >
            Change Video
          </button>
        </div>
      )}

      {/* Video element */}
      <video
        ref={videoRef}
        src={videoUrl || undefined}
        className="absolute inset-0 w-full h-full object-contain"
        muted
        playsInline
        loop
      />
      
      {/* Canvas for rendering TF.js bounding boxes */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-contain pointer-events-none z-10"
      />
    </motion.div>
  );
}
