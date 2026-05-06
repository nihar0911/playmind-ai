'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface AnalysisConfigProps {
  config: {
    sport: string;
    scenario: string;
    action: string;
  };
  setConfig: React.Dispatch<React.SetStateAction<{
    sport: string;
    scenario: string;
    action: string;
  }>>;
}

export default function AnalysisConfig({ config, setConfig }: AnalysisConfigProps) {
  
  const sports = [
    { id: 'soccer', label: 'Soccer / Football' },
    { id: 'basketball', label: 'Basketball' },
    { id: 'tennis', label: 'Tennis' },
    { id: 'american_football', label: 'American Football' },
    { id: 'cricket', label: 'Cricket' },
    { id: 'rugby', label: 'Rugby' },
    { id: 'volleyball', label: 'Volleyball' },
    { id: 'ice_hockey', label: 'Ice Hockey' },
    { id: 'baseball', label: 'Baseball' },
  ];

  const actionsBySport: Record<string, { id: string, label: string }[]> = {
    soccer: [
      { id: 'pass', label: 'Pass' },
      { id: 'shoot', label: 'Shoot' },
      { id: 'dribble', label: 'Dribble / Hold' },
      { id: 'tackle', label: 'Tackle' },
      { id: 'cross', label: 'Cross' },
      { id: 'header', label: 'Header' },
      { id: 'save', label: 'Save (Goalkeeper)' },
    ],
    basketball: [
      { id: 'pass', label: 'Pass' },
      { id: 'shoot', label: 'Shoot (Jump Shot/Layup)' },
      { id: 'dribble', label: 'Dribble / Drive' },
      { id: 'rebound', label: 'Rebound' },
      { id: 'block', label: 'Block' },
    ],
    tennis: [
      { id: 'serve', label: 'Serve' },
      { id: 'forehand', label: 'Forehand' },
      { id: 'backhand', label: 'Backhand' },
      { id: 'volley', label: 'Volley' },
      { id: 'smash', label: 'Smash' },
    ],
    cricket: [
      { id: 'bowl', label: 'Bowl (Pace/Spin)' },
      { id: 'bat_defend', label: 'Bat (Defend)' },
      { id: 'bat_attack', label: 'Bat (Attack/Drive)' },
      { id: 'catch', label: 'Catch / Field' },
      { id: 'throw', label: 'Throw (Run Out Attempt)' },
    ],
    baseball: [
      { id: 'pitch', label: 'Pitch' },
      { id: 'swing', label: 'Swing / Hit' },
      { id: 'catch', label: 'Catch' },
      { id: 'throw', label: 'Throw' },
    ],
    american_football: [
      { id: 'pass', label: 'Throw Pass' },
      { id: 'run', label: 'Run / Rush' },
      { id: 'catch', label: 'Catch / Receive' },
      { id: 'tackle', label: 'Tackle' },
      { id: 'kick', label: 'Kick / Punt' },
    ]
  };

  // Fallback for sports not explicitly defined above
  const defaultActions = [
    { id: 'offensive_action', label: 'Offensive Action' },
    { id: 'defensive_action', label: 'Defensive Action' },
    { id: 'neutral_action', label: 'Neutral / Passing' },
  ];

  const currentActions = config.sport && actionsBySport[config.sport] 
    ? actionsBySport[config.sport] 
    : defaultActions;

  const handleChange = (field: keyof typeof config, value: string) => {
    // If sport changes, reset the action so we don't have invalid state
    if (field === 'sport') {
      setConfig(prev => ({ ...prev, sport: value, action: '' }));
    } else {
      setConfig(prev => ({ ...prev, [field]: value }));
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="glass-panel rounded-2xl p-6 w-full h-full flex flex-col justify-center"
    >
      <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
        <div className="w-2 h-6 bg-neon-purple rounded-full" />
        Analysis Configuration
      </h3>

      <div className="flex flex-col gap-6">
        
        {/* CV Auto-detect Info */}
        <div className="p-4 rounded-xl bg-neon-cyan/10 border border-neon-cyan/30 flex items-start gap-3">
          <Sparkles className="text-neon-cyan w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-neon-cyan font-semibold mb-1">Computer Vision Active</p>
            <p className="text-sm text-gray-400">
              The AI will automatically track players and detect the <strong>Match Scenario</strong> (e.g. pressure density) from the video feed.
            </p>
          </div>
        </div>

        {/* Sport Dropdown */}
        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-400 font-medium ml-1">Sport</label>
          <div className="relative">
            <select 
              value={config.sport}
              onChange={(e) => handleChange('sport', e.target.value)}
              className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-white appearance-none focus:outline-none focus:neon-border-cyan transition-all cursor-pointer"
            >
              <option value="" disabled>Select Sport</option>
              {sports.map(opt => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>

        {/* Action Dropdown */}
        <div className="flex flex-col gap-2 opacity-100 transition-opacity">
          <label className="text-sm text-gray-400 font-medium ml-1">Observed Action</label>
          <div className="relative">
            <select 
              value={config.action}
              onChange={(e) => handleChange('action', e.target.value)}
              disabled={!config.sport}
              className={`w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-white appearance-none focus:outline-none focus:neon-border-cyan transition-all cursor-pointer ${!config.sport ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <option value="" disabled>{config.sport ? 'Select the action the player took' : 'Please select a sport first'}</option>
              {currentActions.map(opt => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
