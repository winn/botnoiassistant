import React, { createContext, useContext } from 'react';
import { useFeatures } from '../hooks/useFeatures';

const FeaturesContext = createContext(null);

export function FeaturesProvider({ children }) {
  const features = useFeatures();

  return (
    <FeaturesContext.Provider value={features}>
      {children}
    </FeaturesContext.Provider>
  );
}

export function useFeatureFlags() {
  const context = useContext(FeaturesContext);
  if (!context) {
    throw new Error('useFeatureFlags must be used within a FeaturesProvider');
  }
  return context;
}