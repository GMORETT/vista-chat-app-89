import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import '@testing-library/jest-dom';
import { createTestQueryClient } from '../utils/testUtils';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useLabels, useCreateLabel } from '@/hooks/useLabels';
import { mockLabel } from '@/__mocks__/mockData';

// Mock the API
vi.mock('@/api/labels', () => ({
  getLabels: vi.fn().mockResolvedValue([mockLabel]),
  createLabel: vi.fn().mockResolvedValue({ id: 2, title: 'New Label', color: '#000000' })
}));

describe('useLabels', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should initialize with correct initial state', () => {
    const { result } = renderHook(() => useLabels(), { wrapper });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeNull();
  });
});

describe('useCreateLabel', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should initialize with correct initial state', () => {
    const { result } = renderHook(() => useCreateLabel(), { wrapper });

    expect(result.current.isPending).toBe(false);
    expect(typeof result.current.mutateAsync).toBe('function');
  });
});