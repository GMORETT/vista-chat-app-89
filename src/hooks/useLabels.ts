import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { labelsApi } from '../api/labels';
import { contactsApi } from '../api/contacts';
import { conversationsApi } from '../api/conversations';
import { Label } from '../models';
import { useToast } from './use-toast';

export const useLabels = () => {
  return useQuery<Label[]>({
    queryKey: ['labels'],
    queryFn: async () => {
      const response = await labelsApi.getLabels();
      return response.data || [];
    },
  });
};

export const useCreateLabel = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ title, color }: { title: string; color?: string }) => 
      labelsApi.createLabel(title, color),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['labels'] });
      toast({
        title: "Label criada",
        description: `Label "${response.data?.title}" foi criada com sucesso.`,
      });
    },
    onError: () => {
      toast({
        title: "Erro ao criar label",
        description: "Não foi possível criar a label. Tente novamente.",
        variant: "destructive",
      });
    },
  });
};

export const useApplyLabelsToContact = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ contactId, labels }: { contactId: number; labels: string[] }) => 
      contactsApi.addContactLabels(contactId, labels),
    onSuccess: (_, { labels }) => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['labels'] });
      toast({
        title: "Labels aplicadas",
        description: `${labels.length} label(s) aplicada(s) ao contato com sucesso.`,
      });
    },
    onError: () => {
      toast({
        title: "Erro ao aplicar labels",
        description: "Não foi possível aplicar as labels ao contato.",
        variant: "destructive",
      });
    },
  });
};

export const useApplyLabelsToConversation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ conversationId, labels }: { conversationId: number; labels: string[] }) => 
      conversationsApi.addConversationLabels(conversationId, labels),
    onSuccess: (_, { labels }) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['labels'] });
      toast({
        title: "Labels aplicadas",
        description: `${labels.length} label(s) aplicada(s) à conversa com sucesso.`,
      });
    },
    onError: () => {
      toast({
        title: "Erro ao aplicar labels",
        description: "Não foi possível aplicar as labels à conversa.",
        variant: "destructive",
      });
    },
  });
};

export const useContactLabels = (contactId: number) => {
  return useQuery<string[]>({
    queryKey: ['contact-labels', contactId],
    queryFn: async () => {
      const response = await contactsApi.getContactLabels(contactId);
      return response.data || [];
    },
    enabled: !!contactId,
  });
};

export const useConversationLabels = (conversationId: number) => {
  return useQuery<string[]>({
    queryKey: ['conversation-labels', conversationId],
    queryFn: async () => {
      const response = await conversationsApi.getConversationLabels(conversationId);
      return response.data || [];
    },
    enabled: !!conversationId,
  });
};