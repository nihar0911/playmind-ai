'use client';

import { useState } from 'react';
import { UploadCloud, FileVideo, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function VideoUpload({ onUpload }: { onUpload: (file: File) => void }) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile.type.startsWith('video/')) {
      setFile(selectedFile);
      onUpload(selectedFile);
    } else {
      alert('Please upload a valid video file (.mp4, .webm, etc)');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative w-full rounded-2xl p-8 border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center min-h-[250px]
        ${isDragging ? 'border-neon-cyan bg-neon-cyan/5' : 'border-white/20 glass-panel hover:border-white/40'}
        ${file ? 'border-green-500/50 bg-green-500/5' : ''}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <AnimatePresence mode="wait">
        {!file ? (
          <motion.div 
            key="upload"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center text-center"
          >
            <div className={`p-4 rounded-full mb-4 ${isDragging ? 'bg-neon-cyan/20' : 'bg-white/5'}`}>
              <UploadCloud className={`w-10 h-10 ${isDragging ? 'text-neon-cyan' : 'text-gray-400'}`} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Upload Match Footage</h3>
            <p className="text-gray-400 mb-6 text-sm">Drag & drop or click to upload .mp4 file</p>
            <label className="cursor-pointer bg-white/10 hover:bg-white/20 text-white px-6 py-2.5 rounded-lg transition-colors text-sm font-medium">
              Select Video
              <input type="file" accept="video/*" className="hidden" onChange={handleFileInput} />
            </label>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center text-center w-full"
          >
            <div className="p-4 rounded-full bg-green-500/20 mb-4 relative">
              <FileVideo className="w-10 h-10 text-green-400" />
              <CheckCircle2 className="w-5 h-5 text-green-500 absolute bottom-2 right-2 bg-[#050508] rounded-full" />
            </div>
            <h3 className="text-lg font-semibold mb-1 text-green-400">Video Uploaded Successfully</h3>
            <p className="text-gray-400 text-sm mb-4 truncate max-w-[250px]">{file.name}</p>
            <button 
              onClick={() => {
                setFile(null);
                onUpload(null as any);
              }}
              className="text-xs text-red-400 hover:text-red-300 underline underline-offset-2"
            >
              Remove and upload another
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
