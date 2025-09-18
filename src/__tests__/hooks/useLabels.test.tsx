import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { waitFor } from '@testing-library/dom';
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

  it('should fetch labels successfully', async () => {
    const { result } = renderHook(() => useLabels(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual([mockLabel]);
  });

  it('should handle loading state', () => {
    const { result } = renderHook(() => useLabels(), { wrapper });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
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

  it('should create label successfully', async () => {
    const { result } = renderHook(() => useCreateLabel(), { wrapper });

    const newLabel = { title: 'New Label', color: '#FF0000' };
    
    await waitFor(async () => {
      const response = await result.current.mutateAsync(newLabel);
      expect(response).toEqual({ id: 2, title: 'New Label', color: '#000000' });
    });
  });

  it('should handle mutation loading state', () => {
    const { result } = renderHook(() => useCreateLabel(), { wrapper });

    expect(result.current.isPending).toBe(false);
  });
});