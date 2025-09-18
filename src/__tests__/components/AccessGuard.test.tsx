import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AccessGuard } from '@/components/AccessGuard';
import { mockAdminUser, mockRegularUser } from '@/__mocks__/mockData';

describe('AccessGuard', () => {
  const mockOnUnauthorized = vi.fn();
  
  beforeEach(() => {
    mockOnUnauthorized.mockClear();
  });

  it('should render children when user has admin-interno role', () => {
    const { getByText } = render(
      <AccessGuard currentUser={mockAdminUser} onUnauthorized={mockOnUnauthorized}>
        <div>Protected Content</div>
      </AccessGuard>
    );

    expect(getByText('Protected Content')).toBeInTheDocument();
    expect(mockOnUnauthorized).not.toHaveBeenCalled();
  });

  it('should show access denied when user lacks admin-interno role', () => {
    const { getByText } = render(
      <AccessGuard currentUser={mockRegularUser} onUnauthorized={mockOnUnauthorized}>
        <div>Protected Content</div>
      </AccessGuard>
    );

    expect(getByText('Acesso Negado')).toBeInTheDocument();
    expect(mockOnUnauthorized).toHaveBeenCalledOnce();
  });
});