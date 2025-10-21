// Export all animation components
export { DirectionSenseAnimation, DirectionSenseExample } from './DirectionSenseAnimation';
export { BloodRelationsAnimation, BloodRelationsExample } from './BloodRelationsAnimation';
export { NumberSeriesAnimation, NumberSeriesExample } from './NumberSeriesAnimation';
export { ClockProblemsAnimation, ClockProblemsExample } from './ClockProblemsAnimation';
export { PermutationCombinationAnimation, PermutationCombinationExample } from './PermutationCombinationAnimation';
export { BoatStreamAnimation, BoatStreamExample } from './BoatStreamAnimation';
export { default as AnimationManager, type AnimationType } from './AnimationManager';

// Animation type definitions
export type {
  // Re-export the main type from AnimationManager
  AnimationType as AptitudeAnimationType
} from './AnimationManager';
