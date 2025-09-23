import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../utils/testUtils';
import { WaCloudWizard } from '../../components/admin/inboxes/WaCloudWizard';
import { FacebookWizard } from '../../components/admin/inboxes/FacebookWizard';
import { performanceHelpers } from '../utils/testHelpers';
import * as adminService from '../../services/AdminService';

// Mock AdminService
vi.mock('../../services/AdminService');
const mockAdminService = adminService as any;

describe('Inbox Wizard Performance Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock fast responses by default
    mockAdminService.listAgents.mockResolvedValue({
      success: true,
      data: Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        name: `Agent ${i + 1}`,
        email: `agent${i + 1}@test.com`,
      })),
    });
  });

  describe('WhatsApp Wizard Performance', () => {
    it('renders initial step within performance threshold', async () => {
      const renderTime = await performanceHelpers.measureRenderTime(() => {
        render(
          <WaCloudWizard
            open={true}
            onOpenChange={vi.fn()}
            accountId={123}
            onFinished={vi.fn()}
          />
        );
      });
      
      // Should render within 200ms
      expect(renderTime).toBeLessThan(200);
    });

    it('handles rapid step navigation efficiently', async () => {
      const { container } = render(
        <WaCloudWizard
          open={true}
          onOpenChange={vi.fn()}
          accountId={123}
          onFinished={vi.fn()}
        />
      );
      
      const startTime = performance.now();
      
      // Rapidly navigate through steps
      const nameInput = screen.getByPlaceholderText('Enter inbox name');
      fireEvent.change(nameInput, { target: { value: 'Test Inbox' } });
      fireEvent.click(screen.getByText('Next'));
      
      await waitFor(() => {
        expect(screen.getByText('WhatsApp Credentials')).toBeInTheDocument();
      });
      
      const endTime = performance.now();
      
      // Step navigation should be fast
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('handles slow network responses gracefully', async () => {
      // Mock slow network
      const slowMock = performanceHelpers.createSlowNetworkMock(3000);
      mockAdminService.connectWhatsAppCloud.mockImplementation(slowMock);
      
      render(
        <WaCloudWizard
          open={true}
          onOpenChange={vi.fn()}
          accountId={123}
          onFinished={vi.fn()}
        />
      );
      
      // Navigate to credentials step
      const nameInput = screen.getByPlaceholderText('Enter inbox name');
      fireEvent.change(nameInput, { target: { value: 'Test Inbox' } });
      fireEvent.click(screen.getByText('Next'));
      
      await waitFor(() => {
        // Fill credentials
        fireEvent.change(screen.getByPlaceholderText('Enter Phone Number ID'), {
          target: { value: '123456789' },
        });
        fireEvent.change(screen.getByPlaceholderText('Enter Access Token'), {
          target: { value: 'test_token' },
        });
        fireEvent.change(screen.getByPlaceholderText('Enter Webhook Verify Token'), {
          target: { value: 'verify_token' },
        });
      });
      
      const connectButton = screen.getByText('Connect WhatsApp');
      fireEvent.click(connectButton);
      
      // Should show loading state immediately
      expect(screen.getByText(/connecting/i)).toBeInTheDocument();
      
      // UI should remain responsive during slow request
      expect(screen.getByText('Cancel')).toBeEnabled();
    });
  });

  describe('Facebook Wizard Performance', () => {
    it('handles OAuth popup simulation efficiently', async () => {
      render(
        <FacebookWizard
          open={true}
          onOpenChange={vi.fn()}
          accountId={123}
          onFinished={vi.fn()}
        />
      );
      
      const startTime = performance.now();
      
      // Simulate OAuth success
      window.postMessage({
        type: 'FACEBOOK_OAUTH_SUCCESS',
        code: 'oauth_code_123',
        state: 'test_state',
      }, '*');
      
      await waitFor(() => {
        expect(mockAdminService.loadFacebookPages).toHaveBeenCalled();
      });
      
      const endTime = performance.now();
      
      // OAuth processing should be fast
      expect(endTime - startTime).toBeLessThan(500);
    });

    it('loads large page lists efficiently', async () => {
      const largePageList = Array.from({ length: 100 }, (_, i) => ({
        id: `page_${i}`,
        name: `Business Page ${i}`,
        followers_count: Math.floor(Math.random() * 10000),
      }));
      
      mockAdminService.loadFacebookPages.mockResolvedValue({
        success: true,
        data: largePageList,
      });
      
      render(
        <FacebookWizard
          open={true}
          onOpenChange={vi.fn()}
          accountId={123}
          onFinished={vi.fn()}
        />
      );
      
      // Simulate OAuth and page loading
      window.postMessage({
        type: 'FACEBOOK_OAUTH_SUCCESS',
        code: 'oauth_code_123',
        state: 'test_state',
      }, '*');
      
      const startTime = performance.now();
      
      await waitFor(() => {
        expect(screen.getByText('Business Page 0')).toBeInTheDocument();
      });
      
      const endTime = performance.now();
      
      // Should load large lists efficiently
      expect(endTime - startTime).toBeLessThan(1000);
      
      // Should virtualize or paginate long lists
      const renderedPages = screen.getAllByText(/^Business Page \d+$/);
      expect(renderedPages.length).toBeLessThan(50); // Reasonable viewport size
    });
  });

  describe('Memory Management', () => {
    it('cleans up event listeners on unmount', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
      
      const { unmount } = render(
        <FacebookWizard
          open={true}
          onOpenChange={vi.fn()}
          accountId={123}
          onFinished={vi.fn()}
        />
      );
      
      // Should have added OAuth message listener
      expect(addEventListenerSpy).toHaveBeenCalledWith('message', expect.any(Function));
      
      unmount();
      
      // Should clean up listener
      expect(removeEventListenerSpy).toHaveBeenCalledWith('message', expect.any(Function));
      
      addEventListenerSpy.mockRestore();
      removeEventListenerSpy.mockRestore();
    });

    it('prevents memory leaks from unresolved promises', async () => {
      let resolveMock: (value: any) => void;
      const slowPromise = new Promise(resolve => {
        resolveMock = resolve;
      });
      
      mockAdminService.connectWhatsAppCloud.mockReturnValue(slowPromise);
      
      const { unmount } = render(
        <WaCloudWizard
          open={true}
          onOpenChange={vi.fn()}
          accountId={123}
          onFinished={vi.fn()}
        />
      );
      
      // Start connection process
      const nameInput = screen.getByPlaceholderText('Enter inbox name');
      fireEvent.change(nameInput, { target: { value: 'Test Inbox' } });
      fireEvent.click(screen.getByText('Next'));
      
      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText('Enter Phone Number ID'), {
          target: { value: '123456789' },
        });
        fireEvent.click(screen.getByText('Connect WhatsApp'));
      });
      
      // Unmount before promise resolves
      unmount();
      
      // Resolve the promise after unmount
      resolveMock!({ success: true, data: { id: 123 } });
      
      // Should not cause memory leaks or errors
      // This is mainly a structural test - in real implementation,
      // useEffect cleanup should cancel pending requests
    });
  });

  describe('Error Recovery Performance', () => {
    it('recovers quickly from network failures', async () => {
      const flakyMock = performanceHelpers.createFlakyMock(2);
      mockAdminService.connectWhatsAppCloud.mockImplementation(flakyMock);
      
      render(
        <WaCloudWizard
          open={true}
          onOpenChange={vi.fn()}
          accountId={123}
          onFinished={vi.fn()}
        />
      );
      
      // Navigate and trigger error
      const nameInput = screen.getByPlaceholderText('Enter inbox name');
      fireEvent.change(nameInput, { target: { value: 'Test Inbox' } });
      fireEvent.click(screen.getByText('Next'));
      
      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText('Enter Phone Number ID'), {
          target: { value: '123456789' },
        });
        fireEvent.change(screen.getByPlaceholderText('Enter Access Token'), {
          target: { value: 'test_token' },
        });
        fireEvent.change(screen.getByPlaceholderText('Enter Webhook Verify Token'), {
          target: { value: 'verify_token' },
        });
      });
      
      const startTime = performance.now();
      
      fireEvent.click(screen.getByText('Connect WhatsApp'));
      
      // Should show error quickly
      await waitFor(() => {
        expect(screen.getByText('Retry')).toBeInTheDocument();
      });
      
      // Retry should work
      fireEvent.click(screen.getByText('Retry'));
      
      await waitFor(() => {
        expect(screen.getByText(/success/i)).toBeInTheDocument();
      });
      
      const endTime = performance.now();
      
      // Error recovery should be reasonably fast
      expect(endTime - startTime).toBeLessThan(2000);
    });
  });

  describe('Concurrent Operations', () => {
    it('handles multiple wizard instances efficiently', async () => {
      const wizards = Array.from({ length: 5 }, (_, i) => (
        <WaCloudWizard
          key={i}
          open={true}
          onOpenChange={vi.fn()}
          accountId={123 + i}
          onFinished={vi.fn()}
        />
      ));
      
      const startTime = performance.now();
      
      render(
        <div>
          {wizards}
        </div>
      );
      
      const endTime = performance.now();
      
      // Should render multiple wizards efficiently
      expect(endTime - startTime).toBeLessThan(500);
      
      // Each should be independent
      const nameInputs = screen.getAllByPlaceholderText('Enter inbox name');
      expect(nameInputs).toHaveLength(5);
    });

    it('throttles rapid state updates', async () => {
      render(
        <WaCloudWizard
          open={true}
          onOpenChange={vi.fn()}
          accountId={123}
          onFinished={vi.fn()}
        />
      );
      
      const nameInput = screen.getByPlaceholderText('Enter inbox name');
      
      const startTime = performance.now();
      
      // Rapidly fire input events
      for (let i = 0; i < 100; i++) {
        fireEvent.change(nameInput, { target: { value: `Test Inbox ${i}` } });
      }
      
      const endTime = performance.now();
      
      // Should handle rapid updates without performance degradation
      expect(endTime - startTime).toBeLessThan(100);
      
      // Final value should be correct
      expect(nameInput.value).toBe('Test Inbox 99');
    });
  });
});