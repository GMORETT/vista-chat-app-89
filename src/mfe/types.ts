export interface MountOptions {
  basePath?: string;
  apiBaseUrl?: string;
  authToken?: string;
  theme?: 'light' | 'dark';
  locale?: string;
  onResize?: (height: number) => void;
  onUnauthorized?: () => void;
  chatwootAccountId?: string;
  getAuthToken?: () => string | Promise<string>;
  currentUser?: {
    id: number;
    name: string;
    email: string;
    role: string;
    roles?: string[];
    account_id?: number | null;
  };
}

export interface SolabsMessagesAPI {
  mountOperator: (container: Element, options?: MountOptions) => Promise<void>;
  mountAdmin: (container: Element, options?: MountOptions) => Promise<void>;
  unmount: (container: Element) => void;
  version: string;
}

declare global {
  interface Window {
    SolabsMessages: SolabsMessagesAPI;
  }
}