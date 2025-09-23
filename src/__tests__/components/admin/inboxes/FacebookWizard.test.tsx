import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../../utils/testUtils';
import { FacebookWizard } from '../../../../components/admin/inboxes/FacebookWizard';
import * as adminService from '../../../../services/AdminService';

// Mock AdminService
vi.mock('../../../../services/AdminService', () => ({
  startFacebookOAuth: vi.fn(),
  loadFacebookPages: vi.fn(),
  createFacebookInbox: vi.fn(),
  listAgents: vi.fn(),
  assignInboxAgents: vi.fn(),
}));

const mockAdminService = adminService as any;

const defaultProps = {
  open: true,
  onOpenChange: vi.fn(),
  accountId: 123,
  onFinished: vi.fn(),
};

describe('FacebookWizard', () => {
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

  describe('OAuth Flow', () => {
    it('starts OAuth flow when initiated', async () => {
      mockAdminService.startFacebookOAuth.mockResolvedValue({
        success: true,
        data: { authUrl: 'https://facebook.com/oauth?state=test123' },
      });

      render(<FacebookWizard {...defaultProps} />);
      
      // Enter inbox name
      const nameInput = screen.getByPlaceholderText('Enter inbox name');
      fireEvent.change(nameInput, { target: { value: 'FB Test Inbox' } });
      
      const oauthButton = screen.getByText('Connect with Facebook');
      fireEvent.click(oauthButton);
      
      await waitFor(() => {
        expect(mockAdminService.startFacebookOAuth).toHaveBeenCalledWith({
          accountId: 123,
          state: expect.any(String),
        });
      });
    });

    it('handles OAuth callback and loads pages', async () => {
      mockAdminService.loadFacebookPages.mockResolvedValue({
        success: true,
        data: [
          {
            id: 'page123',
            name: 'Test Page',
            followers_count: 1500,
            picture: 'https://example.com/pic.jpg',
          },
          {
            id: 'page456',
            name: 'Another Page',
            followers_count: 3200,
          },
        ],
      });

      render(<FacebookWizard {...defaultProps} />);
      
      // Simulate OAuth callback
      window.postMessage({
        type: 'FACEBOOK_OAUTH_SUCCESS',
        code: 'oauth_code_123',
        state: 'test_state',
      }, '*');
      
      await waitFor(() => {
        expect(mockAdminService.loadFacebookPages).toHaveBeenCalledWith({
          accountId: 123,
          code: 'oauth_code_123',
        });
      });
      
      await waitFor(() => {
        expect(screen.getByText('Test Page')).toBeInTheDocument();
        expect(screen.getByText('1.5K followers')).toBeInTheDocument();
        expect(screen.getByText('Another Page')).toBeInTheDocument();
        expect(screen.getByText('3.2K followers')).toBeInTheDocument();
      });
    });

    it('handles OAuth errors gracefully', async () => {
      render(<FacebookWizard {...defaultProps} />);
      
      // Simulate OAuth error
      window.postMessage({
        type: 'FACEBOOK_OAUTH_ERROR',
        error: 'access_denied',
        error_description: 'User cancelled the dialog',
      }, '*');
      
      await waitFor(() => {
        expect(screen.getByText(/authorization failed/i)).toBeInTheDocument();
        expect(screen.getByText('Retry Authorization')).toBeInTheDocument();
      });
    });
  });

  describe('Page Selection', () => {
    beforeEach(async () => {
      mockAdminService.loadFacebookPages.mockResolvedValue({
        success: true,
        data: [
          {
            id: 'page123',
            name: 'Test Page',
            followers_count: 1500,
          },
        ],
      });
    });

    it('creates inbox when page is selected', async () => {
      mockAdminService.createFacebookInbox.mockResolvedValue({
        success: true,
        data: { id: 789, name: 'FB Test Inbox' },
      });

      render(<FacebookWizard {...defaultProps} />);
      
      // Simulate successful OAuth and page loading
      window.postMessage({
        type: 'FACEBOOK_OAUTH_SUCCESS',
        code: 'oauth_code_123',
        state: 'test_state',
      }, '*');
      
      await waitFor(() => {
        expect(screen.getByText('Test Page')).toBeInTheDocument();
      });
      
      // Select page
      const pageCard = screen.getByText('Test Page').closest('div');
      fireEvent.click(pageCard!);
      
      await waitFor(() => {
        expect(mockAdminService.createFacebookInbox).toHaveBeenCalledWith({
          accountId: 123,
          name: 'FB Test Inbox',
          pageId: 'page123',
          pageName: 'Test Page',
        });
      });
    });

    it('handles inbox creation errors', async () => {
      mockAdminService.createFacebookInbox.mockRejectedValue(
        new Error('Failed to create inbox')
      );

      render(<FacebookWizard {...defaultProps} />);
      
      // Simulate flow up to page selection
      window.postMessage({
        type: 'FACEBOOK_OAUTH_SUCCESS',
        code: 'oauth_code_123',
        state: 'test_state',
      }, '*');
      
      await waitFor(() => {
        expect(screen.getByText('Test Page')).toBeInTheDocument();
      });
      
      const pageCard = screen.getByText('Test Page').closest('div');
      fireEvent.click(pageCard!);
      
      await waitFor(() => {
        expect(screen.getByText(/failed to create inbox/i)).toBeInTheDocument();
        expect(screen.getByText('Retry')).toBeInTheDocument();
      });
    });
  });

  describe('Agent Assignment', () => {
    it('shows agent assignment after successful inbox creation', async () => {
      mockAdminService.createFacebookInbox.mockResolvedValue({
        success: true,
        data: { id: 789, name: 'FB Test Inbox' },
      });
      
      mockAdminService.loadFacebookPages.mockResolvedValue({
        success: true,
        data: [{ id: 'page123', name: 'Test Page', followers_count: 1500 }],
      });

      render(<FacebookWizard {...defaultProps} />);
      
      // Complete flow to agent assignment
      window.postMessage({
        type: 'FACEBOOK_OAUTH_SUCCESS',
        code: 'oauth_code_123',
        state: 'test_state',
      }, '*');
      
      await waitFor(() => {
        const pageCard = screen.getByText('Test Page').closest('div');
        fireEvent.click(pageCard!);
      });
      
      await waitFor(() => {
        expect(screen.getByText('Assign Agents')).toBeInTheDocument();
        expect(screen.getByText('Agent 1')).toBeInTheDocument();
        expect(screen.getByText('Agent 2')).toBeInTheDocument();
      });
    });

    it('assigns selected agents to inbox', async () => {
      mockAdminService.createFacebookInbox.mockResolvedValue({
        success: true,
        data: { id: 789, name: 'FB Test Inbox' },
      });
      
      mockAdminService.loadFacebookPages.mockResolvedValue({
        success: true,
        data: [{ id: 'page123', name: 'Test Page', followers_count: 1500 }],
      });
      
      mockAdminService.assignInboxAgents.mockResolvedValue({
        success: true,
      });

      render(<FacebookWizard {...defaultProps} />);
      
      // Complete flow to agent assignment
      window.postMessage({
        type: 'FACEBOOK_OAUTH_SUCCESS',
        code: 'oauth_code_123',
        state: 'test_state',
      }, '*');
      
      await waitFor(() => {
        const pageCard = screen.getByText('Test Page').closest('div');
        fireEvent.click(pageCard!);
      });
      
      await waitFor(() => {
        // Select agents
        const agent1Checkbox = screen.getByLabelText('Agent 1');
        const agent2Checkbox = screen.getByLabelText('Agent 2');
        
        fireEvent.click(agent1Checkbox);
        fireEvent.click(agent2Checkbox);
        
        const assignButton = screen.getByText('Assign Selected Agents');
        fireEvent.click(assignButton);
      });
      
      await waitFor(() => {
        expect(mockAdminService.assignInboxAgents).toHaveBeenCalledWith({
          inboxId: 789,
          agentIds: [1, 2],
        });
      });
    });
  });

  describe('Security Guardrails', () => {
    it('does not expose OAuth tokens in component state', async () => {
      const { container } = render(<FacebookWizard {...defaultProps} />);
      
      // Simulate OAuth success with sensitive token
      window.postMessage({
        type: 'FACEBOOK_OAUTH_SUCCESS',
        code: 'SENSITIVE_OAUTH_CODE_123',
        state: 'test_state',
      }, '*');
      
      await waitFor(() => {
        // Token should not appear in DOM
        expect(container.innerHTML).not.toContain('SENSITIVE_OAUTH_CODE_123');
      });
    });

    it('validates OAuth state to prevent CSRF', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      render(<FacebookWizard {...defaultProps} />);
      
      // Send message with invalid state
      window.postMessage({
        type: 'FACEBOOK_OAUTH_SUCCESS',
        code: 'oauth_code_123',
        state: 'invalid_state',
      }, '*');
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('state'));
      });
      
      consoleSpy.mockRestore();
    });

    it('sanitizes page data to prevent XSS', async () => {
      mockAdminService.loadFacebookPages.mockResolvedValue({
        success: true,
        data: [
          {
            id: 'page123',
            name: '<script>alert("xss")</script>Test Page',
            followers_count: 1500,
          },
        ],
      });

      render(<FacebookWizard {...defaultProps} />);
      
      window.postMessage({
        type: 'FACEBOOK_OAUTH_SUCCESS',
        code: 'oauth_code_123',
        state: 'test_state',
      }, '*');
      
      await waitFor(() => {
        // Should not contain script tag
        expect(screen.queryByText('<script>')).not.toBeInTheDocument();
        // Should contain sanitized text
        expect(screen.getByText(/Test Page/)).toBeInTheDocument();
      });
    });
  });
});