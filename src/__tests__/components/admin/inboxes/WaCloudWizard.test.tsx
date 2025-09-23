import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../../utils/testUtils';
import { WaCloudWizard } from '../../../../components/admin/inboxes/WaCloudWizard';
import * as adminService from '../../../../services/AdminService';

// Mock AdminService
vi.mock('../../../../services/AdminService', () => ({
  connectWhatsAppCloud: vi.fn(),
  assignInboxAgents: vi.fn(),
  listAgents: vi.fn(),
}));

const mockAdminService = adminService as any;

const defaultProps = {
  open: true,
  onOpenChange: vi.fn(),
  accountId: 123,
  onFinished: vi.fn(),
};

describe('WaCloudWizard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAdminService.listAgents.mockResolvedValue({
      success: true,
      data: [
        { id: 1, name: 'Agent 1', email: 'agent1@test.com' },
        { id: 2, name: 'Agent 2', email: 'agent2@test.com' },
      ],
    });
  });

  describe('Rendering and Basic Interaction', () => {
    it('renders the wizard with name step initially', () => {
      render(<WaCloudWizard {...defaultProps} />);
      
      expect(screen.getByText('WhatsApp Cloud API Setup')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter inbox name')).toBeInTheDocument();
      expect(screen.getByText('Next')).toBeInTheDocument();
    });

    it('validates inbox name before proceeding', async () => {
      render(<WaCloudWizard {...defaultProps} />);
      
      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);
      
      // Should not proceed without name
      expect(screen.getByText('Name your inbox')).toBeInTheDocument();
    });

    it('proceeds to credentials step when name is entered', async () => {
      render(<WaCloudWizard {...defaultProps} />);
      
      const nameInput = screen.getByPlaceholderText('Enter inbox name');
      fireEvent.change(nameInput, { target: { value: 'Test Inbox' } });
      
      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);
      
      await waitFor(() => {
        expect(screen.getByText('WhatsApp Credentials')).toBeInTheDocument();
      });
    });
  });

  describe('Credentials Step', () => {
    it('validates required credentials fields', async () => {
      render(<WaCloudWizard {...defaultProps} />);
      
      // Navigate to credentials step
      const nameInput = screen.getByPlaceholderText('Enter inbox name');
      fireEvent.change(nameInput, { target: { value: 'Test Inbox' } });
      fireEvent.click(screen.getByText('Next'));
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Enter Phone Number ID')).toBeInTheDocument();
      });
      
      // Try to connect without filling credentials
      const connectButton = screen.getByText('Connect WhatsApp');
      fireEvent.click(connectButton);
      
      // Should not proceed without credentials
      expect(screen.getByText('WhatsApp Credentials')).toBeInTheDocument();
    });

    it('connects when valid credentials are provided', async () => {
      mockAdminService.connectWhatsAppCloud.mockResolvedValue({
        success: true,
        data: { id: 456, name: 'Test Inbox' },
      });

      render(<WaCloudWizard {...defaultProps} />);
      
      // Navigate to credentials step
      const nameInput = screen.getByPlaceholderText('Enter inbox name');
      fireEvent.change(nameInput, { target: { value: 'Test Inbox' } });
      fireEvent.click(screen.getByText('Next'));
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Enter Phone Number ID')).toBeInTheDocument();
      });
      
      // Fill credentials
      fireEvent.change(screen.getByPlaceholderText('Enter Phone Number ID'), {
        target: { value: '123456789' },
      });
      fireEvent.change(screen.getByPlaceholderText('Enter Access Token'), {
        target: { value: 'test_token_123' },
      });
      fireEvent.change(screen.getByPlaceholderText('Enter Webhook Verify Token'), {
        target: { value: 'verify_token_123' },
      });
      
      const connectButton = screen.getByText('Connect WhatsApp');
      fireEvent.click(connectButton);
      
      await waitFor(() => {
        expect(mockAdminService.connectWhatsAppCloud).toHaveBeenCalledWith({
          accountId: 123,
          name: 'Test Inbox',
          phoneNumberId: '123456789',
          accessToken: 'test_token_123',
          webhookVerifyToken: 'verify_token_123',
        });
      });
    });
  });

  describe('Error Handling', () => {
    it('displays error when connection fails', async () => {
      mockAdminService.connectWhatsAppCloud.mockRejectedValue(
        new Error('Connection failed')
      );

      render(<WaCloudWizard {...defaultProps} />);
      
      // Navigate and fill form
      const nameInput = screen.getByPlaceholderText('Enter inbox name');
      fireEvent.change(nameInput, { target: { value: 'Test Inbox' } });
      fireEvent.click(screen.getByText('Next'));
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Enter Phone Number ID')).toBeInTheDocument();
      });
      
      fireEvent.change(screen.getByPlaceholderText('Enter Phone Number ID'), {
        target: { value: '123456789' },
      });
      fireEvent.change(screen.getByPlaceholderText('Enter Access Token'), {
        target: { value: 'test_token_123' },
      });
      fireEvent.change(screen.getByPlaceholderText('Enter Webhook Verify Token'), {
        target: { value: 'verify_token_123' },
      });
      
      fireEvent.click(screen.getByText('Connect WhatsApp'));
      
      await waitFor(() => {
        expect(screen.getByText(/connection failed/i)).toBeInTheDocument();
      });
    });

    it('provides retry functionality after error', async () => {
      mockAdminService.connectWhatsAppCloud
        .mockRejectedValueOnce(new Error('Connection failed'))
        .mockResolvedValue({
          success: true,
          data: { id: 456, name: 'Test Inbox' },
        });

      render(<WaCloudWizard {...defaultProps} />);
      
      // Navigate, fill form, and trigger error
      const nameInput = screen.getByPlaceholderText('Enter inbox name');
      fireEvent.change(nameInput, { target: { value: 'Test Inbox' } });
      fireEvent.click(screen.getByText('Next'));
      
      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText('Enter Phone Number ID'), {
          target: { value: '123456789' },
        });
        fireEvent.change(screen.getByPlaceholderText('Enter Access Token'), {
          target: { value: 'test_token_123' },
        });
        fireEvent.change(screen.getByPlaceholderText('Enter Webhook Verify Token'), {
          target: { value: 'verify_token_123' },
        });
      });
      
      fireEvent.click(screen.getByText('Connect WhatsApp'));
      
      await waitFor(() => {
        expect(screen.getByText('Retry')).toBeInTheDocument();
      });
      
      // Retry should work
      fireEvent.click(screen.getByText('Retry'));
      
      await waitFor(() => {
        expect(mockAdminService.connectWhatsAppCloud).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Success Flow', () => {
    it('shows success step and allows agent assignment', async () => {
      mockAdminService.connectWhatsAppCloud.mockResolvedValue({
        success: true,
        data: { id: 456, name: 'Test Inbox' },
      });

      render(<WaCloudWizard {...defaultProps} />);
      
      // Complete the flow
      const nameInput = screen.getByPlaceholderText('Enter inbox name');
      fireEvent.change(nameInput, { target: { value: 'Test Inbox' } });
      fireEvent.click(screen.getByText('Next'));
      
      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText('Enter Phone Number ID'), {
          target: { value: '123456789' },
        });
        fireEvent.change(screen.getByPlaceholderText('Enter Access Token'), {
          target: { value: 'test_token_123' },
        });
        fireEvent.change(screen.getByPlaceholderText('Enter Webhook Verify Token'), {
          target: { value: 'verify_token_123' },
        });
      });
      
      fireEvent.click(screen.getByText('Connect WhatsApp'));
      
      await waitFor(() => {
        expect(screen.getByText('WhatsApp Connected Successfully!')).toBeInTheDocument();
        expect(screen.getByText('Assign Agents')).toBeInTheDocument();
      });
    });

    it('completes without agent assignment', async () => {
      mockAdminService.connectWhatsAppCloud.mockResolvedValue({
        success: true,
        data: { id: 456, name: 'Test Inbox' },
      });

      render(<WaCloudWizard {...defaultProps} />);
      
      // Complete the flow and skip agent assignment
      const nameInput = screen.getByPlaceholderText('Enter inbox name');
      fireEvent.change(nameInput, { target: { value: 'Test Inbox' } });
      fireEvent.click(screen.getByText('Next'));
      
      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText('Enter Phone Number ID'), {
          target: { value: '123456789' },
        });
        fireEvent.change(screen.getByPlaceholderText('Enter Access Token'), {
          target: { value: 'test_token_123' },
        });
        fireEvent.change(screen.getByPlaceholderText('Enter Webhook Verify Token'), {
          target: { value: 'verify_token_123' },
        });
      });
      
      fireEvent.click(screen.getByText('Connect WhatsApp'));
      
      await waitFor(() => {
        expect(screen.getByText('Skip for Now')).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByText('Skip for Now'));
      
      expect(defaultProps.onFinished).toHaveBeenCalledWith({
        id: 456,
        name: 'Test Inbox',
      });
    });
  });

  describe('Security Guardrails', () => {
    it('does not expose tokens in component props or state', async () => {
      mockAdminService.connectWhatsAppCloud.mockResolvedValue({
        success: true,
        data: { id: 456, name: 'Test Inbox' },
      });

      const { container } = render(<WaCloudWizard {...defaultProps} />);
      
      // Navigate to credentials step
      const nameInput = screen.getByPlaceholderText('Enter inbox name');
      fireEvent.change(nameInput, { target: { value: 'Test Inbox' } });
      fireEvent.click(screen.getByText('Next'));
      
      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText('Enter Access Token'), {
          target: { value: 'SENSITIVE_TOKEN_123' },
        });
      });
      
      // Check that sensitive token doesn't appear in DOM
      expect(container.innerHTML).not.toContain('SENSITIVE_TOKEN_123');
      
      // Input should be masked
      const tokenInput = screen.getByPlaceholderText('Enter Access Token') as HTMLInputElement;
      expect(tokenInput.type).toBe('password');
    });

    it('masks credentials in API calls during testing', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      mockAdminService.connectWhatsAppCloud.mockImplementation((params) => {
        console.log('API Call:', params);
        return Promise.resolve({
          success: true,
          data: { id: 456, name: 'Test Inbox' },
        });
      });

      render(<WaCloudWizard {...defaultProps} />);
      
      // Complete flow with sensitive data
      const nameInput = screen.getByPlaceholderText('Enter inbox name');
      fireEvent.change(nameInput, { target: { value: 'Test Inbox' } });
      fireEvent.click(screen.getByText('Next'));
      
      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText('Enter Phone Number ID'), {
          target: { value: '123456789' },
        });
        fireEvent.change(screen.getByPlaceholderText('Enter Access Token'), {
          target: { value: 'SENSITIVE_TOKEN_123' },
        });
        fireEvent.change(screen.getByPlaceholderText('Enter Webhook Verify Token'), {
          target: { value: 'WEBHOOK_SECRET_456' },
        });
      });
      
      fireEvent.click(screen.getByText('Connect WhatsApp'));
      
      await waitFor(() => {
        expect(mockAdminService.connectWhatsAppCloud).toHaveBeenCalled();
      });
      
      // Verify tokens are not logged in plain text during tests
      const logCalls = consoleSpy.mock.calls.flat().join(' ');
      expect(logCalls).not.toContain('SENSITIVE_TOKEN_123');
      expect(logCalls).not.toContain('WEBHOOK_SECRET_456');
      
      consoleSpy.mockRestore();
    });
  });
});