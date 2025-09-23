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
  
  // In-memory storage for mock data
  private static mockTeams: Team[] = [
    {
      id: 1,
      name: 'Suporte Técnico',
      description: 'Team responsável pelo atendimento de questões técnicas',
      allow_auto_assign: true,
      account_id: 1,
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z',
    },
    {
      id: 2,
      name: 'Vendas',
      description: 'Team de vendas e relacionamento com clientes',
      allow_auto_assign: false,
      account_id: 1,
      created_at: '2024-01-20T14:30:00Z',
      updated_at: '2024-01-20T14:30:00Z',
    },
  ];

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
      account_id: data.account_id || 1,
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  async deleteChannel(id: number): Promise<void> {
    // Mock implementation
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
  async getTeams(): Promise<Team[]> { 
    return [...AdminChatService.mockTeams]; 
  }
  
  async createTeam(data: CreateTeamRequest): Promise<Team> {
    const newTeam: Team = { 
      id: Date.now(), 
      ...data, 
      allow_auto_assign: data.allow_auto_assign ?? false, 
      created_at: new Date().toISOString(), 
      updated_at: new Date().toISOString() 
    };
    AdminChatService.mockTeams.push(newTeam);
    return newTeam;
  }
  
  async updateTeam(id: number, data: Partial<CreateTeamRequest>): Promise<Team> {
    const teamIndex = AdminChatService.mockTeams.findIndex(team => team.id === id);
    if (teamIndex !== -1) {
      const updatedTeam = { 
        ...AdminChatService.mockTeams[teamIndex], 
        ...data, 
        updated_at: new Date().toISOString() 
      };
      AdminChatService.mockTeams[teamIndex] = updatedTeam;
      return updatedTeam;
    }
    throw new Error('Team not found');
  }
  
  async deleteTeam(id: number): Promise<void> { 
    const teamIndex = AdminChatService.mockTeams.findIndex(team => team.id === id);
    if (teamIndex !== -1) {
      AdminChatService.mockTeams.splice(teamIndex, 1);
    }
  }
  async getTeamMembers(teamId: number): Promise<TeamMember[]> { return []; }
  async addTeamMember(teamId: number, agentIds: number[]): Promise<void> { /* Mock implementation */ }
  async removeTeamMember(teamId: number, agentId: number): Promise<void> { /* Mock implementation */ }

  // Agents - Mock implementations  
  async getAgents(): Promise<Agent[]> { 
    // Return mock agents in admin format
    return [
      { id: 1, name: 'Samuel França', display_name: 'Samuel França', email: 'samuel@empresa.com', role: 'user', confirmed: true, availability_status: 'available', auto_offline: true, assigned_inboxes: [1], created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z', account_id: 1 },
      { id: 2, name: 'Marina Costa', display_name: 'Marina Costa', email: 'marina@empresa.com', role: 'admin', confirmed: true, availability_status: 'available', auto_offline: true, assigned_inboxes: [1, 2], created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z', account_id: 1 },
      { id: 3, name: 'Rafael Duarte', display_name: 'Rafael Duarte', email: 'rafael@empresa.com', role: 'user', confirmed: true, availability_status: 'offline', auto_offline: true, assigned_inboxes: [2], created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z', account_id: 1 },
      { id: 4, name: 'Camila Barros', display_name: 'Camila Barros', email: 'camila@empresa.com', role: 'user', confirmed: true, availability_status: 'available', auto_offline: true, assigned_inboxes: [1], created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z', account_id: 1 },
      { id: 5, name: 'Diego Fernandes', display_name: 'Diego Fernandes', email: 'diego@empresa.com', role: 'super_admin', confirmed: true, availability_status: 'available', auto_offline: true, assigned_inboxes: [], created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z', account_id: null },
    ];
  }
  async createAgent(data: CreateAgentRequest): Promise<Agent> {
    return { id: Date.now(), ...data, role: data.role || 'user', confirmed: false, availability_status: 'offline', auto_offline: false, assigned_inboxes: [], created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
  }
  async updateAgent(id: number, data: Partial<CreateAgentRequest>): Promise<Agent> {
    return { id, name: '', email: '', account_id: data.account_id || 1, ...data, role: 'user', confirmed: true, availability_status: 'available', auto_offline: false, assigned_inboxes: [], created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
  }
  async deleteAgent(id: number): Promise<void> { /* Mock implementation */ }

  // Labels - Mock implementations
  async getLabels(): Promise<Label[]> { return []; }
  async createLabel(data: CreateLabelRequest): Promise<Label> {
    const slug = data.slug || data.title.toLowerCase().replace(/\s+/g, '-');
    return { 
      id: Date.now(), 
      ...data, 
      slug: slug,
      cw_name: `acc${data.account_id}_${slug}`,
      status: data.status || 'active',
      show_on_sidebar: true,
      created_at: new Date().toISOString(), 
      updated_at: new Date().toISOString() 
    };
  }
  async updateLabel(id: number, data: Partial<CreateLabelRequest>): Promise<Label> {
    const slug = data.slug || data.title?.toLowerCase().replace(/\s+/g, '-') || 'default';
    return { 
      id, 
      title: data.title || 'Default Title', 
      slug: slug,
      cw_name: `acc${data.account_id || 1}_${slug}`,
      account_id: data.account_id || 1, 
      ...data, 
      color: data.color || '#6b7280', 
      status: data.status || 'active',
      show_on_sidebar: true, 
      created_at: new Date().toISOString(), 
      updated_at: new Date().toISOString() 
    };
  }
  async deleteLabel(id: number): Promise<void> { /* Mock implementation */ }
  async applyLabelToConversation(conversationId: number, labelIds: number[]): Promise<void> { /* Mock implementation */ }
  async applyLabelToContact(contactId: number, labelIds: number[]): Promise<void> { /* Mock implementation */ }
}