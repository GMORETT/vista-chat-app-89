import { useState, useCallback, useRef } from 'react';
import { InboxConnectionStatus } from '../../components/admin/shared/InboxStatusCard';
import { InboxError, InboxErrorType, createInboxError, isRetryableError, requiresReconnection, getRetryStrategy } from '../../types/inboxErrors';

export interface InboxWizardState {
  step: number;
  status: InboxConnectionStatus;
  error: InboxError | null;
  isLoading: boolean;
  canRetry: boolean;
  needsReconnect: boolean;
  retryAttempts: number;
  progress?: number;
}

export interface InboxWizardActions {
  setStep: (step: number) => void;
  setStatus: (status: InboxConnectionStatus) => void;
  setError: (error: InboxError | string | null) => void;
  setLoading: (loading: boolean) => void;
  setProgress: (progress: number) => void;
  handleRetry: () => Promise<void>;
  handleReconnect: () => Promise<void>;
  handleNext: () => void;
  handleBack: () => void;
  reset: () => void;
}

interface UseInboxWizardStateOptions {
  initialStep?: number;
  onRetry?: () => Promise<void>;
  onReconnect?: () => Promise<void>;
  maxRetries?: number;
  persistKey?: string;
}

export const useInboxWizardState = (
  options: UseInboxWizardStateOptions = {}
): [InboxWizardState, InboxWizardActions] => {
  const {
    initialStep = 1,
    onRetry,
    onReconnect,
    maxRetries = 3,
    persistKey
  } = options;

  const [state, setState] = useState<InboxWizardState>(() => {
    // Try to restore from localStorage if persistKey is provided
    if (persistKey && typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(`wizard_${persistKey}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          return {
            step: initialStep,
            status: 'idle' as InboxConnectionStatus,
            error: null,
            isLoading: false,
            canRetry: false,
            needsReconnect: false,
            retryAttempts: 0,
            ...parsed
          };
        }
      } catch (error) {
        console.warn('Failed to restore wizard state:', error);
      }
    }

    return {
      step: initialStep,
      status: 'idle' as InboxConnectionStatus,
      error: null,
      isLoading: false,
      canRetry: false,
      needsReconnect: false,
      retryAttempts: 0
    };
  });

  const retryTimeoutRef = useRef<NodeJS.Timeout>();

  // Persist state to localStorage when it changes
  const persistState = useCallback((newState: InboxWizardState) => {
    if (persistKey && typeof window !== 'undefined') {
      try {
        localStorage.setItem(`wizard_${persistKey}`, JSON.stringify({
          step: newState.step,
          retryAttempts: newState.retryAttempts,
          progress: newState.progress
        }));
      } catch (error) {
        console.warn('Failed to persist wizard state:', error);
      }
    }
  }, [persistKey]);

  const updateState = useCallback((updates: Partial<InboxWizardState>) => {
    setState(prev => {
      const newState = { ...prev, ...updates };
      persistState(newState);
      return newState;
    });
  }, [persistState]);

  const setStep = useCallback((step: number) => {
    updateState({ step });
  }, [updateState]);

  const setStatus = useCallback((status: InboxConnectionStatus) => {
    updateState({ 
      status,
      isLoading: status === 'connecting' || status === 'authorizing' || status === 'creating' || status === 'reconnecting'
    });
  }, [updateState]);

  const setError = useCallback((error: InboxError | string | null) => {
    if (error === null) {
      updateState({ 
        error: null, 
        status: 'idle',
        canRetry: false,
        needsReconnect: false 
      });
      return;
    }

    const inboxError = typeof error === 'string' 
      ? createInboxError(InboxErrorType.UNKNOWN, error, { retryable: true })
      : error;

    updateState({
      error: inboxError,
      status: 'error',
      isLoading: false,
      canRetry: isRetryableError(inboxError) && state.retryAttempts < maxRetries,
      needsReconnect: requiresReconnection(inboxError)
    });
  }, [updateState, state.retryAttempts, maxRetries]);

  const setLoading = useCallback((loading: boolean) => {
    updateState({ isLoading: loading });
  }, [updateState]);

  const setProgress = useCallback((progress: number) => {
    updateState({ progress: Math.max(0, Math.min(100, progress)) });
  }, [updateState]);

  const handleRetry = useCallback(async () => {
    if (!state.error || !isRetryableError(state.error) || state.retryAttempts >= maxRetries) {
      return;
    }

    const retryStrategy = getRetryStrategy(state.error);
    const delay = retryStrategy.initialDelay * Math.pow(retryStrategy.backoffMultiplier, state.retryAttempts);

    updateState({
      retryAttempts: state.retryAttempts + 1,
      isLoading: true,
      error: null
    });

    if (delay > 0) {
      await new Promise(resolve => {
        retryTimeoutRef.current = setTimeout(resolve, delay);
      });
    }

    try {
      if (onRetry) {
        await onRetry();
      }
    } catch (error) {
      const inboxError = error instanceof Error 
        ? createInboxError(InboxErrorType.UNKNOWN, error.message, { retryable: true })
        : createInboxError(InboxErrorType.UNKNOWN, 'Retry failed', { retryable: true });
      
      setError(inboxError);
    }
  }, [state.error, state.retryAttempts, maxRetries, onRetry, updateState, setError]);

  const handleReconnect = useCallback(async () => {
    if (!onReconnect) return;

    updateState({
      status: 'reconnecting',
      isLoading: true,
      error: null,
      retryAttempts: 0
    });

    try {
      await onReconnect();
      updateState({
        status: 'connected',
        isLoading: false
      });
    } catch (error) {
      const inboxError = error instanceof Error 
        ? createInboxError(InboxErrorType.OAUTH, error.message, { requiresReconnect: true })
        : createInboxError(InboxErrorType.OAUTH, 'Reconnection failed', { requiresReconnect: true });
      
      setError(inboxError);
    }
  }, [onReconnect, updateState, setError]);

  const handleNext = useCallback(() => {
    if (!state.isLoading && !state.error) {
      setStep(state.step + 1);
    }
  }, [state.isLoading, state.error, state.step, setStep]);

  const handleBack = useCallback(() => {
    if (!state.isLoading && state.step > 1) {
      setStep(state.step - 1);
      updateState({ error: null });
    }
  }, [state.isLoading, state.step, setStep, updateState]);

  const reset = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }

    if (persistKey && typeof window !== 'undefined') {
      localStorage.removeItem(`wizard_${persistKey}`);
    }

    setState({
      step: initialStep,
      status: 'idle',
      error: null,
      isLoading: false,
      canRetry: false,
      needsReconnect: false,
      retryAttempts: 0
    });
  }, [initialStep, persistKey]);

  const actions: InboxWizardActions = {
    setStep,
    setStatus,
    setError,
    setLoading,
    setProgress,
    handleRetry,
    handleReconnect,
    handleNext,
    handleBack,
    reset
  };

  return [state, actions];
};