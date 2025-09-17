import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useChatStore } from '../state/useChatStore';
import { 
  Message, 
  MessagesResponse, 
  SendMessageRequest,
  MessageFilters 
} from '../models';
import { generateMessages } from '../data/mockData';

// Mock messages storage per conversation
const conversationMessages: Record<number, Message[]> = {};

// Get messages for a conversation with pagination
const getConversationMessages = (
  conversationId: number, 
  filters?: MessageFilters
): MessagesResponse => {
  // Generate messages if not cached
  if (!conversationMessages[conversationId]) {
    conversationMessages[conversationId] = generateMessages(conversationId, 30);
  }

  let messages = [...conversationMessages[conversationId]];

  // Apply pagination filters
  if (filters?.before) {
    const beforeIndex = messages.findIndex(msg => msg.id.toString() === filters.before);
    if (beforeIndex > 0) {
      messages = messages.slice(0, beforeIndex);
    }
  }

  if (filters?.after) {
    const afterIndex = messages.findIndex(msg => msg.id.toString() === filters.after);
    if (afterIndex >= 0) {
      messages = messages.slice(afterIndex + 1);
    }
  }

  // Apply limit
  if (filters?.limit) {
    messages = messages.slice(-filters.limit);
  }

  return {
    payload: messages,
    meta: {
      count: messages.length,
      current_page: 1,
    },
  };
};

// Add message to conversation
const addMessageToConversation = (conversationId: number, message: Message) => {
  if (!conversationMessages[conversationId]) {
    conversationMessages[conversationId] = [];
  }
  conversationMessages[conversationId].push(message);
};

export const useMessages = (conversationId: number | null, filters?: MessageFilters) => {
  const queryClient = useQueryClient();
  const { clearDraft } = useChatStore();

  const messagesQuery = useQuery({
    queryKey: ['messages', conversationId, filters],
    queryFn: async (): Promise<MessagesResponse | null> => {
      if (!conversationId) return null;
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 200));
      
      return getConversationMessages(conversationId, filters);
    },
    enabled: !!conversationId,
    staleTime: 10000, // 10 seconds
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ 
      conversationId, 
      data 
    }: { 
      conversationId: number; 
      data: SendMessageRequest; 
    }) => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Create new message
      const newMessage: Message = {
        id: Date.now(),
        content: data.content,
        message_type: data.private ? 2 : 1, // 2 for notes, 1 for outgoing
        created_at: Date.now(),
        updated_at: Date.now(),
        private: data.private || false,
        status: 'sent',
        content_type: data.private ? 'note' : 'text',
        sender_type: 'agent',
        sender_id: 1, // Mock current agent ID
        conversation_id: conversationId,
        inbox_id: 1, // Mock inbox ID
        attachments: [],
      };
      
      // Add to mock storage
      addMessageToConversation(conversationId, newMessage);
      
      return newMessage;
    },
    onSuccess: (newMessage, { conversationId }) => {
      // Clear draft
      clearDraft(conversationId);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error) => {
      console.error('Failed to send message:', error);
    },
  });

  // Send files mutation
  const sendFilesMutation = useMutation({
    mutationFn: async ({ 
      conversationId, 
      files, 
      content, 
      isPrivate 
    }: { 
      conversationId: number; 
      files: File[]; 
      content?: string; 
      isPrivate?: boolean; 
    }) => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Create attachments from files
      const attachments = files.map((file, index) => ({
        id: Date.now() + index,
        file_type: file.type,
        extension: file.name.split('.').pop(),
        data_url: URL.createObjectURL(file),
        file_size: file.size,
        fallback_title: file.name,
        coordinates_lat: null,
        coordinates_long: null,
      }));
      
      // Create new message with attachments
      const newMessage: Message = {
        id: Date.now(),
        content: content || '',
        message_type: isPrivate ? 2 : 1,
        created_at: Date.now(),
        updated_at: Date.now(),
        private: isPrivate || false,
        status: 'sent',
        content_type: isPrivate ? 'note' : 'text',
        sender_type: 'agent',
        sender_id: 1,
        conversation_id: conversationId,
        inbox_id: 1,
        attachments,
      };
      
      // Add to mock storage
      addMessageToConversation(conversationId, newMessage);
      
      return newMessage;
    },
    onSuccess: (newMessage, { conversationId }) => {
      clearDraft(conversationId);
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error) => {
      console.error('Failed to send files:', error);
    },
  });

  // Load more messages (pagination)
  const loadMoreMessages = async (before?: string) => {
    if (!conversationId) return;
    
    const moreFilters = { ...filters, before, limit: 20 };
    
    try {
      const moreMessages = await queryClient.fetchQuery({
        queryKey: ['messages', conversationId, 'more', before],
        queryFn: () => getConversationMessages(conversationId, moreFilters),
        staleTime: 0,
      });
      
      if (moreMessages?.payload) {
        // Merge with existing messages
        queryClient.setQueryData(
          ['messages', conversationId, filters],
          (oldData: MessagesResponse | undefined) => {
            if (!oldData) return moreMessages;
            
            return {
              ...oldData,
              payload: [...moreMessages.payload, ...oldData.payload],
            };
          }
        );
      }
    } catch (error) {
      console.error('Failed to load more messages:', error);
    }
  };

  return {
    // Data
    messages: messagesQuery.data?.payload || [],
    isLoading: messagesQuery.isLoading,
    isSending: sendMessageMutation.isPending || sendFilesMutation.isPending,
    error: messagesQuery.error,

    // Actions
    sendMessage: (data: SendMessageRequest) => {
      if (conversationId) {
        sendMessageMutation.mutate({ conversationId, data });
      }
    },
    sendFiles: (files: File[], content?: string, isPrivate?: boolean) => {
      if (conversationId) {
        sendFilesMutation.mutate({ conversationId, files, content, isPrivate });
      }
    },
    loadMoreMessages,
    refetch: messagesQuery.refetch,
  };
};