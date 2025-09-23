import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useInboxWizardState } from '../../hooks/admin/useInboxWizardState';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useInboxWizardState', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Initial State', () => {
    it('initializes with default state', () => {
      const { result } = renderHook(() => useInboxWizardState());
      
      expect(result.current[0]).toEqual({
        step: 'name',
        status: 'idle',
        error: null,
        isLoading: false,
        canRetry: false,
        needsReconnect: false,
        retryAttempts: 0,
        progress: undefined,
      });
    });

    it('provides all expected actions', () => {
      const { result } = renderHook(() => useInboxWizardState());
      
      const [, actions] = result.current;
      
      expect(actions).toHaveProperty('setStep');
      expect(actions).toHaveProperty('setStatus');
      expect(actions).toHaveProperty('setError');
      expect(actions).toHaveProperty('setLoading');
      expect(actions).toHaveProperty('setProgress');
      expect(actions).toHaveProperty('handleRetry');
      expect(actions).toHaveProperty('handleReconnect');
      expect(actions).toHaveProperty('handleNext');
      expect(actions).toHaveProperty('handleBack');
      expect(actions).toHaveProperty('reset');
    });
  });

  describe('State Persistence', () => {
    it('restores state from localStorage when persistKey is provided', () => {
      const persistedState = {
        step: 'credentials',
        status: 'connecting',
        retryAttempts: 2,
      };
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(persistedState));
      
      const { result } = renderHook(() => 
        useInboxWizardState({ persistKey: 'test-wizard' })
      );
      
      expect(localStorageMock.getItem).toHaveBeenCalledWith('inbox-wizard-test-wizard');
      expect(result.current[0].step).toBe('credentials');
      expect(result.current[0].status).toBe('connecting');
      expect(result.current[0].retryAttempts).toBe(2);
    });

    it('saves state to localStorage when persistKey is provided', () => {
      const { result } = renderHook(() => 
        useInboxWizardState({ persistKey: 'test-wizard' })
      );
      
      act(() => {
        result.current[1].setStep('oauth');
      });
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'inbox-wizard-test-wizard',
        expect.stringContaining('"step":"oauth"')
      );
    });

    it('handles corrupted localStorage data gracefully', () => {
      localStorageMock.getItem.mockReturnValue('invalid-json');
      
      const { result } = renderHook(() => 
        useInboxWizardState({ persistKey: 'test-wizard' })
      );
      
      // Should fall back to default state
      expect(result.current[0].step).toBe('name');
    });
  });

  describe('Step Navigation', () => {
    it('advances to next step with handleNext', () => {
      const { result } = renderHook(() => useInboxWizardState());
      
      act(() => {
        result.current[1].handleNext();
      });
      
      expect(result.current[0].step).toBe('credentials');
      
      act(() => {
        result.current[1].handleNext();
      });
      
      expect(result.current[0].step).toBe('oauth');
    });

    it('goes back to previous step with handleBack', () => {
      const { result } = renderHook(() => useInboxWizardState());
      
      // Move forward first
      act(() => {
        result.current[1].setStep('oauth');
      });
      
      act(() => {
        result.current[1].handleBack();
      });
      
      expect(result.current[0].step).toBe('credentials');
      
      act(() => {
        result.current[1].handleBack();
      });
      
      expect(result.current[0].step).toBe('name');
    });

    it('does not go back from first step', () => {
      const { result } = renderHook(() => useInboxWizardState());
      
      act(() => {
        result.current[1].handleBack();
      });
      
      expect(result.current[0].step).toBe('name');
    });

    it('accepts custom step order', () => {
      const customSteps = ['setup', 'configure', 'test', 'done'];
      const { result } = renderHook(() => 
        useInboxWizardState({ steps: customSteps })
      );
      
      expect(result.current[0].step).toBe('setup');
      
      act(() => {
        result.current[1].handleNext();
      });
      
      expect(result.current[0].step).toBe('configure');
    });
  });

  describe('Error Handling and Retry Logic', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('enables retry after error', () => {
      const { result } = renderHook(() => useInboxWizardState());
      
      act(() => {
        result.current[1].setError({
          type: 'NETWORK',
          message: 'Connection failed',
          retryable: true,
        });
      });
      
      expect(result.current[0].canRetry).toBe(true);
      expect(result.current[0].status).toBe('error');
    });

    it('implements exponential backoff for retries', async () => {
      const retryCallback = vi.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() => 
        useInboxWizardState({ onRetry: retryCallback })
      );
      
      // Set error state
      act(() => {
        result.current[1].setError({
          type: 'NETWORK',
          message: 'Connection failed',
          retryable: true,
        });
      });
      
      // First retry
      act(() => {
        result.current[1].handleRetry();
      });
      
      expect(result.current[0].retryAttempts).toBe(1);
      expect(result.current[0].isLoading).toBe(true);
      
      await act(async () => {
        vi.advanceTimersByTime(1000); // Initial delay
      });
      
      expect(retryCallback).toHaveBeenCalledTimes(1);
      
      // Simulate retry failure
      act(() => {
        result.current[1].setError({
          type: 'NETWORK',
          message: 'Still failing',
          retryable: true,
        });
      });
      
      // Second retry should have longer delay
      act(() => {
        result.current[1].handleRetry();
      });
      
      expect(result.current[0].retryAttempts).toBe(2);
      
      await act(async () => {
        vi.advanceTimersByTime(2000); // Doubled delay
      });
      
      expect(retryCallback).toHaveBeenCalledTimes(2);
    });

    it('stops retrying after max attempts', () => {
      const { result } = renderHook(() => 
        useInboxWizardState({ maxRetries: 3 })
      );
      
      // Simulate multiple failures
      for (let i = 0; i < 5; i++) {
        act(() => {
          result.current[1].setError({
            type: 'NETWORK',
            message: 'Connection failed',
            retryable: true,
          });
          result.current[1].handleRetry();
        });
      }
      
      expect(result.current[0].retryAttempts).toBe(3);
      expect(result.current[0].canRetry).toBe(false);
    });

    it('handles reconnection requirement', () => {
      const reconnectCallback = vi.fn();
      const { result } = renderHook(() => 
        useInboxWizardState({ onReconnect: reconnectCallback })
      );
      
      act(() => {
        result.current[1].setError({
          type: 'OAUTH',
          message: 'Token expired',
          reconnect: true,
        });
      });
      
      expect(result.current[0].needsReconnect).toBe(true);
      
      act(() => {
        result.current[1].handleReconnect();
      });
      
      expect(reconnectCallback).toHaveBeenCalled();
      expect(result.current[0].needsReconnect).toBe(false);
      expect(result.current[0].retryAttempts).toBe(0);
    });
  });

  describe('Progress Tracking', () => {
    it('tracks progress through wizard steps', () => {
      const { result } = renderHook(() => useInboxWizardState());
      
      act(() => {
        result.current[1].setProgress(25);
      });
      
      expect(result.current[0].progress).toBe(25);
      
      act(() => {
        result.current[1].setProgress(75);
      });
      
      expect(result.current[0].progress).toBe(75);
    });

    it('auto-calculates progress based on step if not manually set', () => {
      const steps = ['step1', 'step2', 'step3', 'step4'];
      const { result } = renderHook(() => 
        useInboxWizardState({ steps, autoProgress: true })
      );
      
      expect(result.current[0].progress).toBe(25); // 1/4 = 25%
      
      act(() => {
        result.current[1].handleNext();
      });
      
      expect(result.current[0].progress).toBe(50); // 2/4 = 50%
    });
  });

  describe('Reset Functionality', () => {
    it('resets state to initial values', () => {
      const { result } = renderHook(() => 
        useInboxWizardState({ persistKey: 'test-wizard' })
      );
      
      // Modify state
      act(() => {
        result.current[1].setStep('oauth');
        result.current[1].setStatus('error');
        result.current[1].setError({
          type: 'NETWORK',
          message: 'Test error',
        });
        result.current[1].setProgress(75);
      });
      
      // Reset
      act(() => {
        result.current[1].reset();
      });
      
      expect(result.current[0]).toEqual({
        step: 'name',
        status: 'idle',
        error: null,
        isLoading: false,
        canRetry: false,
        needsReconnect: false,
        retryAttempts: 0,
        progress: undefined,
      });
      
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('inbox-wizard-test-wizard');
    });
  });

  describe('Status Management', () => {
    it('transitions between status states correctly', () => {
      const { result } = renderHook(() => useInboxWizardState());
      
      act(() => {
        result.current[1].setStatus('connecting');
      });
      
      expect(result.current[0].status).toBe('connecting');
      expect(result.current[0].isLoading).toBe(true);
      
      act(() => {
        result.current[1].setStatus('success');
      });
      
      expect(result.current[0].status).toBe('success');
      expect(result.current[0].isLoading).toBe(false);
      
      act(() => {
        result.current[1].setStatus('error');
      });
      
      expect(result.current[0].status).toBe('error');
      expect(result.current[0].isLoading).toBe(false);
    });

    it('clears error when setting loading state', () => {
      const { result } = renderHook(() => useInboxWizardState());
      
      act(() => {
        result.current[1].setError({
          type: 'VALIDATION',
          message: 'Invalid input',
        });
      });
      
      expect(result.current[0].error).toBeTruthy();
      
      act(() => {
        result.current[1].setLoading(true);
      });
      
      expect(result.current[0].error).toBeNull();
      expect(result.current[0].isLoading).toBe(true);
    });
  });
});