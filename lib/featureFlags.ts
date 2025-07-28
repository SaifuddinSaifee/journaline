import features from '@/config/features.json';

export type FeatureFlag = keyof typeof features;

export function isFeatureEnabled(feature: FeatureFlag): boolean {
  return features[feature] || false;
}

// Type for all available feature flags
export type Features = {
  [K in FeatureFlag]: boolean;
};

// Get all feature flags
export function getAllFeatures(): Features {
  return features;
} 