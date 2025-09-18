import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LabelManager } from '@/components/LabelManager';
import { mockLabel } from '@/__mocks__/mockData';

// Mock the hooks
vi.mock('@/hooks/useLabels', () => ({
  useLabels: () => ({
    data: [mockLabel],
    isLoading: false,
    error: null
  }),
  useCreateLabel: () => ({
    mutateAsync: vi.fn().mockResolvedValue({ id: 2, title: 'New Label', color: '#000000' }),
    isPending: false
  })
}));

describe('LabelManager', () => {
  const mockOnApply = vi.fn();

  beforeEach(() => {
    mockOnApply.mockClear();
  });

  it('should render label manager', () => {
    const { getByPlaceholderText } = render(
      <LabelManager
        selectedLabels={[]}
        onLabelsChange={vi.fn()}
        onApply={mockOnApply}
      />
    );

    expect(getByPlaceholderText('Digite ou selecione labels...')).toBeInTheDocument();
  });
});