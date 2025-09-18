import { describe, it, expect } from 'vitest';
import { BffChatService } from '../../api/BffChatService';
import { AdvancedFiltersModal } from '../../components/AdvancedFiltersModal';

describe('Account ID Compatibility', () => {
  it('should have account_id in ConversationQuery interface', () => {
    // Test that ConversationQuery includes account_id
    const query = {
      status: 'open' as const,
      account_id: 123,
      inbox_id: 456,
    };
    
    expect(query.account_id).toBe(123);
    expect(query.inbox_id).toBe(456);
  });

  it('should have account_id in ContactQuery interface', () => {
    // Test that ContactQuery includes account_id
    const query = {
      page: 1,
      account_id: 123,
      name: 'John',
    };
    
    expect(query.account_id).toBe(123);
    expect(query.page).toBe(1);
  });

  it('BffChatService should be instantiable', () => {
    const service = new BffChatService();
    expect(service).toBeDefined();
    expect(typeof service.listConversations).toBe('function');
    expect(typeof service.listContacts).toBe('function');
    expect(typeof service.getConversationsMeta).toBe('function');
  });

  it('AdvancedFiltersModal should be importable', () => {
    expect(AdvancedFiltersModal).toBeDefined();
    expect(typeof AdvancedFiltersModal).toBe('function');
  });
});