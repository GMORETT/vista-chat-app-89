import { useState, useCallback } from 'react';
import { Account } from '../../models/chat';
import { OptimisticAccount, SyncState } from '../../types/syncState';

export const useOptimisticAccounts = (accounts: Account[] = []) => {
  const [optimisticAccounts, setOptimisticAccounts] = useState<OptimisticAccount[]>([]);
  
  // Merge real accounts with optimistic ones
  const mergedAccounts = [
    ...optimisticAccounts.filter(acc => acc.tempId),
    ...accounts.map(acc => ({ ...acc, syncState: 'idle' as SyncState }))
  ];

  const addOptimisticAccount = useCallback((account: Omit<OptimisticAccount, 'id'>) => {
    const tempId = `temp_${Date.now()}`;
    const optimisticAcc: OptimisticAccount = {
      ...account,
      id: tempId,
      tempId,
      syncState: 'pending',
    };
    
    setOptimisticAccounts(prev => [...prev, optimisticAcc]);
    return tempId;
  }, []);

  const replaceOptimisticAccount = useCallback((tempId: string, realAccount: Account) => {
    setOptimisticAccounts(prev => prev.filter(acc => acc.tempId !== tempId));
  }, []);

  const markAccountError = useCallback((id: string | number, error: string) => {
    setOptimisticAccounts(prev => 
      prev.map(acc => 
        acc.id === id ? { ...acc, syncState: 'error' as SyncState, error } : acc
      )
    );
  }, []);

  const removeOptimisticAccount = useCallback((id: string | number) => {
    setOptimisticAccounts(prev => prev.filter(acc => acc.id !== id));
  }, []);

  return {
    accounts: mergedAccounts,
    addOptimisticAccount,
    replaceOptimisticAccount,
    markAccountError,
    removeOptimisticAccount,
  };
};