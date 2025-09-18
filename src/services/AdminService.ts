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
    return this.request<Label[]>('/labels');
  }

  async createLabel(data: CreateLabelRequest): Promise<Label> {
    return this.request<Label>('/labels', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateLabel(id: number, data: Partial<CreateLabelRequest>): Promise<Label> {
    return this.request<Label>(`/labels/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteLabel(id: number): Promise<void> {
    await this.request(`/labels/${id}`, {
      method: 'DELETE',
    });
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

  // Accounts (Client Management)
  async listAccounts(query?: ClientQuery): Promise<Account[]> {
    const queryParams = new URLSearchParams();
    if (query?.page) queryParams.append('page', query.page.toString());
    if (query?.name) queryParams.append('name', query.name);
    if (query?.status) queryParams.append('status', query.status);
    if (query?.sort) queryParams.append('sort', query.sort);
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/accounts?${queryString}` : '/accounts';
    return this.request<Account[]>(endpoint);
  }

  async createAccount(data: CreateAccountRequest): Promise<Account> {
    return this.request<Account>('/accounts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAccount(id: number, data: UpdateAccountRequest): Promise<Account> {
    return this.request<Account>(`/accounts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAccount(id: number): Promise<void> {
    await this.request(`/accounts/${id}`, {
      method: 'DELETE',
    });
  }

  // Credentials
  async listCredentials(): Promise<Array<{ id: string; name: string; description?: string; created_at: string }>> {
    return this.request('/credentials');
  }
}

// Hook to create service instance with current config
export const useAdminService = () => {
  const config = useAdminClient();
  return new AdminServiceClass(config);
};