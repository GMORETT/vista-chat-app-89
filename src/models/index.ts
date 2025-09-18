// Re-export all types from chat models for backward compatibility
export * from './chat';

// Re-export admin-specific types (avoid conflicts with chat types)
export type {
  Channel,
  CreateChannelRequest,
  CreateTeamRequest,
  CreateAgentRequest,
  CreateLabelRequest,
  UpdateAgentRequest,
  TeamMember,
  ChannelType
} from './admin';