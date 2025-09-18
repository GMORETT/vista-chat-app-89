import React from 'react';
import { AdminLayout } from '../components/admin/AdminLayout';
import { MountOptions } from '../mfe/types';

interface AdminAppProps {
  mountOptions: MountOptions;
}

export const AdminApp: React.FC<AdminAppProps> = ({ mountOptions }) => {
  return <AdminLayout mountOptions={mountOptions} />;
};