import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../../utils/testUtils';
import { AgentAssignmentModal } from '../../../../components/admin/inboxes/AgentAssignmentModal';
import * as adminService from '../../../../services/AdminService';

// Mock AdminService
vi.mock('../../../../services/AdminService', () => ({
  listAgents: vi.fn(),
  assignInboxAgents: vi.fn(),
  getInboxMembers: vi.fn(),
}));

const mockAdminService = adminService as any;

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  onComplete: vi.fn(),
  inboxId: 789,
  inboxName: 'Test Inbox',
};

describe('AgentAssignmentModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAdminService.listAgents.mockResolvedValue({
      success: true,
      data: [
        { id: 1, name: 'John Doe', email: 'john@test.com', role: 'agent' },
        { id: 2, name: 'Jane Smith', email: 'jane@test.com', role: 'agent' },
        { id: 3, name: 'Bob Wilson', email: 'bob@test.com', role: 'supervisor' },
      ],
    });
    
    mockAdminService.getInboxMembers.mockResolvedValue({
      success: true,
      data: [],
    });
  });

  describe('Rendering and Initial State', () => {
    it('renders modal with inbox name', async () => {
      render(<AgentAssignmentModal {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('Assign Agents to Test Inbox')).toBeInTheDocument();
      });
    });

    it('loads and displays available agents', async () => {
      render(<AgentAssignmentModal {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('john@test.com')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.getByText('jane@test.com')).toBeInTheDocument();
        expect(screen.getByText('Bob Wilson')).toBeInTheDocument();
        expect(screen.getByText('bob@test.com')).toBeInTheDocument();
      });
    });

    it('shows loading state while fetching agents', () => {
      mockAdminService.listAgents.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ success: true, data: [] }), 100))
      );
      
      render(<AgentAssignmentModal {...defaultProps} />);
      
      expect(screen.getByText('Loading agents...')).toBeInTheDocument();
    });

    it('displays error when agent loading fails', async () => {
      mockAdminService.listAgents.mockRejectedValue(new Error('Failed to load agents'));
      
      render(<AgentAssignmentModal {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText(/failed to load agents/i)).toBeInTheDocument();
      });
    });
  });

  describe('Agent Selection', () => {
    it('allows selecting and deselecting agents', async () => {
      render(<AgentAssignmentModal {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
      
      const johnCheckbox = screen.getByLabelText('John Doe');
      const janeCheckbox = screen.getByLabelText('Jane Smith');
      
      // Select agents
      fireEvent.click(johnCheckbox);
      fireEvent.click(janeCheckbox);
      
      expect(johnCheckbox).toBeChecked();
      expect(janeCheckbox).toBeChecked();
      
      // Deselect one agent
      fireEvent.click(johnCheckbox);
      expect(johnCheckbox).not.toBeChecked();
      expect(janeCheckbox).toBeChecked();
    });

    it('shows selected agent count', async () => {
      render(<AgentAssignmentModal {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
      
      const johnCheckbox = screen.getByLabelText('John Doe');
      const janeCheckbox = screen.getByLabelText('Jane Smith');
      
      fireEvent.click(johnCheckbox);
      fireEvent.click(janeCheckbox);
      
      expect(screen.getByText('2 agents selected')).toBeInTheDocument();
    });

    it('allows select all functionality', async () => {
      render(<AgentAssignmentModal {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
      
      const selectAllButton = screen.getByText('Select All');
      fireEvent.click(selectAllButton);
      
      const johnCheckbox = screen.getByLabelText('John Doe');
      const janeCheckbox = screen.getByLabelText('Jane Smith');
      const bobCheckbox = screen.getByLabelText('Bob Wilson');
      
      expect(johnCheckbox).toBeChecked();
      expect(janeCheckbox).toBeChecked();
      expect(bobCheckbox).toBeChecked();
      expect(screen.getByText('3 agents selected')).toBeInTheDocument();
    });

    it('allows clear all functionality', async () => {
      render(<AgentAssignmentModal {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
      
      // Select all first
      const selectAllButton = screen.getByText('Select All');
      fireEvent.click(selectAllButton);
      
      // Then clear all
      const clearAllButton = screen.getByText('Clear All');
      fireEvent.click(clearAllButton);
      
      const johnCheckbox = screen.getByLabelText('John Doe');
      const janeCheckbox = screen.getByLabelText('Jane Smith');
      const bobCheckbox = screen.getByLabelText('Bob Wilson');
      
      expect(johnCheckbox).not.toBeChecked();
      expect(janeCheckbox).not.toBeChecked();
      expect(bobCheckbox).not.toBeChecked();
      expect(screen.getByText('0 agents selected')).toBeInTheDocument();
    });
  });

  describe('Pre-existing Assignments', () => {
    it('shows currently assigned agents as checked', async () => {
      mockAdminService.getInboxMembers.mockResolvedValue({
        success: true,
        data: [
          { id: 1, name: 'John Doe', email: 'john@test.com' },
        ],
      });
      
      render(<AgentAssignmentModal {...defaultProps} />);
      
      await waitFor(() => {
        const johnCheckbox = screen.getByLabelText('John Doe');
        expect(johnCheckbox).toBeChecked();
      });
    });

    it('displays current assignment status', async () => {
      mockAdminService.getInboxMembers.mockResolvedValue({
        success: true,
        data: [
          { id: 1, name: 'John Doe', email: 'john@test.com' },
          { id: 2, name: 'Jane Smith', email: 'jane@test.com' },
        ],
      });
      
      render(<AgentAssignmentModal {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('2 agents currently assigned')).toBeInTheDocument();
      });
    });
  });

  describe('Assignment Submission', () => {
    it('submits selected agents successfully', async () => {
      mockAdminService.assignInboxAgents.mockResolvedValue({
        success: true,
        data: {
          inbox_id: 789,
          agents: [
            { id: 1, name: 'John Doe', email: 'john@test.com' },
            { id: 3, name: 'Bob Wilson', email: 'bob@test.com' },
          ],
        },
      });
      
      render(<AgentAssignmentModal {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
      
      // Select agents
      const johnCheckbox = screen.getByLabelText('John Doe');
      const bobCheckbox = screen.getByLabelText('Bob Wilson');
      
      fireEvent.click(johnCheckbox);
      fireEvent.click(bobCheckbox);
      
      // Submit
      const assignButton = screen.getByText('Assign Selected Agents');
      fireEvent.click(assignButton);
      
      await waitFor(() => {
        expect(mockAdminService.assignInboxAgents).toHaveBeenCalledWith({
          inboxId: 789,
          agentIds: [1, 3],
        });
      });
      
      expect(defaultProps.onComplete).toHaveBeenCalledWith({
        inbox_id: 789,
        agents: [
          { id: 1, name: 'John Doe', email: 'john@test.com' },
          { id: 3, name: 'Bob Wilson', email: 'bob@test.com' },
        ],
      });
    });

    it('handles assignment errors gracefully', async () => {
      mockAdminService.assignInboxAgents.mockRejectedValue(
        new Error('Failed to assign agents')
      );
      
      render(<AgentAssignmentModal {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
      
      // Select an agent and submit
      const johnCheckbox = screen.getByLabelText('John Doe');
      fireEvent.click(johnCheckbox);
      
      const assignButton = screen.getByText('Assign Selected Agents');
      fireEvent.click(assignButton);
      
      await waitFor(() => {
        expect(screen.getByText(/failed to assign agents/i)).toBeInTheDocument();
      });
    });

    it('provides retry functionality after error', async () => {
      mockAdminService.assignInboxAgents
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValue({
          success: true,
          data: { inbox_id: 789, agents: [] },
        });
      
      render(<AgentAssignmentModal {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
      
      // Select agent and trigger error
      const johnCheckbox = screen.getByLabelText('John Doe');
      fireEvent.click(johnCheckbox);
      
      const assignButton = screen.getByText('Assign Selected Agents');
      fireEvent.click(assignButton);
      
      await waitFor(() => {
        expect(screen.getByText('Retry')).toBeInTheDocument();
      });
      
      // Retry should work
      fireEvent.click(screen.getByText('Retry'));
      
      await waitFor(() => {
        expect(mockAdminService.assignInboxAgents).toHaveBeenCalledTimes(2);
      });
    });

    it('allows skipping agent assignment', async () => {
      render(<AgentAssignmentModal {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('Skip for Now')).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByText('Skip for Now'));
      
      expect(defaultProps.onComplete).toHaveBeenCalledWith(null);
    });
  });

  describe('Search and Filtering', () => {
    it('filters agents by name and email', async () => {
      render(<AgentAssignmentModal {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
      
      const searchInput = screen.getByPlaceholderText('Search agents...');
      
      // Search by name
      fireEvent.change(searchInput, { target: { value: 'John' } });
      
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
      expect(screen.queryByText('Bob Wilson')).not.toBeInTheDocument();
      
      // Search by email
      fireEvent.change(searchInput, { target: { value: 'jane@' } });
      
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.queryByText('Bob Wilson')).not.toBeInTheDocument();
    });

    it('filters agents by role', async () => {
      render(<AgentAssignmentModal {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
      
      const roleFilter = screen.getByDisplayValue('All Roles');
      fireEvent.change(roleFilter, { target: { value: 'supervisor' } });
      
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
      expect(screen.getByText('Bob Wilson')).toBeInTheDocument();
    });

    it('shows no results message when search has no matches', async () => {
      render(<AgentAssignmentModal {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
      
      const searchInput = screen.getByPlaceholderText('Search agents...');
      fireEvent.change(searchInput, { target: { value: 'NonexistentAgent' } });
      
      expect(screen.getByText('No agents found matching your search')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('supports keyboard navigation', async () => {
      render(<AgentAssignmentModal {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
      
      const johnCheckbox = screen.getByLabelText('John Doe');
      
      // Focus and activate with keyboard
      johnCheckbox.focus();
      fireEvent.keyDown(johnCheckbox, { key: 'Enter' });
      
      expect(johnCheckbox).toBeChecked();
    });

    it('has proper ARIA labels and descriptions', async () => {
      render(<AgentAssignmentModal {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
      
      expect(screen.getByLabelText('Search agents...')).toBeInTheDocument();
      expect(screen.getByLabelText('Filter by role')).toBeInTheDocument();
      expect(screen.getByLabelText('John Doe')).toBeInTheDocument();
    });

    it('announces selection changes to screen readers', async () => {
      render(<AgentAssignmentModal {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
      
      const johnCheckbox = screen.getByLabelText('John Doe');
      fireEvent.click(johnCheckbox);
      
      expect(screen.getByRole('status')).toHaveTextContent('1 agents selected');
    });
  });

  describe('Performance', () => {
    it('handles large agent lists efficiently', async () => {
      const largeAgentList = Array.from({ length: 1000 }, (_, i) => ({
        id: i + 1,
        name: `Agent ${i + 1}`,
        email: `agent${i + 1}@test.com`,
        role: i % 3 === 0 ? 'supervisor' : 'agent',
      }));
      
      mockAdminService.listAgents.mockResolvedValue({
        success: true,
        data: largeAgentList,
      });
      
      const start = performance.now();
      render(<AgentAssignmentModal {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('Agent 1')).toBeInTheDocument();
      });
      
      const end = performance.now();
      
      // Should render within reasonable time (adjust threshold as needed)
      expect(end - start).toBeLessThan(1000);
    });

    it('virtualizes large agent lists', async () => {
      const largeAgentList = Array.from({ length: 1000 }, (_, i) => ({
        id: i + 1,
        name: `Agent ${i + 1}`,
        email: `agent${i + 1}@test.com`,
        role: 'agent',
      }));
      
      mockAdminService.listAgents.mockResolvedValue({
        success: true,
        data: largeAgentList,
      });
      
      render(<AgentAssignmentModal {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('Agent 1')).toBeInTheDocument();
      });
      
      // Should not render all 1000 agents in DOM at once
      const renderedAgents = screen.getAllByText(/^Agent \d+$/);
      expect(renderedAgents.length).toBeLessThan(50); // Reasonable viewport size
    });
  });
});