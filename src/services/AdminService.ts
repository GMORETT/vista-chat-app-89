import React from 'react';
import { useAdminClient } from '../contexts/AdminClientProvider';
import { 
  Channel, 
  CreateChannelRequest, 
  Team, 
  CreateTeamRequest, 
  Agent, 
  CreateAgentRequest, 
  Label,
  CreateLabelRequest,
  ChannelType 
} from '../models/admin';
import { 
  Account, 
  CreateAccountRequest, 
  UpdateAccountRequest, 
  ClientQuery 
} from '../models/chat';

class AdminServiceClass {
  private config: {
    apiBaseUrl: string;
    getAuthToken: () => string | Promise<string>;
    chatwootAccountId: string;
  };

  constructor(config: {
    apiBaseUrl: string;
    getAuthToken: () => string | Promise<string>;
    chatwootAccountId: string;
  }) {
    this.config = config;
  }

  private async getHeaders(): Promise<Record<string, string>> {
    const token = await this.config.getAuthToken();
    return {
      'Content-Type': 'application/json',
      'api_access_token': token,
    };
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers = await this.getHeaders();
    const url = `${this.config.apiBaseUrl}/api/v1/accounts/${this.config.chatwootAccountId}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      console.error('🔴 API Request failed:', {
        url: response.url,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      const contentType = response.headers.get('content-type') || '';
      let details = '';
      try {
        if (contentType.includes('application/json')) {
          const data = await response.json();
          details = typeof data === 'string' ? data : (data.error || JSON.stringify(data));
        } else {
          details = await response.text();
        }
      } catch (_) {}
      throw new Error(`API Error: ${response.status} ${response.statusText}${details ? ' - ' + details : ''}`);
    }

    return response.json();
  }

  private static inMemoryAccounts: Account[] = [
    {
      id: 1,
      name: "Solabs Demo",
      slug: "solabs-demo",
      status: "active" as const,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z"
    }
  ];

  private static inMemoryLabels: Label[] = [
    { id: 1, title: 'Bug', slug: 'bug', cw_name: 'acc1_bug', description: 'Problema técnico', color: '#f97316', status: 'active', show_on_sidebar: true, account_id: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 2, title: 'Feature Request', slug: 'feature-request', cw_name: 'acc1_feature_request', description: 'Solicitação de funcionalidade', color: '#10b981', status: 'active', show_on_sidebar: false, account_id: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 3, title: 'Vendas', slug: 'vendas', cw_name: 'acc1_vendas', description: 'Oportunidade de venda', color: '#3b82f6', status: 'active', show_on_sidebar: true, account_id: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 4, title: 'Suporte', slug: 'suporte', cw_name: 'acc2_suporte', description: 'Questão de suporte', color: '#8b5cf6', status: 'active', show_on_sidebar: true, account_id: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 5, title: 'Billing', slug: 'billing', cw_name: 'acc2_billing', description: 'Questão financeira', color: '#f59e0b', status: 'inactive', show_on_sidebar: false, account_id: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  ];

  private async bffRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers = await this.getHeaders();
    const url = `${this.config.apiBaseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      // Fallback to in-memory operations for accounts
      if (endpoint.includes('/api/admin/accounts')) {
        return this.handleAccountFallback(endpoint, options) as Promise<T>;
      }
      throw error;
    }
  }

  private async handleAccountFallback(endpoint: string, options: RequestInit): Promise<any> {
    const method = options.method || 'GET';
    const body = options.body ? JSON.parse(options.body as string) : null;

    if (method === 'GET') {
      return { payload: AdminServiceClass.inMemoryAccounts };
    }

    if (method === 'POST' && body) {
      const newAccount: Account = {
        id: Date.now(),
        name: body.name,
        slug: body.slug || body.name.toLowerCase().replace(/\s+/g, '-'),
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      AdminServiceClass.inMemoryAccounts.push(newAccount);
      return newAccount;
    }

    if (method === 'PATCH') {
      const idMatch = endpoint.match(/\/(\d+)(?:\/|$)/);
      const id = idMatch ? parseInt(idMatch[1]) : null;
      
      if (id && body) {
        const accountIndex = AdminServiceClass.inMemoryAccounts.findIndex(acc => acc.id === id);
        if (accountIndex !== -1) {
          if (endpoint.includes('/status')) {
            AdminServiceClass.inMemoryAccounts[accountIndex] = {
              ...AdminServiceClass.inMemoryAccounts[accountIndex],
              status: body.status,
              updated_at: new Date().toISOString()
            };
            return { id, status: body.status };
          } else {
            AdminServiceClass.inMemoryAccounts[accountIndex] = {
              ...AdminServiceClass.inMemoryAccounts[accountIndex],
              ...body,
              updated_at: new Date().toISOString()
            };
            return AdminServiceClass.inMemoryAccounts[accountIndex];
          }
        }
      }
    }

    if (method === 'DELETE') {
      const idMatch = endpoint.match(/\/(\d+)$/);
      const id = idMatch ? parseInt(idMatch[1]) : null;
      
      if (id) {
        AdminServiceClass.inMemoryAccounts = AdminServiceClass.inMemoryAccounts.filter(acc => acc.id !== id);
        return;
      }
    }

    throw new Error('Fallback operation not supported');
  }

  // Inboxes/Channels
  async listInboxes(): Promise<Channel[]> {
    return this.request<Channel[]>('/inboxes');
  }

  async createInbox(data: CreateChannelRequest): Promise<Channel> {
    // Transform to official Chatwoot payload structure
    const payload = {
      name: data.name,
      channel: {
        type: data.channel_type,
        phone_number: data.phone_number,
        provider_config: data.provider_config || {}
      },
      greeting_enabled: data.greeting_enabled,
      greeting_message: data.greeting_message,
      working_hours_enabled: data.working_hours_enabled,
      out_of_office_message: data.out_of_office_message,
      timezone: data.timezone,
      working_hours: data.working_hours
    };
    
    return this.request<Channel>('/inboxes', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateInbox(id: number, data: Partial<CreateChannelRequest>): Promise<Channel> {
    return this.request<Channel>(`/inboxes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteInbox(id: number): Promise<void> {
    await this.request(`/inboxes/${id}`, {
      method: 'DELETE',
    });
  }

  async assignInboxAgents(inboxId: number, agentIds: number[]): Promise<void> {
    await this.request(`/inboxes/${inboxId}/agents`, {
      method: 'POST',
      body: JSON.stringify({ user_ids: agentIds }),
    });
  }

  async getChannelTypes(): Promise<ChannelType[]> {
    return this.request<ChannelType[]>('/channel-types');
  }

  // Teams
  async listTeams(): Promise<Team[]> {
    return this.request<Team[]>('/teams');
  }

  async createTeam(data: CreateTeamRequest): Promise<Team> {
    return this.request<Team>('/teams', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTeam(id: number, data: Partial<CreateTeamRequest>): Promise<Team> {
    return this.request<Team>(`/teams/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTeam(id: number): Promise<void> {
    await this.request(`/teams/${id}`, {
      method: 'DELETE',
    });
  }

  async addTeamMembers(teamId: number, agentIds: number[]): Promise<void> {
    await this.request(`/teams/${teamId}/members`, {
      method: 'POST',
      body: JSON.stringify({ user_ids: agentIds }),
    });
  }

  async removeTeamMember(teamId: number, agentId: number): Promise<void> {
    await this.request(`/teams/${teamId}/members/${agentId}`, {
      method: 'DELETE',
    });
  }

  async getTeamMembers(teamId: number): Promise<Agent[]> {
    return this.request<Agent[]>(`/teams/${teamId}/members`);
  }

  // Account Users (Agents)
  async listAgents(): Promise<Agent[]> {
    return this.request<Agent[]>('/account_users');
  }

  async createAgent(data: CreateAgentRequest): Promise<Agent> {
    // Transform to official payload structure
    const payload = {
      name: data.name,
      email: data.email,
      role: data.role || 'agent',
      availability_status: 'available',
      auto_offline: false
    };
    
    return this.request<Agent>('/account_users', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateAgent(id: number, data: Partial<CreateAgentRequest>): Promise<Agent> {
    return this.request<Agent>(`/account_users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAgent(id: number): Promise<void> {
    await this.request(`/account_users/${id}`, {
      method: 'DELETE',
    });
  }

  // Labels
  async listLabels(): Promise<Label[]> {
    try {
      const labels = await this.request<Label[]>('/labels');
      // Ensure all labels have required fields with defaults
      return labels.map(label => ({
        ...label,
        slug: label.slug || this.generateSlug(label.title),
        cw_name: label.cw_name || this.generateCwName(label.account_id, label.slug || this.generateSlug(label.title)),
        status: label.status || 'active',
      }));
    } catch (error) {
      // Fallback to in-memory labels
      return AdminServiceClass.inMemoryLabels;
    }
  }

  async createLabel(data: CreateLabelRequest): Promise<Label> {
    try {
      console.log('Creating label with data:', data);
      const response = await this.request<Label>('/labels', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      console.log('Label created successfully:', response);
      return response;
    } catch (error) {
      console.error('API call failed, using fallback:', error);
      // Fallback: Add to in-memory labels
      const slug = data.slug || this.generateSlug(data.title);
      const newLabel: Label = {
        id: Math.max(...AdminServiceClass.inMemoryLabels.map(l => l.id), 0) + 1,
        title: data.title,
        slug: slug,
        cw_name: this.generateCwName(data.account_id, slug),
        description: data.description,
        color: data.color,
        status: data.status || 'active',
        show_on_sidebar: true,
        account_id: data.account_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      AdminServiceClass.inMemoryLabels.push(newLabel);
      console.log('Created fallback label:', newLabel);
      return newLabel;
    }
  }

  async updateLabel(id: number, data: Partial<CreateLabelRequest>): Promise<Label> {
    try {
      return this.request<Label>(`/labels/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    } catch (error) {
      // Fallback: Update in-memory label
      const labelIndex = AdminServiceClass.inMemoryLabels.findIndex(l => l.id === id);
      if (labelIndex !== -1) {
        AdminServiceClass.inMemoryLabels[labelIndex] = {
          ...AdminServiceClass.inMemoryLabels[labelIndex],
          ...data,
          updated_at: new Date().toISOString(),
        };
        return AdminServiceClass.inMemoryLabels[labelIndex];
      }
      throw new Error('Label not found');
    }
  }

  async deleteLabel(id: number): Promise<void> {
    try {
      await this.request(`/labels/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      // Fallback: Remove from in-memory labels
      AdminServiceClass.inMemoryLabels = AdminServiceClass.inMemoryLabels.filter(l => l.id !== id);
    }
  }

  async getContactLabels(contactId: number): Promise<string[]> {
    return this.request<string[]>(`/contacts/${contactId}/labels`);
  }

  async addLabelsToContact(contactId: number, labelTitles: string[]): Promise<void> {
    // Get existing labels to merge, not replace
    const existingLabels = await this.getContactLabels(contactId);
    const allLabels = [...new Set([...existingLabels, ...labelTitles])];
    
    await this.request(`/contacts/${contactId}/labels`, {
      method: 'POST',
      body: JSON.stringify({ labels: allLabels }),
    });
  }

  async getConversationLabels(conversationId: number): Promise<string[]> {
    return this.request<string[]>(`/conversations/${conversationId}/labels`);
  }

  async addLabelsToConversation(conversationId: number, labelTitles: string[]): Promise<void> {
    // Get existing labels to merge, not replace
    const existingLabels = await this.getConversationLabels(conversationId);
    const allLabels = [...new Set([...existingLabels, ...labelTitles])];
    
    await this.request(`/conversations/${conversationId}/labels`, {
      method: 'POST',
      body: JSON.stringify({ labels: allLabels }),
    });
  }

  // Mock data storage
  private static mockAccounts: Account[] = [];
  private static mockAccountIdCounter = 1;

  // Mock data for client inboxes
  private static inMemoryInboxes: Channel[] = [
    {
      id: 1,
      name: 'WhatsApp Suporte',
      channel_type: 'whatsapp',
      phone_number: '+5511999999999',
      account_id: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 2,
      name: 'Facebook Messenger',
      channel_type: 'facebook',
      account_id: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  ];

  // Client-specific Inboxes (BFF endpoints)
  async listClientInboxes(accountId: number): Promise<Channel[]> {
    try {
      return this.bffRequest<Channel[]>(`/api/admin/accounts/${accountId}/inboxes`);
    } catch (error) {
      // Fallback to mock data
      return AdminServiceClass.inMemoryInboxes.filter(inbox => inbox.account_id === accountId);
    }
  }

  async createClientInbox(accountId: number, data: CreateChannelRequest): Promise<Channel> {
    try {
      return this.bffRequest<Channel>(`/api/admin/accounts/${accountId}/inboxes`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      // Fallback: Add to in-memory inboxes
      const newInbox: Channel = {
        id: Math.max(...AdminServiceClass.inMemoryInboxes.map(i => i.id), 0) + 1,
        name: data.name,
        channel_type: data.channel_type,
        phone_number: data.phone_number,
        account_id: accountId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      AdminServiceClass.inMemoryInboxes.push(newInbox);
      return newInbox;
    }
  }

  async updateClientInbox(accountId: number, inboxId: number, data: Partial<CreateChannelRequest>): Promise<Channel> {
    try {
      return this.bffRequest<Channel>(`/api/admin/accounts/${accountId}/inboxes/${inboxId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    } catch (error) {
      // Fallback: Update in-memory inbox
      const inboxIndex = AdminServiceClass.inMemoryInboxes.findIndex(i => i.id === inboxId && i.account_id === accountId);
      if (inboxIndex !== -1) {
        AdminServiceClass.inMemoryInboxes[inboxIndex] = {
          ...AdminServiceClass.inMemoryInboxes[inboxIndex],
          ...data,
          updated_at: new Date().toISOString(),
        };
        return AdminServiceClass.inMemoryInboxes[inboxIndex];
      }
      throw new Error('Inbox not found');
    }
  }

  async deleteClientInbox(accountId: number, inboxId: number): Promise<void> {
    try {
      await this.bffRequest<void>(`/api/admin/accounts/${accountId}/inboxes/${inboxId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      // Fallback: Remove from in-memory inboxes
      AdminServiceClass.inMemoryInboxes = AdminServiceClass.inMemoryInboxes.filter(
        i => !(i.id === inboxId && i.account_id === accountId)
      );
    }
  }

  // Integrations - WhatsApp Cloud
  async startWaCloudIntegration(accountId: number, name: string): Promise<{ authorization_url: string }> {
    // Initiates OAuth flow on the BFF; never exposes tokens to the frontend
    return this.bffRequest<{ authorization_url: string }>(`/api/admin/integrations/wa-cloud/start`, {
      method: 'POST',
      body: JSON.stringify({ accountId, name }),
    });
  }

  async assignClientInboxMembers(accountId: number, inboxId: number, agentIds: number[]): Promise<void> {
    try {
      await this.bffRequest<void>(`/api/admin/accounts/${accountId}/inboxes/${inboxId}/members`, {
        method: 'POST',
        body: JSON.stringify({ user_ids: agentIds }),
      });
    } catch (error) {
      // Fallback: no-op in mock mode
      console.warn('Assign members fallback (mock):', { accountId, inboxId, agentIds });
    }
  }

  // Use BFF endpoints for account management
  async listAccounts(query?: ClientQuery): Promise<Account[]> {
    const params = new URLSearchParams();
    if (query?.name) params.append('name', query.name);
    if (query?.status) params.append('status', query.status);
    
    const response = await this.bffRequest<{ payload: Account[] }>(`/api/admin/accounts?${params}`);
    return response.payload;
  }

  async createAccount(data: CreateAccountRequest): Promise<Account> {
    return this.bffRequest<Account>('/api/admin/accounts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAccount(id: number, data: UpdateAccountRequest): Promise<Account> {
    return this.bffRequest<Account>(`/api/admin/accounts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async updateAccountStatus(id: number, status: 'active' | 'inactive'): Promise<{ id: number; status: string }> {
    return this.bffRequest<{ id: number; status: string }>(`/api/admin/accounts/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async deleteAccount(id: number): Promise<void> {
    await this.bffRequest<void>(`/api/admin/accounts/${id}`, {
      method: 'DELETE',
    });
  }

  // Facebook Integration
  async startFacebookIntegration(accountId: number, name: string): Promise<{ authorization_url: string }> {
    try {
      return await this.bffRequest<{ authorization_url: string }>(`/integrations/facebook/start`, {
        method: 'POST',
        body: JSON.stringify({ accountId, name }),
      });
    } catch (error) {
      // Mock fallback for prototype
      console.log('Using mock Facebook integration');
      return {
        authorization_url: `https://www.facebook.com/v18.0/dialog/oauth?client_id=mock&redirect_uri=${encodeURIComponent(window.location.origin)}/admin/inboxes&state=${btoa(JSON.stringify({ type: 'facebook', accountId, name }))}&scope=pages_manage_metadata,pages_messaging`
      };
    }
  }

  async listFacebookPages(accountId: number): Promise<{ id: string; name: string; followers_count?: number; picture?: string }[]> {
    try {
      return await this.bffRequest<{ id: string; name: string; followers_count?: number; picture?: string }[]>(`/integrations/facebook/pages?accountId=${accountId}`);
    } catch (error) {
      // Mock fallback for prototype
      console.log('Using mock Facebook pages');
      return [
        {
          id: 'page_1',
          name: 'Empresa Demo',
          followers_count: 1250,
          picture: 'https://via.placeholder.com/50x50?text=ED'
        },
        {
          id: 'page_2', 
          name: 'Loja Virtual',
          followers_count: 3400,
          picture: 'https://via.placeholder.com/50x50?text=LV'
        },
        {
          id: 'page_3',
          name: 'Suporte Técnico',
          followers_count: 890,
          picture: 'https://via.placeholder.com/50x50?text=ST'
        }
      ];
    }
  }

  async selectFacebookPage(accountId: number, pageId: string, inboxName: string): Promise<Channel> {
    try {
      return await this.bffRequest<Channel>(`/integrations/facebook/select-page`, {
        method: 'POST',
        body: JSON.stringify({ accountId, page_id: pageId, inbox_name: inboxName }),
      });
    } catch (error) {
      // Mock fallback for prototype
      console.log('Using mock Facebook page selection');
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API delay
      
      const mockInbox: Channel = {
        id: Date.now(),
        name: inboxName,
        channel_type: 'Channel::FacebookPage',
        webhook_url: `https://app.chatwoot.com/webhooks/facebook/${pageId}`,
        phone_number: null,
        provider_config: {
          page_id: pageId,
          page_access_token: '[HIDDEN]' // Never expose real tokens
        },
        working_hours_enabled: false,
        working_hours: null,
        timezone: 'UTC',
        greeting_enabled: true,
        greeting_message: 'Olá! Como podemos ajudar você hoje?',
        out_of_office_message: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        account_id: accountId
      };

      return mockInbox;
    }
  }

  // Instagram Integration Methods
  async startInstagramIntegration(accountId: number, name: string): Promise<{ authorization_url: string }> {
    try {
      const response = await this.bffRequest<{ authorization_url: string }>('/integrations/instagram/start', {
        method: 'POST',
        body: JSON.stringify({
          accountId,
          inbox_name: name
        })
      });
      return response;
    } catch (error) {
      // Mock fallback for prototype
      console.log('Using mock Instagram integration');
      const state = btoa(JSON.stringify({ type: 'instagram', accountId, name }));
      return {
        authorization_url: `https://api.instagram.com/oauth/authorize?client_id=mock&redirect_uri=${encodeURIComponent(window.location.origin)}/admin/inboxes&state=${state}&scope=instagram_basic,pages_show_list,business_management`
      };
    }
  }

  async listInstagramAccounts(accountId: number): Promise<Array<{
    ig_business_account_id: string;
    username: string;
    name: string;
    profile_picture_url: string;
    followers_count: number;
    page_id: string;
    page_name: string;
  }>> {
    try {
      return await this.bffRequest<Array<{
        ig_business_account_id: string;
        username: string;
        name: string;
        profile_picture_url: string;
        followers_count: number;
        page_id: string;
        page_name: string;
      }>>(`/integrations/instagram/accounts?accountId=${accountId}`);
    } catch (error) {
      // Mock fallback for prototype
      console.log('Using mock Instagram accounts');
      return [
        {
          ig_business_account_id: 'ig_123456789',
          username: 'solabs_official',
          name: 'SoLabs',
          profile_picture_url: 'https://via.placeholder.com/150x150?text=SL',
          followers_count: 25000,
          page_id: 'page_123',
          page_name: 'SoLabs Page'
        },
        {
          ig_business_account_id: 'ig_987654321', 
          username: 'solabs_support',
          name: 'SoLabs Support',
          profile_picture_url: 'https://via.placeholder.com/150x150?text=SS',
          followers_count: 12500,
          page_id: 'page_456',
          page_name: 'SoLabs Support Page'
        },
        {
          ig_business_account_id: 'ig_555444333',
          username: 'solabs_sales',
          name: 'SoLabs Vendas',
          profile_picture_url: 'https://via.placeholder.com/150x150?text=SV',
          followers_count: 8750,
          page_id: 'page_789',
          page_name: 'SoLabs Sales Page'
        }
      ];
    }
  }

  async selectInstagramAccount(accountId: number, igBusinessAccountId: string, inboxName: string): Promise<Channel> {
    try {
      const response = await this.bffRequest<Channel>('/integrations/instagram/select-ig', {
        method: 'POST',
        body: JSON.stringify({
          accountId,
          ig_business_account_id: igBusinessAccountId,
          inbox_name: inboxName
        })
      });
      return response;
    } catch (error) {
      // Mock fallback for prototype
      console.log('Creating mock Instagram inbox');
      const newInbox: Channel = {
        id: Date.now(),
        account_id: accountId,
        name: inboxName,
        channel_type: 'Channel::InstagramDirect',
        webhook_url: `https://graph.facebook.com/v18.0/${igBusinessAccountId}/subscribed_apps`,
        greeting_enabled: true,
        greeting_message: 'Olá! Como podemos ajudar via Instagram?',
        working_hours_enabled: false,
        out_of_office_message: 'Estamos fora do horário comercial.',
        timezone: 'America/Sao_Paulo',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      return newInbox;
    }
  }

  // Credentials
  async listCredentials(): Promise<Array<{ id: string; name: string; description?: string; created_at: string }>> {
    return this.request('/credentials');
  }

  // Audit Logs
  async getAuditLogs(filters = {}, page = 1): Promise<import('../models/audit').AuditLogResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      ...Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== undefined && value !== null && value !== '')
      )
    });

    return this.request(`/api/admin/audit-logs?${params}`);
  }

  async getAuditLog(id: number): Promise<import('../models/audit').AuditLog> {
    return this.request(`/api/admin/audit-logs/${id}`);
  }

  async exportAuditLogs(request: import('../models/audit').AuditExportRequest): Promise<string> {
    const params = new URLSearchParams({
      format: request.format,
      ...Object.fromEntries(
        Object.entries(request.filters || {}).filter(([_, value]) => value !== undefined && value !== null && value !== '')
      )
    });

    // Use raw fetch to get text (CSV/JSON) instead of JSON parsing
    const headers = await this.getHeaders();
    const url = `${this.config.apiBaseUrl}/api/v1/accounts/${this.config.chatwootAccountId}/api/admin/audit-logs/export?${params}`;
    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    return response.text();
  }

  async validateAuditChain(accountId?: number): Promise<{ valid: boolean; error?: string }> {
    const params = accountId ? `?account_id=${accountId}` : '';
    return this.request(`/api/admin/audit-logs/validate${params}`);
  }

  // Helper methods
  private generateSlug(title: string): string {
    return title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
  }

  private generateCwName(accountId: number, slug: string): string {
    return `acc${accountId}_${slug}`;
  }
}

// Hook to create service instance with current config
export const useAdminService = () => {
  const config = useAdminClient();
  
  // Memoize the service instance to prevent recreation
  const serviceRef = React.useRef<AdminServiceClass | null>(null);
  const configRef = React.useRef(config);
  
  // Only create new instance if config changed
  if (!serviceRef.current || configRef.current !== config) {
    serviceRef.current = new AdminServiceClass(config);
    configRef.current = config;
  }
  
  return serviceRef.current;
};