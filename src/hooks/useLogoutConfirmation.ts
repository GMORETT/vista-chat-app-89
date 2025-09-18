import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export const useLogoutConfirmation = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { logout } = useAuth();

  const openLogoutConfirmation = () => {
    setIsModalOpen(true);
  };

  const closeLogoutConfirmation = () => {
    setIsModalOpen(false);
  };

  const confirmLogout = async () => {
    setIsLoading(true);
    try {
      logout();
    } finally {
      setIsLoading(false);
      setIsModalOpen(false);
    }
  };

  return {
    isModalOpen,
    isLoading,
    openLogoutConfirmation,
    closeLogoutConfirmation,
    confirmLogout
  };
};