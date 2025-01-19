import { useState } from 'react';
import { FEATURES } from '../config/features';

export function useFeatures() {
  const [features, setFeatures] = useState(FEATURES);

  const toggleFeature = (path, value) => {
    setFeatures(prev => {
      const newFeatures = { ...prev };
      let current = newFeatures;
      const keys = path.split('.');
      const lastKey = keys.pop();
      
      for (const key of keys) {
        current = current[key];
      }
      current[lastKey] = value;
      
      return newFeatures;
    });
  };

  return {
    features,
    toggleFeature,
    isEnabled: (path) => {
      let current = features;
      for (const key of path.split('.')) {
        current = current[key];
        if (current === undefined) return false;
        if (typeof current === 'boolean') return current;
      }
      return Boolean(current?.enabled);
    }
  };
}