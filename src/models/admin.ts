export interface Channel {
  id: number;
  name: string;
  channel_type: string;
  webhook_url?: string;
  phone_number?: string;
  provider?: string;
  provider_config?: Record<string, any>;
  greeting_enabled?: boolean;
  greeting_message?: string;
  working_hours_enabled?: boolean;
  out_of_office_message?: string;
  timezone?: string;
  working_hours?: Array<{
    day_of_week: number;
    open_hour: number;
    open_minutes: number;
    close_hour: number;
    close_minutes: number;
  }>;
  created_at: string;
  updated_at: string;
}

export interface CreateChannelRequest {
  name: string;
  channel_type: string;
  webhook_url?: string;
  phone_number?: string;
  provider?: string;
  provider_config?: Record<string, any>;
  greeting_enabled?: boolean;
  greeting_message?: string;
  working_hours_enabled?: boolean;
  out_of_office_message?: string;
  timezone?: string;
  working_hours?: Array<{
    day_of_week: number;
    open_hour: number;
    open_minutes: number;
    close_hour: number;
    close_minutes: number;
  }>;
}

export interface Team {
  id: number;
  name: string;
  description?: string;
  allow_auto_assign: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateTeamRequest {
  name: string;
  description?: string;
  allow_auto_assign?: boolean;
}

export interface Agent {
  id: number;
  name: string;
  display_name?: string;
  email: string;
  role: 'agent' | 'administrator';
  confirmed: boolean;
  availability_status: 'available' | 'busy' | 'offline';
  auto_offline: boolean;
  custom_attributes?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CreateAgentRequest {
  name: string;
  display_name?: string;
  email: string;
  role?: 'agent' | 'administrator';
  password?: string;
  custom_attributes?: Record<string, any>;
}

export interface UpdateAgentRequest {
  display_name?: string;
  availability_status?: 'available' | 'busy' | 'offline';
}

export interface Label {
  id: number;
  title: string;
  description?: string;
  color: string;
  show_on_sidebar: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateLabelRequest {
  title: string;
  description?: string;
  color: string;
  show_on_sidebar?: boolean;
}

export interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface ChannelType {
  id: string;
  name: string;
  description: string;
  icon: string;
  fields: Array<{
    name: string;
    label: string;
    type: 'text' | 'password' | 'select' | 'boolean' | 'textarea';
    required: boolean;
    sensitive?: boolean;
    options?: Array<{ value: string; label: string }>;
    placeholder?: string;
    description?: string;
  }>;
}