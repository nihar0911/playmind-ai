'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, User, Zap } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'ai';
  text: string;
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'ai',
      text: "Hi there! I'm CoachMind, your personal AI sports coach. How can I help you level up your game today?"
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const newUserMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: inputValue.trim()
    };

    const newMessages = [...messages, newUserMsg];
    setMessages(newMessages);
    setInputValue('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch response');
      }

      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'ai',
          text: data.reply
        }
      ]);
    } catch (error: any) {
      console.error(error);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'ai',
          text: `System Error: ${error.message}. (Did you add your GEMINI_API_KEY to .env.local?)`
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-8 right-8 z-50 p-4 rounded-full bg-gradient-to-r from-neon-purple to-neon-cyan shadow-[0_0_20px_rgba(157,0,255,0.5)] flex items-center justify-center transition-all ${isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      >
        <MessageSquare className="w-8 h-8 text-white" />
        {/* Unread notification dot */}
        <div className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-[#050508]" />
      </motion.button>

      {/* Chat Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 100, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.95 }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] h-[600px] max-h-[80vh] flex flex-col bg-[#0a0a0f]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.8)] overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-purple to-neon-cyan flex items-center justify-center shadow-[0_0_15px_rgba(157,0,255,0.3)]">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg leading-tight flex items-center gap-2">
                    CoachMind <Zap className="w-3 h-3 text-neon-cyan" />
                  </h3>
                  <p className="text-xs text-neon-cyan font-mono tracking-wider">AI ONLINE</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-grow overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${msg.role === 'user' ? 'bg-white/10' : 'bg-neon-purple/20 border border-neon-purple/30'}`}>
                      {msg.role === 'user' ? <User className="w-4 h-4 text-gray-300" /> : <Bot className="w-4 h-4 text-neon-purple" />}
                    </div>
                    
                    {/* Bubble */}
                    <div className={`p-3 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-neon-cyan text-black rounded-tr-sm shadow-[0_5px_15px_rgba(0,243,255,0.15)]' 
                        : 'bg-white/5 border border-white/10 text-gray-200 rounded-tl-sm shadow-[0_5px_15px_rgba(0,0,0,0.5)]'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex gap-3 max-w-[85%] flex-row">
                    <div className="w-8 h-8 rounded-full bg-neon-purple/20 border border-neon-purple/30 flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot className="w-4 h-4 text-neon-purple" />
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 rounded-tl-sm flex items-center gap-1">
                      <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-2 h-2 rounded-full bg-neon-purple" />
                      <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-2 h-2 rounded-full bg-neon-cyan" />
                      <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-2 h-2 rounded-full bg-neon-purple" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-white/10 bg-black/50">
              <div className="flex items-center gap-2 relative">feat: Add Gemini AI Chatbot, real MP4 upload & Compare with Pro feature
                
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask CoachMind..."
                  className="w-full bg-white/5 border border-white/10 rounded-full py-3 pl-4 pr-12 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-neon-cyan transition-colors"
                />
                <button
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isTyping}
                  className="absolute right-2 p-2 bg-neon-cyan rounded-full text-black hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
Pressing key...Stopping...

Stop Agent
