export type SyncState = 'idle' | 'pending' | 'deleting' | 'error';

export interface OptimisticAccount {
  id: number | string;
  tempId?: string;
  name: string;
  slug: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  syncState?: SyncState;
  error?: string;
}

export interface SyncError {
  message: string;
  code?: string;
  retryable?: boolean;
}