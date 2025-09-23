import { useEffect } from 'react';
import { create } from 'zustand';
import { useAuth } from '../contexts/AuthContext';


/**
 * Hook to manage the current active client (account) based on user role
 * - Super admin: can select any account or view all
 * - Admin/user: fixed to their account_id
 */
// Create a dedicated store for current client
const useCurrentClientStore = create<{
  selectedAccountId: number | null;
  setSelectedAccountId: (id: number | null) => void;
}>((set) => ({
  selectedAccountId: null,
  setSelectedAccountId: (id) => set({ selectedAccountId: id }),
}));

export const useCurrentClient = () => {
  const { user } = useAuth();
  const { selectedAccountId, setSelectedAccountId } = useCurrentClientStore();

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