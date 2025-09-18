import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useChatStore } from '../state/useChatStore';

/**
 * Hook to manage the current active client (account) based on user role
 * - Super admin: can select any account or view all
 * - Admin/user: fixed to their account_id
 */
export const useCurrentClient = () => {
  const { user } = useAuth();
  const { selectedAccountId, setSelectedAccountId } = useChatStore();

  useEffect(() => {
    if (!user) return;

    // For non-super admin users, always set their account_id
    if (user.role !== 'super_admin' && user.account_id) {
      setSelectedAccountId(user.account_id);
    }
    
    // For super admin without selection, default to null (all accounts)
    if (user.role === 'super_admin' && selectedAccountId === undefined) {
      setSelectedAccountId(null);
    }
  }, [user, selectedAccountId, setSelectedAccountId]);

  const getCurrentAccountId = () => {
    if (user?.role !== 'super_admin') {
      return user?.account_id || null;
    }
    return selectedAccountId;
  };

  const canSelectAccount = () => {
    return user?.role === 'super_admin';
  };

  return {
    currentAccountId: getCurrentAccountId(),
    canSelectAccount: canSelectAccount(),
    selectedAccountId,
    setSelectedAccountId,
  };
};