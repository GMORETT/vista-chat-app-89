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
  account_id: number;
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
  account_id: number;
}

export interface Team {
  id: number;
  name: string;
  description?: string;
  allow_auto_assign: boolean;
  account_id: number;
  created_at: string;
  updated_at: string;
}

export interface CreateTeamRequest {
  name: string;
  description?: string;
  allow_auto_assign?: boolean;
  account_id: number;
}

export interface Agent {
  id: number;
  name: string;
  display_name?: string;
  email: string;
  role: 'super_admin' | 'admin' | 'user';
  confirmed: boolean;
  availability_status: 'available' | 'busy' | 'offline';
  auto_offline: boolean;
  custom_attributes?: Record<string, any>;
  assigned_inboxes?: number[];
  created_at: string;
  updated_at: string;
  account_id?: number | null; // null for super_admin
}

export interface CreateAgentRequest {
  name: string;
  display_name?: string;
  email: string;
  role?: 'super_admin' | 'admin' | 'user';
  password?: string;
  custom_attributes?: Record<string, any>;
  account_id?: number | null; // null for super_admin
}

export interface UpdateAgentRequest {
  display_name?: string;
  availability_status?: 'available' | 'busy' | 'offline';
}

export interface Label {
  id: number;
  title: string;
  slug: string;
  cw_name: string;
  description?: string;
  color: string;
  status: 'active' | 'inactive';
  show_on_sidebar: boolean;
  created_at: string;
  updated_at: string;
  account_id: number;
}

export interface CreateLabelRequest {
  title: string;
  slug?: string;
  description?: string;
  color: string;
  status?: 'active' | 'inactive';
  account_id: number;
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