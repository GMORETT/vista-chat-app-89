import { useEffect, useRef, useState } from 'react';
import { useMessageStore } from '../state/stores/messageStore';
import { Message } from '../models/chat';
import { validateChatwootConfig, createChatwootWebSocketUrl, getChatwootErrorMessage } from '../utils/chatwootConfig';
import { createChatService } from '../utils/chatServiceFactory';
import { useQueryClient } from '@tanstack/react-query';

interface RealTimeMessageEvent {
  type: 'message.created' | 'message.updated' | 'conversation.created' | 'conversation.updated' | 'conversation.status_changed' | 'conversation_typing_on' | 'conversation_typing_off' | 'presence.update' | 'assignee.changed' | 'contact.updated' | 'contact.created';
  data: any; // Make it flexible to handle different event structures
}

interface ChatwootWebSocketConfig {
  url: string;
  token: string;
  accountId: number;
  userId?: number;
  inboxId?: number;
}

/**
 * Hook for handling real-time message updates via WebSocket/PubSub
 * Integrates with the message buffer to maintain memory limits
 */
export const useRealTimeMessages = (
  conversationId: number | null,
  config?: ChatwootWebSocketConfig
) => {
  console.log('🔧 useRealTimeMessages called with:', { conversationId, config });
  const { addNewMessage, updateMessage } = useMessageStore();
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttemptsRef = useRef(0);
  const conversationIdRef = useRef(conversationId);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [pubsubToken, setPubsubToken] = useState<string | null>(null);
  
  // Keep the ref updated with current conversation ID
  useEffect(() => {
    conversationIdRef.current = conversationId;
  }, [conversationId]);
  
  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_DELAY = 3000;

  const fetchPubsubToken = async () => {
    if (!config) {
      console.log('❌ No config available for PubSub token fetch');
      return null;
    }
    
    try {
      console.log('🔑 Fetching PubSub token from profile API...');
      console.log('🔧 Using API token:', config.token.substring(0, 10) + '...');
      console.log('🔧 Using account ID:', config.accountId);
      
      const chatService = createChatService({ token: config.token, accountId: config.accountId });
      const response = await chatService.getProfile();
      
      console.log('📡 Profile API response:', response);
      
      if (response.error) {
        console.error('❌ Failed to fetch profile:', response.error);
        return null;
      }
      
      if (!response.data) {
        console.error('❌ No data in profile response:', response);
        return null;
      }
      
      console.log('📊 Profile data structure:', JSON.stringify(response.data, null, 2));
      
      const pubsubToken = response.data?.pubsub_token;
      if (pubsubToken) {
        console.log('✅ Got PubSub token:', pubsubToken.substring(0, 10) + '...');
        setPubsubToken(pubsubToken);
        return pubsubToken;
      } else {
        console.warn('⚠️ No pubsub_token in profile response. Available fields:', Object.keys(response.data || {}));
        return null;
      }
    } catch (error) {
      console.error('❌ Error fetching PubSub token:', error);
      return null;
    }
  };

  const subscribeToChannels = () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN || !config) {
      return;
    }

    const tokenToUse = pubsubToken || config.token;
    console.log('🔍 Subscribing with PubSub token:', tokenToUse ? tokenToUse.substring(0, 10) + '...' : 'null');
    
    // Subscribe to RoomChannel using Chatwoot's exact format
    const subscription = {
      command: 'subscribe',
      identifier: JSON.stringify({
        channel: 'RoomChannel',
        pubsub_token: tokenToUse,
        account_id: config.accountId,
        user_id: config.userId || 1, // Use user ID from config or default to 1
      }),
    };
    
    wsRef.current.send(JSON.stringify(subscription));
    console.log('📡 Subscribed to RoomChannel with:', {
      account_id: config.accountId,
      user_id: config.userId || 1,
      has_pubsub_token: !!tokenToUse
    });
  };

  const connect = async () => {
    console.log('🔌 connect() called with config:', config);
    if (!config) {
      console.log('❌ No config provided, skipping WebSocket connection');
      return;
    }
    
    // Fetch PubSub token first if we don't have it
    if (!pubsubToken) {
      const token = await fetchPubsubToken();
      if (!token) {
        console.warn('⚠️ Failed to get PubSub token, using API token as fallback');
      }
    }
    
    // Validate configuration
    const validationErrors = validateChatwootConfig({
      baseUrl: config.url.replace('wss://', 'https://').replace('ws://', 'http://'),
      websocketUrl: config.url,
      token: config.token,
      accountId: config.accountId,
    });
    
    if (validationErrors.length > 0) {
      const errorMessage = `Configuration error: ${validationErrors.join(', ')}`;
      setConnectionError(errorMessage);
      console.error('Chatwoot config validation failed:', validationErrors);
      return;
    }
    
    try {
      setConnectionError(null);
      
      // Create WebSocket URL (no auth params in URL, auth goes in subscription)
      const wsUrl: string = config.url;
      console.log('🔗 WebSocket URL (plain):', wsUrl);
      
      console.log('🔌 Attempting WebSocket connection to:', wsUrl);
      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current.onopen = () => {
        console.log('✅ Real-time WebSocket connection established');
        console.log('🔗 Connected to:', wsUrl);
        console.log('🔑 Using account ID:', config.accountId);
        console.log('👤 Using user ID:', config.userId || 1);
        reconnectAttemptsRef.current = 0;
        
        // Subscribe to channels
        subscribeToChannels();
      };
      
      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleRealTimeEvent(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      wsRef.current.onclose = (event) => {
        console.log('❌ WebSocket connection closed');
        console.log('📊 Close code:', event.code);
        console.log('📊 Close reason:', event.reason);
        console.log('📊 Was clean close:', event.wasClean);
        
        // Attempt to reconnect if not manually closed
        if (event.code !== 1000 && reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            console.log(`🔄 Reconnecting... Attempt ${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS}`);
            connect();
          }, RECONNECT_DELAY * reconnectAttemptsRef.current);
        } else if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
          console.error('❌ Max reconnection attempts reached. WebSocket connection failed.');
        }
      };
      
      wsRef.current.onerror = (error) => {
        const errorMessage = getChatwootErrorMessage(error);
        setConnectionError(errorMessage);
        console.error('WebSocket error:', error);
      };
    } catch (error: any) {
      const errorMessage = getChatwootErrorMessage(error);
      setConnectionError(errorMessage);
      console.error('Failed to establish WebSocket connection:', error);
    }
  };

  const handleRealTimeEvent = (data: any) => {
    console.log('📨 Received real-time event:', JSON.stringify(data, null, 2));
    console.log('📨 Raw event structure check:');
    console.log('📨 data.type:', data.type);
    console.log('📨 data.message:', !!data.message);
    console.log('📨 data.message.type:', data.message?.type);
    console.log('📨 data.message.event:', data.message?.event);
    console.log('📨 data.message.data:', !!data.message?.data);
    
    // Handle ping events
    if (data.type === 'ping') {
      return;
    }
    
    // Handle welcome/confirmation events
    if (data.type === 'welcome' || data.type === 'confirm_subscription') {
      console.log('✅ WebSocket subscription confirmed:', data.type);
      return;
    }
    
    // Handle actual message events - check if we have data.message with event info
    if (data.message && data.message.event) {
      const event: any = data.message;
      const eventType = event.event;
      console.log('🎯 Processing event type:', eventType);
      console.log('🎯 Raw event object:', JSON.stringify(event, null, 2));
      
      // Process the event
      handleChatwootEvent(event, eventType);
      return;
    }
    
    // Handle other message structures if needed
    if (!data.message) {
      console.log('❌ No message in real-time event data:', data);
      return;
    }
    
  };

  const handleChatwootEvent = (event: any, eventType: string) => {
    // Extract conversation ID from different possible locations
    const conversationIdFromEvent = event.data?.conversation_id || 
                                    event.data?.conversation?.id || 
                                    event.data?.id ||
                                    event.data?.account_id;
    
    console.log('🎯 Conversation ID from event:', conversationIdFromEvent);
    console.log('🔍 Available fields in event.data:', Object.keys(event.data || {}));
    
    switch (eventType) {
      case 'message.created':
        console.log('💬 New message created!');
        console.log('💬 Message data:', JSON.stringify(event.data, null, 2));
        
        if (event.data && conversationIdFromEvent) {
          const currentConversationId = conversationIdRef.current;
          console.log('🔍 Debug info:');
          console.log('🔍 Current conversationId (from ref):', currentConversationId);
          console.log('🔍 Event conversationIdFromEvent:', conversationIdFromEvent);
          console.log('🔍 Are they equal?', currentConversationId === conversationIdFromEvent);
          console.log('🔍 Types:', typeof currentConversationId, typeof conversationIdFromEvent);
          
          // If this conversation is currently open, add the message directly to the buffer
          if (currentConversationId && conversationIdFromEvent === currentConversationId) {
            console.log('✅ New message in active conversation');
            
            // Add to message store directly for immediate display
            // The message data is directly in event.data
            if (event.data && event.data.id && event.data.content !== undefined) {
              console.log('📨 Adding message to buffer:', JSON.stringify(event.data, null, 2));
              addNewMessage(currentConversationId, event.data);
              console.log('✅ Added new message to message store for conversation', currentConversationId);
            } else {
              console.warn('⚠️ Message data structure not recognized:', JSON.stringify(event.data, null, 2));
              // Fallback: refresh the query to fetch latest messages
              queryClient.invalidateQueries({ queryKey: ['messages', currentConversationId] });
            }
          }
          
          // Always refresh conversation list for any new message (to update last message, timestamp, etc.)
          console.log('📬 New message in conversation', conversationIdFromEvent, '- refreshing conversation list');
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
          queryClient.invalidateQueries({ queryKey: ['conversationsMeta'] });
        } else {
          console.warn('⚠️ Message created event missing data or conversation ID');
        }
        break;
        
      case 'message.updated':
        if (event.data.message && conversationIdFromEvent) {
          const currentConversationId = conversationIdRef.current;
          if (currentConversationId && conversationIdFromEvent === currentConversationId) {
            // Update existing message in buffer
            updateMessage(currentConversationId, event.data.message);
            console.log('✅ Updated message in conversation', currentConversationId);
          }
        }
        break;
        
      case 'conversation.created':
        console.log('🆕 New conversation created:', conversationIdFromEvent);
        console.log('🔄 Refreshing conversation list for new conversation');
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
        queryClient.invalidateQueries({ queryKey: ['conversationsMeta'] });
        break;
        
      case 'conversation.updated':
        console.log('📝 Conversation updated:', conversationIdFromEvent);
        console.log('📝 This likely contains new message data!');
        console.log('📝 Conversation data:', JSON.stringify(event.data, null, 2));
        
        // Check if this update contains a message
        if (event.data && (event.data.messages || event.data.last_message || event.data.content)) {
          console.log('✅ Detected message-related conversation update');
          
          // If this is for the currently selected conversation, also refresh messages
          const currentConversationId = conversationIdRef.current;
          if (currentConversationId && conversationIdFromEvent === currentConversationId) {
            console.log('🔄 Refreshing messages for active conversation:', currentConversationId);
            queryClient.invalidateQueries({ queryKey: ['messages', currentConversationId] });
          }
        }
        
        console.log('🔄 Refreshing conversation list for conversation update');
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
        queryClient.invalidateQueries({ queryKey: ['conversationsMeta'] });
        break;
        
      case 'conversation.status_changed':
        console.log('🔄 Conversation status changed:', conversationIdFromEvent);
        console.log('🔄 Refreshing conversation list for status change');
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
        queryClient.invalidateQueries({ queryKey: ['conversationsMeta'] });
        break;
        
      case 'assignee.changed':
        console.log('👤 Assignee changed for conversation:', conversationIdFromEvent);
        console.log('🔄 Refreshing conversation list for assignee change');
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
        queryClient.invalidateQueries({ queryKey: ['conversationsMeta'] });
        break;
        
      case 'conversation_typing_on':
        console.log('✍️ User started typing in conversation:', conversationIdFromEvent);
        break;
        
      case 'conversation_typing_off':
        console.log('✋ User stopped typing in conversation:', conversationIdFromEvent);
        break;
        
      case 'presence.update':
        console.log('👥 Presence update:', event.data.user);
        break;
        
      case 'contact.updated':
        console.log('👤 Contact updated:', event.data);
        console.log('👤 Contact update data:', JSON.stringify(event.data, null, 2));
        // Contact updates might indicate new message activity - trigger refresh
        console.log('🔄 Refreshing conversation list for contact update (might indicate new message)');
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
        queryClient.invalidateQueries({ queryKey: ['conversationsMeta'] });
        break;
        
      case 'contact.created':
        console.log('🆕 Contact created:', event.data);
        console.log('🔄 Refreshing conversation list for new contact');
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
        break;
        
      default:
        console.log('❓ Unhandled real-time event type:', eventType);
        console.log('❓ Full event object:', JSON.stringify(event, null, 2));
        console.log('❓ This might be the event type we need for messages!');
        
        // For now, trigger a refresh for any unhandled event that might be a message
        if (eventType && typeof eventType === 'string' && eventType.includes('message')) {
          console.log('🔄 Refreshing conversation list for potential message event');
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
        }
    }
  };

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'Component unmounting');
      wsRef.current = null;
    }
  };

  // Connect/disconnect based on conversation and config
  useEffect(() => {
    console.log('🔄 useRealTimeMessages useEffect triggered:', { conversationId, hasConfig: !!config });
    // Connect if we have config and either a specific conversation or want to listen to all (conversationId === null)
    if (config && (conversationId !== undefined)) {
      console.log('✅ Conditions met, calling connect()');
      connect();
    } else {
      console.log('❌ Conditions not met, calling disconnect()');
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [config?.url, config?.token, config?.accountId]);

  // Update subscriptions when conversation ID changes (without reconnecting)
  useEffect(() => {
    console.log('🔄 Conversation ID changed, updating subscriptions:', conversationId);
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      subscribeToChannels();
    }
  }, [conversationId]);

  return {
    isConnected: wsRef.current?.readyState === WebSocket.OPEN,
    reconnectAttempts: reconnectAttemptsRef.current,
    connectionError,
    disconnect,
    connect,
  };
};

/**
 * Enhanced polling mechanism for real-time message updates
 * Used as fallback when WebSocket connection fails
 */
export const usePollingMessages = (
  conversationId: number | null,
  chatService: any,
  pollInterval: number = 8000,
  enabled: boolean = true
) => {
  const { addNewMessage, addNewerMessages, getBuffer } = useMessageStore();
  const intervalRef = useRef<NodeJS.Timeout>();
  const [isPolling, setIsPolling] = useState(false);
  const [lastPollTime, setLastPollTime] = useState<number>(Date.now());
  
  useEffect(() => {
    if (!conversationId || !enabled || !chatService) {
      setIsPolling(false);
      return;
    }
    
    const pollForNewMessages = async () => {
      try {
        const buffer = getBuffer(conversationId);
        const newestMessage = buffer.messages[buffer.messages.length - 1];
        
        // If we have messages, poll for newer ones
        if (newestMessage) {
          const response = await chatService.getMessages(conversationId, {
            after: newestMessage.created_at.toString(),
            limit: 50
          });
          
          if (response.data?.payload && response.data.payload.length > 0) {
            addNewerMessages(conversationId, response.data.payload);
            console.log(`Polling: Found ${response.data.payload.length} new messages`);
          }
        } else {
          // If no messages in buffer, load initial messages
          const response = await chatService.getMessages(conversationId, {
            limit: 50
          });
          
          if (response.data?.payload && response.data.payload.length > 0) {
            response.data.payload.forEach((message: any) => {
              addNewMessage(conversationId, message);
            });
            console.log(`Polling: Loaded ${response.data.payload.length} initial messages`);
          }
        }
        
        setLastPollTime(Date.now());
      } catch (error) {
        console.error('Error polling for messages:', error);
      }
    };
    
    // Start polling
    setIsPolling(true);
    pollForNewMessages(); // Initial poll
    intervalRef.current = setInterval(pollForNewMessages, pollInterval);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        setIsPolling(false);
      }
    };
  }, [conversationId, pollInterval, enabled, chatService, addNewMessage, addNewerMessages, getBuffer]);

  return {
    isPolling,
    lastPollTime,
    stopPolling: () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        setIsPolling(false);
      }
    },
  };
};