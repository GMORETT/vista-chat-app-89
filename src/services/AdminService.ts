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
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
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
      return this.request<Label[]>('/labels');
    } catch (error) {
      // Fallback to in-memory labels
      return AdminServiceClass.inMemoryLabels;
    }
  }

  async createLabel(data: CreateLabelRequest): Promise<Label> {
    try {
      return this.request<Label>('/labels', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
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
        show_on_sidebar: data.show_on_sidebar || true,
        account_id: data.account_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      AdminServiceClass.inMemoryLabels.push(newLabel);
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

  // Credentials
  async listCredentials(): Promise<Array<{ id: string; name: string; description?: string; created_at: string }>> {
    return this.request('/credentials');
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