import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAdminService } from '../../services/AdminService';
import { Team, CreateTeamRequest, Agent } from '../../models/admin';

export const useTeams = () => {
  const adminService = useAdminService();
  
  return useQuery<Team[]>({
    queryKey: ['solabs-admin', 'teams'],
    queryFn: () => adminService.listTeams(),
  });
};

export const useCreateTeam = () => {
  const adminService = useAdminService();
  const queryClient = useQueryClient();
  
  return useMutation<Team, Error, CreateTeamRequest>({
    mutationFn: (data) => adminService.createTeam(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solabs-admin', 'teams'] });
    },
  });
};

export const useUpdateTeam = () => {
  const adminService = useAdminService();
  const queryClient = useQueryClient();
  
  return useMutation<Team, Error, { id: number; data: Partial<CreateTeamRequest> }>({
    mutationFn: ({ id, data }) => adminService.updateTeam(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solabs-admin', 'teams'] });
    },
  });
};

export const useDeleteTeam = () => {
  const adminService = useAdminService();
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, number>({
    mutationFn: (id) => adminService.deleteTeam(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solabs-admin', 'teams'] });
    },
  });
};

export const useAddTeamMembers = () => {
  const adminService = useAdminService();
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, { teamId: number; agentIds: number[] }>({
    mutationFn: ({ teamId, agentIds }) => adminService.addTeamMembers(teamId, agentIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solabs-admin', 'teams'] });
    },
  });
};

export const useRemoveTeamMember = () => {
  const adminService = useAdminService();
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, { teamId: number; agentId: number }>({
    mutationFn: ({ teamId, agentId }) => adminService.removeTeamMember(teamId, agentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solabs-admin', 'teams'] });
    },
  });
};

export const useTeamMembers = (teamId: number) => {
  const adminService = useAdminService();
  
  return useQuery<Agent[]>({
    queryKey: ['solabs-admin', 'teams', teamId, 'members'],
    queryFn: () => adminService.getTeamMembers(teamId),
    enabled: !!teamId,
  });
};