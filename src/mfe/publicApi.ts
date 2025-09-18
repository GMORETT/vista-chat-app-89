import { mountOperator, mountAdmin, unmount } from './bootstrap';
import { SolabsMessagesAPI } from './types';

const API_VERSION = '1.0.0';

const SolabsMessages: SolabsMessagesAPI = {
  mountOperator,
  mountAdmin,
  unmount,
  version: API_VERSION,
};

// Expose global API
if (typeof window !== 'undefined') {
  window.SolabsMessages = SolabsMessages;
}

export default SolabsMessages;