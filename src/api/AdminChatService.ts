import { apiClient } from './client';
import { 
  Channel, CreateChannelRequest,
  Team, CreateTeamRequest,
  Agent, CreateAgentRequest,
  Label, CreateLabelRequest,
  TeamMember,
  ChannelType
} from '../models/admin';

export class AdminChatService {
  private getAuthToken: () => string | Promise<string>;
  private chatwootAccountId: string;

  constructor(
    apiBaseUrl: string,
    getAuthToken: () => string | Promise<string>,
    chatwootAccountId: string
  ) {
    this.getAuthToken = getAuthToken;
    this.chatwootAccountId = chatwootAccountId;
  }

  private async getHeaders() {
    const token = await this.getAuthToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  // Mock implementations for development
  async getChannels(): Promise<Channel[]> {
    return [];
  }

  async createChannel(data: CreateChannelRequest): Promise<Channel> {
    return {
      id: Date.now(),
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  async updateChannel(id: number, data: Partial<CreateChannelRequest>): Promise<Channel> {
    return {
      id,
      name: data.name || '',
      channel_type: data.channel_type || '',
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  async deleteChannel(id: number): Promise<void> {
    console.log('Deleting channel:', id);
  }

  async getChannelTypes(): Promise<ChannelType[]> {
    return [
      {
        id: 'website',
        name: 'Website',
        description: 'Embed chat widget on your website',
        icon: 'Globe',
        fields: [
          { name: 'name', label: 'Inbox Name', type: 'text', required: true, placeholder: 'Website Inbox' },
          { name: 'website_url', label: 'Website URL', type: 'text', required: true, placeholder: 'https://yourwebsite.com' }
        ]
      }
    ];
  }

  // Teams - Mock implementations
  async getTeams(): Promise<Team[]> { return []; }
  async createTeam(data: CreateTeamRequest): Promise<Team> {
    return { id: Date.now(), ...data, allow_auto_assign: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
  }
  async updateTeam(id: number, data: Partial<CreateTeamRequest>): Promise<Team> {
    return { id, name: '', ...data, allow_auto_assign: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
  }
  async deleteTeam(id: number): Promise<void> { console.log('Deleting team:', id); }
  async getTeamMembers(teamId: number): Promise<TeamMember[]> { return []; }
  async addTeamMember(teamId: number, agentIds: number[]): Promise<void> { console.log('Adding members:', teamId, agentIds); }
  async removeTeamMember(teamId: number, agentId: number): Promise<void> { console.log('Removing member:', teamId, agentId); }

  // Agents - Mock implementations  
  async getAgents(): Promise<Agent[]> { 
    // Return mock agents in admin format
    return [
      { id: 1, name: 'Samuel França', display_name: 'Samuel França', email: 'samuel@empresa.com', role: 'agent', confirmed: true, availability_status: 'available', auto_offline: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
      { id: 2, name: 'Marina Costa', display_name: 'Marina Costa', email: 'marina@empresa.com', role: 'agent', confirmed: true, availability_status: 'available', auto_offline: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
      { id: 3, name: 'Rafael Duarte', display_name: 'Rafael Duarte', email: 'rafael@empresa.com', role: 'agent', confirmed: true, availability_status: 'offline', auto_offline: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
      { id: 4, name: 'Camila Barros', display_name: 'Camila Barros', email: 'camila@empresa.com', role: 'agent', confirmed: true, availability_status: 'available', auto_offline: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
      { id: 5, name: 'Diego Fernandes', display_name: 'Diego Fernandes', email: 'diego@empresa.com', role: 'administrator', confirmed: true, availability_status: 'available', auto_offline: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    ];
  }
  async createAgent(data: CreateAgentRequest): Promise<Agent> {
    return { id: Date.now(), ...data, role: 'agent', confirmed: false, availability_status: 'offline', auto_offline: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
  }
  async updateAgent(id: number, data: Partial<CreateAgentRequest>): Promise<Agent> {
    return { id, name: '', email: '', ...data, role: 'agent', confirmed: true, availability_status: 'available', auto_offline: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
  }
  async deleteAgent(id: number): Promise<void> { console.log('Deleting agent:', id); }

  // Labels - Mock implementations
  async getLabels(): Promise<Label[]> { return []; }
  async createLabel(data: CreateLabelRequest): Promise<Label> {
    return { id: Date.now(), ...data, show_on_sidebar: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
  }
  async updateLabel(id: number, data: Partial<CreateLabelRequest>): Promise<Label> {
    return { id, title: '', ...data, color: '#6b7280', show_on_sidebar: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
  }
  async deleteLabel(id: number): Promise<void> { console.log('Deleting label:', id); }
  async applyLabelToConversation(conversationId: number, labelIds: number[]): Promise<void> { console.log('Applying labels to conversation:', conversationId, labelIds); }
  async applyLabelToContact(contactId: number, labelIds: number[]): Promise<void> { console.log('Applying labels to contact:', contactId, labelIds); }
}