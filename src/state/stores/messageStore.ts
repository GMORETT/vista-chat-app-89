import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Message } from '../../models/chat';

interface MessageBuffer {
  messages: Message[];
  hasOlderMessages: boolean;
  hasNewerMessages: boolean;
  isLoadingOlder: boolean;
  isLoadingNewer: boolean;
  oldestMessageId?: number;
  newestMessageId?: number;
}

interface MessageState {
  drafts: Record<number, string>;
  buffers: Record<number, MessageBuffer>;

  // Draft actions
  setDraft: (conversationId: number, draft: string) => void;
  getDraft: (conversationId: number) => string;
  clearDraft: (conversationId: number) => void;

  // Buffer actions
  initializeBuffer: (conversationId: number, initialMessages: Message[]) => void;
  addNewerMessages: (conversationId: number, messages: Message[]) => void;
  addOlderMessages: (conversationId: number, messages: Message[]) => void;
  addNewMessage: (conversationId: number, message: Message) => void;
  updateMessage: (conversationId: number, message: Message) => void;
  getBuffer: (conversationId: number) => MessageBuffer;
  clearBuffer: (conversationId: number) => void;
  setLoadingState: (conversationId: number, type: 'older' | 'newer', loading: boolean) => void;
  updateHasOlderMessages: (conversationId: number, hasOlder: boolean) => void;
}

const MESSAGE_BUFFER_SIZE = 200; // Increased buffer size
const SCROLL_LOAD_SIZE = 50;

export const useMessageStore = create<MessageState>()(
  persist(
    (set, get) => ({
      drafts: {},
      buffers: {},

      // Draft actions
      setDraft: (conversationId, draft) => {
        set((state) => ({
          drafts: { ...state.drafts, [conversationId]: draft }
        }));
      },

      getDraft: (conversationId) => {
        return get().drafts[conversationId] || '';
      },

      clearDraft: (conversationId) => {
        set((state) => {
          const { [conversationId]: removed, ...restDrafts } = state.drafts;
          return { drafts: restDrafts };
        });
      },

      // Buffer actions
      initializeBuffer: (conversationId, initialMessages) => {
        const sortedMessages = [...initialMessages].sort((a, b) => a.created_at - b.created_at);
        
        set((state) => ({
          buffers: {
            ...state.buffers,
            [conversationId]: {
              messages: sortedMessages,
              hasOlderMessages: sortedMessages.length > 0, // Always assume there might be more initially, let the API tell us otherwise
              hasNewerMessages: false,
              isLoadingOlder: false,
              isLoadingNewer: false,
              oldestMessageId: sortedMessages[0]?.id,
              newestMessageId: sortedMessages[sortedMessages.length - 1]?.id,
            }
          }
        }));
      },

      addNewerMessages: (conversationId, newMessages) => {
        if (newMessages.length === 0) return;

        set((state) => {
          const buffer = state.buffers[conversationId];
          if (!buffer) return state;

          const sortedNew = [...newMessages].sort((a, b) => a.created_at - b.created_at);
          const allMessages = [...buffer.messages, ...sortedNew];

          // Keep only the most recent MESSAGE_BUFFER_SIZE messages
          const trimmedMessages = allMessages.length > MESSAGE_BUFFER_SIZE 
            ? allMessages.slice(-MESSAGE_BUFFER_SIZE)
            : allMessages;

          return {
            buffers: {
              ...state.buffers,
              [conversationId]: {
                ...buffer,
                messages: trimmedMessages,
                hasOlderMessages: allMessages.length > MESSAGE_BUFFER_SIZE || buffer.hasOlderMessages,
                hasNewerMessages: newMessages.length >= SCROLL_LOAD_SIZE,
                newestMessageId: sortedNew[sortedNew.length - 1].id,
                oldestMessageId: trimmedMessages[0]?.id,
              }
            }
          };
        });
      },

      addOlderMessages: (conversationId, oldMessages) => {
        if (oldMessages.length === 0) return;

        set((state) => {
          const buffer = state.buffers[conversationId];
          if (!buffer) return state;

          const sortedOld = [...oldMessages].sort((a, b) => a.created_at - b.created_at);
          const allMessages = [...sortedOld, ...buffer.messages];

          // Keep only the most recent MESSAGE_BUFFER_SIZE messages
          const trimmedMessages = allMessages.length > MESSAGE_BUFFER_SIZE 
            ? allMessages.slice(-MESSAGE_BUFFER_SIZE)
            : allMessages;

          // If we got fewer messages than requested, there are no more older messages
          // The API consistently returns 20 messages max, so if we get 20, there might be more
          const newHasOlderMessages = oldMessages.length >= 20;

          return {
            buffers: {
              ...state.buffers,
              [conversationId]: {
                ...buffer,
                messages: trimmedMessages,
                hasOlderMessages: newHasOlderMessages, // Only set to false if we got fewer than full batch
                hasNewerMessages: allMessages.length > MESSAGE_BUFFER_SIZE || buffer.hasNewerMessages,
                oldestMessageId: sortedOld[0].id,
                newestMessageId: trimmedMessages[trimmedMessages.length - 1]?.id,
              }
            }
          };
        });
      },

      addNewMessage: (conversationId, message) => {
        console.log('📨 addNewMessage called:', { conversationId, messageId: message.id, content: message.content?.substring(0, 50) });
        
        set((state) => {
          const buffer = state.buffers[conversationId];
          console.log('📨 Current buffer for conversation', conversationId, ':', buffer ? `${buffer.messages.length} messages` : 'no buffer');
          
          if (!buffer) {
            console.log('📨 Creating new buffer with single message');
            // Initialize buffer with single message if it doesn't exist
            return {
              buffers: {
                ...state.buffers,
                [conversationId]: {
                  messages: [message],
                  hasOlderMessages: false,
                  hasNewerMessages: false,
                  isLoadingOlder: false,
                  isLoadingNewer: false,
                  oldestMessageId: message.id,
                  newestMessageId: message.id,
                }
              }
            };
          }

          // Check if message already exists to prevent duplicates
          const messageExists = buffer.messages.some(existingMessage => existingMessage.id === message.id);
          if (messageExists) {
            console.log('📨 Message', message.id, 'already exists, skipping');
            return state; // Return unchanged state
          }

          // Add new message to end and trim if needed
          const allMessages = [...buffer.messages, message];
          const trimmedMessages = allMessages.length > MESSAGE_BUFFER_SIZE 
            ? allMessages.slice(-MESSAGE_BUFFER_SIZE)
            : allMessages;

          console.log('📨 Adding message to buffer:', {
            previousCount: buffer.messages.length,
            newCount: trimmedMessages.length,
            messageId: message.id
          });

          return {
            buffers: {
              ...state.buffers,
              [conversationId]: {
                ...buffer,
                messages: trimmedMessages,
                hasOlderMessages: allMessages.length > MESSAGE_BUFFER_SIZE || buffer.hasOlderMessages,
                newestMessageId: message.id,
                oldestMessageId: trimmedMessages[0]?.id,
              }
            }
          };
        });
      },

      updateMessage: (conversationId, updatedMessage) => {
        set((state) => {
          const buffer = state.buffers[conversationId];
          if (!buffer) return state;

          const updatedMessages = buffer.messages.map(msg => 
            msg.id === updatedMessage.id ? updatedMessage : msg
          );

          return {
            buffers: {
              ...state.buffers,
              [conversationId]: {
                ...buffer,
                messages: updatedMessages,
              }
            }
          };
        });
      },

      getBuffer: (conversationId) => {
        const buffer = get().buffers[conversationId];
        return buffer || {
          messages: [],
          hasOlderMessages: false,
          hasNewerMessages: false,
          isLoadingOlder: false,
          isLoadingNewer: false,
        };
      },

      clearBuffer: (conversationId) => {
        set((state) => {
          const { [conversationId]: removed, ...restBuffers } = state.buffers;
          return { buffers: restBuffers };
        });
      },

      setLoadingState: (conversationId, type, loading) => {
        set((state) => {
          const buffer = state.buffers[conversationId];
          if (!buffer) return state;

          return {
            buffers: {
              ...state.buffers,
              [conversationId]: {
                ...buffer,
                [type === 'older' ? 'isLoadingOlder' : 'isLoadingNewer']: loading,
              }
            }
          };
        });
      },

      updateHasOlderMessages: (conversationId, hasOlder) => {
        set((state) => {
          const buffer = state.buffers[conversationId];
          if (!buffer) return state;

          return {
            buffers: {
              ...state.buffers,
              [conversationId]: {
                ...buffer,
                hasOlderMessages: hasOlder,
              }
            }
          };
        });
      },
    }),
    {
      name: 'message-store',
      partialize: (state) => ({ drafts: state.drafts }), // Don't persist buffers - they should be fresh on reload
    }
  )
);