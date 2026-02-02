"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface CoffeeRecommendation {
  coffee_blend_id: string;
  coffee_name: string;
  summary: string;
  distance_score: number;
  aroma_score: number;
  acidity_score: number;
  nutty_score: number;
  body_score: number;
  sweetness_score: number;
  match_percentage: number;
}

interface TasteAnalysisContextType {
  recommendations: CoffeeRecommendation[];
  setRecommendations: (recommendations: CoffeeRecommendation[]) => void;
  clearRecommendations: () => void;
}

const TasteAnalysisContext = createContext<TasteAnalysisContextType | undefined>(undefined);

export function TasteAnalysisProvider({ children }: { children: ReactNode }) {
  const [recommendations, setRecommendations] = useState<CoffeeRecommendation[]>([]);

  const clearRecommendations = () => {
    setRecommendations([]);
  };

  return (
    <TasteAnalysisContext.Provider
      value={{
        recommendations,
        setRecommendations,
        clearRecommendations,
      }}
    >
      {children}
    </TasteAnalysisContext.Provider>
  );
}

export function useTasteAnalysis() {
  const context = useContext(TasteAnalysisContext);
  
  if (context === undefined) {
    throw new Error('useTasteAnalysis must be used within a TasteAnalysisProvider');
  }
  
  return context;
}

