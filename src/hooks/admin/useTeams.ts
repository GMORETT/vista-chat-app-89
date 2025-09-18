import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminChatService } from '../../api/AdminChatService';
import { Team, CreateTeamRequest, Agent } from '../../models/admin';

// Use mock service for development
const adminChatService = new AdminChatService(
  'http://localhost:3001',
  () => 'mock-token',
  'mock-account-id'
);

export const useTeams = () => {
  return useQuery<Team[]>({
    queryKey: ['solabs-admin', 'teams'],
    queryFn: () => adminChatService.getTeams(),
  });
};

export const useCreateTeam = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Team, Error, CreateTeamRequest>({
    mutationFn: (data) => adminChatService.createTeam(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solabs-admin', 'teams'] });
    },
  });
};

export const useUpdateTeam = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Team, Error, { id: number; data: Partial<CreateTeamRequest> }>({
    mutationFn: ({ id, data }) => adminChatService.updateTeam(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solabs-admin', 'teams'] });
    },
  });
};

export const useDeleteTeam = () => {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, number>({
    mutationFn: (id) => adminChatService.deleteTeam(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solabs-admin', 'teams'] });
    },
  });
};

export const useAddTeamMembers = () => {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, { teamId: number; agentIds: number[] }>({
    mutationFn: ({ teamId, agentIds }) => adminChatService.addTeamMember(teamId, agentIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solabs-admin', 'teams'] });
    },
  });
};

export const useRemoveTeamMember = () => {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, { teamId: number; agentId: number }>({
    mutationFn: ({ teamId, agentId }) => adminChatService.removeTeamMember(teamId, agentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solabs-admin', 'teams'] });
    },
  });
};

export const useTeamMembers = (teamId: number) => {
  return useQuery({
    queryKey: ['solabs-admin', 'teams', teamId, 'members'],
    queryFn: () => adminChatService.getTeamMembers(teamId),
    enabled: !!teamId,
  });
};