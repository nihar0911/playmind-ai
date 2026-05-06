'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

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

interface AnalysisContextType {
  results: ResultsData | null;
  setResults: (data: ResultsData | null) => void;
  config: { sport: string; scenario: string; action: string };
  setConfig: React.Dispatch<React.SetStateAction<{ sport: string; scenario: string; action: string }>>;
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

export function AnalysisProvider({ children }: { children: ReactNode }) {
  const [results, setResults] = useState<ResultsData | null>(null);
  const [config, setConfig] = useState({ sport: '', scenario: '', action: '' });

  return (
    <AnalysisContext.Provider value={{ results, setResults, config, setConfig }}>
      {children}
    </AnalysisContext.Provider>
  );
}

export function useAnalysis() {
  const context = useContext(AnalysisContext);
  if (context === undefined) {
    throw new Error('useAnalysis must be used within an AnalysisProvider');
  }
  return context;
}
