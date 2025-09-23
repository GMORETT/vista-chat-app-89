export interface AuditLog {
  id: number;
  request_id: string;
  timestamp: string;
  actor_id: number | null;
  actor_role: 'super_admin' | 'admin' | 'user' | 'unknown';
  actor_ip: string;
  entity_type: 'account' | 'inbox' | 'label' | 'agent' | 'team';
  action: 'create' | 'update' | 'delete';
  account_id: number | null;
  cw_entity_id: number | null;
  before: any;
  after: any;
  success: boolean;
  error_message: string | null;
  hash: string;
  prev_hash: string | null;
}

export interface AuditLogFilters {
  account_id?: number;
  actor_id?: number;
  actor_role?: string;
  entity_type?: string;
  action?: string;
  success?: boolean;
  start_date?: string;
  end_date?: string;
}

export interface AuditLogResponse {
  payload: AuditLog[];
  meta: {
    current_page: number;
    next_page: number | null;
    prev_page: number | null;
    total_pages: number;
    total_count: number;
  };
}

export interface AuditExportRequest {
  format: 'csv' | 'json';
  filters?: AuditLogFilters;
}

export type AuditEntityType = 'account' | 'inbox' | 'label' | 'agent' | 'team';
export type AuditAction = 'create' | 'update' | 'delete';
export type ActorRole = 'super_admin' | 'admin' | 'user' | 'unknown';