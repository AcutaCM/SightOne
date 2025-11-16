// Workflow Node Components
// Export all custom node components for ReactFlow

export { default as PureChatChatNode } from './PureChatChatNode';
export { default as PureChatImageAnalysisNode } from './PureChatImageAnalysisNode';
export { default as UniPixelSegmentationNode } from './UniPixelSegmentationNode';
export { Challenge8FlightNode } from './Challenge8FlightNode';
export { ChallengeObstacleNode } from './ChallengeObstacleNode';
export { ChallengePrecisionLandNode } from './ChallengePrecisionLandNode';

// Node type mapping for ReactFlow
export const nodeTypes = {
  purechat_chat: require('./PureChatChatNode').default,
  purechat_image_analysis: require('./PureChatImageAnalysisNode').default,
  unipixel_segmentation: require('./UniPixelSegmentationNode').default,
  challenge_8_flight: require('./Challenge8FlightNode').Challenge8FlightNode,
  challenge_obstacle: require('./ChallengeObstacleNode').ChallengeObstacleNode,
  challenge_precision_land: require('./ChallengePrecisionLandNode').ChallengePrecisionLandNode,
};
