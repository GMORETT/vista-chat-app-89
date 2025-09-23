import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Team, CreateTeamRequest, Agent } from '../../models/admin';
import { useAdminService } from '../../services/AdminService';

export const useTeams = () => {
  const adminService = useAdminService();
  
  return useQuery<Team[]>({
    queryKey: ['solabs-admin', 'teams'],
    queryFn: () => adminService.listTeams(),
  });
};

export const useCreateTeam = () => {
  const queryClient = useQueryClient();
  const adminService = useAdminService();
  
  return useMutation<Team, Error, CreateTeamRequest>({
    mutationFn: (data) => adminService.createTeam(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solabs-admin', 'teams'] });
    },
  });
};

export const useUpdateTeam = () => {
  const queryClient = useQueryClient();
  const adminService = useAdminService();
  
  return useMutation<Team, Error, { id: number; data: Partial<CreateTeamRequest> }>({
    mutationFn: ({ id, data }) => adminService.updateTeam(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solabs-admin', 'teams'] });
    },
  });
};

export const useDeleteTeam = () => {
  const queryClient = useQueryClient();
  const adminService = useAdminService();
  
  return useMutation<void, Error, number>({
    mutationFn: (id) => adminService.deleteTeam(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solabs-admin', 'teams'] });
    },
  });
};

export const useAddTeamMembers = () => {
  const queryClient = useQueryClient();
  const adminService = useAdminService();
  
  return useMutation<void, Error, { teamId: number; agentIds: number[] }>({
    mutationFn: ({ teamId, agentIds }) => adminService.addTeamMembers(teamId, agentIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solabs-admin', 'teams'] });
    },
  });
};

export const useRemoveTeamMember = () => {
  const queryClient = useQueryClient();
  const adminService = useAdminService();
  
  return useMutation<void, Error, { teamId: number; agentId: number }>({
    mutationFn: ({ teamId, agentId }) => adminService.removeTeamMember(teamId, agentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solabs-admin', 'teams'] });
    },
  });
};

export const useTeamMembers = (teamId: number) => {
  const adminService = useAdminService();
  
  return useQuery({
    queryKey: ['solabs-admin', 'teams', teamId, 'members'],
    queryFn: () => adminService.getTeamMembers(teamId),
    enabled: !!teamId,
  });
};